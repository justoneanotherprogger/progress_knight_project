import { t } from "../dist/js/translations.js";
import { applyUnpausedSpeed } from "./calculations.js";
import {
	buyEssenceCollector,
	buyExplosionOfTheUniverse,
	buyMultiverseExplorer,
	buySpeedOfLife,
	buyYourGreatestDebt,
} from "./dark_matter.js";
import { gameData, updateSpeed } from "./data.js";
import { formatTime, softcap } from "./utils.js";

export function getHypercubeGeneration() {
	if (gameData.rebirthFiveCount === 0) return 0;

	const tesseractEffect = gameData.itemData.item_tesseract.getEffect();
	const hypersphereEffect = gameData.itemData.item_hypersphere.getEffect();

	return (
		0.03 *
		hypersphereEffect *
		tesseractEffect *
		(gameData.metaverse.hypercube_gain_modifier === 0
			? 1
			: gameData.metaverse.hypercube_gain_modifier) *
		(gameData.perks.hypercube_boost === 1 ? 10 : 1) *
		(gameData.perks.hyper_speed === 1 ? 1000 : 1)
	);
}

export function getNextPowerOfNumber(number, add_power = 0) {
	return 10 ** (add_power + Math.ceil(Math.log10(number)));
}

export function getTimeTillNextHypercubePower(add_power = 0) {
	return (
		(getNextPowerOfNumber(gameData.hypercubes, add_power) -
			gameData.hypercubes) /
		(applyUnpausedSpeed(getHypercubeGeneration()) * updateSpeed)
	);
}

export function getBoostTimeSeconds() {
	return gameData.metaverse.boost_timer_modifier === 0
		? 60.0
		: 60.0 * gameData.metaverse.boost_timer_modifier;
}

export function getBoostCooldownSeconds() {
	return gameData.metaverse.boost_cooldown_modifier === 0
		? 60.0 * 10.0
		: (60.0 * 10.0) / gameData.metaverse.boost_cooldown_modifier;
}

export function canApplyBoost() {
	return gameData.boost_cooldown <= 0 && !gameData.boost_active;
}

export function applyBoost() {
	if (canApplyBoost()) {
		gameData.boost_timer = getBoostTimeSeconds();
		gameData.boost_active = true;
	}
}

// shop
export function reduceBoostCooldownCost() {
	return 1000 * 3 ** (gameData.metaverse.boost_cooldown_modifier - 1);
}

export function canBuyReduceBoostCooldown() {
	return gameData.hypercubes >= reduceBoostCooldownCost();
}

export function buyReduceBoostCooldown() {
	if (canBuyReduceBoostCooldown()) {
		gameData.hypercubes -= reduceBoostCooldownCost();
		gameData.metaverse.boost_cooldown_modifier += 1;
	}
}

export function boostDurationCost() {
	return 5000 * 5 ** (gameData.metaverse.boost_timer_modifier - 1);
}

export function canBuyBoostDuration() {
	return gameData.hypercubes >= boostDurationCost();
}

export function buyBoostDuration() {
	if (canBuyBoostDuration()) {
		gameData.hypercubes -= boostDurationCost();
		gameData.metaverse.boost_timer_modifier += 1;
	}
}

export function hypercubeGainCost() {
	return 800 * 1.5 ** (gameData.metaverse.hypercube_gain_modifier - 1);
}

export function canBuyHypercubeGain() {
	return gameData.hypercubes >= hypercubeGainCost();
}

export function buyHypercubeGain() {
	if (canBuyHypercubeGain()) {
		gameData.hypercubes -= hypercubeGainCost();
		gameData.metaverse.hypercube_gain_modifier += 1;
	}
}

export function evilTranGain() {
	return gameData.metaverse.evil_tran_gain === 0
		? new Decimal(0)
		: new Decimal(250000 * 10 ** gameData.metaverse.evil_tran_gain);
}

export function evilTranCost() {
	return 100000000 * 10 ** gameData.metaverse.evil_tran_gain;
}

export function canBuyEvilTran() {
	return gameData.hypercubes >= evilTranCost();
}

export function buyEvilTran() {
	if (canBuyEvilTran()) {
		gameData.hypercubes -= evilTranCost();
		gameData.metaverse.evil_tran_gain += 1;
	}
}

export function essenceMultGain() {
	return gameData.metaverse.essence_gain_modifier === 0
		? 1
		: 10 ** gameData.metaverse.essence_gain_modifier;
}

export function essenceMultCost() {
	return 1e9 * 10 ** gameData.metaverse.essence_gain_modifier;
}

export function canBuyEssenceMult() {
	return gameData.hypercubes >= essenceMultCost();
}

export function buyEssenceMult() {
	if (canBuyEssenceMult()) {
		gameData.hypercubes -= essenceMultCost();
		gameData.metaverse.essence_gain_modifier += 1;
	}
}

export function challengeAltarCost() {
	return 1e10;
}

export function canBuyChallengeAltar() {
	return (
		gameData.metaverse.challenge_altar === 0 &&
		gameData.hypercubes >= challengeAltarCost()
	);
}

