import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Last Witness — The 11:17 Incident",
  description:
    "A cinematic detective investigation. Question three witnesses, follow the records, and build an evidence-backed reconstruction.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
