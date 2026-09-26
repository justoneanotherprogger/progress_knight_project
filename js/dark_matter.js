// Costs Dark Matter
import { getDarkMatter } from "./calculations.js";
import { gameData } from "./data.js";
import { milestoneData } from "./milestones.js";

export function getDarkOrbGeneratorCost() {
	return new Decimal(1.2).pow(gameData.dark_matter_shop.dark_orb_generator);
}

export function isDecimalInfinity(value) {
	if (typeof value !== "object") return value === Infinity;
	return value.toString() === "Infinity";
}

export function canBuyDarkOrbGenerator() {
	return (
		gameData.dark_matter.gte(getDarkOrbGeneratorCost()) &&
		!isDecimalInfinity(getDarkOrbGeneration())
	);
}

export function buyDarkOrbGenerator() {
	if (canBuyDarkOrbGenerator()) {
		gameData.dark_matter = gameData.dark_matter.sub(getDarkOrbGeneratorCost());
		gameData.dark_matter_shop.dark_orb_generator += 1;
	}
}

// Costs Dark Orbs
export function getADealWithTheChairmanCost() {
	return new Decimal(1e3).pow(
		gameData.dark_matter_shop.a_deal_with_the_chairman + 1,
	);
}

export function canBuyADealWithTheChairman() {
	return (
		gameData.dark_orbs.gte(getADealWithTheChairmanCost()) &&
		!isDecimalInfinity(getADealWithTheChairmanCost())
	);
}

export function buyADealWithTheChairman() {
	if (canBuyADealWithTheChairman()) {
		gameData.dark_orbs = gameData.dark_orbs.sub(getADealWithTheChairmanCost());
		gameData.dark_matter_shop.a_deal_with_the_chairman += 1;
	}
}

export function getAGiftFromGodCost() {
	return new Decimal(1e5).pow(gameData.dark_matter_shop.a_gift_from_god + 1);
}

export function canBuyAGiftFromGod() {
	return (
		gameData.dark_orbs.gte(getAGiftFromGodCost()) &&
		!isDecimalInfinity(getAGiftFromGodCost())
	);
}

export function buyAGiftFromGod() {
	if (canBuyAGiftFromGod()) {
		gameData.dark_orbs = gameData.dark_orbs.sub(getAGiftFromGodCost());
		gameData.dark_matter_shop.a_gift_from_god += 1;
	}
}

export function getLifeCoachCost() {
	return new Decimal(1e10).pow(gameData.dark_matter_shop.life_coach + 1);
}

export function canBuyLifeCoach() {
	return (
		gameData.dark_orbs.gte(getLifeCoachCost()) &&
		!isDecimalInfinity(getLifeCoachCost())
	);
}

export function buyLifeCoach() {
	if (canBuyLifeCoach()) {
		gameData.dark_orbs = gameData.dark_orbs.sub(getLifeCoachCost());
		gameData.dark_matter_shop.life_coach += 1;
	}
}

export function getGottaBeFastCost() {
	return new Decimal(5e7).pow(gameData.dark_matter_shop.gotta_be_fast + 1);
}

export function canBuyGottaBeFast() {
	return (
		gameData.dark_orbs.gte(getGottaBeFastCost()) &&
		!isDecimalInfinity(getGottaBeFastCost())
	);
}

export function buyGottaBeFast() {
	if (canBuyGottaBeFast()) {
		gameData.dark_orbs = gameData.dark_orbs.sub(getGottaBeFastCost());
		gameData.dark_matter_shop.gotta_be_fast += 1;
	}
}

// Rewards
export function getDarkOrbGeneration() {
	if (gameData.dark_matter_shop.dark_orb_generator === 0) return new Decimal(0);

	const darkOrbiter = milestoneData.milestone_dark_orbiter.getEffect();

	return new Decimal(100)
		.pow(gameData.dark_matter_shop.dark_orb_generator - 1)
		.times(darkOrbiter);
}

export function getTaaAndMagicXpGain() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	return new Decimal(4).pow(gameData.dark_matter_shop.a_deal_with_the_chairman);
}

export function getAGiftFromGodEssenceGain() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	return new Decimal(2.1).pow(gameData.dark_matter_shop.a_gift_from_god);
}

export function getLifeCoachIncomeGain() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	return new Decimal(14).pow(gameData.dark_matter_shop.life_coach);
}

export function getGottaBeFastGain() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	return 1 + 0.2 * gameData.dark_matter_shop.gotta_be_fast;
}

export function getAMiracleCost() {
	return 10;
}

// Permanent unlocks
export function canBuyAMiracle() {
	return getDarkMatter().gte(getAMiracleCost());
}

export function buyAMiracle() {
	if (canBuyAMiracle()) {
		gameData.dark_matter_shop.a_miracle = true;
		gameData.dark_matter = gameData.dark_matter.sub(getAMiracleCost());
	}
}

// Skill tree
export function resetSkillTree() {
	if (
		(gameData.dark_matter.lt(1e11) &&
			confirm(
				"Are you sure that you want to reset your Dark Matter Abilities?",
			)) ||
		gameData.dark_matter.gte(1e11)
	) {
		gameData.dark_matter_shop.speed_is_life = 0;
		gameData.dark_matter_shop.your_greatest_debt = 0;
		gameData.dark_matter_shop.essence_collector = 0;
		gameData.dark_matter_shop.explosion_of_the_universe = 0;
		gameData.dark_matter_shop.multiverse_explorer = 0;
		return true;
	}
	return false;
}