export function buyChallengeAltar() {
	if (canBuyChallengeAltar()) {
		gameData.hypercubes -= challengeAltarCost();
		gameData.metaverse.challenge_altar = 1;
	}
}

export function darkMatterMultGain() {
	return gameData.metaverse.dark_mater_gain_modifer === 0
		? 1
		: new Decimal(10).pow(gameData.metaverse.dark_mater_gain_modifer);
}

export function darkMatterMultCost() {
	return 1e19 * 10 ** gameData.metaverse.dark_mater_gain_modifer;
}

export function canBuyDarkMatterMult() {
	return gameData.hypercubes >= darkMatterMultCost();
}

export function buyDarkMaterMult() {
	if (canBuyDarkMatterMult()) {
		gameData.hypercubes -= darkMatterMultCost();
		gameData.metaverse.dark_mater_gain_modifer += 1;
	}
}

// perks

export function getMetaversePerkPointsGain() {
	if (gameData.essence.gte(1e90))
		return (
			(gameData.perks.more_perk_points === 1 ? 10 : 1) *
			(gameData.perks.double_perk_points_gain === 1 ? 2 : 1) *
			(Math.floor(gameData.essence.log10()) - 89)
		);

	return 0;
}

export const perks_cost = {
	auto_dark_orb: 1,
	auto_dark_shop: 1,
	auto_boost: 1,
	instant_evil: 2,
	hypercube_boost: 5,
	instant_essence: 10,
	save_challenges: 15,
	instant_dark_matter: 25,
	auto_sacrifice: 40,
	double_perk_points_gain: 50,
	positive_dark_mater_skills: 100,
	hyper_speed: 200,
	both_dark_mater_skills: 300,
	keep_dark_mater_skills: 500,
	evil_booster: 2500,
	more_perk_points: 5000,
};

export function getMetaversePerkName(perkName) {
	return t(`perk_${perkName}`);
}

export function getPerkCost(perkName) {
	return perks_cost[perkName];
}

export function canBuyPerk(perkName) {
	return gameData.perks_points >= getPerkCost(perkName);
}

export function buyPerk(perkName) {
	if (gameData.perks[perkName] === 0) {
		if (canBuyPerk(perkName)) {
			gameData.perks_points -= getPerkCost(perkName);
			gameData.perks[perkName] = 1;

			if (perkName === "both_dark_mater_skills") {
				buySpeedOfLife(3);
				buyYourGreatestDebt(3);
				buyEssenceCollector(3);
				buyExplosionOfTheUniverse(3);
				buyMultiverseExplorer(3);
			}
		}
	} else {
		gameData.perks[perkName] = 0;
		gameData.perks_points += getPerkCost(perkName);

		if (perkName === "both_dark_mater_skills") {
			if (gameData.dark_matter_shop.speed_is_life === 3)
				gameData.dark_matter_shop.speed_is_life = 2;
			if (gameData.dark_matter_shop.your_greatest_debt === 3)
				gameData.dark_matter_shop.your_greatest_debt = 1;
			if (gameData.dark_matter_shop.essence_collector === 3)
				gameData.dark_matter_shop.essence_collector = 2;
			if (gameData.dark_matter_shop.explosion_of_the_universe === 3)
				gameData.dark_matter_shop.explosion_of_the_universe = 2;
			if (gameData.dark_matter_shop.multiverse_explorer === 3)
				gameData.dark_matter_shop.multiverse_explorer = 2;
		}
	}
}

export function getTotalPerkPoints() {
	let total = gameData.perks_points;
	for (const key of Object.keys(gameData.perks)) {
		if (gameData.perks[key] === 1) total += getPerkCost(key);
	}
	return total;
}

export function collectPerkPoints(value) {
	for (const key of Object.keys(gameData.perks)) {
		if (gameData.perks[key] === value) {
			buyPerk(key);
		}
	}
}

export function getBoostCooldownString() {
	return gameData.boost_active
		? `${t("active")}: ${formatTime(gameData.boost_timer)}`
		: gameData.boost_cooldown <= 0
			? t("boost_ready")
			: t("boost_cooldown", formatTime(gameData.boost_cooldown));
}

export function getTimeIsAFlatCircleXP() {
	if (gameData.active_challenge === "the_darkest_time") return 1;

	return gameData.requirements.milestone_time_is_a_flat_circle.isCompleted()
		? 1e50
		: 1;
}

export function getUnspentPerksDarkmatterGainBuff() {
	const effect = softcap(gameData.perks_points * 0.0027 + 2, 75, 0.01);

	return gameData.requirements.milestone_the_end_is_near.isCompleted()
		? 10 ** effect
		: 1;
}

export function getHypercubeCap(next = 0) {
	if (
		getTotalPerkPoints() >= 1 ||
		(next > 0 && getMetaversePerkPointsGain() > 0)
	)
		return Infinity;

	return 1e7 * 10 ** ((gameData.rebirthFiveCount + next) * 3);
}
