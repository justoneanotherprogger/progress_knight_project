// ui/table.js — shared table rendering: rows, header rows, requirement rows

import { itemCategories } from "../../dist/js/items_data.js";
import { jobCategories } from "../../dist/js/jobs_data.js";
import { milestoneCategories } from "../../dist/js/milestones_data.js";
import { skillCategories } from "../../dist/js/skills_data.js";
import { t } from "../../dist/js/translations.js";
import {
	getDarkMatterGain,
	getEssenceGain,
	getEvilGain,
} from "../calculations.js";
import {
	AgeRequirement,
	DarkMatterRequirement,
	EssenceRequirement,
	EvilRequirement,
	HypercubeRequirement,
	MetaverseRequirement,
} from "../classes.js";
import { gameData } from "../data.js";
import { labelKey } from "../effects.js";
import {
	getExpense,
	getIncome,
	setCurrentJob,
	setCurrentProperty,
	setMisc,
} from "../main.js";
import { getHypercubeGeneration } from "../metaverse.js";
import { milestoneData } from "../milestones.js";
import {
	daysToYears,
	format,
	formatCoins,
	formatLevel,
	getDynamicProgress,
	removeSpaces,
	removeStrangeCharacters,
} from "../utils.js";
import {
	getTaskNameLocale,
	renderRequirementProgress,
	resourceProgress,
	setElementText,
} from "./helpers.js";
import { showNoteModal } from "./note_modal.js";

export function renderRequirements() {
	for (const key in gameData.requirements) {
		const requirement = gameData.requirements[key];
		const visible = requirement.isCompleted();
		for (const element of requirement.elements) {
			// Класс пишется только при реальной смене: за весь забег
			// требование закрывается максимум один раз, а отрисовка
			// гоняется каждый кадр.
			if (element.classList.contains("hidden") === visible) {
				element.classList.toggle("hidden", !visible);
				if (visible && element.tagName === "DETAILS") showNoteModal(element);
			}
		}
	}
}

export function updateHeaderColumns(headerRow, categoryType) {
	if (categoryType === jobCategories || categoryType === skillCategories) {
		const valueType = headerRow.querySelector(".valueType");
		if (valueType)
			setElementText(
				valueType,
				categoryType === jobCategories ? t("income_day") : t("effect"),
			);
		const headers = headerRow.getElementsByTagName("th");
		setElementText(headers[1], t("level"));
		setElementText(headers[3], t("xp_day"));
		setElementText(headers[4], t("xp_left"));
		setElementText(headers[5], t("max_level"));
	} else if (categoryType === itemCategories) {
		const headers = headerRow.getElementsByTagName("th");
		setElementText(headers[1], t("active"));
		setElementText(headers[2], t("effect"));
		setElementText(headers[3], t("expense_day"));
	}
}

export function renderHeaderRows(categories) {
	for (const categoryName in categories) {
		const className = removeSpaces(categoryName);
		const headerRow = document.getElementsByClassName(className)[0];
		const categoryElement = headerRow
			.getElementsByClassName("category")[0]
			.querySelector(".name");
		if (categoryElement) setElementText(categoryElement, t(categoryName));
		else
			setElementText(
				headerRow.getElementsByClassName("category")[0],
				t(categoryName),
			);
		const maxLevelElement = headerRow.querySelector(".maxLevel");
		if (maxLevelElement)
			maxLevelElement.classList.toggle(
				"hidden",
				gameData.rebirthOneCount === 0,
			);

		updateHeaderColumns(headerRow, categories);
	}
}

// Первая строка под таблицей: название следующего, эффект — в скобках.
// Пока сущность ни разу не открывалась, строка — одно «Неизвестно», и название
// не показываем: следующее по определению ещё не открыто. effectText == null:
// строка без эффекта (работы, недвижимость, веха без описания).
function renderNextEntityLine(
	effectValueElement,
	nextEntity,
	effectText,
	seen,
) {
	let line = t(nextEntity.name);
	if (!seen) line = t("unknown");
	else if (effectText != null) line = `${line} (${effectText})`;
	setElementText(effectValueElement, line);
}

export function createRequiredRow(categoryName, table) {
	const requiredRow = document
		.querySelector(".requiredRowTemplate")
		.content.firstElementChild.cloneNode(true);
	setElementText(requiredRow.querySelector(".requirementLabel"), t("required"));
	setElementText(requiredRow.querySelector(".nextLabel"), t("next"));
	requiredRow.classList.add("requiredRow");
	requiredRow.classList.add(removeSpaces(categoryName));
	requiredRow.id = `req_${categoryName}`;
	requiredRow.firstElementChild.colSpan = table.rows[0].cells.length;
	return requiredRow;
}

