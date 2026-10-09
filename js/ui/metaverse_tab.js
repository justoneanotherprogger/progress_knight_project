// ui/metaverse_tab.js — metaverse tab rendering

import { t } from "../../dist/js/translations.js";
import { getUnpausedGameSpeed } from "../calculations.js";
import { gameData } from "../data.js";
import {
	boostDurationCost,
	canApplyBoost,
	canBuyBoostDuration,
	canBuyChallengeAltar,
	canBuyDarkMatterMult,
	canBuyEssenceMult,
	canBuyEvilTran,
	canBuyHypercubeGain,
	canBuyReduceBoostCooldown,
	challengeAltarCost,
	darkMatterMultCost,
	darkMatterMultGain,
	essenceMultCost,
	essenceMultGain,
	evilTranCost,
	evilTranGain,
	getBoostCooldownSeconds,
	getBoostCooldownString,
	getBoostTimeSeconds,
	getHypercubeCap,
	getHypercubeGeneration,
	getMetaversePerkName,
	getNextPowerOfNumber,
	getPerkCost,
	getTimeTillNextHypercubePower,
	getTotalPerkPoints,
	getUnspentPerksDarkmatterGainBuff,
	hypercubeGainCost,
	perks_cost,
	reduceBoostCooldownCost,
} from "../metaverse.js";
import {
	format,
	formatTime,
	formatTreshold,
	getDynamicProgress,
} from "../utils.js";
import {
	fitText,
	renderRequirementProgress,
	setElementText,
	setHTML,
	updateButtonText,
} from "./helpers.js";

export function renderBoostButton(elemName) {
	// render boost button to look nicier :)
	const boostButton = document.getElementById(elemName);
	if (boostButton == null) return;
	setElementText(boostButton, t("boost"));
	if (gameData.boost_active) {
		// active
		boostButton.classList.add("perk-boost-active");
		boostButton.classList.remove("perk-boost-cooldown");
	} else if (gameData.boost_cooldown <= 0) {
		// ready
		boostButton.classList.remove("perk-boost-active");
		boostButton.classList.remove("perk-boost-cooldown");
	} else {
		// cooldown
		boostButton.classList.add("perk-boost-cooldown");
		boostButton.classList.remove("perk-boost-active");
	}

	boostButton.disabled = !canApplyBoost();
}

