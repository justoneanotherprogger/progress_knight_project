#!/usr/bin/env python3
"""Locale key check.

A locale key reaches the screen through one of two literal shapes: `id="key"`
in a template, or `"key"` in js/, content/ or build.py. A key neither shape
mentions is a translation nothing renders — dead weight in every language
file, invisible to the linters because the YAML is not code. This script lists
such keys and fails.

Keys built at runtime are exempt through the rules in DYNAMIC below.

Run: python scripts/check_locale_keys.py [--report]
"""

import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
LOCALES = ROOT / "locales"

# A key counts as used when it shows up in one of these shapes.
ID_IN_TEMPLATE = re.compile(r'id="([A-Za-z_][\w]*)"')
STRING_LITERAL = re.compile(r'"([A-Za-z_][\w]*)"')

SOURCES = ("templates/**/*.html", "js/**/*.js", "content/*.json", "build.py")
# Not searched: locales/ would make every key reference itself, dist/ and
# index.html are generated from the sources above, scripts/ would let this
# check find its own patterns, vendor/ is third-party.
EXCLUDE_DIRS = {
    ".git",
    ".glia",
    "__pycache__",
    "dist",
    "locales",
    "node_modules",
    "scripts",
    "vendor",
}
EXCLUDE_FILES = {"index.html"}

# Keys the code assembles at runtime cannot appear as literals. Every prefix
# and pattern below names the mechanism that builds it, so a hit stays
# auditable instead of being a silent exemption:
#   perk_*            t(`perk_${perkName}`)          js/metaverse.js:226
#   effect_*          labelKey() -> `effect_${target.id}`  js/effects.js:69-79
#   <root>_<n>[_neg]  t(`${key}_${level}`), t(`${key}_${level}_neg`)
#                     js/ui/dark_matter_tab.js:35,40  (only where <root> itself
#                     is a string literal in a searched source)
DYNAMIC_PREFIXES = ("perk_", "effect_")
DYNAMIC_NUMBERED = re.compile(r"^(.+)_\d+(_neg)?$")


def locale_keys() -> dict[str, Path]:
    """key -> the locale file defining it."""
    found: dict[str, Path] = {}
    for path in sorted(LOCALES.rglob("*.yaml")):
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        for key in data:
            found.setdefault(str(key), path)
    return found


def collect_sources() -> list[Path]:
    found: list[Path] = []
    for pattern in SOURCES:
        for path in ROOT.glob(pattern):
            rel = path.relative_to(ROOT).as_posix()
            if not path.is_file() or rel in EXCLUDE_FILES:
                continue
            if any(part in EXCLUDE_DIRS for part in rel.split("/")):
                continue
            found.append(path)
    return sorted(set(found))


def scan(paths: list[Path]) -> tuple[set[str], set[str]]:
    """(keys referenced, string literals seen) across the searched sources."""
    used: set[str] = set()
    literals: set[str] = set()
    for path in paths:
        rel = path.relative_to(ROOT).as_posix()
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as exc:
            print(f"error: cannot read {rel}: {exc}", file=sys.stderr)
            sys.exit(2)
        if path.suffix == ".html":
            used.update(ID_IN_TEMPLATE.findall(text))
        literals.update(STRING_LITERAL.findall(text))
    used.update(literals)
    return used, literals


def is_dynamic(key: str, literals: set[str]) -> bool:
    if key.startswith(DYNAMIC_PREFIXES):
        return True
    match = DYNAMIC_NUMBERED.match(key)
    return match is not None and match.group(1) in literals


def main() -> int:
    report = "--report" in sys.argv[1:]
    unknown = [arg for arg in sys.argv[1:] if arg != "--report"]
    if unknown:
        print(f"usage: {Path(sys.argv[0]).name} [--report]", file=sys.stderr)
        return 2

    keys = locale_keys()
    sources = collect_sources()
    used, literals = scan(sources)

    unused = sorted(
        (key, path)
        for key, path in keys.items()
        if key not in used and not is_dynamic(key, literals)
    )

    if not unused:
        print(f"Checked {len(keys)} locale keys in {len(sources)} files (all referenced)")
        return 0

    print("Locale keys nothing references:\n")
    for key, path in unused:
        print(f"  {key} — {path.relative_to(ROOT).as_posix()}")
    print(f"\n{len(unused)} of {len(keys)} keys are unreferenced.")
    print("Delete them, or wire them up if something renders them after all.")
    return 0 if report else 1


if __name__ == "__main__":
    sys.exit(main())
