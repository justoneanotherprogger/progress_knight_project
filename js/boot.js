// boot.js — точка входа: собирает игру и запускает циклы.
//
// Отдельный модуль не из упёртости, а ради TDZ. Тело модуля выполняется после того,
// как все его зависимости прочитаются, но внутри ЦИКЛА импортов порядок ломается:
// main.js импортируют семь модулей (gameLoop, save, challenges, ui/*), поэтому
// main.js оказывается достижим из раннего <script> и его тело стартует, пока
// calculations.js ещё не инициализировал `const gainMemo` —
// «Cannot access 'gainMemo' before initialization». Здесь таких циклов нет: boot.js
// не импортирует никто, он последний корень графа и читает только готовое.

import { jobBaseData } from "../dist/js/jobs_data.js";
import { milestoneBaseData } from "../dist/js/milestones_data.js";
import { skillBaseData } from "../dist/js/skills_data.js";
import { applyTranslations, setLang } from "../dist/js/translations.js";
import { enterChallenge, exitChallenge } from "./challenges.js";
import {
	buyADealWithTheChairman,
	buyAGiftFromGod,
	buyAMiracle,
	buyDarkOrbGenerator,
	buyEssenceCollector,
	buyExplosionOfTheUniverse,
	buyGottaBeFast,
	buyLifeCoach,
	buyMultiverseExplorer,
	buySpeedOfLife,
	buyYourGreatestDebt,
	resetSkillTree,
} from "./dark_matter.js";
import { gameData } from "./data.js";
import { update } from "./gameLoop.js";
import {
	createGameObjects,
	createItemObjects,
	createSkillRequirements,
	setCurrency,
	setEnableKeybinds,
	setNotation,
	setTheme,
	startLoops,
	toggleAutoBuy,
	togglePause,
} from "./main.js";
import {
	applyBoost,
	buyBoostDuration,
	buyChallengeAltar,
	buyDarkMaterMult,
	buyEssenceMult,
	buyEvilTran,
	buyHypercubeGain,
	buyReduceBoostCooldown,
	collectPerkPoints,
} from "./metaverse.js";
import { createMilestoneRequirements, milestoneData } from "./milestones.js";
import { addMultipliers, setCustomEffects } from "./multipliers.js";
import {
	rebirthFive,
	rebirthFour,
	rebirthOne,
	rebirthThree,
	rebirthTwo,
} from "./rebirth.js";
import { requirementsBaseData } from "./requirements.js";
import {
	exportGameData,
	importGameData,
	loadGameData,
	outExportButton,
	resetGameData,
} from "./save.js";
import { initializeUI, refreshSettingsButtons, updateUI } from "./ui/init.js";
import {
	refreshLangButtons,
	setFontSize,
	setLayout,
	setStickySidebar,
	setTab,
	setTabDarkMatter,
	setTabMetaverse,
	setTabSettings,
	updateFontSizeIndicator,
} from "./ui/navigation.js";
import { renderChangelog } from "./ui/tabs.js";
import { checkAdminPassword, initAdminPanel, setAdminSpeed } from "./utils.js";

// Ошибка в коде — не сообщение игроку, а сигнал «игра сломалась»: останавливаем
// симуляцию, чтобы время не тикало по битому состоянию. Диагностика — в консоли
// браузера, через onerror, штатно.
window.onerror = () => {
	gameData.hasError = true;
};

document
	.querySelector("#changelogTabTabButton")
	.addEventListener("click", async () => {
		renderChangelog();
	});

// Мост для HTML-атрибутов: onclick="buyBoostDuration()" в шаблонах не видит модульные
// функции. Публикуем только то, что зовут из разметки; внутри игры всё идёт через
// import. Полноту списка проверяет scripts/check_inline_handlers.py — не дописывай
// руками, добавь функцию в шаблон и почини список по выводу проверки.
Object.assign(window, {
	applyBoost,
	buyADealWithTheChairman,
	buyAGiftFromGod,
	buyAMiracle,
	buyBoostDuration,
	buyChallengeAltar,
	buyDarkMaterMult,
	buyDarkOrbGenerator,
	buyEssenceCollector,
	buyEssenceMult,
	buyEvilTran,
	buyExplosionOfTheUniverse,
	buyGottaBeFast,
	buyHypercubeGain,
	buyLifeCoach,
	buyMultiverseExplorer,
	buyReduceBoostCooldown,
	buySpeedOfLife,
	buyYourGreatestDebt,
	checkAdminPassword,
	collectPerkPoints,
	enterChallenge,
	exitChallenge,
	exportGameData,
	importGameData,
	outExportButton,
	rebirthFive,
	rebirthFour,
	rebirthOne,
	rebirthThree,
	rebirthTwo,
	resetGameData,
	resetSkillTree,
	setAdminSpeed,
	setCurrency,
	setEnableKeybinds,
	setFontSize,
	setLang,
	setLayout,
	setNotation,
	setStickySidebar,
	setTab,
	setTabDarkMatter,
	setTabMetaverse,
	setTabSettings,
	setTheme,
	toggleAutoBuy,
	togglePause,
});

// Загрузка сейва, первый рендер и старт циклов расчёта и рендера.

createGameObjects(gameData.taskData, jobBaseData);
createGameObjects(gameData.taskData, skillBaseData);
createItemObjects();
createGameObjects(milestoneData, milestoneBaseData);

gameData.currentJob = gameData.taskData.job_beggar;
gameData.currentProperty = gameData.itemData.item_homeless;
gameData.currentMisc = [];

gameData.requirements = requirementsBaseData;

createSkillRequirements();
createMilestoneRequirements();

loadGameData();

initializeUI();
initAdminPanel();

setCustomEffects();
addMultipliers();

applyTranslations();
update();

setTab(gameData.settings.selectedTab);
setTabSettings("settingsTab");
setTabDarkMatter("shopTab");
setTabMetaverse("metaverseTab1");

startLoops();

// Re-apply translations when language changes
document.addEventListener("i18n:changed", () => {
	updateUI();
	refreshSettingsButtons();
	refreshLangButtons();
	updateFontSizeIndicator();
	renderChangelog();
});
