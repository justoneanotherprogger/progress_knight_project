// ui/settings_tab.js — settings tab content: stats

import { getChallengeBonus } from "../challenges.js";
import { gameData } from "../data.js";
import { format, formatTime } from "../utils.js";
import { updateButtonText } from "./helpers.js";

export function renderSettings() {
	const date = new Date(gameData.stats.startDate);
	updateButtonText("startDateDisplay", date.toLocaleDateString());

	const currentDate = new Date();
	updateButtonText(
		"playedDaysDisplay",
		format((currentDate.getTime() - date.getTime()) / (1000 * 3600 * 24), 2),
	);
	updateButtonText("playedRealTimeDisplay", formatTime(gameData.realtimeRun));

	updateButtonText("playedGameTimeDisplay", format(gameData.totalDays, 2));

	if (gameData.rebirthOneCount > 0)
		document.getElementById("statsRebirth1").classList.remove("hidden");
	else document.getElementById("statsRebirth1").classList.add("hidden");

	if (gameData.rebirthTwoCount > 0)
		document.getElementById("statsRebirth2").classList.remove("hidden");
	else document.getElementById("statsRebirth2").classList.add("hidden");

	if (gameData.rebirthThreeCount > 0)
		document.getElementById("statsRebirth3").classList.remove("hidden");
	else document.getElementById("statsRebirth3").classList.add("hidden");

	if (gameData.rebirthFourCount > 0)
		document.getElementById("statsRebirth4").classList.remove("hidden");
	else document.getElementById("statsRebirth4").classList.add("hidden");

	if (gameData.rebirthFiveCount > 0)
		document.getElementById("statsRebirth5").classList.remove("hidden");
	else document.getElementById("statsRebirth5").classList.add("hidden");

	updateButtonText("rebirthOneCountDisplay", gameData.rebirthOneCount);
	updateButtonText("rebirthTwoCountDisplay", gameData.rebirthTwoCount);
	updateButtonText("rebirthThreeCountDisplay", gameData.rebirthThreeCount);
	updateButtonText("rebirthFourCountDisplay", gameData.rebirthFourCount);
	updateButtonText("rebirthFiveCountDisplay", gameData.rebirthFiveCount);

	updateButtonText(
		"rebirthOneTimeDisplay",
		formatTime(gameData.rebirthOneTime, true),
	);
	updateButtonText(
		"rebirthTwoTimeDisplay",
		formatTime(gameData.rebirthTwoTime, true),
	);
	updateButtonText(
		"rebirthThreeTimeDisplay",
		formatTime(gameData.rebirthThreeTime, true),
	);
	updateButtonText(
		"rebirthFourTimeDisplay",
		formatTime(gameData.rebirthFourTime, true),
	);
	updateButtonText(
		"rebirthFiveTimeDisplay",
		formatTime(gameData.rebirthFiveTime, true),
	);

	updateButtonText(
		"rebirthOneFastestDisplay",
		formatTime(gameData.stats.fastest1, true),
	);
	updateButtonText(
		"rebirthTwoFastestDisplay",
		formatTime(gameData.stats.fastest2, true),
	);
	updateButtonText(
		"rebirthThreeFastestDisplay",
		formatTime(gameData.stats.fastest3, true),
	);
	updateButtonText(
		"rebirthFourFastestDisplay",
		formatTime(gameData.stats.fastest4, true),
	);
	updateButtonText(
		"rebirthFiveFastestDisplay",
		formatTime(gameData.stats.fastest5, true),
	);

	// Gain Stats
	updateButtonText(
		"evilPerSecondDisplay",
		format(gameData.stats.EvilPerSecond, 3),
	);
	updateButtonText(
		"maxEvilPerSecondDisplay",
		format(gameData.stats.maxEvilPerSecond, 3),
	);
	updateButtonText(
		"maxEvilPerSecondRtDisplay",
		formatTime(gameData.stats.maxEvilPerSecondRt),
	);

	updateButtonText(
		"essencePerSecondDisplay",
		format(gameData.stats.EssencePerSecond, 3),
	);
	updateButtonText(
		"maxEssencePerSecondDisplay",
		format(gameData.stats.maxEssencePerSecond, 3),
	);
	updateButtonText(
		"maxEssencePerSecondRtDisplay",
		formatTime(gameData.stats.maxEssencePerSecondRt),
	);

	// Challenge Stats
	document.getElementById("stats_challenge_1").hidden =
		gameData.challenges.an_unhappy_life === 0;
	document.getElementById("stats_challenge_2").hidden =
		gameData.challenges.rich_and_the_poor === 0;
	document.getElementById("stats_challenge_3").hidden =
		gameData.challenges.time_does_not_fly === 0;
	document.getElementById("stats_challenge_4").hidden =
		gameData.challenges.dance_with_the_devil === 0;
	document.getElementById("stats_challenge_5").hidden =
		gameData.challenges.legends_never_die === 0;
	document.getElementById("stats_challenge_6").hidden =
		gameData.challenges.the_darkest_time === 0;

	updateButtonText(
		"challengeHappinessBuffDisplay",
		format(getChallengeBonus("an_unhappy_life"), 2),
	);
	updateButtonText(
		"challengeIncomeBuffDisplay",
		format(getChallengeBonus("rich_and_the_poor"), 2),
	);
	updateButtonText(
		"challengeTimewarpingBuffDisplay",
		format(getChallengeBonus("time_does_not_fly"), 2),
	);
	updateButtonText(
		"challengeEssenceGainBuffDisplay",
		format(getChallengeBonus("dance_with_the_devil"), 2),
	);
	updateButtonText(
		"challengeEvilGainBuffDisplay",
		format(getChallengeBonus("legends_never_die"), 2),
	);
	updateButtonText(
		"challengeDarkMaterGainBuffDisplay",
		format(getChallengeBonus("the_darkest_time"), 2),
	);
}
