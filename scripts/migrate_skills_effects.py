#!/usr/bin/env python3
"""Migrate skills.json effects: value -> base, type-string -> {type, target}.

Old form:  effect: {type: "<string>", value: n, formula?: "..."}
New form:  effect: {type: "<mechanics>", target: {kind: "...", ...}, base: n, formula?: "..."}

Type strings map to (mechanics, target) per the agreed effect framework.
Fails loudly on any unknown type so nothing is silently left behind.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "content" / "skills.json"

TYPE_MAP = {
    "skill_xp": ("xp", {"kind": "skill"}),
    "job_xp": ("xp", {"kind": "job"}),
    "all_xp": ("xp", {"kind": "all"}),
    "army_xp": ("xp", {"kind": "job", "category": "Military"}),
    "army_income": ("income", {"kind": "job", "category": "Military"}),
    "strength_xp": ("xp", {"kind": "task", "task": "skill_strength"}),
    "magic_xp": ("xp", {"kind": "skill", "category": "Magic"}),
    "void_xp": ("xp", {"kind": "job", "category": "The Void"}),
    "galactic_xp": ("xp", {"kind": "job", "category": "Galactic Council"}),
    "collegium_xp": ("xp", {"kind": "job", "category": "Mage Collegium"}),
    "collegium_income": ("income", {"kind": "job", "category": "Mage Collegium"}),
    "job_income": ("income", {"kind": "job"}),
    "expense_reduction": ("expense_reduction", {"kind": "item"}),
    "happiness": ("multiply", {"kind": "resource", "id": "happiness"}),
    "evil_gain": ("multiply", {"kind": "resource", "id": "evil_gain"}),
    "essence_gain": ("multiply", {"kind": "resource", "id": "essence_gain"}),
    "essence_evil_gain": ("multiply", {"kind": "resource", "id": "essence_evil_gain"}),
    "dark_matter_gain": ("multiply", {"kind": "resource", "id": "dark_matter_gain"}),
    "gamespeed": ("multiply", {"kind": "resource", "id": "gamespeed"}),
    "lifespan": ("multiply", {"kind": "resource", "id": "lifespan"}),
    "max_level_multiplier": ("multiply", {"kind": "resource", "id": "max_level"}),
}


def main():
    data = json.loads(SKILLS.read_text(encoding="utf-8"))
    changed = 0
    for category, skills in data["skillCategories"].items():
        for key, skill in skills.items():
            effect = skill.get("effect")
            if not effect:
                continue
            old_type = effect.get("type")
            if old_type not in TYPE_MAP:
                raise SystemExit(f"Unknown effect type in {category}/{key}: {old_type!r}")
            new_type, target = TYPE_MAP[old_type]
            new_effect = {"type": new_type, "target": target}
            if effect.get("value") is not None:
                new_effect["base"] = effect["value"]
            elif effect.get("base") is not None:
                new_effect["base"] = effect["base"]
            if effect.get("formula") is not None:
                new_effect["formula"] = effect["formula"]
            skill["effect"] = new_effect
            changed += 1
    SKILLS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"migrated {changed} effects")


if __name__ == "__main__":
    main()