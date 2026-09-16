"""Migrate js/data.js item sections to content ids.

- Removes the handwritten itemBaseData (now generated into js/items_data.js).
- Rewrites item requirements in requirementsBaseData to id keys.
- Removes the handwritten itemCategories (now generated into js/items_data.js).
"""

import re
from pathlib import Path

README = Path("js/save.js").read_text(encoding="utf-8")
# Extract old name -> id from ITEM_LEGACY_IDS entries like: "Old Name": "item_id",
LEGACY_PATTERN = re.compile(r'"([^"]+)":\s*"(item_[a-z_0-9]+)"')
OLD_TO_ID = dict(LEGACY_PATTERN.findall(README))
print(f"Loaded {len(OLD_TO_ID)} item mappings")

data_path = Path("js/data.js")
src = data_path.read_text(encoding="utf-8")

# 1. Remove the old handwritten itemBaseData block.
marker = "const itemBaseData = {"
start = src.index(marker)
end = src.index("\n}", start) + 2
removed = src[start:end]
src = src[:start] + src[end:]
print(f"Removed itemBaseData block ({len(removed.splitlines())} lines)")

# 2. Rewrite item requirement keys + selectors + expense lookups.
for old_name, item_id in OLD_TO_ID.items():
    src = src.replace(f'"{old_name}": new CoinRequirement([getQuerySelector("{old_name}")]',
                      f'"{item_id}": new CoinRequirement([getQuerySelector("{item_id}")]')
    src = src.replace(f'itemBaseData["{old_name}"].expense * 100',
                      f'itemBaseData["{item_id}"].expense.base * 100')
    src = src.replace(f'itemBaseData["{old_name}"].expense',
                      f'itemBaseData["{item_id}"].expense.base')

# Leftover references to old itemBaseData keys would now break - report them.
stale = re.findall(r'itemBaseData\["([^"]+)"\]', src)
if stale:
    print(f"WARNING: leftover itemBaseData references: {sorted(set(stale))}")

# 3. Remove the old handwritten itemCategories block.
marker = "const itemCategories = {"
start = src.index(marker)
end = src.index("\n}", start) + 2
removed = src[start:end]
src = src[:start] + src[end:]
print(f"Removed itemCategories block ({len(removed.splitlines())} lines)")

data_path.write_text(src, encoding="utf-8")
print("Done")