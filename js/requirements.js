// Factory: builds requirement instances from declarative JSON specs (content/requirements.json)

import { itemBaseData } from "../dist/js/items_data.js";
import { requirementsSpecs } from "../dist/js/requirements_data.js";
import { metaverseUnlocks, permanentUnlocks } from "../dist/js/unlocks_data.js";
import {
	AgeRequirement,
	CoinRequirement,
	DarkMatterRequirement,
	DarkOrbsRequirement,
	EssenceRequirement,
	EvilRequirement,
	HypercubeRequirement,
	MetaverseRequirement,
	PerkPointRequirement,
	TaskRequirement,
} from "./classes.js";
import { removeSpaces, removeStrangeCharacters } from "./utils.js";

export function buildRequirementsFromSpec(specs) {
	const result = {};
	for (const [key, spec] of Object.entries(specs)) {
		const selectors = spec.selectors.map((s) =>
			removeSpaces(removeStrangeCharacters(s)),
		);
		switch (spec.type) {
			case "task":
				result[key] = new TaskRequirement(selectors, spec.requirements);
				break;
			case "coins": {
				const reqs = spec.requirements.map((r) => {
					if (r.itemRef)
						return {
							requirement:
								itemBaseData[r.itemRef].expense.base * (r.multiplier ?? 1),
						};
					return r;
				});
				result[key] = new CoinRequirement(selectors, reqs);
				break;
			}
			case "age":
				result[key] = new AgeRequirement(selectors, spec.requirements);
				break;
			case "evil":
				result[key] = new EvilRequirement(selectors, spec.requirements);
				break;
			case "essence":
				result[key] = new EssenceRequirement(selectors, spec.requirements);
				break;
			case "darkMatter":
				result[key] = new DarkMatterRequirement(selectors, spec.requirements);
				break;
			case "darkOrb":
				result[key] = new DarkOrbsRequirement(selectors, spec.requirements);
				break;
			case "metaverse":
				result[key] = new MetaverseRequirement(selectors, spec.requirements);
				break;
			case "hypercube":
				result[key] = new HypercubeRequirement(selectors, spec.requirements);
				break;
			case "perkpoint":
				result[key] = new PerkPointRequirement(selectors, spec.requirements);
				break;
		}
	}
	// Перманентные разблокировки — единственные, чью выполненность можно кэшировать.
	for (const key in result) {
		result[key].permanent =
			permanentUnlocks.includes(key) || metaverseUnlocks.includes(key);
	}
	return result;
}

export const requirementsBaseData =
	buildRequirementsFromSpec(requirementsSpecs);
