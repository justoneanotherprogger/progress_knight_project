// ui/metaverse_tab.js — metaverse tab rendering

function renderBoostButton(elemName) {
	// render boost button to look nicier :)
	const boostButton = document.getElementById(elemName);
	if (boostButton == null) return;
	boostButton.textContent = t("boost");
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

function renderMetaverse() {
	document.getElementById("currentHypercubesCap").hidden =
		getHypercubeCap() == Infinity;
	document.getElementById("currentHypercubesCapValue").textContent = format(
		getHypercubeCap(),
	);

	for (var i = 0; i < 3; i++) {
		const elem = document.getElementById(
			"timeTillNextHypercubePower" + (i + 1),
		);
		const nextH = getNextPowerOfNumber(gameData.hypercubes * 10 ** i);
		elem.textContent = t(
			"hypercubes_in",
			format(nextH),
			formatTime(getTimeTillNextHypercubePower(i)),
		);
		if (i > 0)
			elem.hidden =
				nextH > getHypercubeCap() ||
				gameData.perks_points == 0 ||
				gameData.hypercubes < 1e20 * 10 ** i;
		else elem.hidden = false;
	}

	renderBoostButton("boostMetaButton");

	// Display currency
	document.getElementById("metaverseHypercubes").textContent = t("hypercubes");

	document.getElementById("hypercubesMetaDisplay").textContent = format(
		gameData.hypercubes,
	);
	document.getElementById("hypercubesBonusMetaDisplay").textContent =
		"x" + format(getHypercubeGeneration() / 0.03);
	document.getElementById("boostCooldownMetaDisplay").textContent =
		getBoostCooldownString();

	// Cost labels & currencies
	document.getElementById("hypercubeGainCostLabel").textContent = t("cost");
	document.getElementById("hypercubeGainCostCurrency").textContent =
		t("hypercubes");
	document.getElementById("reduceBoostCooldownCostLabel").textContent =
		t("cost");
	document.getElementById("reduceBoostCooldownCostCurrency").textContent =
		t("hypercubes");
	document.getElementById("boostDurationCostLabel").textContent = t("cost");
	document.getElementById("boostDurationCostCurrency").textContent =
		t("hypercubes");
	document.getElementById("evilTranCostLabel").textContent = t("cost");
	document.getElementById("evilTranCostCurrency").textContent = t("hypercubes");
	document.getElementById("essenceMultCostLabel").textContent = t("cost");
	document.getElementById("essenceMultCostCurrency").textContent =
		t("hypercubes");
	document.getElementById("challengeAltarCostLabel").textContent = t("cost");
	document.getElementById("challengeAltarCostCurrency").textContent =
		t("hypercubes");
	document.getElementById("darkMatterMultCostLabel").textContent = t("cost");
	document.getElementById("darkMatterMultCostCurrency").textContent =
		t("hypercubes");

	document.getElementById("reduceBoostCooldown").innerHTML = t(
		"current_cooldown",
		formatTime(getBoostCooldownSeconds()),
	);
	document.getElementById("reduceBoostCooldownCost").textContent = format(
		reduceBoostCooldownCost(),
	);
	document.getElementById("reduceBoostCooldownBuyButton").textContent =
		t("buy");
	document.getElementById("reduceBoostCooldownBuyButton").disabled =
		!canBuyReduceBoostCooldown();

	document.getElementById("boostDuration").innerHTML = t(
		"current_duration",
		formatTime(getBoostTimeSeconds()),
	);
	document.getElementById("boostDurationCost").textContent = format(
		boostDurationCost(),
	);
	document.getElementById("boostDurationBuyButton").textContent = t("buy");
	document.getElementById("boostDurationBuyButton").disabled =
		!canBuyBoostDuration();

	document.getElementById("hypercubeGain").innerHTML = t(
		"current_gain_per_s",
		format(getHypercubeGeneration() * getUnpausedGameSpeed(), 2),
	);
	document.getElementById("hypercubeGainCost").textContent = format(
		hypercubeGainCost(),
	);
	document.getElementById("hypercubeGainBuyButton").textContent = t("buy");
	document.getElementById("hypercubeGainBuyButton").disabled =
		!canBuyHypercubeGain();

	document.getElementById("evilTranGain").innerHTML = t(
		"current_gain",
		format(evilTranGain(), 2),
	);
	document.getElementById("evilTranCost").textContent = format(evilTranCost());
	document.getElementById("evilTranBuyButton").textContent = t("buy");
	document.getElementById("evilTranBuyButton").disabled = !canBuyEvilTran();

	document.getElementById("essenceMultGain").innerHTML = t(
		"current_multiplier",
		format(essenceMultGain(), 2),
	);
	document.getElementById("essenceMultCost").textContent = format(
		essenceMultCost(),
	);
	document.getElementById("essenceMultButton").textContent = t("buy");
	document.getElementById("essenceMultButton").disabled = !canBuyEssenceMult();

	document.getElementById("challengeAltarCost").textContent = format(
		challengeAltarCost(),
	);
	document.getElementById("challengeAltarState").textContent =
		gameData.metaverse.challenge_altar == 0 ? "" : t("active");
	document.getElementById("challengeAltarButton").textContent = t("buy");
	document.getElementById("challengeAltarButton").disabled =
		!canBuyChallengeAltar();
	if (gameData.metaverse.challenge_altar == 0)
		document.getElementById("challengeAltarButton").classList.remove("hidden");
	else document.getElementById("challengeAltarButton").classList.add("hidden");

	document.getElementById("darkMatterMultGain").innerHTML = t(
		"current_multiplier",
		format(darkMatterMultGain(), 2),
	);
	document.getElementById("darkMatterMultCost").textContent = format(
		darkMatterMultCost(),
	);
	document.getElementById("darkMaterMultButton").textContent = t("buy");
	document.getElementById("darkMaterMultButton").disabled =
		!canBuyDarkMatterMult();

	// Perks
	renderPerks();
}

function renderPerks() {
	document.getElementById("perkPointDisplay").textContent = formatTreshold(
		gameData.perks_points,
	);
	document.getElementById("totalPerkPointDisplay").textContent = formatTreshold(
		getTotalPerkPoints(),
	);
	// Info

	if (gameData.requirements["milestone_the_end_is_near"].isCompleted()) {
		document.getElementById("mppInfo").hidden = true;
		document.getElementById("mppInfo2").hidden = false;
		document.getElementById("mppDMBuff").innerHTML = t(
			"perks_dm_bonus",
			format(getUnspentPerksDarkmatterGainBuff()),
		);
	} else {
		document.getElementById("mppInfo").hidden = false;
		document.getElementById("mppInfo2").hidden = true;
		document.getElementById("mppInfo").innerHTML = t("perks_info");
	}

	// PerkButtons
	const total_mpp = getTotalPerkPoints();
	let hide_next = false;
	let index = 0;

	for (const perkName of getSortedPerks()) {
		const key = perkName[0];
		const button = document.getElementById("id" + key);

		if (hide_next) button.classList.add("hidden");
		else {
			button.classList.remove("hidden");

			if (gameData.perks[key] == 0) button.classList.remove("active-perk");
			else button.classList.add("active-perk");

			const perk_cost = getPerkCost(key);

			if (total_mpp >= perk_cost) {
				const perkNameEl = button.getElementsByClassName("perkName")[0];
				perkNameEl.textContent = getMetaversePerkName(key);
				fitText(perkNameEl, 18);
				button.classList.remove("perk-locked");
			} else {
				const perkNameEl = button.getElementsByClassName("perkName")[0];
				perkNameEl.textContent = t("locked");
				fitText(perkNameEl, 18);
				button.classList.add("perk-locked");
				if (index % 2 == 1) hide_next = true;
			}
		}
		index++;
	}
}

function getSortedPerks() {
	const sortable = [];
	for (var perkname in perks_cost) {
		sortable.push([perkname, perks_cost[perkname]]);
	}

	sortable.sort(function (a, b) {
		return a[1] - b[1];
	});

	return sortable;
}
