// ui/challenges_tab.js — challenges tab rendering

import { t } from "../../dist/js/translations.js";
import { getChallengeBonus, getChallengeGoal } from "../challenges.js";
import {
	CHALLENGE_DANCE_HAPPINESS_EXPONENT,
	CHALLENGE_LEGENDS_WARP_EXPONENT,
	CHALLENGE_RICH_INCOME_EXPONENT,
	CHALLENGE_TIME_WARP_EXPONENT,
	CHALLENGE_UNHAPPY_HAPPINESS_EXPONENT,
	gameData,
	LIFESPAN_CHALLENGE_EXPONENT,
} from "../data.js";
import {
	format,
	getChallengeTranslatedName,
	getFormattedChallengeTaskGoal,
} from "../utils.js";

export function renderChallenges() {
	document.getElementById("activeChallengeName").textContent =
		getChallengeTranslatedName(gameData.active_challenge);

	if (gameData.active_challenge === "") {
		document.getElementById("exitChallengeDiv").hidden = true;

		for (let i = 1; i <= Object.keys(gameData.challenges).length; i++) {
			const element = document.getElementById(`challengeButton${i}`);
			if (element != null) {
				element.textContent = t("enter_challenge");
				element.classList.remove("hidden");
			}
		}
	} else {
		document.getElementById("exitChallengeDiv").hidden = false;

		for (let i = 1; i <= Object.keys(gameData.challenges).length; i++) {
			const element = document.getElementById(`challengeButton${i}`);
			if (element != null) element.classList.add("hidden");
		}

		renderCurrentChallengeReward("currentChallengeReward");
	}

	//TODO (indomit)

	document.getElementById("challengeGoal1").textContent = t(
		"challenge_goal",
		format(getChallengeGoal("an_unhappy_life")),
		t("reward_happiness"),
	);
	document.getElementById("challengeGoal2").textContent = t(
		"challenge_goal",
		format(getChallengeGoal("rich_and_the_poor")),
		t("reward_income"),
	);
	document.getElementById("challengeGoal3").textContent = t(
		"challenge_goal",
		`x${format(getChallengeGoal("time_does_not_fly"))}`,
		t("reward_time_warping"),
	);
	document.getElementById("challengeGoal4").textContent = t(
		"challenge_goal",
		format(getChallengeGoal("dance_with_the_devil")),
		t("gain_evil"),
	);
	document.getElementById("challengeGoal5").textContent = t(
		"challenge_goal_plain",
		getFormattedChallengeTaskGoal(
			"job_chairman",
			Math.floor(getChallengeGoal("legends_never_die")),
		),
	);
	document.getElementById("challengeGoal6").textContent = t(
		"challenge_goal_plain",
		getFormattedChallengeTaskGoal(
			"job_sigma_proioxis",
			Math.floor(100 * (getChallengeGoal("the_darkest_time") - 1)),
		),
	);

	// Показатели эффектов берутся из констант, чтобы текст не рассинхронизировался с механикой
	document.getElementById("challenge_1_desc").textContent = t(
		"challenge_1_desc",
		CHALLENGE_UNHAPPY_HAPPINESS_EXPONENT,
	);
	document.getElementById("challenge_2_desc").textContent = t(
		"challenge_2_desc",
		CHALLENGE_RICH_INCOME_EXPONENT,
	);
	document.getElementById("challenge_3_desc").textContent = t(
		"challenge_3_desc",
		CHALLENGE_TIME_WARP_EXPONENT,
	);
	document.getElementById("challenge_4_desc").textContent = t(
		"challenge_4_desc",
		CHALLENGE_DANCE_HAPPINESS_EXPONENT,
	);
	document.getElementById("challenge_5_desc").textContent = t(
		"challenge_5_desc",
		LIFESPAN_CHALLENGE_EXPONENT,
		CHALLENGE_LEGENDS_WARP_EXPONENT,
	);

	const challengeRewardIds = [
		"challenge_1_reward",
		"challenge_2_reward",
		"challenge_3_reward",
		"challenge_4_reward",
		"challenge_5_reward",
		"challenge_6_reward",
	];
	const challengeRewardStatKeys = [
		"reward_happiness",
		"reward_income",
		"reward_time_warping",
		"gain_essence",
		"gain_evil",
		"gain_dark_matter",
	];
	for (let i = 0; i < 6; i++) {
		const rewardElement = document.getElementById(challengeRewardIds[i]);
		if (rewardElement != null)
			rewardElement.innerHTML = t(
				"challenge_reward",
				t(challengeRewardStatKeys[i]),
			);
	}

	document.getElementById("challengeReward1").hidden =
		gameData.challenges.an_unhappy_life === 0;
	document.getElementById("challengeReward2").hidden =
		gameData.challenges.rich_and_the_poor === 0;
	document.getElementById("challengeReward3").hidden =
		gameData.challenges.time_does_not_fly === 0;
	document.getElementById("challengeReward4").hidden =
		gameData.challenges.dance_with_the_devil === 0;
	document.getElementById("challengeReward5").hidden =
		gameData.challenges.legends_never_die === 0;
	document.getElementById("challengeReward6").hidden =
		gameData.challenges.the_darkest_time === 0;

	renderCurrentChallengeRewardValue();

	document.getElementById("challengeHappinessBuff").textContent = format(
		getChallengeBonus("an_unhappy_life"),
		2,
	);
	document.getElementById("challengeIncomeBuff").textContent = format(
		getChallengeBonus("rich_and_the_poor"),
		2,
	);
	document.getElementById("challengeTimewarpingBuff").textContent = format(
		getChallengeBonus("time_does_not_fly"),
		2,
	);
	document.getElementById("challengeEssenceGainBuff").textContent = format(
		getChallengeBonus("dance_with_the_devil"),
		2,
	);
	document.getElementById("challengeEvilGainBuff").textContent = format(
		getChallengeBonus("legends_never_die"),
		2,
	);
	document.getElementById("challengeDarkMatterGainBuff").textContent = format(
		getChallengeBonus("the_darkest_time"),
		2,
	);

	const lifespanDebuff = document.getElementById(
		"challenge5MetaverseLifespanDebuff",
	);
	lifespanDebuff.hidden = gameData.rebirthFiveCount === 0;
	if (!lifespanDebuff.hidden)
		lifespanDebuff.textContent = t("challenge_5_meta_debuff");
}

export function renderCurrentChallengeReward(blockclass) {
	const elements = document.getElementsByClassName(blockclass);
	for (const elementReward of elements) {
		if (elementReward.classList.contains(gameData.active_challenge)) {
			elementReward.classList.remove("hidden");

			if (
				getChallengeBonus(gameData.active_challenge, true).gt(
					getChallengeBonus(gameData.active_challenge),
				)
			)
				elementReward.classList.add("reward");
			else elementReward.classList.remove("reward");
		} else elementReward.classList.add("hidden");
	}
}

export function renderCurrentChallengeRewardValue(side_bar = false) {
	for (let i = 1; i <= Object.keys(gameData.challenges).length; i++) {
		document.getElementById(
			`${side_bar ? "sidebarC" : "c"}urrentChallengeBuff${i}`,
		).textContent = format(getChallengeBonus(i, true), 2);
		if (side_bar)
			document.getElementById(`sidebarChallengeBuff${i}`).textContent = format(
				getChallengeBonus(i),
				2,
			);
	}
}
