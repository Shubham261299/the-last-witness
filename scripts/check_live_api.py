"""Exercise a real local Ollama reply through the application API on disposable data."""

import json
import os
import sys
import time
from pathlib import Path
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from fastapi.testclient import TestClient
from witness.app import create_app

os.environ["WITNESS_DIALOGUE_MODE"] = "ollama"
os.environ["WITNESS_OLLAMA_MODEL"] = "llama3.1:8b"
with TestClient(create_app(ROOT / ".cache/live-api.db")) as client:
    health = client.get("/api/health").json()
    assert health["model_available"], "The installed model must be available for this live check."
    run = client.post("/api/start", json={"command_id": str(uuid4())}).json()["run"]
    before = len(run["conversations"])
    start = time.perf_counter()
    response = client.post(f"/api/runs/{run['id']}/interactions", json={
        "command_id": str(uuid4()), "expected_revision": run["revision"],
        "character_id": "alex", "question": "Tell me about your shift at the security desk."})
    assert response.is_success, response.text
    result = response.json()
    assert result["dialogue_mode"] == "ollama"
    assert len(result["run"]["conversations"]) == before + 1
    assert len(result["run"]["records"]) == 4
    assert not result["run"]["pending"]
    with TestClient(create_app(ROOT / ".cache/live-api.db")) as reopened:
        assert len(reopened.get("/api/bootstrap").json()["run"]["conversations"]) == before + 1
    evidence = {"passed": True, "mode": result["dialogue_mode"], "model": health["model"],
                "seconds": round(time.perf_counter() - start, 3), "single_committed_reply": True,
                "no_inventory_unlock": True, "survives_service_restart": True}
    (ROOT / "docs/verification/live-api-results.json").write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(evidence, indent=2))