export function createHeaderRow(templates, categoryType, categoryName) {
	const headerRow =
		templates.headerRow.content.firstElementChild.cloneNode(true);
	const categoryElement = headerRow.getElementsByClassName("category")[0];

	if (categoryType === itemCategories) {
		setElementText(
			categoryElement.getElementsByClassName("name")[0],
			t(categoryName),
		);
	} else {
		setElementText(categoryElement, t(categoryName));
	}

	updateHeaderColumns(headerRow, categoryType);

	// Фон и цвет — на ячейках: в collapse фон строки перекрывает скругление
	// углов у th.
	for (const cell of headerRow.cells) {
		cell.style.backgroundColor = categoryType[categoryName].headerColor;
		cell.style.color = "#ffffff";
	}
	headerRow.classList.add(removeSpaces(categoryName));
	headerRow.classList.add("headerRow");

	return headerRow;
}

export function createRow(templates, name, categoryName, categoryType) {
	const row = templates.row.content.firstElementChild.cloneNode(true);

	let displayName = name;
	let tooltipKey = `tt_${name}`;
	if (categoryType === skillCategories || categoryType === jobCategories) {
		const entity = gameData.taskData[name];
		if (entity) {
			displayName = entity.name;
			tooltipKey = entity.baseData.tooltip;
		}
	} else if (categoryType === itemCategories) {
		const entity = gameData.itemData[name];
		if (entity) {
			displayName = entity.name;
			tooltipKey = entity.baseData.tooltip;
		}
	} else if (categoryType === milestoneCategories) {
		const entity = milestoneData[name];
		if (entity) {
			displayName = entity.name;
			tooltipKey = entity.baseData.tooltip;
		}
	}

	// В шаблоне вехи колонка валюты всегда эссенция: у вех за зло — зло.
	if (categoryName === "category_evil_milestones")
		row
			.getElementsByClassName("essence")[0]
			.classList.replace("color-essence", "color-evil");

	row.getElementsByClassName("name")[0].textContent = t(displayName);
	row.getElementsByClassName("tooltipText")[0].textContent = t(tooltipKey);
	row.id = `row${removeSpaces(removeStrangeCharacters(name))}`;

	if (categoryType === itemCategories) {
		row.getElementsByClassName("button")[0].onclick =
			categoryName === "category_properties"
				? () => {
						setCurrentProperty(name);
					}
				: () => {
						setMisc(name);
					};
	}

	if (categoryType === jobCategories) {
		row.style.cursor = "pointer";
		row.onclick = () => {
			setCurrentJob(name);
		};
	}

	return row;
}

export function createAllRows(categoryType, tableId) {
	const templates = {
		headerRow: document.getElementsByClassName(
			categoryType === itemCategories
				? "headerRowItemTemplate"
				: categoryType === milestoneCategories
					? "headerRowMilestoneTemplate"
					: "headerRowTaskTemplate",
		)[0],
		row: document.getElementsByClassName(
			categoryType === itemCategories
				? "rowItemTemplate"
				: categoryType === milestoneCategories
					? "rowMilestoneTemplate"
					: "rowTaskTemplate",
		)[0],
	};

	const table = document.getElementById(tableId);

	for (const categoryName in categoryType) {
		const headerRow = createHeaderRow(templates, categoryType, categoryName);
		table.appendChild(headerRow);

		const category = categoryType[categoryName];
		if (Array.isArray(category)) {
			category.forEach((name) => {
				const row = createRow(templates, name, categoryName, categoryType);
				table.appendChild(row);
			});
		} else {
			const entries = category.items != null ? category.items : category;
			for (const name in entries) {
				const row = createRow(templates, name, categoryName, categoryType);
				table.appendChild(row);
			}
		}

		const requiredRow = createRequiredRow(categoryName, table);
		table.append(requiredRow);
	}
}

