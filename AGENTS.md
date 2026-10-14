# Repository Guidelines

## Project Structure & Module Organization

V1 implementation was explicitly approved on 14 October 2026. Preserve the case and scope in `docs/V1_PROTOTYPE_PLAN.md`; do not expand the mystery or deploy publicly without a separate decision.

- `frontend/app`, `frontend/components`, `frontend/lib`: Next.js interface and typed client.
- `frontend/public`: original static SVG assets with text equivalents.
- `backend/witness`: API, rules, server-only case content and SQLite storage.
- `backend/tests`: pytest scoring, dialogue, disclosure and API tests.
- `scripts`: setup/start and disposable browser/model checks.
- `docs`: design, contracts, acceptance mapping and verification. Case documents contain spoilers.

Create directories only when needed. Keep project setup and usage instructions in a root `README.md`.

## Build, Test, and Development Commands

Use the root README for exact Windows setup and commands. Setup: `.\scripts\setup.ps1`; backend: `.\scripts\start-backend.ps1`; frontend: `npm --prefix frontend run dev`. Verify with `.\backend\.venv\Scripts\python.exe -m pytest` and `npm --prefix frontend run typecheck`, `lint`, `format:check`, `build`. Production preview uses `start` after build.

Keep manifests and lockfiles. npm installs use `--ignore-scripts`; do not approve pending scripts without necessity review or run `npm audit fix --force`. Do not label an offline audit clean. Browser checks require a disposable backend started with `scripts/start-backend.ps1 -Test`; never remove the test-mode guard or run them against normal player data.

## Coding Style & Naming Conventions

TypeScript/CSS use Prettier with two-space indentation; Python uses four spaces. Strict TypeScript and Next flat ESLint are configured. Read `frontend/AGENTS.md` and relevant installed Next guides before frontend edits. Keep functions focused and never commit generated dependencies, build output, databases or caches.

## Testing Guidelines

Use pytest `test_*.py` and real Playwright walkthroughs. Independently specify proof fixtures and cover every support subset, role misuse, immutable snapshots, retries, disclosure and replay isolation. Notes cannot affect scores or permissions. Models select visible topic IDs only; render authored eligible dialogue. Add regression checks for substantive defects, prioritize meaningful assertions and disclose unexecuted manual checks.

## Commit & Pull Request Guidelines

This repository uses the `main` branch. Use concise, imperative commit subjects, such as `Add project setup instructions`. Keep changes focused. Pull requests should explain the purpose, summarize changes, link relevant issues, and report validation performed. Include screenshots for visual changes and identify any checks that could not run.

# Codex Project Rules

## Git & Account Rules

- **Account Usage**: Always verify and ensure Git operations strictly use the PERSONAL GitHub account configured for this machine/folder.
- **Commit History**: Never append any "Co-authored-by:", "Generated-by:", or AI attribution tags to Git commit messages. Keep commit messages plain, clean, and concise.

## Code & Output Rules

- **No Signatures**: Do not add AI signatures, footers, watermarks, or self-promotional comments in generated files, code blocks, or markdown files.
- **Folder Scope**: Operate and execute commands strictly within the boundaries of this repository directory (`~\Local Folder\Personal\codex pratice\new project ideas`).

## Code Style & Behavior

- Keep solutions concise, robust, and clean.
