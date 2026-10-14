from uuid import uuid4
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from witness.app import create_app


def pytest_configure():
    (Path(__file__).resolve().parents[2] / ".cache").mkdir(exist_ok=True)


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("WITNESS_DIALOGUE_MODE", "scripted")
    with TestClient(create_app(tmp_path / "case.db")) as instance:
        yield instance


class Player:
    def __init__(self, client):
        self.client = client
        self.run = client.post("/api/start", json={"command_id": str(uuid4())}).json()["run"]

    def act(self, action, payload=None, method="post", command_id=None, expected=None):
        body = {"command_id": command_id or str(uuid4()), "expected_revision": self.run["revision"] if expected is None else expected, **(payload or {})}
        response = getattr(self.client, method)(f"/api/runs/{self.run['id']}/{action}", json=body)
        if response.is_success and "run" in response.json():
            self.run = response.json()["run"]
        return response

    def collect_all(self):
        for key in ["E01", "E02", "E03", "E07"]:
            assert self.act("inspect", {"record_id": key}).is_success
        for request in ["R01", "R02", "R03", "R04", "R05", "R06", "R07", "R08"]:
            assert self.act("retrieve", {"request_id": request}).is_success


@pytest.fixture
def player(client):
    return Player(client)