export function renderMetaverse() {
	document.getElementById("currentHypercubesCap").hidden =
		getHypercubeCap() === Infinity;
	updateButtonText("currentHypercubesCapValue", format(getHypercubeCap()));

	// Полоса к цене следующего алтаря: все семь алтарей покупаются за
	// гиперкубы, берём самый дешёвый из ещё доступных. Алтарь испытания
	// одноразовый — купленным он из списка выпадает. Цены здесь обычные
	// числа, счёт — Decimal, поэтому сложение через new Decimal.
	const nextAltarCost = Math.min(
		reduceBoostCooldownCost(),
		boostDurationCost(),
		hypercubeGainCost(),
		evilTranCost(),
		essenceMultCost(),
		gameData.metaverse.challenge_altar === 0 ? challengeAltarCost() : Infinity,
		darkMatterMultCost(),
	);
	renderRequirementProgress(
		document.getElementById("metaverseAltarProgress"),
		Number.isFinite(nextAltarCost)
			? getDynamicProgress(gameData.hypercubes, nextAltarCost)
			: null,
		getDynamicProgress(
			new Decimal(gameData.hypercubes).add(getHypercubeGeneration()),
			nextAltarCost,
		),
		"color-hypercubes",
	);

	for (let i = 0; i < 3; i++) {
		const elem = document.getElementById(`timeTillNextHypercubePower${i + 1}`);
		const nextH = getNextPowerOfNumber(gameData.hypercubes * 10 ** i);
		setElementText(
			elem,
			t(
				"hypercubes_in",
				format(nextH),
				formatTime(getTimeTillNextHypercubePower(i)),
			),
		);
		if (i > 0)
			elem.hidden =
				nextH > getHypercubeCap() ||
				gameData.perks_points === 0 ||
				gameData.hypercubes < 1e20 * 10 ** i;
		else elem.hidden = false;
	}

	renderBoostButton("boostMetaButton");

	// Display currency
	updateButtonText("metaverseHypercubes", t("hypercubes"));

	updateButtonText("hypercubesMetaDisplay", format(gameData.hypercubes));
	updateButtonText(
		"hypercubesBonusMetaDisplay",
		`x${format(getHypercubeGeneration() / 0.03)}`,
	);
	updateButtonText("boostCooldownMetaDisplay", getBoostCooldownString());

	// Cost labels & currencies
	updateButtonText("hypercubeGainCostLabel", t("cost"));
	updateButtonText("hypercubeGainCostCurrency", t("hypercubes"));
	updateButtonText("reduceBoostCooldownCostLabel", t("cost"));
	updateButtonText("reduceBoostCooldownCostCurrency", t("hypercubes"));
	updateButtonText("boostDurationCostLabel", t("cost"));
	updateButtonText("boostDurationCostCurrency", t("hypercubes"));
	updateButtonText("evilTranCostLabel", t("cost"));
	updateButtonText("evilTranCostCurrency", t("hypercubes"));
	updateButtonText("essenceMultCostLabel", t("cost"));
	updateButtonText("essenceMultCostCurrency", t("hypercubes"));
	updateButtonText("challengeAltarCostLabel", t("cost"));
	updateButtonText("challengeAltarCostCurrency", t("hypercubes"));
	updateButtonText("darkMatterMultCostLabel", t("cost"));
	updateButtonText("darkMatterMultCostCurrency", t("hypercubes"));

	setHTML(
		document.getElementById("reduceBoostCooldown"),
		t("current_cooldown", formatTime(getBoostCooldownSeconds())),
	);
	updateButtonText(
		"reduceBoostCooldownCost",
		format(reduceBoostCooldownCost()),
	);
	updateButtonText("reduceBoostCooldownBuyButton", t("buy"));
	document.getElementById("reduceBoostCooldownBuyButton").disabled =
		!canBuyReduceBoostCooldown();

	setHTML(
		document.getElementById("boostDuration"),
		t("current_duration", formatTime(getBoostTimeSeconds())),
	);
	updateButtonText("boostDurationCost", format(boostDurationCost()));
	updateButtonText("boostDurationBuyButton", t("buy"));
	document.getElementById("boostDurationBuyButton").disabled =
		!canBuyBoostDuration();

	setHTML(
		document.getElementById("hypercubeGain"),
		t(
			"current_gain_per_s",
			format(getHypercubeGeneration() * getUnpausedGameSpeed(), 2),
		),
	);
	updateButtonText("hypercubeGainCost", format(hypercubeGainCost()));
	updateButtonText("hypercubeGainBuyButton", t("buy"));
	document.getElementById("hypercubeGainBuyButton").disabled =
		!canBuyHypercubeGain();

	setHTML(
		document.getElementById("evilTranGain"),
		t("current_gain", format(evilTranGain(), 2)),
	);
	updateButtonText("evilTranCost", format(evilTranCost()));
	updateButtonText("evilTranBuyButton", t("buy"));
	document.getElementById("evilTranBuyButton").disabled = !canBuyEvilTran();

	setHTML(
		document.getElementById("essenceMultGain"),
		t("current_multiplier", format(essenceMultGain(), 2)),
	);
	updateButtonText("essenceMultCost", format(essenceMultCost()));
	updateButtonText("essenceMultButton", t("buy"));
	document.getElementById("essenceMultButton").disabled = !canBuyEssenceMult();

	updateButtonText("challengeAltarCost", format(challengeAltarCost()));
	updateButtonText(
		"challengeAltarState",
		gameData.metaverse.challenge_altar === 0 ? "" : t("active"),
	);
	updateButtonText("challengeAltarButton", t("buy"));
	document.getElementById("challengeAltarButton").disabled =
		!canBuyChallengeAltar();
	if (gameData.metaverse.challenge_altar === 0)
		document.getElementById("challengeAltarButton").classList.remove("hidden");
	else document.getElementById("challengeAltarButton").classList.add("hidden");

	if (gameData.metaverse.challenge_altar === 0)
		document.getElementById("challengeAltarCostRow").classList.remove("hidden");
	else document.getElementById("challengeAltarCostRow").classList.add("hidden");

	setHTML(
		document.getElementById("darkMatterMultGain"),
		t("current_multiplier", format(darkMatterMultGain(), 2)),
	);
	updateButtonText("darkMatterMultCost", format(darkMatterMultCost()));
	updateButtonText("darkMaterMultButton", t("buy"));
	document.getElementById("darkMaterMultButton").disabled =
		!canBuyDarkMatterMult();

	// Perks
	renderPerks();
}

export function renderPerks() {
	updateButtonText("perkPointDisplay", formatTreshold(gameData.perks_points));
	updateButtonText(
		"totalPerkPointDisplay",
		formatTreshold(getTotalPerkPoints()),
	);
	// Info

	if (gameData.requirements.milestone_the_end_is_near.isCompleted()) {
		document.getElementById("mppInfo").hidden = true;
		document.getElementById("mppInfo2").hidden = false;
		setHTML(
			document.getElementById("mppDMBuff"),
			t("perks_dm_bonus", format(getUnspentPerksDarkmatterGainBuff())),
		);
	} else {
		document.getElementById("mppInfo").hidden = false;
		document.getElementById("mppInfo2").hidden = true;
		setHTML(document.getElementById("mppInfo"), t("perks_info"));
	}

	// PerkButtons
	const total_mpp = getTotalPerkPoints();
	let hide_next = false;
	let index = 0;

	for (const perkName of getSortedPerks()) {
		const key = perkName[0];
		const button = document.getElementById(`id${key}`);

		if (hide_next) button.classList.add("hidden");
		else {
			button.classList.remove("hidden");

			if (gameData.perks[key] === 0) button.classList.remove("active-perk");
			else button.classList.add("active-perk");

			const perk_cost = getPerkCost(key);

			if (total_mpp >= perk_cost) {
				const perkNameEl = button.getElementsByClassName("perkName")[0];
				setElementText(perkNameEl, getMetaversePerkName(key));
				fitText(perkNameEl, 18);
				button.classList.remove("perk-locked");
			} else {
				const perkNameEl = button.getElementsByClassName("perkName")[0];
				setElementText(perkNameEl, t("locked"));
				fitText(perkNameEl, 18);
				button.classList.add("perk-locked");
				if (index % 2 === 1) hide_next = true;
			}
		}
		index++;
	}
}

export function getSortedPerks() {
	const sortable = [];
	for (var perkname in perks_cost) {
		sortable.push([perkname, perks_cost[perkname]]);
	}

	sortable.sort((a, b) => a[1] - b[1]);

	return sortable;
}
