import { milestoneBaseData } from "../dist/js/milestones_data.js";
import { getEssenceGain, getEvilGain } from "./calculations.js";
import { EssenceRequirement, EvilRequirement } from "./classes.js";
import { gameData } from "./data.js";
import { getQuerySelector } from "./ui/navigation.js";

export var milestoneData = {};

// milestoneBaseData и milestoneCategories генерируются build.py
// в js/milestones_data.js из content/milestones.json

export function createMilestoneRequirements() {
	for (const key in milestoneBaseData) {
		const milestone = milestoneData[key];
		// Класс выбирается здесь, а не мапой на верхнем уровне модуля: цикл
		// импортов classes.js → calculations.js → milestones.js → classes.js
		// выполняет тело модуля раньше, чем classes.js дойдёт до объявления
		// класса, и обращение к нему падает с TDZ. Вызов функции безопасен —
		// createMilestoneRequirements зовётся из boot.js после инициализации.
		const RequirementClass =
			milestoneBaseData[key].currency === "evil"
				? EvilRequirement
				: EssenceRequirement;
		gameData.requirements[key] = new RequirementClass(
			[getQuerySelector(key)],
			[{ requirement: milestone.threshold }],
		);
	}
}

export function isMilestoneInReach(currency) {
	const isEvil = currency === "evil";
	const total = isEvil
		? gameData.evil.add(getEvilGain())
		: gameData.essence.add(getEssenceGain());
	const RequirementClass = isEvil ? EvilRequirement : EssenceRequirement;

	for (const key in milestoneData) {
		const requirement = gameData.requirements[key];
		if (
			requirement instanceof RequirementClass &&
			!requirement.isCompleted() &&
			total.gte(requirement.requirements[0].requirement)
		)
			return true;
	}
	return false;
}
