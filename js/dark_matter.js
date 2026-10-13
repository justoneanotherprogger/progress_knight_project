// Costs Dark Matter

import { darkMatterAbilities } from "../dist/js/dark_matter_abilities_data.js";
import { t } from "../dist/js/translations.js";
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

const DARK_ORB_SOFTCAP_BASE = new Decimal(10);
const DARK_ORB_SOFTCAP_STEP = 100;
const DARK_ORB_SOFTCAP_POWER = 0.95;

// Прогрессивный софткап генерации сфер — лестница порогов 1e100, 1e200,
// 1e300… На каждой ступени всё выше порога сжимается на 5% степени, и
// результат идёт на вход следующей ступени, а не возвращается в начало.
// Ступеней не потолок: 1e10000 на входе даёт 1e3576, 1e100000 — 1e7763.
// Отдельная функция вместо softcap из utils.js: та даёт потолок с потолком,
// а здесь нужна степенная кривая без верхней границы.
function softcapDarkOrbs(value) {
	let capped = value;
	let exponent = DARK_ORB_SOFTCAP_STEP;
	let threshold = DARK_ORB_SOFTCAP_BASE.pow(exponent);

	while (capped.gt(threshold)) {
		capped = threshold.times(capped.div(threshold).pow(DARK_ORB_SOFTCAP_POWER));
		exponent += DARK_ORB_SOFTCAP_STEP;
		threshold = DARK_ORB_SOFTCAP_BASE.pow(exponent);
	}

	return capped;
}

// Rewards
export function getDarkOrbGeneration() {
	if (gameData.dark_matter_shop.dark_orb_generator === 0) return new Decimal(0);

	const darkOrbiter = milestoneData.milestone_dark_orbiter.getEffect();

	return darkOrbiter.times(
		softcapDarkOrbs(
			new Decimal(100).pow(gameData.dark_matter_shop.dark_orb_generator - 1),
		),
	);
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
function getAbility(key) {
	return darkMatterAbilities.find((ability) => ability.key === key);
}

export function resetSkillTree() {
	if (
		(gameData.dark_matter.lt(1e11) &&
			confirm(t("confirm_reset_dm_abilities"))) ||
		gameData.dark_matter.gte(1e11)
	) {
		for (const ability of darkMatterAbilities)
			gameData.dark_matter_shop[ability.key] = 0;
		return true;
	}
	return false;
}

export function buyAbility(key, number) {
	buyDarkMatterSkill(key, getAbility(key).cost, number);
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

// Множитель всех способностей по цели. Уровень 3 (перк
// both_dark_mater_skills) считает купленными оба уровня, поэтому
// проверяются и [1, 3], и [2, 3]. Негативные эффекты снимает перк
// positive_dark_mater_skills — и в расчёте, и в тексте описания.
function getAbilityEffect(target) {
	let mult = 1;

	for (const ability of darkMatterAbilities) {
		const bought = gameData.dark_matter_shop[ability.key] ?? 0;
		if (bought === 0) continue;

		for (const level of [1, 2]) {
			if (![level, 3].includes(bought)) continue;

			const effects = ability.levels[level];
			const gain = effects.positive[target];
			const loss = effects.negative?.[target];

			if (gain != null) mult *= gain;
			if (loss != null && gameData.perks.positive_dark_mater_skills === 0)
				mult *= loss;
		}
	}

	return mult;
}

export function getDarkMatterSkillIncome() {
	if (gameData.active_challenge === "the_darkest_time") return 0;

	return getAbilityEffect("income");
}

export function getDarkMatterSkillTimeWarping() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	return getAbilityEffect("timewarping");
}

export function getDarkMatterSkillXP() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	return getAbilityEffect("xp");
}

export function getDarkMatterSkillEssence() {
	if (gameData.active_challenge === "the_darkest_time") return 0.25;

	return getAbilityEffect("essence");
}

export function getDarkMatterSkillEvil() {
	if (gameData.active_challenge === "the_darkest_time") return 0.25;

	return getAbilityEffect("evil");
}

export function getDarkMatterSkillDarkMater() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	return getAbilityEffect("darkMatter");
}
