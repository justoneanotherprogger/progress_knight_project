"""Inline handler bridge check.

ES module functions are invisible to HTML attributes, so the ones templates call
are published on window in js/boot.js. That list is hand-maintained, and a missing
name fails silently: the button just does nothing until someone clicks it. This
script compares calls in templates/ against the bridge and fails the build on any
gap.

Run: python scripts/check_inline_handlers.py
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATES = ROOT / "templates"
BOOT = ROOT / "js" / "boot.js"

# Browser builtins and keywords, not ours
BUILTIN = {
    "alert", "confirm", "prompt", "parseInt", "parseFloat", "String", "Number",
    "Boolean", "Array", "Object", "Math", "JSON", "Date", "isNaN",
    "encodeURIComponent", "decodeURIComponent", "if", "for", "while", "switch",
    "return", "typeof", "new",
}

HANDLER_ATTR = re.compile(r'\bon[a-z]+\s*=\s*"([^"]*)"', re.IGNORECASE)
CALL = re.compile(r"([A-Za-z_$][\w$]*)\s*\(")
BRIDGE_BLOCK = re.compile(r"Object\.assign\(window,\s*\{(.*?)\}\);", re.DOTALL)
BRIDGE_ITEM = re.compile(r"([A-Za-z_$][\w$]*)\s*,?$", re.MULTILINE)


def called_from_templates() -> set[str]:
    names: set[str] = set()
    for html in TEMPLATES.rglob("*.html"):
        text = html.read_text(encoding="utf-8")
        for attr in HANDLER_ATTR.findall(text):
            for name in CALL.findall(attr):
                if name not in BUILTIN:
                    names.add(name)
    return names


def bridged() -> set[str]:
    text = BOOT.read_text(encoding="utf-8")
    block = BRIDGE_BLOCK.search(text)
    if not block:
        return set()
    return {m.group(1) for m in BRIDGE_ITEM.finditer(block.group(1))}


def main() -> int:
    if not BOOT.exists():
        print(f"error: {BOOT.relative_to(ROOT)} not found", file=sys.stderr)
        return 1

    wanted = called_from_templates()
    have = bridged()

    if not have:
        print("error: no Object.assign(window, {...}) bridge found in js/boot.js",
              file=sys.stderr)
        return 1

    missing = sorted(wanted - have)
    if missing:
        print("Called from templates but not published on window:")
        for name in missing:
            print(f"  {name}")
        print("\nAdd them to Object.assign(window, {...}) in js/boot.js and import them.")
        return 1

    extra = sorted(have - wanted)
    if extra:
        print(f"note: {len(extra)} bridged names are not called from templates: "
              f"{', '.join(extra)}")

    print(f"Checked {len(wanted)} inline handler calls (all bridged)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
