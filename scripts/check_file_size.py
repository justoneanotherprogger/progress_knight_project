#!/usr/bin/env python3
"""Source file size ratchet.

Keeps source files from growing without bound, modeled after the same
mechanism in letta-code:

- new files must stay at or below ``limit`` lines;
- files pinned in the baseline may shrink but never grow: any commit that
  leaves a pinned file smaller than recorded MUST lower its baseline entry
  in the same change;
- once a pinned file reaches ``limit``, its baseline entry must be removed.

All tunables (limit, extensions, excluded dirs) live in the baseline JSON
next to this script, so adopting the check in another repository requires
no code changes.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
CONFIG_PATH = SCRIPT_DIR / "source-file-size-baseline.json"


def count_lines(path: Path) -> int:
    """Physical line count of a text file, robust to missing trailing newline."""
    try:
        with path.open("r", encoding="utf-8", errors="replace") as fh:
            return sum(1 for _ in fh)
    except OSError as exc:
        print(f"error: cannot read {path}: {exc}", file=sys.stderr)
        sys.exit(2)


def collect_files(extensions: list[str], exclude_dirs: list[str]) -> list[Path]:
    exts = {f".{e.lstrip('.')}" for e in extensions}
    excluded = set(exclude_dirs)
    found: list[Path] = []
    for path in REPO_ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in exts:
            continue
        if any(part in excluded for part in path.relative_to(REPO_ROOT).parts):
            continue
        found.append(path)
    return sorted(found)


def main() -> int:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    limit: int = config["limit"]
    extensions: list[str] = config["extensions"]
    exclude_dirs: list[str] = config.get("exclude_dirs", [])
    # Normalize keys to repo-root-relative posix paths regardless of platform.
    baseline = {
        Path(k).as_posix(): v for k, v in config.get("baseline", {}).items()
    }

    failures: list[str] = []
    checked = 0
    max_lines = 0

    for path in collect_files(extensions, exclude_dirs):
        rel = path.relative_to(REPO_ROOT).as_posix()
        lines = count_lines(path)
        checked += 1
        if lines > max_lines:
            max_lines = lines

        if rel in baseline:
            recorded = baseline[rel]
            if lines > recorded:
                failures.append(
                    f"  {rel}: grew from the {recorded}-line baseline "
                    f"to {lines} lines"
                )
            elif lines < recorded:
                failures.append(
                    f"  {rel}: shrank from {recorded} to {lines} lines; "
                    f"ratchet the baseline down in this change"
                )
            elif lines == limit and lines == recorded:
                failures.append(
                    f"  {rel}: reached the {limit}-line limit; remove its "
                    f"baseline entry in this change"
                )
        elif lines > limit:
            failures.append(
                f"  {rel}: {lines} lines exceeds the {limit}-line limit. "
                f"Split oversized files by responsibility; only pre-existing "
                f"oversized files may be pinned in the baseline."
            )

    if failures:
        print("Source file size check failed:\n")
        print("\n".join(failures))
        print(
            "\nNew source files must stay at or below "
            f"{limit} lines. Split oversized files by responsibility."
        )
        return 1

    print(f"Checked {checked} source files (maximum seen: {max_lines})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
