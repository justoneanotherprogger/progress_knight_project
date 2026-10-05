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
import { format, getFormattedChallengeTaskGoal } from "../utils.js";
import { setElementText, updateButtonText } from "./helpers.js";

export function renderChallenges() {
	const challengeActive = gameData.active_challenge !== "";
	for (let i = 1; i <= Object.keys(gameData.challenges).length; i++) {
		const element = document.getElementById(`challengeButton${i}`);
		if (element == null) continue;
		updateButtonText(`challengeButton${i}`, t("enter_challenge"));
		element.disabled = challengeActive;
	}

	//TODO (indomit)

	updateButtonText(
		"challengeGoal1",
		t(
			"challenge_goal",
			format(getChallengeGoal("an_unhappy_life")),
			t("reward_happiness"),
		),
	);
	updateButtonText(
		"challengeGoal2",
		t(
			"challenge_goal",
			format(getChallengeGoal("rich_and_the_poor")),
			t("reward_income"),
		),
	);
	updateButtonText(
		"challengeGoal3",
		t(
			"challenge_goal",
			`x${format(getChallengeGoal("time_does_not_fly"))}`,
			t("reward_time_warping"),
		),
	);
	updateButtonText(
		"challengeGoal4",
		t(
			"challenge_goal",
			format(getChallengeGoal("dance_with_the_devil")),
			t("gain_evil"),
		),
	);
	updateButtonText(
		"challengeGoal5",
		t(
			"challenge_goal_plain",
			getFormattedChallengeTaskGoal(
				"job_chairman",
				Math.floor(getChallengeGoal("legends_never_die")),
			),
		),
	);
	updateButtonText(
		"challengeGoal6",
		t(
			"challenge_goal_plain",
			getFormattedChallengeTaskGoal(
				"job_sigma_proioxis",
				Math.floor(100 * (getChallengeGoal("the_darkest_time") - 1)),
			),
		),
	);

	// Показатели эффектов берутся из констант, чтобы текст не рассинхронизировался с механикой
	updateButtonText(
		"challenge1Desc",
		t("challenge_1_desc", CHALLENGE_UNHAPPY_HAPPINESS_EXPONENT),
	);
	updateButtonText(
		"challenge2Desc",
		t("challenge_2_desc", CHALLENGE_RICH_INCOME_EXPONENT),
	);
	updateButtonText(
		"challenge3Desc",
		t("challenge_3_desc", CHALLENGE_TIME_WARP_EXPONENT),
	);
	updateButtonText(
		"challenge4Desc",
		t("challenge_4_desc", CHALLENGE_DANCE_HAPPINESS_EXPONENT),
	);
	updateButtonText(
		"challenge5Desc",
		t(
			"challenge_5_desc",
			LIFESPAN_CHALLENGE_EXPONENT,
			CHALLENGE_LEGENDS_WARP_EXPONENT,
		),
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

	updateButtonText(
		"challengeHappinessBuff",
		format(getChallengeBonus("an_unhappy_life"), 2),
	);
	updateButtonText(
		"challengeIncomeBuff",
		format(getChallengeBonus("rich_and_the_poor"), 2),
	);
	updateButtonText(
		"challengeTimewarpingBuff",
		format(getChallengeBonus("time_does_not_fly"), 2),
	);
	updateButtonText(
		"challengeEssenceGainBuff",
		format(getChallengeBonus("dance_with_the_devil"), 2),
	);
	updateButtonText(
		"challengeEvilGainBuff",
		format(getChallengeBonus("legends_never_die"), 2),
	);
	updateButtonText(
		"challengeDarkMatterGainBuff",
		format(getChallengeBonus("the_darkest_time"), 2),
	);

	const lifespanDebuff = document.getElementById(
		"challenge5MetaverseLifespanDebuff",
	);
	lifespanDebuff.hidden = gameData.rebirthFiveCount === 0;
	if (!lifespanDebuff.hidden)
		setElementText(lifespanDebuff, t("challenge_5_meta_debuff"));
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

export function renderCurrentChallengeRewardValue() {
	for (let i = 1; i <= Object.keys(gameData.challenges).length; i++) {
		document.getElementById(`sidebarCurrentChallengeBuff${i}`).textContent =
			format(getChallengeBonus(i, true), 2);
		document.getElementById(`sidebarChallengeBuff${i}`).textContent = format(
			getChallengeBonus(i),
			2,
		);
	}
}
