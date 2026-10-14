"""Record the tested Windows Python dependency closure, excluding unrelated packages."""

from importlib import metadata
from pathlib import Path

from packaging.requirements import Requirement
from packaging.utils import canonicalize_name

ROOT = Path(__file__).resolve().parents[1]
pending = ["fastapi", "pydantic", "uvicorn", "httpx", "pytest", "playwright"]
locked = {}
while pending:
    name = canonicalize_name(pending.pop())
    if name in locked:
        continue
    package = metadata.distribution(name)
    locked[name] = package.version
    for text in package.requires or []:
        dependency = Requirement(text)
        if dependency.marker and not dependency.marker.evaluate({"extra": ""}):
            continue
        installed = metadata.version(dependency.name)
        assert installed in dependency.specifier, f"Incompatible installed dependency: {dependency} ({installed})"
        pending.append(dependency.name)
content = "# Tested dependency closure: Windows, CPython 3.13. Includes test/browser tools.\n"
content += "\n".join(f"{name}=={version}" for name, version in sorted(locked.items())) + "\n"
(ROOT / "backend/requirements-lock.txt").write_text(content, encoding="utf-8")
print(f"Locked {len(locked)} compatible packages; unrelated system packages excluded.")