export function buySpeedOfLife(number) {
	buyDarkMatterSkill("speed_is_life", 100, number);
}

export function buyYourGreatestDebt(number) {
	buyDarkMatterSkill("your_greatest_debt", 1000, number);
}

export function buyEssenceCollector(number) {
	buyDarkMatterSkill("essence_collector", 10000, number);
}

export function buyExplosionOfTheUniverse(number) {
	buyDarkMatterSkill("explosion_of_the_universe", 100000, number);
}

export function buyMultiverseExplorer(number) {
	buyDarkMatterSkill("multiverse_explorer", 100000000, number);
}

export function buyDarkMatterSkill(skill_name, cost, number) {
	if (gameData.dark_matter.gte(cost)) {
		gameData.dark_matter = gameData.dark_matter.sub(cost);

		if (gameData.dark_matter_shop[skill_name] === 0)
			gameData.dark_matter_shop[skill_name] = number;
		else if (
			gameData.dark_matter_shop[skill_name] === 1 &&
			(number === 2 || number === 3)
		)
			gameData.dark_matter_shop[skill_name] = 3;
		else if (
			gameData.dark_matter_shop[skill_name] === 2 &&
			(number === 1 || number === 3)
		)
			gameData.dark_matter_shop[skill_name] = 3;
		else gameData.dark_matter = gameData.dark_matter.add(cost);
	}
}

export function getDarkMatterSkillIncome() {
	if (gameData.active_challenge === "the_darkest_time") return 0;

	if (gameData.perks.positive_dark_mater_skills === 1) return 1;

	let income = 1;

	income *= [1, 3].includes(gameData.dark_matter_shop.your_greatest_debt)
		? 0.1
		: 1;
	income *= [2, 3].includes(gameData.dark_matter_shop.your_greatest_debt)
		? 0.5
		: 1;
	income *= [2, 3].includes(gameData.dark_matter_shop.essence_collector)
		? 0.04
		: 1;
	income *= [2, 3].includes(gameData.dark_matter_shop.explosion_of_the_universe)
		? 0.00001
		: 1;

	return income;
}

export function getDarkMatterSkillTimeWarping() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	let timewarping = 1;

	timewarping *= [1, 3].includes(gameData.dark_matter_shop.speed_is_life)
		? 3
		: 1;
	timewarping *= [2, 3].includes(gameData.dark_matter_shop.speed_is_life)
		? 7
		: 1;
	timewarping *= [1, 3].includes(gameData.dark_matter_shop.multiverse_explorer)
		? gameData.perks.positive_dark_mater_skills === 1
			? 1
			: 0.001
		: 1;

	return timewarping;
}

export function getDarkMatterSkillXP() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	let xp = 1;

	xp *= [1, 3].includes(gameData.dark_matter_shop.your_greatest_debt) ? 500 : 1;
	xp *= [1, 3].includes(gameData.dark_matter_shop.explosion_of_the_universe)
		? 1e100
		: 1;
	xp *= [2, 3].includes(gameData.dark_matter_shop.explosion_of_the_universe)
		? 1e150
		: 1;

	return xp;
}

export function getDarkMatterSkillEssence() {
	if (gameData.active_challenge === "the_darkest_time") return 0.25;

	let ess = 1;

	ess *=
		gameData.perks.positive_dark_mater_skills === 0 &&
		[2, 3].includes(gameData.dark_matter_shop.speed_is_life)
			? 0.5
			: 1;
	ess *=
		gameData.perks.positive_dark_mater_skills === 0 &&
		[1, 3].includes(gameData.dark_matter_shop.explosion_of_the_universe)
			? 0.5
			: 1;

	ess *= [1, 3].includes(gameData.dark_matter_shop.essence_collector) ? 500 : 1;
	ess *= [2, 3].includes(gameData.dark_matter_shop.essence_collector)
		? 1000
		: 1;

	ess *= [1, 3].includes(gameData.dark_matter_shop.multiverse_explorer)
		? 5000
		: 1;
	ess *= [2, 3].includes(gameData.dark_matter_shop.multiverse_explorer)
		? 10000
		: 1;

	return ess;
}

export function getDarkMatterSkillEvil() {
	if (gameData.active_challenge === "the_darkest_time") return 0.25;

	let evil = 1;

	evil *= [2, 3].includes(gameData.dark_matter_shop.your_greatest_debt)
		? 100
		: 1;
	evil *=
		gameData.perks.positive_dark_mater_skills === 0 &&
		[1, 3].includes(gameData.dark_matter_shop.speed_is_life)
			? 0.5
			: 1;
	evil *=
		gameData.perks.positive_dark_mater_skills === 0 &&
		[1, 3].includes(gameData.dark_matter_shop.essence_collector)
			? 0.5
			: 1;

	return evil;
}
export function getDarkMatterSkillDarkMater() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	return gameData.perks.positive_dark_mater_skills === 0 &&
		[2, 3].includes(gameData.dark_matter_shop.multiverse_explorer)
		? 0.01
		: 1;
}
