"""Local transactions and immutable report history."""

import hashlib
import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path


class GameError(Exception):
    def __init__(self, message, code="invalid_action", status=400):
        self.message, self.code, self.status = message, code, status
        super().__init__(message)


def encode(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def fingerprint(kind, payload):
    return hashlib.sha256(encode({"kind": kind, "payload": payload}).encode()).hexdigest()


class Store:
    def __init__(self, path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.connection() as db:
            db.executescript("""
                PRAGMA journal_mode=WAL;
                CREATE TABLE IF NOT EXISTS runs (
                    id TEXT PRIMARY KEY, created_at TEXT NOT NULL,
                    revision INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1,
                    revealed INTEGER NOT NULL DEFAULT 0, state TEXT NOT NULL
                );
                CREATE UNIQUE INDEX IF NOT EXISTS current_run ON runs(active) WHERE active = 1;
                CREATE TABLE IF NOT EXISTS attempts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT NOT NULL REFERENCES runs(id),
                    command_id TEXT UNIQUE NOT NULL, created_at TEXT NOT NULL, snapshot TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS commands (
                    id TEXT PRIMARY KEY, run_id TEXT, fingerprint TEXT NOT NULL, response TEXT NOT NULL
                );
                CREATE TRIGGER IF NOT EXISTS attempts_no_update BEFORE UPDATE ON attempts
                    BEGIN SELECT RAISE(ABORT, 'Submitted reports are immutable'); END;
                CREATE TRIGGER IF NOT EXISTS attempts_no_delete BEFORE DELETE ON attempts
                    BEGIN SELECT RAISE(ABORT, 'Submitted reports are immutable'); END;
            """)

    @contextmanager
    def connection(self):
        db = sqlite3.connect(self.path, timeout=10)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys=ON")
        try:
            yield db
        finally:
            db.close()

    @contextmanager
    def transaction(self):
        with self.connection() as db:
            db.execute("BEGIN IMMEDIATE")
            try:
                yield db
                db.commit()
            except BaseException:
                db.rollback()
                raise

    @staticmethod
    def retry(db, command_id, digest):
        row = db.execute("SELECT * FROM commands WHERE id=?", (command_id,)).fetchone()
        if row:
            if row["fingerprint"] != digest:
                raise GameError("This command belongs to a different action.", "command_conflict", 409)
            return json.loads(row["response"])
        return None

    @staticmethod
    def remember(db, command_id, run_id, digest, response):
        db.execute("INSERT INTO commands VALUES (?, ?, ?, ?)", (command_id, run_id, digest, encode(response)))

    @staticmethod
    def current(db, run_id, expected_revision=None):
        row = db.execute("SELECT * FROM runs WHERE id=? AND active=1", (run_id,)).fetchone()
        if not row:
            raise GameError("This investigation has been restarted. Resume the current case.", "stale_run", 409)
        if expected_revision is not None and row["revision"] != expected_revision:
            raise GameError("The saved investigation changed. Refresh it before retrying.", "revision_conflict", 409)
        return row, json.loads(row["state"])

    @staticmethod
    def save(db, row, state):
        db.execute("UPDATE runs SET state=?, revision=revision+1 WHERE id=?", (encode(state), row["id"]))
        return db.execute("SELECT * FROM runs WHERE id=?", (row["id"],)).fetchone()
