// ui/task_tab.js — jobs and skills tab rendering

import { t } from "../../dist/js/translations.js";
import { isHeroesUnlocked } from "../calculations.js";
import {
	AgeRequirement,
	DarkMatterRequirement,
	EssenceRequirement,
	EvilRequirement,
	Job,
	Skill,
} from "../classes.js";
import { gameData, getPreviousTaskInCategory } from "../data.js";
import { isJobAutoSelectUnlocked } from "../slots.js";
import { format, formatCoins, formatLevel } from "../utils.js";
import {
	fitText,
	getTaskNameLocale,
	renderProgressBar,
	setHTML,
} from "./helpers.js";
import { getRowByName } from "./navigation.js";

// Элементы строки статичны: DOM не пересоздаётся, а getRowByName +
// querySelector — по три поиска на строку каждый кадр на ~295 строк.
export function taskRow(task, rowKey) {
	if (task._row == null) {
		const row = getRowByName(rowKey);
		const progressBar = task.querySelector(".progressBar", row);
		const valueElement = task.querySelector(".value", row);
		task._row = {
			level: task.querySelector(".level", row),
			xpGain: task.querySelector(".xpGain", row),
			xpLeft: task.querySelector(".xpLeft", row),
			tooltip: task.querySelector(".tooltipText", row),
			maxLevel: task.querySelector(".maxLevel", row),
			name: progressBar.querySelector(".name"),
			progressBar,
			progressFill: task.querySelector(".progressFill", row),
			valueElement,
			income: valueElement.querySelector(".income"),
			effect: valueElement.querySelector(".effect"),
		};
	}
	return task._row;
}

export function renderJobRow(task, rowKey) {
	const els = taskRow(task, rowKey);

	const levelText = formatLevel(task.level);
	if (els.level.textContent !== levelText) els.level.textContent = levelText;

	const xpGainText = task.getXpGainFormatted();
	if (els.xpGain.textContent !== xpGainText)
		els.xpGain.textContent = xpGainText;

	const xpLeftText = task.getXpLeftFormatted();
	if (els.xpLeft.textContent !== xpLeftText)
		els.xpLeft.textContent = xpLeftText;

	const tooltipText = rowTooltip(task, rowKey);
	setHTML(els.tooltip, tooltipText);

	const maxLevelText = formatLevel(task.maxLevel);
	if (els.maxLevel.textContent !== maxLevelText)
		els.maxLevel.textContent = maxLevelText;
	els.maxLevel.classList.toggle("hidden", gameData.rebirthOneCount === 0);

	const nameText = (task.isHero ? `${t("great")} ` : "") + t(task.name);
	if (els.name.textContent !== nameText) els.name.textContent = nameText;
	els.name.style.whiteSpace = "nowrap";
	fitText(els.name, 16);
	renderProgressBar(task, els.progressFill, els.progressBar);

	els.income.style.display = true;
	els.effect.style.display = false;

	formatCoins(task.getIncome(), els.income);
}

export function rowTooltip(task, rowKey) {
	let tooltip = t(task.baseData.tooltip);
	if (!task.isHero && isHeroesUnlocked())
		tooltip += getHeroicRequiredTooltip(rowKey);
	return tooltip;
}

export function renderJobs() {
	for (const key in gameData.taskData) {
		const task = gameData.taskData[key];
		if (!(task instanceof Job)) continue;
		renderJobRow(task, key);
	}

	const autoPromoteRow = document.getElementById("autoPromoteToggleRow");
	if (autoPromoteRow) {
		autoPromoteRow.style.display = isJobAutoSelectUnlocked() ? "" : "none";
		const autoPromoteToggle = document.getElementById("autoPromoteToggle");
		if (
			autoPromoteToggle &&
			autoPromoteToggle.checked !== gameData.autoPromoteEnabled
		)
			autoPromoteToggle.checked = gameData.autoPromoteEnabled;
	}
}

