import type { Bootstrap } from "@/lib/types";
import { Icon } from "./Icon";

export function Archive({
  data,
  loading,
  ready,
  busy,
  onStart,
  onResume,
  onHistory,
}: {
  data: Bootstrap | null;
  loading: boolean;
  ready: boolean;
  busy: boolean;
  onStart: () => void;
  onResume: () => void;
  onHistory: () => void;
}) {
  return (
    <div className="archive-view">
      <div className="archive-atmosphere" aria-hidden="true" />
      <div className="archive-kicker">
        <span className="tiny-line" /> AN INTERACTIVE INVESTIGATION
      </div>
      <div className="archive-grid">
        <section className="archive-intro">
          <p className="eyebrow">THE LAST WITNESS</p>
          <h1>
            The truth lives
            <br />
            between
            <br />
            <em>the accounts.</em>
          </h1>
          <p className="archive-deck">
            Three witnesses. A missing diamond.
            <br />
            One story the records refuse to tell.
          </p>
          <div className="archive-rule" />
          <p className="archive-note">
            Question their accounts. Follow the evidence.
            <br />
            Build a conclusion you can stand behind.
          </p>
          <div className="archive-features">
            <span>
              <Icon name="interview" /> Three voices
            </span>
            <span>
              <Icon name="evidence" /> One case
            </span>
            <span>
              <Icon name="clock" /> 10–20 minutes
            </span>
          </div>
        </section>
        <section className="case-file" aria-labelledby="case-title">
          <div className="file-topline">
            <span>CASE FILE / 001</span>
            <span>
              {data?.run
                ? "INVESTIGATION IN PROGRESS"
                : "OPEN FOR INVESTIGATION"}
            </span>
          </div>
          <div
            className="case-art"
            role="img"
            aria-label="Museum display beneath a pool of light at night"
          >
            <div className="case-art-time">23:17</div>
            <span className="case-art-caption">
              BELLWETHER MUSEUM · NORTH GALLERY
            </span>
          </div>
          <div className="file-body">
            <p className="eyebrow">A MUSEUM THEFT</p>
            <h2 id="case-title">The 11:17 Incident</h2>
            <p>
              An alarm. A gap in the footage. A locked display, empty. The night
              shift&apos;s accounts do not quite fit.
            </p>
            <div className="file-meta">
              <span>12 OCTOBER 2026</span>
              <span>
                <Icon name="clock" size={15} /> 10–20 MIN
              </span>
            </div>
            {loading ? (
              <p className="subtle" role="status">
                Checking saved investigation…
              </p>
            ) : data?.run ? (
              <>
                <button className="button primary wide" onClick={onResume}>
                  <span>Resume investigation</span>
                  <Icon name="arrow" />
                </button>
                <p className="resume-copy">
                  {data.run.records.length} records collected · progress saved
                  locally
                </p>
              </>
            ) : (
              <button
                className="button primary wide"
                onClick={onStart}
                disabled={!ready || busy}
              >
                <span>
                  {busy ? "Opening the dossier…" : "Open investigation"}
                </span>
                <Icon name="arrow" />
              </button>
            )}
            {!!data?.attempts.length && (
              <button
                className="text-button archive-history"
                onClick={onHistory}
              >
                View saved submissions <span>{data.attempts.length}</span>
              </button>
            )}
          </div>
        </section>
      </div>
      <div className="archive-bottom">
        <span>THE RECORDS ARE YOUR WITNESSES.</span>
        <span>No timer. Unlimited questions. Follow your own lead.</span>
      </div>
    </div>
  );
}
