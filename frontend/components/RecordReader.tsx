import type { EvidenceRecord } from "@/lib/types";
import Image from "next/image";
import { Icon } from "./Icon";

export function RecordReader({
  record,
  historical = false,
  compact = false,
}: {
  record: EvidenceRecord;
  historical?: boolean;
  compact?: boolean;
}) {
  return (
    <article className={`record-paper ${compact ? "compact" : ""}`}>
      <div className="record-stamp">
        <span>{record.id} / INCIDENT DOSSIER</span>
        <Icon name="evidence" />
      </div>
      {historical && (
        <p className="context-label">
          Historical source · does not collect evidence in your current run
        </p>
      )}
      {record.review_only && (
        <p className="context-label">
          Revealed in case review · absent from this submission&apos;s inventory
        </p>
      )}
      <span className="source-kind">{record.kind}</span>
      <h2 tabIndex={-1}>{record.title}</h2>
      <dl className="record-meta">
        <div>
          <dt>EVENT / COVERAGE</dt>
          <dd>{record.event_range}</dd>
        </div>
        <div>
          <dt>RECORDED / EXPORTED</dt>
          <dd>{record.created_at}</dd>
        </div>
      </dl>
      <p className="source-provenance">{record.source}</p>
      <div className="record-body">
        {record.body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      {record.id === "E01" && (
        <figure className="evidence-figure">
          <Image
            src="/gallery-plan.svg"
            alt="North Gallery has one entrance from the staff corridor. The display case has its own keyed lid. The corridor also connects the desk, bay and equipment room."
            width={640}
            height={250}
          />
          <figcaption>
            Response-team plan · gallery door and display-case lock are
            separate.
          </figcaption>
        </figure>
      )}
      {record.id === "E08" && (
        <div className="coverage-strip">
          <Icon name="clock" />
          <div>
            <strong>Recording coverage matters</strong>
            <p>
              23:09–23:14 and 23:17:02–23:18. The transcript identifies
              occupants and movement; hands and small objects are obscured.
            </p>
          </div>
        </div>
      )}
      <aside className="source-limits">
        <span className="eyebrow">SOURCE LIMITATIONS</span>
        <p>{record.limitation}</p>
      </aside>
      <footer className="record-foot">
        12 OCTOBER 2026 <span>MUSEUM LOCAL TIME · 11:17 PM = 23:17</span>
      </footer>
    </article>
  );
}
