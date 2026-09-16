"""Migrate skills.json skillCategories to unified id-format.

Формат как у items.json:
    "category_fundamentals": {"name": "category_fundamentals", "items": {...}}

Транзитивно обновляет target-категории навыков в эффектах (kind == "skill").
Категории работ (kind == "job") не трогает — работы мигрируют отдельно.
"""
import json
from pathlib import Path

SRC = Path("content/skills.json")

CATEGORY_IDS = {
    "Fundamentals": "category_fundamentals",
    "Combat": "category_combat",
    "Magic": "category_magic",
    "Dark Magic": "category_dark_magic",
    "Void Manipulation": "category_void_manipulation",
    "Celestial Powers": "category_celestial_powers",
    "Almightiness": "category_almightiness",
    "Darkness": "category_darkness",
}

data = json.loads(SRC.read_text(encoding="utf-8"))

old_categories = data["skillCategories"]
if all(not isinstance(c, dict) or "items" not in c for c in old_categories.values()):
    legacy_hit = 0
    new_categories = {}
    for old_name, skills in old_categories.items():
        new_id = CATEGORY_IDS[old_name]
        new_categories[new_id] = {"name": new_id, "items": skills}
        legacy_hit += 1
    data["skillCategories"] = new_categories
    print(f"rebuild: {legacy_hit} categories")
else:
    print("skills.json already unified — nothing to rebuild")

# target-категории навыков: старые имена -> id (kind == "skill")
fixed = 0
for category in data["skillCategories"].values():
    for skill in category["items"].values():
        effect = skill.get("effect")
        if not isinstance(effect, dict):
            continue
        target = effect.get("target")
        if (
            isinstance(target, dict)
            and target.get("kind") == "skill"
            and target.get("category") in CATEGORY_IDS
        ):
            target["category"] = CATEGORY_IDS[target["category"]]
            fixed += 1

SRC.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"target-category refs fixed: {fixed}")