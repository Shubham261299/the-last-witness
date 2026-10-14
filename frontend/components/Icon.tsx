import type { CSSProperties } from "react";

const paths: Record<string, string[]> = {
  archive: ["M4 7h16v13H4z", "M3 3h18v4H3z", "M9 11h6"],
  interview: [
    "M21 11.5a8.3 8.3 0 0 1-.9 3.8 8.4 8.4 0 0 1-7.5 4.7 8.3 8.3 0 0 1-3.8-.9L3 21l1.9-5.8a8.3 8.3 0 0 1-.9-3.8 8.4 8.4 0 0 1 4.7-7.5 8.3 8.3 0 0 1 3.8-.9h.5a8.4 8.4 0 0 1 8 8v.5z",
  ],
  evidence: [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    "M14 2v6h6",
    "M8 13h8M8 17h5",
  ],
  report: [
    "M9 3H5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4",
    "M9 2h6v4H9z",
    "m8 13 2 2 5-5",
  ],
  arrow: ["M4 12h16", "m14 6 6 6-6 6"],
  back: ["M20 12H4", "m10 6-6 6 6 6"],
  close: ["m6 6 12 12M18 6 6 18"],
  plus: ["M12 5v14M5 12h14"],
  check: ["m5 12 4 4L19 6"],
  clock: ["M12 8v4l3 2", "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0"],
  diamond: ["m3 8 4-5h10l4 5-9 13z", "M3 8h18M7 3l5 18 5-18"],
  compare: ["M4 4h7v16H4zM15 4h5v16h-5z", "M8 8h0M8 12h0M17 8h0"],
  timeline: ["M6 3v18M6 5h13M6 12h9M6 19h13"],
  reset: ["M3 11a9 9 0 1 1 2.5 7", "M3 3v8h8"],
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16", "m17 17 4 4"],
  warning: ["m12 3 10 18H2z", "M12 9v4M12 17h.01"],
  book: ["M3 3h7l2 2 2-2h7v17h-7l-2 2-2-2H3z", "M12 5v17"],
};

export function Icon({
  name,
  size = 19,
  style,
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {(paths[name] || paths.evidence).map((path, index) => (
        <path key={index} d={path} />
      ))}
    </svg>
  );
}
