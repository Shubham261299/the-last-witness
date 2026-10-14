# V1 dependency review — 14 October 2026

The user's online npm audit reports five high-severity findings in the development-only chain eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces. The agent's sandbox cannot query the npm advisory service. An offline audit returned no advisory data; that result is **not** evidence of a clean audit.

## Inspected installation

| Dependency | Installed version | Role |
|---|---|---|
| next | 16.4.0 | Application framework |
| react | 19.3.0 | Interface runtime |
| eslint | 9.39.5 | Development linting |
| eslint-config-next / @next/eslint-plugin-next | 16.4.0 | Compatible Next lint rules |
| fast-glob | 3.3.1 | Development file discovery |
| micromatch | 4.0.8 | Development glob matching |
| braces | 3.0.3 | Development glob expansion |
| unrs-resolver | 1.12.2 | TypeScript import resolver for linting |

package.json, package-lock.json, npm ls and installed package metadata were inspected. npm ls braces --omit=dev has no production dependency path. Player questions, notes and report text are never passed into this lint/glob chain. This reduces the prototype's exposure but does not remove the vulnerable dependency or constitute a complete production security assessment.

## Compatible approach and trade-offs

The older [CVE-2024-4068 advisory](https://github.com/advisories/GHSA-grv7-fg5c-xmjg) was patched in braces 3.0.3. However, the newer [CVE-2026-93687 advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) affects versions through 3.0.3 and lists no patched version as of this review. An override to 3.0.3 would therefore not fix the current issue.

Keep the matching Next 16 runtime/lint configuration and use only repository-authored file patterns. Do not run npm audit fix --force: its proposed eslint-config-next 14.2.35 downgrade would change the lint major without evidence that the vulnerable matching code disappears. No dependency versions have been changed for this finding. The residual development-only advisory remains documented; an online audit should be repeated when a compatible upstream fix is available. A confirmed patched compatible release would be preferable to a forced downgrade or an unreviewed custom package fork.

## Pending install script

The installed unrs-resolver postinstall calls napi-postinstall's checkAndPreparePackage to prepare a native binding. The module loads successfully with the already-installed Windows binding, without executing that pending postinstall script. No install script approval, npm rebuild or extra native download was performed. The real ESLint run passed with that binding.

## Verification status

The dependency chain and installed resolver loading were checked locally. Full online npm audit retrieval remains unavailable inside the agent sandbox; the user supplied the online audit summary, and the reviewed advisory was inspected through web browsing. Application build, type/lint/format checks and browser validation passed; evidence and limitations are recorded in V1_VERIFICATION.md.
