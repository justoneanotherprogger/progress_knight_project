// main.js — entry point

import { itemCategories } from "../dist/js/items_data.js";
import { jobBaseData } from "../dist/js/jobs_data.js";
import { milestoneBaseData } from "../dist/js/milestones_data.js";
import { skillBaseData } from "../dist/js/skills_data.js";
import { applyTranslations, setLang } from "../dist/js/translations.js";
import { toInfinityNumber } from "./calculations.js";
import { enterChallenge, exitChallenge } from "./challenges.js";
import {
	DarkMatterRequirement,
	EssenceRequirement,
	EvilRequirement,
	Item,
	Job,
	Milestone,
	Skill,
	TaskRequirement,
} from "./classes.js";
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
	getDarkMatterSkillIncome,
	resetSkillTree,
} from "./dark_matter.js";
import { gameData, renderSpeed, updateSpeed } from "./data.js";
import { update } from "./gameLoop.js";
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
import { requirementsBaseData } from "./requirements.js";
import { loadGameData, saveGameData } from "./save.js";
import { initializeUI, refreshSettingsButtons, updateUI } from "./ui/init.js";
import {
	getQuerySelector,
	refreshLangButtons,
	selectElementInGroup,
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

export function togglePause() {
	gameData.paused = !gameData.paused;
}

export function toggleAutoBuy() {
	gameData.autoBuyEnabled = document.getElementById("autoBuyToggle").checked;
}

export function setCurrentProperty(propertyName) {
	if (gameData.paused) return;
	gameData.autoBuyEnabled = false;
	gameData.currentProperty = gameData.itemData[propertyName];
}

export function setMisc(miscName) {
	if (gameData.paused) return;
	gameData.autoBuyEnabled = false;
	const misc = gameData.itemData[miscName];
	if (gameData.currentMisc.includes(misc)) {
		for (let i = 0; i < gameData.currentMisc.length; i++) {
			if (gameData.currentMisc[i] === misc) {
				gameData.currentMisc.splice(i, 1);
			}
		}
	} else {
		gameData.currentMisc.push(misc);
	}
}

export function createGameObjects(data, baseData) {
	for (const key in baseData) createGameObject(data, baseData[key], key);
}

export function createGameObject(data, entity, id) {
	if ("income" in entity) {
		data[id] = new Job(entity);
	} else if ("maxXp" in entity) {
		data[id] = new Skill(entity);
	} else if ("tier" in entity) {
		data[id] = new Milestone(entity);
	} else {
		data[id] = new Item(entity);
	}
	data[id].id = id;
}

export function createItemObjects() {
	for (const categoryId in itemCategories) {
		const items = itemCategories[categoryId].items;
		for (const key in items) {
			const item = new Item(items[key]);
			item.id = key;
			item.categoryId = categoryId;
			gameData.itemData[key] = item;
		}
	}
}

export function createSkillRequirements() {
	for (const key in skillBaseData) {
		const skill = skillBaseData[key];
		const req = skill.requirement;
		const selector = getQuerySelector(key);
		let requirement;
		if (req.type === "task") {
			requirement = new TaskRequirement(
				[selector],
				req.tasks.map((t) => ({
					task: t.task,
					requirement: t.level,
					herequirement: t.hero,
				})),
			);
		} else if (req.type === "evil") {
			requirement = new EvilRequirement(
				[selector],
				[{ requirement: req.value }],
			);
		} else if (req.type === "essence") {
			requirement = new EssenceRequirement(
				[selector],
				[{ requirement: req.value }],
			);
		} else if (req.type === "darkMatter") {
			requirement = new DarkMatterRequirement(
				[selector],
				[{ requirement: req.value }],
			);
		}
		gameData.requirements[key] = requirement;
	}
}

export function setCurrency(index) {
	gameData.settings.currencyNotation = index;
	selectElementInGroup("CurrencyNotation", index);
}

export function setNotation(index) {
	gameData.settings.numberNotation = index;
	selectElementInGroup("Notation", index);
}

export function getNet() {
	return getIncome().minus(getExpense()).abs();
}

export function getIncome() {
	if (gameData.active_challenge === "the_darkest_time") return new Decimal(0);

	return gameData.currentJob.getIncome().times(getDarkMatterSkillIncome());
}

export function getExpense() {
	var expense = toInfinityNumber(gameData.currentProperty.getExpense());
	for (const misc of gameData.currentMisc) {
		expense = expense.plus(misc.getExpense());
	}
	return expense;
}

export function validateTheme(index) {
	// Незнакомые значения (в т.ч. theme=2 из выпиленной colorblind-темы)
	// дают светлый дефолт — валидация на входе, а не в setTheme
	return index === 1 ? 1 : 0;
}

export function setTheme(index, reload = false) {
	const body = document.getElementById("body");

	body.classList.remove("dark");

	if (index === 1) {
		body.classList.add("dark");
	}

	gameData.settings.theme = index;
	selectElementInGroup("Theme", index);

	if (reload) {
		saveGameData();
		location.reload();
	}
}

export function setEnableKeybinds(enableKeybinds) {
	gameData.settings.enableKeybinds = enableKeybinds;
	selectElementInGroup("EnableKeybinds", enableKeybinds ? 0 : 1);
	document
		.getElementById("keybindsList")
		.classList.toggle("hidden", !enableKeybinds);
}

// Мост для HTML-атрибутов: onclick="buyBoostDuration()" в шаблонах не видит модульные функции.
// Публикуем только то, что зовут из разметки; внутри игры всё идёт через import.
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
	resetSkillTree,
	setAdminSpeed,
	setCurrency,
	setFontSize,
	setLang,
	setLayout,
	setNotation,
	setStickySidebar,
	toggleAutoBuy,
});

// Initialization

// Loads the game save, does the initial render and starts the game update and render loop.

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

export let ticking = false;

export var gameloop, renderloop, saveloop;

// Расчёты гоняются на updateSpeed (20 Гц) — игровая логика должна быть плавной.
// Рендер на renderSpeed (10 Гц) отдельным интервалом: глаз не различает разницу,
// а полный кадр стоит ~9 мс. Когда вкладка скрыта — рендер пропускается
// целиком, расчёты при этом продолжаются.
export function startLoops() {
	gameloop = setInterval(() => {
		if (ticking) return;
		ticking = true;
		update();

		ticking = false;
	}, 1000 / updateSpeed);

	renderloop = setInterval(() => {
		if (!document.hidden) updateUI();
	}, 1000 / renderSpeed);

	saveloop = setInterval(saveGameData, 3000);
}

startLoops();

// Re-apply translations when language changes
document.addEventListener("i18n:changed", () => {
	updateUI();
	refreshSettingsButtons();
	refreshLangButtons();
	updateFontSizeIndicator();
	renderChangelog();
});
