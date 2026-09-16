#!/usr/bin/env python3
"""Migrate skills.json effect formulas: string formula -> {kind, params}.

Old form:  formula: "<string>", value (or base) may be ignored by the formula
New form:  formula: {"kind": "log"|"power"|"linear", ...params}

All formulas collapse onto value as the honest multiplier:
  log      -> 1 + value * log_(logBase ?? e)(level+1), optional floor
              (covers former log/time_warping/life_essence/expense_reduction:
               expense uses value = -1/divisor and logBase = divisor base)
  power    -> 1 + value * levelEff * pow(SKILL_LEVEL_EXPONENT_BASE, log10(level+1))
  linear   -> level * value * (hero ? heroScale : 1)
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "content" / "skills.json"

# former string formula -> new formula object + the honest value it actually uses
FORMULA_MAP = {
    "log": {"formula": {"kind": "log"}},  # natural log, value stays as-is (0.1)
    "expense_reduction": {
        "formula": {"kind": "log", "logBase": 7, "logHeroBase": 3, "floor": 0.1},
        "base": -1 / 10,  # EXPENSE_REDUCTION_DIVISOR = 10; old -0.01 was ignored
    },
    "time_warping": {
        "formula": {"kind": "log", "logBase": 10, "logHeroBase": 1.005},
        "base": 1,  # old 0.01 was ignored; formula was 1 + log_10
    },
    "life_essence": {
        "formula": {"kind": "log", "logBase": 30, "logHeroBase": 1.01},
        "base": 1,  # old 0.01 was ignored; formula was 1 + log_30
    },
    "cosmic_recollection": {
        "formula": {"kind": "linear", "heroScale": 100},  # hero: 0.00065 * 100 = 0.065
        # value 0.00065 stays (== COSMIC_RECOLLECTION_EFFECT_NORMAL), it is the honest multiplier
    },
}


def main():
    data = json.loads(SKILLS.read_text(encoding="utf-8"))
    changed = 0
    for category, skills in data["skillCategories"].items():
        for key, skill in skills.items():
            effect = skill.get("effect")
            if not effect:
                continue
            old_formula = effect.get("formula")
            if old_formula is None:
                # no formula -> standard power growth
                effect["formula"] = {"kind": "power"}
                changed += 1
                continue
            if old_formula not in FORMULA_MAP:
                raise SystemExit(f"Unknown formula in {category}/{key}: {old_formula!r}")
            mapping = FORMULA_MAP[old_formula]
            if "base" in mapping:
                effect["base"] = mapping["base"]
            effect["formula"] = mapping["formula"]
            changed += 1
    SKILLS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"migrated {changed} formulas")


if __name__ == "__main__":
    main()