export function renderSkillRow(task, rowKey) {
	const els = taskRow(task, rowKey);

	const levelText = formatLevel(task.level);
	if (els.level.textContent !== levelText) els.level.textContent = levelText;

	const xpGainText = task.getXpGainFormatted();
	if (els.xpGain.textContent !== xpGainText)
		els.xpGain.textContent = xpGainText;

	const xpLeftText = task.getXpLeftFormatted();
	if (els.xpLeft.textContent !== xpLeftText)
		els.xpLeft.textContent = xpLeftText;

	const tooltipText = rowTooltip(task, rowKey);
	setHTML(els.tooltip, tooltipText);

	const maxLevelText = formatLevel(task.maxLevel);
	if (els.maxLevel.textContent !== maxLevelText)
		els.maxLevel.textContent = maxLevelText;
	els.maxLevel.classList.toggle("hidden", gameData.rebirthOneCount === 0);

	const nameText = (task.isHero ? `${t("great")} ` : "") + t(task.name);
	if (els.name.textContent !== nameText) els.name.textContent = nameText;
	els.name.style.whiteSpace = "nowrap";
	fitText(els.name, 16);
	renderProgressBar(task, els.progressFill, els.progressBar);

	els.income.style.display = false;
	els.effect.style.display = true;

	const effectText = task.getEffectDescription();
	if (els.effect.textContent !== effectText)
		els.effect.textContent = effectText;
	fitText(els.effect, 16);
}

export function renderSkills() {
	for (const key in gameData.taskData) {
		const task = gameData.taskData[key];
		if (!(task instanceof Skill)) continue;
		renderSkillRow(task, key);
	}
}

export function getHeroicRequiredTooltip(task) {
	const requirementObject = gameData.requirements[task];
	const requirements = requirementObject.requirements;
	const prev = getPreviousTaskInCategory(task);

	let tooltip =
		'<br> <span style="color: red">' +
		t("required") +
		'</span>: <span style="color: orange">';
	let reqlist = "";
	let prevReq = "";

	if (prev !== "") {
		const prevTask = gameData.taskData[prev];
		const prevlvl = prevTask.isHero ? prevTask.level : 0;
		if (prevlvl < 20)
			prevReq =
				t("great") +
				" " +
				t(getTaskNameLocale(prev)) +
				" " +
				prevlvl +
				"/20<br>";
	}

	if (requirementObject instanceof EvilRequirement) {
		reqlist +=
			format(
				requirements[0].herequirement === undefined
					? requirements[0].requirement
					: requirements[0].herequirement,
			) +
			" " +
			t("evil") +
			"<br>";
	} else if (requirementObject instanceof EssenceRequirement) {
		reqlist +=
			format(
				requirements[0].herequirement === undefined
					? requirements[0].requirement
					: requirements[0].herequirement,
			) +
			" " +
			t("essence") +
			"<br>";
	} else if (requirementObject instanceof AgeRequirement) {
		reqlist +=
			t("age") +
			" " +
			format(
				requirements[0].herequirement === undefined
					? requirements[0].requirement
					: requirements[0].herequirement,
			) +
			"<br>";
	} else if (requirementObject instanceof DarkMatterRequirement) {
		reqlist +=
			format(
				requirements[0].herequirement === undefined
					? requirements[0].requirement
					: requirements[0].herequirement,
			) +
			" " +
			t("dark_matter") +
			"<br>";
	} else {
		for (const requirement of requirements) {
			const task_check = gameData.taskData[requirement.task];

			const reqvalue =
				requirement.herequirement == null
					? requirement.requirement
					: requirement.herequirement;

			if (task_check.isHero && task_check.level >= reqvalue) continue;
			if (prev !== "" && requirement.task === prev) {
				if (reqvalue <= 20) continue;
				else
					prevReq =
						" " +
						t("great") +
						" " +
						t(getTaskNameLocale(requirement.task)) +
						" " +
						(task_check.isHero ? task_check.level : 0) +
						"/" +
						reqvalue +
						"<br>";
			} else {
				reqlist +=
					" " +
					t("great") +
					" " +
					t(getTaskNameLocale(requirement.task)) +
					" " +
					(task_check.isHero ? task_check.level : 0) +
					"/" +
					reqvalue +
					"<br>";
			}
		}
	}

	reqlist += prevReq;
	reqlist = reqlist.substring(0, reqlist.length - 4);
	tooltip += `${reqlist}</span>`;
	return tooltip;
}