export function updateRequiredRows(data, categoryType) {
	const requiredRows = document.getElementsByClassName("requiredRow");
	for (const requiredRow of requiredRows) {
		setElementText(
			requiredRow.querySelector(".requirementLabel"),
			t("required"),
		);
		setElementText(requiredRow.querySelector(".nextLabel"), t("next"));
		let nextEntity = null;
		let nextEntityName = null;
		const categoryName = requiredRow.id.substring(4);
		const category = categoryType[categoryName];
		if (category == null) {
			continue;
		}
		const entries = Array.isArray(category)
			? category
			: category.items != null
				? Object.keys(category.items)
				: Object.keys(category);
		for (let i = 0; i < entries.length; i++) {
			const entityName = entries[i];
			if (i >= entries.length - 1) break;

			const requirements = gameData.requirements[entityName];
			if (requirements && i === 0) {
				if (!requirements.isCompleted()) {
					nextEntityName = entityName;
					nextEntity = data[entityName];
					break;
				}
			}

			const nextIndex = i + 1;
			if (nextIndex >= entries.length) {
				break;
			}
			nextEntityName = entries[nextIndex];
			const nextEntityRequirements = gameData.requirements[nextEntityName];

			if (!nextEntityRequirements.isCompleted()) {
				nextEntity = data[nextEntityName];
				break;
			}
		}

		if (nextEntity == null) {
			requiredRow.classList.add("hiddenTask");
		} else {
			requiredRow.classList.remove("hiddenTask");
			const requirementObject = gameData.requirements[nextEntityName];
			const requirements = requirementObject.requirements;

			const coinElement = requiredRow.querySelector(".coins");
			const levelElement = requiredRow.querySelector(".levels");
			const evilElement = requiredRow.querySelector(".evil");
			const essenceElement = requiredRow.querySelector(".essence");
			const darkMatterElement = requiredRow.querySelector(".darkMatter");
			const hypercubeElement = requiredRow.querySelector(".hypercube");
			const effectElement = requiredRow.querySelector(".effect");
			const effectValueElement = requiredRow.querySelector(".effectValue");
			const progressContainer = requiredRow.querySelector(
				".req-progress-container",
			);

			if (
				!coinElement ||
				!levelElement ||
				!evilElement ||
				!essenceElement ||
				!darkMatterElement ||
				!hypercubeElement ||
				!effectElement ||
				!effectValueElement
			) {
				console.warn(
					"requiredRow повреждён:",
					requiredRow.id,
					requiredRow.outerHTML.slice(0, 300),
				);
				continue;
			}

			coinElement.classList.add("hiddenTask");
			levelElement.classList.add("hiddenTask");
			evilElement.classList.add("hiddenTask");
			essenceElement.classList.add("hiddenTask");
			darkMatterElement.classList.add("hiddenTask");
			hypercubeElement.classList.add("hiddenTask");
			effectElement.classList.add("hiddenTask");

			let finalText = "";
			// Прогресс к требованию для полосы: percent против порога, pending —
			// с учётом прибавки, если ребёрн открыт. null — порога нет
			// (требование на счёт ребёрнов), полоса спрячется.
			let percent = null;
			let pendingPercent = null;
			let progressColor = "color-income";
			if (data === gameData.taskData) {
				// Название следующего показываем всегда; эффект в скобках — только
				// у навыков, у работ он не нужен.
				let effectText = null;
				if (categoryType !== jobCategories) {
					effectText = t(
						labelKey(
							nextEntity.baseData.effect.target,
							nextEntity.baseData.effect.type,
						),
					);
				}
				effectElement.classList.remove("hiddenTask");
				renderNextEntityLine(
					effectValueElement,
					nextEntity,
					effectText,
					nextEntity.unlocked,
				);

				if (requirementObject instanceof EvilRequirement) {
					evilElement.classList.remove("hiddenTask");
					setElementText(
						evilElement,
						`${format(requirements[0].requirement)} ${t("evil")}`,
					);
					[percent, pendingPercent] = resourceProgress(
						gameData.evil,
						requirements[0].requirement,
						getEvilGain,
						"req_rebirth_button2",
					);
					progressColor = "color-evil";
				} else if (requirementObject instanceof EssenceRequirement) {
					essenceElement.classList.remove("hiddenTask");
					setElementText(
						essenceElement,
						`${format(requirements[0].requirement)} ${t("essence")}`,
					);
					[percent, pendingPercent] = resourceProgress(
						gameData.essence,
						requirements[0].requirement,
						getEssenceGain,
						"req_rebirth_button3",
					);
					progressColor = "color-essence";
				} else if (requirementObject instanceof DarkMatterRequirement) {
					darkMatterElement.classList.remove("hiddenTask");
					setElementText(
						darkMatterElement,
						`${format(requirements[0].requirement)} ${t("dark_matter")}`,
					);
					[percent, pendingPercent] = resourceProgress(
						gameData.dark_matter,
						requirements[0].requirement,
						getDarkMatterGain,
						"req_rebirth_button4",
					);
					progressColor = "color-dark-matter";
				} else if (requirementObject instanceof MetaverseRequirement) {
				} else if (requirementObject instanceof HypercubeRequirement) {
					hypercubeElement.classList.remove("hiddenTask");
					setElementText(
						hypercubeElement,
						`${format(requirements[0].requirement)} ${t("hypercubes")}`,
					);
					[percent, pendingPercent] = resourceProgress(
						gameData.hypercubes,
						requirements[0].requirement,
						getHypercubeGeneration,
						"req_rebirth_button5",
					);
					progressColor = "color-hypercubes";
				} else if (requirementObject instanceof AgeRequirement) {
					essenceElement.classList.remove("hiddenTask");
					setElementText(
						essenceElement,
						`${t("age")} ${format(requirements[0].requirement)}`,
					);
					percent = pendingPercent = getDynamicProgress(
						daysToYears(gameData.days),
						requirements[0].requirement,
					);
					progressColor = "color-essence";
				} else {
					levelElement.classList.remove("hiddenTask");
					for (const requirement of requirements) {
						const task = gameData.taskData[requirement.task];
						if (task.level >= requirement.requirement) continue;
						finalText +=
							" " +
							t(getTaskNameLocale(requirement.task)) +
							" " +
							formatLevel(task.level) +
							"/" +
							formatLevel(requirement.requirement) +
							",";
					}
					// Уровневые требования: среднее по всем условиям. Выполненное
					// условие даёт 100, незавершённое — доля уровня с учётом xp
					// внутри уровня; кап 0.999, чтобы условие не давало 100
					// раньше времени.
					let sum = 0;
					for (const requirement of requirements) {
						const task = gameData.taskData[requirement.task];
						if (task.level >= requirement.requirement) {
							sum += 100;
							continue;
						}
						const xpFraction = task.xp.div(task.getMaxXp()).toNumber();
						const exact = Math.min(
							task.level + Math.min(Math.max(xpFraction, 0), 0.999),
							requirement.requirement,
						);
						sum += (exact / requirement.requirement) * 100;
					}
					percent = requirements.length > 0 ? sum / requirements.length : 0;
					pendingPercent = percent;
					finalText = finalText.substring(0, finalText.length - 1);
					setElementText(levelElement, finalText);
				}
			} else if (data === gameData.itemData) {
				coinElement.classList.remove("hiddenTask");
				formatCoins(requirements[0].requirement, coinElement);
				percent = pendingPercent = getDynamicProgress(
					gameData.coins,
					requirements[0].requirement,
				);
				// Как в апстриме: когда доход меньше расхода, полоса краснеет.
				progressColor = getIncome().gt(getExpense())
					? "color-income"
					: "color-evil";

				// Эффект недвижимости дублирует её колонку эффекта в списке — у
				// недвижимости в строке остаётся одно название.
				let effectText = null;
				if (categoryName !== "category_properties") {
					effectText = nextEntity.getEffectDescription();
				}
				effectElement.classList.remove("hiddenTask");
				renderNextEntityLine(
					effectValueElement,
					nextEntity,
					effectText,
					nextEntity.unlocked,
				);
			} else if (data === milestoneData) {
				if (requirementObject instanceof EvilRequirement) {
					evilElement.classList.remove("hiddenTask");
					setElementText(
						evilElement,
						`${format(requirements[0].requirement)} ${t("evil")}`,
					);
					[percent, pendingPercent] = resourceProgress(
						gameData.evil,
						requirements[0].requirement,
						getEvilGain,
						"req_rebirth_button2",
					);
					progressColor = "color-evil";
				} else {
					essenceElement.classList.remove("hiddenTask");
					setElementText(
						essenceElement,
						`${format(requirements[0].requirement)} ${t("essence")}`,
					);
					[percent, pendingPercent] = resourceProgress(
						gameData.essence,
						requirements[0].requirement,
						getEssenceGain,
						"req_rebirth_button3",
					);
					progressColor = "color-essence";
				}

				// Описания может не быть — тогда строка без эффекта, одно название.
				let effectText = null;
				if (nextEntity.baseData.description != null) {
					effectText = t(nextEntity.baseData.description);
				}
				effectElement.classList.remove("hiddenTask");
				renderNextEntityLine(
					effectValueElement,
					nextEntity,
					effectText,
					gameData.stats.maxEssenceReached.gt(nextEntity.threshold),
				);
			}

			renderRequirementProgress(
				progressContainer,
				percent,
				pendingPercent,
				progressColor,
			);
		}
	}
}
