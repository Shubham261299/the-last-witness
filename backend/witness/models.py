"""Strict input contracts; source-role values are single IDs, never record lists."""

from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, StrictStr


class Input(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Start(Input):
    command_id: UUID


class Command(Start):
    expected_revision: int = Field(ge=0)


class Claim(Input):
    choice: StrictStr
    citations: dict[StrictStr, StrictStr | None]


class Draft(Input):
    fields: dict[StrictStr, Claim]
    explanation: StrictStr = Field(default="", max_length=4000)
    section: int = Field(default=0, ge=0, le=3)


class DraftCommand(Command):
    draft: Draft


class Inspect(Command):
    record_id: StrictStr


class Retrieve(Command):
    request_id: StrictStr


class Note(Input):
    source_ids: list[StrictStr] = Field(min_length=1, max_length=11)
    target_id: StrictStr
    relation: Literal["Corroborates", "Contradicts", "Contextualizes", "Unsure"] = "Unsure"
    interpretation: StrictStr = Field(min_length=1, max_length=2000)
    passages: dict[StrictStr, StrictStr] = Field(default_factory=dict)


class NoteCommand(Command):
    note: Note


class Interaction(Command):
    character_id: Literal["alex", "maya", "daniel"]
    topic_id: StrictStr | None = None
    question: StrictStr = Field(default="", max_length=2000)
    evidence_ids: list[StrictStr] = Field(default_factory=list, max_length=12)
