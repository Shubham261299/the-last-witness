export type View = "archive" | "interview" | "evidence" | "report";
export type CharacterId = "alex" | "maya" | "daniel";

export interface EvidenceRecord {
  id: string;
  title: string;
  kind: string;
  source: string;
  created_at: string;
  event_range: string;
  body: string[];
  limitation: string;
  inspected?: boolean;
  review_only?: boolean;
}

export interface Character {
  id: CharacterId;
  name: string;
  role: string;
  initial_statement: string;
  topics: { id: string; label: string }[];
}

export interface ReportField {
  id: string;
  label: string;
  section: number;
  max_points: number;
  options: { value: string; label: string }[];
  roles: { key: string; label: string }[];
}

export interface Draft {
  fields: Record<
    string,
    { choice: string; citations: Record<string, string | null> }
  >;
  explanation: string;
  section: number;
}

export interface Note {
  id: string;
  source_ids: string[];
  target_id: string;
  relation: "Corroborates" | "Contradicts" | "Contextualizes" | "Unsure";
  interpretation: string;
  passages: Record<string, string>;
  saved_at: string;
}

export type NoteInput = Omit<Note, "id" | "saved_at">;

export interface Conversation {
  id: string;
  character_id: CharacterId;
  question: string;
  reply: string;
  kind: string;
  source_ids: string[];
  corrects: boolean;
  topic_id: string | null;
  created_at: string;
}

export interface Run {
  id: string;
  revision: number;
  created_at: string;
  records: EvidenceRecord[];
  leads: {
    id: string;
    label: string;
    source_ids: string[];
    retrieved: boolean;
  }[];
  timeline: {
    id: string;
    time: string;
    source_id: string;
    kind: string;
    text: string;
  }[];
  conversations: Conversation[];
  notes: Note[];
  draft: Draft;
  report_fields: ReportField[];
  pending: boolean;
  pending_character_id: CharacterId | null;
  pending_command_id: string | null;
  solution_revealed: boolean;
  attempt_count: number;
}

export interface AttemptSummary {
  id: number;
  run_id: string;
  created_at: string;
  run_created_at: string;
  is_current: boolean;
  solution_revealed: boolean;
  total: number;
  outcome: string;
  accusation: string | null;
}

export interface ScoreRow {
  id: string;
  label: string;
  points: number;
  max_points: number;
  reason: string;
  required: { role: string; record_id: string }[];
}

export interface Attempt extends AttemptSummary {
  draft: Draft;
  report_fields: ReportField[];
  records: Record<string, EvidenceRecord>;
  case_version: string;
  rubric_version: string;
  score: {
    total: number;
    outcome: string;
    accusation: string | null;
    rows?: ScoreRow[];
  };
}

export interface Solution {
  paragraphs: string[];
  records: EvidenceRecord[];
  testimony_review_only: boolean;
}

export interface Bootstrap {
  case: {
    id: string;
    title: string;
    setting: string;
    duration: string;
    date: string;
    review_time: string;
    brief: string[];
  };
  characters: Character[];
  run: Run | null;
  attempts: AttemptSummary[];
}

export interface ActionResult {
  run?: Run;
  record_id?: string;
  note_id?: string;
  attempt_id?: number;
  dialogue_mode?: string;
  notice?: string | null;
  archived?: boolean;
  reset?: boolean;
}
