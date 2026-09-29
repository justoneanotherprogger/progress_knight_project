import { milestoneBaseData } from "../dist/js/milestones_data.js";
import { getEssenceGain } from "./calculations.js";
import { EssenceRequirement, EvilRequirement } from "./classes.js";
import { gameData } from "./data.js";
import { getQuerySelector } from "./ui/navigation.js";

export var milestoneData = {};

// milestoneBaseData и milestoneCategories генерируются build.py
// в js/milestones_data.js из content/milestones.json

// Валюта вехи из контента → класс требования. Незаданная валюта — эссенция,
// как у всех вех до #42.
const MILESTONE_REQUIREMENT_CLASSES = {
	essence: EssenceRequirement,
	evil: EvilRequirement,
};

export function createMilestoneRequirements() {
	for (const key in milestoneBaseData) {
		const milestone = milestoneData[key];
		const RequirementClass =
			MILESTONE_REQUIREMENT_CLASSES[milestoneBaseData[key].currency] ??
			EssenceRequirement;
		gameData.requirements[key] = new RequirementClass(
			[getQuerySelector(key)],
			[{ requirement: milestone.threshold }],
		);
	}
}

export function isNextMilestoneInReach() {
	const totalEssence = gameData.essence.add(getEssenceGain());

	for (const key in milestoneData) {
		const requirementObject = gameData.requirements[key];

		if (requirementObject instanceof EssenceRequirement) {
			if (!requirementObject.isCompleted()) {
				if (totalEssence.gte(requirementObject.requirements[0].requirement))
					return true;
			}
		}
	}
	return false;
}
