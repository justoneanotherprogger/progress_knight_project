// effects.js — target-based effect dispatch

function matchTarget(target, key, task) {
	if (!target) return false;
	switch (target.kind) {
		case "all":
			return true;
		case "item":
			return true;
		case "task":
			return target.task === key;
		case "skill":
			return (
				task instanceof Skill &&
				(!target.category || key in skillCategories[target.category].items)
			);
		case "job":
			return (
				task instanceof Job &&
				(!target.category || task.name in jobCategories[target.category].items)
			);
		default:
			return false;
	}
}

function pushTargetEffects(key, task, list, container) {
	// Скиллы и вехи живут в разных таблицах, но эффекты одного вида:
	// type == container и подходящий target. Кастомные формулы вех
	// (setCustomEffects) подменяют getEffect, плоские считают base.
	const sources = [
		[skillBaseData, gameData.taskData],
		[milestoneBaseData, milestoneData],
	];
	for (const [baseData, gameObjects] of sources) {
		for (const srcKey in baseData) {
			const obj = gameObjects[srcKey];
			if (!obj) continue;
			const effect = obj.baseData.effect;
			if (!effect || effect.type !== container) continue;
			if (matchTarget(effect.target, key, task))
				list.push(obj.getEffect.bind(obj));
		}
	}
}

const EFFECT_LABEL_KEYS = {
	all: "effect_all_xp",
	skill: "effect_skill_xp",
	"skill:category:category_fundamentals": "effect_fundamentals_xp",
	"skill:category:category_void_manipulation": "effect_void_manipulation_xp",
	job: "effect_job_xp",
	"task:skill_strength": "effect_strength_xp",
	"skill:category:category_magic": "effect_magic_xp",
	"job:category:category_military": "effect_army_xp",
	"job:category:category_mage_collegium": "effect_collegium_xp",
	"job:category:category_the_void": "effect_void_xp",
	"job:category:category_galactic_council": "effect_galactic_xp",
	item: "effect_expense_reduction",
};

function labelKey(target) {
	if (!target) return "";
	if (target.kind === "resource") {
		if (target.id === "max_level") return "effect_max_level_multiplier";
		return "effect_" + target.id;
	}
	let index = target.kind;
	if (target.kind === "task") index += ":" + target.task;
	else if (target.category) index += ":category:" + target.category;
	return EFFECT_LABEL_KEYS[index] || "";
}
