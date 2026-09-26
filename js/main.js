// main.js — entry point

import { itemCategories } from "../dist/js/items_data.js";
import { skillBaseData } from "../dist/js/skills_data.js";
import { toInfinityNumber } from "./calculations.js";
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
import { getDarkMatterSkillIncome } from "./dark_matter.js";
import { gameData, renderSpeed, updateSpeed } from "./data.js";
import { update } from "./gameLoop.js";
import { saveGameData } from "./save.js";
import { updateUI } from "./ui/init.js";
import { getQuerySelector, selectElementInGroup } from "./ui/navigation.js";

// Тела здесь нет намеренно: запуск игры живёт в boot.js, потому что main.js
// импортируют семь модулей и его собственное тело выполнялось бы внутри цикла
// импортов. Пояснение — в шапке boot.js.

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
