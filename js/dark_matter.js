import { darkMatterAbilities } from "../dist/js/dark_matter_abilities_data.js";
import { darkMatterShop } from "../dist/js/dark_matter_shop_data.js";
import { t } from "../dist/js/translations.js";
import { gameData } from "./data.js";
import { hasAbilityPerk } from "./metaverse.js";
import { milestoneData } from "./milestones.js";

export function getPurchase(key) {
	return darkMatterShop.find((purchase) => purchase.key === key);
}

// Цена: base^(куплено + shift), у одноразовых — фиксированная flat.
export function getShopCost(key) {
	const { cost } = getPurchase(key);
	if (cost.flat != null) return new Decimal(cost.flat);

	return new Decimal(cost.base).pow(
		(gameData.dark_matter_shop[key] ?? 0) + cost.shift,
	);
}

export function isDecimalInfinity(value) {
	if (typeof value !== "object") return value === Infinity;
	return value.toString() === "Infinity";
}

export function canBuyShopPurchase(key) {
	const purchase = getPurchase(key);
	const cost = getShopCost(key);

	if (
		purchase.requires_finite_gain &&
		isDecimalInfinity(getShopGain(purchase.gain.target))
	)
		return false;

	return gameData[purchase.currency].gte(cost) && !isDecimalInfinity(cost);
}

export function buyShopPurchase(key) {
	if (!canBuyShopPurchase(key)) return;

	const purchase = getPurchase(key);
	gameData[purchase.currency] = gameData[purchase.currency].sub(
		getShopCost(key),
	);
	gameData.dark_matter_shop[key] = purchase.one_time
		? true
		: (gameData.dark_matter_shop[key] ?? 0) + 1;
}

// Мягкий потолок: лестница порогов base^step, base^(2·step)…, на каждой
// ступени всё выше порога сжимается на долю степени, и результат идёт на
// вход следующей. Ступеней потолка нет. Отдельная функция вместо softcap из
// utils.js: там потолок с потолком, здесь нужна степенная кривая без верхней
// границы.
function softcapGain(value, { base, step, power }) {
	let capped = new Decimal(value);
	let exponent = step;
	let threshold = new Decimal(base).pow(exponent);

	while (capped.gt(threshold)) {
		capped = threshold.times(capped.div(threshold).pow(power));
		exponent += step;
		threshold = new Decimal(base).pow(exponent);
	}

	return capped;
}

// Награда по цели: произведение наград всех покупок, которые её дают.
// Линейная награда считается в числах, степенная — в Decimal, иначе
// получатель складывал бы несравнимые типы.
export function getShopGain(target) {
	let gain = 1;

	for (const purchase of darkMatterShop) {
		const bought = gameData.dark_matter_shop[purchase.key] ?? 0;
		if (purchase.gain?.target !== target) continue;
		if (bought === 0) {
			// Награда, которая не существует до первой покупки: счётчик сфер
			// должен показывать ноль, а не единицу.
			if (purchase.gain.zero_until_bought) gain = new Decimal(gain).times(0);
			continue;
		}

		if (purchase.gain.linear != null) {
			gain *= 1 + purchase.gain.linear * bought;
			continue;
		}

		gain = new Decimal(gain).times(
			new Decimal(purchase.gain.base).pow(bought + purchase.gain.shift),
		);
		if (purchase.gain.softcap) gain = softcapGain(gain, purchase.gain.softcap);
		if (purchase.gain.milestone)
			gain = gain.times(milestoneData[purchase.gain.milestone].getEffect());
	}

	return gain;
}

export function getDarkOrbGeneration() {
	return getShopGain("dark_orbs");
}

export function getTaaAndMagicXpGain() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	return getShopGain("xp");
}

export function getAGiftFromGodEssenceGain() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	return getShopGain("essence");
}

export function getLifeCoachIncomeGain() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	return getShopGain("income");
}

export function getGottaBeFastGain() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	return getShopGain("timewarping");
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
			if (loss != null && !hasAbilityPerk("negative")) mult *= loss;
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
