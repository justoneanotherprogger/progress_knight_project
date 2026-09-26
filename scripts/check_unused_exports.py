#!/usr/bin/env python3
"""Unused export check.

Biome counts an export as a use, and the code graph cannot see the HTML bridge,
so a function nobody references any more stays in js/ forever and nobody finds
out: it is exported, therefore "used", therefore invisible to every linter. This
script counts word-boundary references to every export across the whole
repository and fails the build on a name nothing points at.

Run: python scripts/check_unused_exports.py
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JS = ROOT / "js"

EXPORT = re.compile(
    r"^\s*export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)",
    re.MULTILINE,
)

# A reference can sit in a module, a template, a build script or a doc, so the
# search is repo-wide. The extension list also keeps binaries out of the walk —
# reading them would only raise decode errors, not find references.
EXTENSIONS = {".js", ".html", ".py", ".json", ".yaml", ".yml", ".css", ".md", ".txt"}
EXCLUDE_DIRS = {".git", "node_modules", "dist", "vendor", "__pycache__", ".glia"}
# Generated and served as /, so its references are the templates' business.
EXCLUDE_FILES = {"index.html"}


def collect_files() -> list[Path]:
    found: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in EXTENSIONS:
            continue
        rel = path.relative_to(ROOT).as_posix()
        if any(part in EXCLUDE_DIRS for part in rel.split("/")):
            continue
        if rel in EXCLUDE_FILES:
            continue
        found.append(path)
    return sorted(found)


def exports() -> dict[str, tuple[Path, int, int]]:
    """name -> (file, declaration line, name occurrences on that same line)."""
    found: dict[str, tuple[Path, int, int]] = {}
    for path in sorted(JS.rglob("*.js")):
        text = path.read_text(encoding="utf-8")
        lines = text.splitlines()
        for match in EXPORT.finditer(text):
            name = match.group(1)
            lineno = text.count("\n", 0, match.start()) + 1
            declaration = lines[lineno - 1]
            found[name] = (
                path,
                lineno,
                len(re.findall(rf"\b{re.escape(name)}\b", declaration)),
            )
    return found


def main() -> int:
    exported = exports()
    files = collect_files()

    # One alternation instead of a scan per name: a few hundred names over a
    # few hundred files is the whole cost of the check.
    pattern = re.compile(
        r"\b(?:" + "|".join(re.escape(name) for name in exported) + r")\b"
    )
    counts = dict.fromkeys(exported, 0)
    for path in files:
        rel = path.relative_to(ROOT).as_posix()
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as exc:
            print(f"error: cannot read {rel}: {exc}", file=sys.stderr)
            return 2
        for match in pattern.finditer(text):
            counts[match.group(0)] += 1

    # The declaration line is not a reference: `export function foo() {` mentions
    # foo once, and that mention is the definition.
    unused = sorted(
        (path, lineno, name)
        for name, (path, lineno, self_hits) in exported.items()
        if counts[name] - self_hits == 0
    )

    if unused:
        print("Exports that nothing references:\n")
        for path, lineno, name in unused:
            print(f"  {name} — {path.relative_to(ROOT).as_posix()}:{lineno}")
        print("\nDelete the dead export, or wire it up if it is really reachable.")
        return 1

    print(f"Checked {len(exported)} exports in {len(files)} files (all referenced)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
