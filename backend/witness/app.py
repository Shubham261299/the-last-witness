"""FastAPI entrypoint for the local investigation service."""

import os
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import models
from .service import Game
from .storage import GameError


def create_app(db_path=None):
    path = db_path or os.getenv("WITNESS_DB") or Path(__file__).parents[1] / "data/witness.db"
    game = Game(path)

    @asynccontextmanager
    async def lifespan(_app):
        yield

    app = FastAPI(title="The Last Witness local service", version="1.0.0", lifespan=lifespan)
    app.state.game = game
    app.add_middleware(CORSMiddleware, allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"],
                       allow_methods=["GET", "POST", "PUT", "DELETE"], allow_headers=["Content-Type"])

    @app.exception_handler(GameError)
    async def game_error(_request: Request, error: GameError):
        return JSONResponse(status_code=error.status, content={"error": {"code": error.code, "message": error.message}})

    @app.exception_handler(RequestValidationError)
    async def shape_error(_request: Request, _error: RequestValidationError):
        return JSONResponse(status_code=422, content={"error": {"code": "invalid_shape", "message": "Review the input. Each evidence role accepts one record, and text must fit its limit."}})

    @app.get("/api/health")
    async def health():
        mode = os.getenv("WITNESS_DIALOGUE_MODE", "ollama")
        available = False
        model = os.getenv("WITNESS_OLLAMA_MODEL", "llama3.1:8b")
        if mode != "scripted":
            try:
                async with httpx.AsyncClient(timeout=2) as client:
                    reply = await client.get(os.getenv("WITNESS_OLLAMA_URL", "http://127.0.0.1:11434") + "/api/tags")
                    reply.raise_for_status()
                    available = any(item["name"] == model for item in reply.json().get("models", []))
            except (httpx.HTTPError, ValueError, KeyError):
                pass
        return {"status": "ok", "dialogue_mode": "ollama" if available else "scripted", "model_available": available, "model": model, "test_mode": os.getenv("WITNESS_TEST_MODE") == "1"}

    @app.get("/api/bootstrap")
    def bootstrap():
        return game.bootstrap()

    @app.post("/api/start")
    def start(command: models.Start):
        return game.start(command)

    @app.get("/api/runs/{run_id}")
    def state(run_id: str):
        return game.get_run(run_id)

    @app.post("/api/runs/{run_id}/inspect")
    def inspect(run_id: str, command: models.Inspect):
        return game.action(run_id, "inspect", command)

    @app.post("/api/runs/{run_id}/retrieve")
    def retrieve(run_id: str, command: models.Retrieve):
        return game.action(run_id, "retrieve", command)

    @app.put("/api/runs/{run_id}/draft")
    def draft(run_id: str, command: models.DraftCommand):
        return game.action(run_id, "draft", command)

    @app.post("/api/runs/{run_id}/notes")
    def create_note(run_id: str, command: models.NoteCommand):
        return game.action(run_id, "note_create", command)

    @app.put("/api/runs/{run_id}/notes/{note_id}")
    def edit_note(run_id: str, note_id: str, command: models.NoteCommand):
        return game.action(run_id, "note_edit", command, note_id)

    @app.delete("/api/runs/{run_id}/notes/{note_id}")
    def delete_note(run_id: str, note_id: str, command: models.Command):
        return game.action(run_id, "note_delete", command, note_id)

    @app.post("/api/runs/{run_id}/submit")
    def submit(run_id: str, command: models.DraftCommand):
        return game.action(run_id, "submit", command)

    @app.post("/api/runs/{run_id}/reveal")
    def reveal(run_id: str, command: models.Command):
        return game.action(run_id, "reveal", command)

    @app.post("/api/runs/{run_id}/reset")
    def reset(run_id: str, command: models.Command):
        return game.action(run_id, "reset", command)

    @app.post("/api/runs/{run_id}/interactions")
    async def interact(run_id: str, command: models.Interaction):
        return await game.interact(run_id, command)

    @app.get("/api/attempts/{attempt_id}")
    def attempt(attempt_id: int):
        return game.attempt(attempt_id)

    @app.post("/api/runs/{run_id}/interactions/{interaction_id}/scripted")
    def scripted_reply(run_id: str, interaction_id: str, command: models.Command):
        return game.scripted_reply(run_id, interaction_id, command)

    @app.get("/api/attempts/{attempt_id}/solution")
    def solution(attempt_id: int):
        return game.attempt(attempt_id, solution=True)

    @app.get("/api/commands/{command_id}")
    def command_status(command_id: str):
        return game.command_status(command_id)

    return app
