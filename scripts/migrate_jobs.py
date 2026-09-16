"""Migrate jobs to content/jobs.json (unified id-format) and update references.

1) Строит content/jobs.json: jobCategories unified (как itemCategories/skillCategories).
2) Обновляет content/skills.json:
   - requirement.tasks[].task: имена работ -> job_*
   - effect.target.category (kind == "job"): категории работ -> category_*
3) Печатает job map (для правок локалей, save.js, requirementsBaseData).
"""
import json
import re
import sys
from pathlib import Path

TEMP = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("C:/Users/C523~1/AppData/Local/Temp/opencode/jobs_extract.json")
JOBS_OUT = Path("content/jobs.json")
SKILLS = Path("content/skills.json")

extract = json.loads(TEMP.read_text(encoding="utf-8"))
base: dict = extract["base"]      # { "Beggar": {"name","maxXp","income","heroxp"} }
cats: dict = extract["cats"]      # { "Common work": ["Beggar", ...] }

CATEGORY_IDS = {
    "Common work": "category_common_work",
    "Military": "category_military",
    "Mage Collegium": "category_mage_collegium",
    "The Void": "category_the_void",
    "Galactic Council": "category_galactic_council",
    "Metaverse Guards": "category_metaverse_guards",
}

def to_job_id(name: str) -> str:
    s = re.sub(r"[^A-Za-z0-9]+", "_", name).lower().strip("_")
    return f"job_{s}"

JOB_IDS = {name: to_job_id(name) for name in base}
assert len(set(JOB_IDS.values())) == len(JOB_IDS), "job id collision!"
print("job ids:", len(JOB_IDS))

# --- content/jobs.json ---
job_categories = {}
for old_cat, job_names in cats.items():
    cat_id = CATEGORY_IDS[old_cat]
    items = {}
    for jn in job_names:
        jid = JOB_IDS[jn]
        items[jid] = {"name": jid, **base[jn]}
    job_categories[cat_id] = {"name": cat_id, "items": items}

JOBS_OUT.write_text(
    json.dumps({"jobCategories": job_categories}, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
print(f"written {JOBS_OUT}")

# --- skills.json: task refs + job target categories ---
skills = json.loads(SKILLS.read_text(encoding="utf-8"))

fixed_tasks = 0
fixed_targets = 0
for cat in skills["skillCategories"].values():
    for sk in cat["items"].values():
        # requirement.tasks[].task — ссылки на работы
        req = sk.get("requirement")
        if req and req.get("type") == "task":
            for t in req.get("tasks", []):
                task_ref = t.get("task")
                if task_ref in JOB_IDS:
                    t["task"] = JOB_IDS[task_ref]
                    fixed_tasks += 1
        # effect.target.category — категории работ
        effect = sk.get("effect")
        target = effect.get("target") if isinstance(effect, dict) else None
        if isinstance(target, dict) and target.get("kind") == "job":
            cat_ref = target.get("category")
            if cat_ref in CATEGORY_IDS:
                target["category"] = CATEGORY_IDS[cat_ref]
                fixed_targets += 1

SKILLS.write_text(
    json.dumps(skills, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)
print(f"skills.json: task refs fixed {fixed_tasks}, job-target categories fixed {fixed_targets}")

# --- печать map для последующих правок ---
print("\nJOB IDS:")
for old, jid in JOB_IDS.items():
    print(f'    "{old}": "{jid}",')
print("\nCATEGORY IDS:")
for old, cid in CATEGORY_IDS.items():
    print(f'    "{old}": "{cid}",')