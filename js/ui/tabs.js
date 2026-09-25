// ui/tabs.js — tab content rendering: jobs, skills, shop, challenges, milestones, metaverse, dark matter, settings, rows, perks

// Элементы строки статичны: DOM не пересоздаётся, а getRowByName +
// querySelector — по три поиска на строку каждый кадр на ~295 строк.
function taskRow(task, rowKey) {
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

function renderJobRow(task, rowKey) {
	const els = taskRow(task, rowKey);

	const levelText = formatLevel(task.level);
	if (els.level.textContent != levelText) els.level.textContent = levelText;

	const xpGainText = task.getXpGainFormatted();
	if (els.xpGain.textContent != xpGainText) els.xpGain.textContent = xpGainText;

	const xpLeftText = task.getXpLeftFormatted();
	if (els.xpLeft.textContent != xpLeftText) els.xpLeft.textContent = xpLeftText;

	const tooltipText = rowTooltip(task, rowKey);
	setHTML(els.tooltip, tooltipText);

	const maxLevelText = formatLevel(task.maxLevel);
	if (els.maxLevel.textContent != maxLevelText)
		els.maxLevel.textContent = maxLevelText;
	els.maxLevel.classList.toggle("hidden", gameData.rebirthOneCount == 0);

	const nameText = (task.isHero ? t("great") + " " : "") + t(task.name);
	if (els.name.textContent != nameText) els.name.textContent = nameText;
	els.name.style.whiteSpace = "nowrap";
	fitText(els.name, 16);
	renderProgressBar(task, els.progressFill, els.progressBar);

	els.income.style.display = true;
	els.effect.style.display = false;

	formatCoins(task.getIncome(), els.income);
}

function rowTooltip(task, rowKey) {
	let tooltip = t(task.baseData.tooltip);
	if (!task.isHero && isHeroesUnlocked())
		tooltip += getHeroicRequiredTooltip(rowKey);
	return tooltip;
}

function renderJobs() {
	for (const key in gameData.taskData) {
		const task = gameData.taskData[key];
		if (!(task instanceof Job)) continue;
		renderJobRow(task, key);
	}
}

function renderSkillRow(task, rowKey) {
	const els = taskRow(task, rowKey);

	const levelText = formatLevel(task.level);
	if (els.level.textContent != levelText) els.level.textContent = levelText;

	const xpGainText = task.getXpGainFormatted();
	if (els.xpGain.textContent != xpGainText) els.xpGain.textContent = xpGainText;

	const xpLeftText = task.getXpLeftFormatted();
	if (els.xpLeft.textContent != xpLeftText) els.xpLeft.textContent = xpLeftText;

	const tooltipText = rowTooltip(task, rowKey);
	setHTML(els.tooltip, tooltipText);

	const maxLevelText = formatLevel(task.maxLevel);
	if (els.maxLevel.textContent != maxLevelText)
		els.maxLevel.textContent = maxLevelText;
	els.maxLevel.classList.toggle("hidden", gameData.rebirthOneCount == 0);

	const nameText = (task.isHero ? t("great") + " " : "") + t(task.name);
	if (els.name.textContent != nameText) els.name.textContent = nameText;
	els.name.style.whiteSpace = "nowrap";
	fitText(els.name, 16);
	renderProgressBar(task, els.progressFill, els.progressBar);

	els.income.style.display = false;
	els.effect.style.display = true;

	const effectText = task.getEffectDescription();
	if (els.effect.textContent != effectText) els.effect.textContent = effectText;
	fitText(els.effect, 16);
}

function renderSkills() {
	for (const key in gameData.taskData) {
		const task = gameData.taskData[key];
		if (!(task instanceof Skill)) continue;
		renderSkillRow(task, key);
	}
}

function renderShop() {
	for (const key in gameData.itemData) {
		const item = gameData.itemData[key];
		if (item._row == null) {
			const row = getRowByName(key);
			const button = row.querySelector(".button");
			item._row = {
				button,
				name: button.querySelector(".name"),
				tooltip: row.querySelector(".tooltipText"),
				active: row.querySelector(".active"),
				effect: row.querySelector(".effect"),
				expense: row.querySelector(".expense"),
			};
		}
		const els = item._row;

		els.button.disabled = gameData.coins.lt(item.getExpense());

		const nameText = t(item.name);
		if (els.name.textContent != nameText) els.name.textContent = nameText;

		if (els.tooltip) {
			const tooltipText = t(item.baseData.tooltip);
			if (els.tooltip.textContent != tooltipText)
				els.tooltip.textContent = tooltipText;
		}

		els.name.classList.toggle("legendary", isHeroesUnlocked());

		const color = itemCategories[item.categoryId].headerColor;
		const bgColor =
			gameData.currentMisc.includes(item) || item == gameData.currentProperty
				? color
				: "white";
		if (els.active.style.backgroundColor != bgColor)
			els.active.style.backgroundColor = bgColor;

		const effectText = item.getEffectDescription();
		if (els.effect.textContent != effectText)
			els.effect.textContent = effectText;
		formatCoins(item.getExpense(), els.expense);
	}

	const autoBuyToggle = document.getElementById("autoBuyToggle");
	if (autoBuyToggle && autoBuyToggle.checked != gameData.autoBuyEnabled)
		autoBuyToggle.checked = gameData.autoBuyEnabled;
}

// Строки вех статичны: порог и перевод большую часть времени не меняются,
// а getRowByName + querySelector — по три поиска по дереву на строку.
// Закэшированные элементы и последний записанный текст живут на самой вехе.
function renderMilestones() {
	for (const key in milestoneData) {
		const milestone = milestoneData[key];
		if (milestone._row == null) {
			const row = getRowByName(key);
			milestone._row = {
				essence: row.querySelector(".essence"),
				description: row.querySelector(".description"),
				name: row.querySelector(".name"),
				tooltip: row.querySelector(".tooltipText"),
			};
		}
		const els = milestone._row;

		const essenceText = format(milestone.threshold);
		if (els.essence.textContent != essenceText)
			els.essence.textContent = essenceText;

		let desc = t(milestone.description);
		const effect = milestone.getEffect();
		if (effect != null) desc = "x" + format(effect, 1) + " " + desc;

		if (els.description.textContent != desc) els.description.textContent = desc;

		const nameText = t(milestone.name);
		if (els.name.textContent != nameText) els.name.textContent = nameText;
		els.name.style.whiteSpace = "nowrap";
		fitText(els.name, 16);

		if (els.tooltip) {
			const tooltipText = t(milestone.tooltip);
			if (els.tooltip.textContent != tooltipText)
				els.tooltip.textContent = tooltipText;
		}
	}
}

function renderSettings() {
	// Stats
	const date = new Date(gameData.stats.startDate);
	document.getElementById("startDateDisplay").textContent =
		date.toLocaleDateString();

	const currentDate = new Date();
	document.getElementById("playedDaysDisplay").textContent = format(
		(currentDate.getTime() - date.getTime()) / (1000 * 3600 * 24),
		2,
	);
	document.getElementById("playedRealTimeDisplay").textContent = formatTime(
		gameData.realtimeRun,
	);

	document.getElementById("playedGameTimeDisplay").textContent = format(
		gameData.totalDays,
		2,
	);

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

	document.getElementById("rebirthOneCountDisplay").textContent =
		gameData.rebirthOneCount;
	document.getElementById("rebirthTwoCountDisplay").textContent =
		gameData.rebirthTwoCount;
	document.getElementById("rebirthThreeCountDisplay").textContent =
		gameData.rebirthThreeCount;
	document.getElementById("rebirthFourCountDisplay").textContent =
		gameData.rebirthFourCount;
	document.getElementById("rebirthFiveCountDisplay").textContent =
		gameData.rebirthFiveCount;

	document.getElementById("rebirthOneTimeDisplay").textContent = formatTime(
		gameData.rebirthOneTime,
		true,
	);
	document.getElementById("rebirthTwoTimeDisplay").textContent = formatTime(
		gameData.rebirthTwoTime,
		true,
	);
	document.getElementById("rebirthThreeTimeDisplay").textContent = formatTime(
		gameData.rebirthThreeTime,
		true,
	);
	document.getElementById("rebirthFourTimeDisplay").textContent = formatTime(
		gameData.rebirthFourTime,
		true,
	);
	document.getElementById("rebirthFiveTimeDisplay").textContent = formatTime(
		gameData.rebirthFiveTime,
		true,
	);

	document.getElementById("rebirthOneFastestDisplay").textContent = formatTime(
		gameData.stats.fastest1,
		true,
	);
	document.getElementById("rebirthTwoFastestDisplay").textContent = formatTime(
		gameData.stats.fastest2,
		true,
	);
	document.getElementById("rebirthThreeFastestDisplay").textContent =
		formatTime(gameData.stats.fastest3, true);
	document.getElementById("rebirthFourFastestDisplay").textContent = formatTime(
		gameData.stats.fastest4,
		true,
	);
	document.getElementById("rebirthFiveFastestDisplay").textContent = formatTime(
		gameData.stats.fastest5,
		true,
	);

	// Gain Stats
	document.getElementById("evilPerSecondDisplay").textContent = format(
		gameData.stats.EvilPerSecond,
		3,
	);
	document.getElementById("maxEvilPerSecondDisplay").textContent = format(
		gameData.stats.maxEvilPerSecond,
		3,
	);
	document.getElementById("maxEvilPerSecondRtDisplay").textContent = formatTime(
		gameData.stats.maxEvilPerSecondRt,
	);

	document.getElementById("essencePerSecondDisplay").textContent = format(
		gameData.stats.EssencePerSecond,
		3,
	);
	document.getElementById("maxEssencePerSecondDisplay").textContent = format(
		gameData.stats.maxEssencePerSecond,
		3,
	);
	document.getElementById("maxEssencePerSecondRtDisplay").textContent =
		formatTime(gameData.stats.maxEssencePerSecondRt);

	// Challenge Stats
	document.getElementById("stats_challenge_1").hidden =
		gameData.challenges.an_unhappy_life == 0;
	document.getElementById("stats_challenge_2").hidden =
		gameData.challenges.rich_and_the_poor == 0;
	document.getElementById("stats_challenge_3").hidden =
		gameData.challenges.time_does_not_fly == 0;
	document.getElementById("stats_challenge_4").hidden =
		gameData.challenges.dance_with_the_devil == 0;
	document.getElementById("stats_challenge_5").hidden =
		gameData.challenges.legends_never_die == 0;
	document.getElementById("stats_challenge_6").hidden =
		gameData.challenges.the_darkest_time == 0;

	document.getElementById("challengeHappinessBuffDisplay").textContent = format(
		getChallengeBonus("an_unhappy_life"),
		2,
	);
	document.getElementById("challengeIncomeBuffDisplay").textContent = format(
		getChallengeBonus("rich_and_the_poor"),
		2,
	);
	document.getElementById("challengeTimewarpingBuffDisplay").textContent =
		format(getChallengeBonus("time_does_not_fly"), 2);
	document.getElementById("challengeEssenceGainBuffDisplay").textContent =
		format(getChallengeBonus("dance_with_the_devil"), 2);
	document.getElementById("challengeEvilGainBuffDisplay").textContent = format(
		getChallengeBonus("legends_never_die"),
		2,
	);
	document.getElementById("challengeDarkMaterGainBuffDisplay").textContent =
		format(getChallengeBonus("the_darkest_time"), 2);
}

function renderRequirements() {
	for (const key in gameData.requirements) {
		const requirement = gameData.requirements[key];
		const visible = requirement.isCompleted();
		for (const element of requirement.elements) {
			// Класс пишется только при реальной смене: за весь забег
			// требование закрывается максимум один раз, а отрисовка
			// гоняется каждый кадр.
			if (element.classList.contains("hidden") == visible)
				element.classList.toggle("hidden", !visible);
		}
	}
}

function updateHeaderColumns(headerRow, categoryType) {
	if (categoryType == jobCategories || categoryType == skillCategories) {
		const valueType = headerRow.querySelector(".valueType");
		if (valueType)
			valueType.textContent =
				categoryType == jobCategories ? t("income_day") : t("effect");
		const headers = headerRow.getElementsByTagName("th");
		headers[1].textContent = t("level");
		headers[3].textContent = t("xp_day");
		headers[4].textContent = t("xp_left");
		headers[5].textContent = t("max_level");
	} else if (categoryType == itemCategories) {
		const headers = headerRow.getElementsByTagName("th");
		headers[1].textContent = t("active");
		headers[2].textContent = t("effect");
		headers[3].textContent = t("cost");
	}
}

function renderHeaderRows(categories) {
	for (const categoryName in categories) {
		const className = removeSpaces(categoryName);
		const headerRow = document.getElementsByClassName(className)[0];
		const categoryElement = headerRow
			.getElementsByClassName("category")[0]
			.querySelector(".name");
		if (categoryElement) categoryElement.textContent = t(categoryName);
		else
			headerRow.getElementsByClassName("category")[0].textContent =
				t(categoryName);
		const maxLevelElement = headerRow.querySelector(".maxLevel");
		if (maxLevelElement)
			maxLevelElement.classList.toggle("hidden", gameData.rebirthOneCount == 0);

		updateHeaderColumns(headerRow, categories);
	}
}

function createRequiredRow(categoryName, categoryType) {
	const requiredRow = document
		.querySelector(".requiredRowTemplate")
		.content.firstElementChild.cloneNode(true);
	const graySpans = requiredRow.querySelectorAll("span.w3-text-gray");
	graySpans[0].textContent = t("required");
	if (categoryType != jobCategories && graySpans.length > 1)
		graySpans[1].textContent = t("next_effect");
	requiredRow.classList.add("requiredRow");
	requiredRow.classList.add(removeSpaces(categoryName));
	requiredRow.id = "req_" + categoryName;
	return requiredRow;
}

function createHeaderRow(templates, categoryType, categoryName) {
	const headerRow =
		templates.headerRow.content.firstElementChild.cloneNode(true);
	const categoryElement = headerRow.getElementsByClassName("category")[0];

	if (categoryType == itemCategories) {
		categoryElement.getElementsByClassName("name")[0].textContent =
			t(categoryName);
	} else {
		categoryElement.textContent = t(categoryName);
	}

	updateHeaderColumns(headerRow, categoryType);

	headerRow.style.backgroundColor = categoryType[categoryName].headerColor;
	headerRow.style.color = "#ffffff";
	headerRow.classList.add(removeSpaces(categoryName));
	headerRow.classList.add("headerRow");

	return headerRow;
}

function createRow(templates, name, categoryName, categoryType) {
	const row = templates.row.content.firstElementChild.cloneNode(true);

	let displayName = name;
	let tooltipKey = "tt_" + name;
	if (categoryType == skillCategories || categoryType == jobCategories) {
		const entity = gameData.taskData[name];
		if (entity) {
			displayName = entity.name;
			tooltipKey = entity.baseData.tooltip;
		}
	} else if (categoryType == itemCategories) {
		const entity = gameData.itemData[name];
		if (entity) {
			displayName = entity.name;
			tooltipKey = entity.baseData.tooltip;
		}
	} else if (categoryType == milestoneCategories) {
		const entity = milestoneData[name];
		if (entity) {
			displayName = entity.name;
			tooltipKey = entity.baseData.tooltip;
		}
	}

	row.getElementsByClassName("name")[0].textContent = t(displayName);
	row.getElementsByClassName("tooltipText")[0].textContent = t(tooltipKey);
	row.id = "row" + removeSpaces(removeStrangeCharacters(name));

	if (categoryType == itemCategories) {
		row.getElementsByClassName("button")[0].onclick =
			categoryName == "category_properties"
				? () => {
						setCurrentProperty(name);
					}
				: () => {
						setMisc(name);
					};
	}

	return row;
}

function createAllRows(categoryType, tableId) {
	const templates = {
		headerRow: document.getElementsByClassName(
			categoryType == itemCategories
				? "headerRowItemTemplate"
				: categoryType == milestoneCategories
					? "headerRowMilestoneTemplate"
					: "headerRowTaskTemplate",
		)[0],
		row: document.getElementsByClassName(
			categoryType == itemCategories
				? "rowItemTemplate"
				: categoryType == milestoneCategories
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
			category.forEach(function (name) {
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

		const requiredRow = createRequiredRow(categoryName, categoryType);
		table.append(requiredRow);
	}
}

function getTaskNameLocale(taskRef) {
	const entity = gameData.taskData[taskRef];
	return entity ? entity.name : taskRef;
}

function updateRequiredRows(data, categoryType) {
	const requiredRows = document.getElementsByClassName("requiredRow");
	for (const requiredRow of requiredRows) {
		const graySpans = requiredRow.querySelectorAll("span.w3-text-gray");
		graySpans[0].textContent = t("required");
		if (categoryType != jobCategories && graySpans.length > 1)
			graySpans[1].textContent = t("next_effect");
		let nextEntity = null;
		let nextEntityName = null;
		const category = categoryType[requiredRow.id.substring(4)];
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
			if (requirements && i == 0) {
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
			const effectText = "";
			if (data == gameData.taskData) {
				if (categoryType != jobCategories) {
					effectElement.classList.remove("hiddenTask");
					effectValueElement.textContent = nextEntity.unlocked
						? t(labelKey(nextEntity.baseData.effect.target))
						: t("unknown");
				}

				if (requirementObject instanceof EvilRequirement) {
					evilElement.classList.remove("hiddenTask");
					evilElement.textContent =
						format(requirements[0].requirement) + " " + t("evil");
				} else if (requirementObject instanceof EssenceRequirement) {
					essenceElement.classList.remove("hiddenTask");
					essenceElement.textContent =
						format(requirements[0].requirement) + " " + t("essence");
				} else if (requirementObject instanceof DarkMatterRequirement) {
					darkMatterElement.classList.remove("hiddenTask");
					darkMatterElement.textContent =
						format(requirements[0].requirement) + " " + t("dark_matter");
				} else if (requirementObject instanceof MetaverseRequirement) {
				} else if (requirementObject instanceof HypercubeRequirement) {
					hypercubeElement.classList.remove("hiddenTask");
					hypercubeElement.textContent =
						format(requirements[0].requirement) + " " + t("hypercubes");
				} else if (requirementObject instanceof AgeRequirement) {
					essenceElement.classList.remove("hiddenTask");
					essenceElement.textContent =
						t("age") + " " + format(requirements[0].requirement);
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
					finalText = finalText.substring(0, finalText.length - 1);
					levelElement.textContent = finalText;
				}
			} else if (data == gameData.itemData) {
				coinElement.classList.remove("hiddenTask");
				formatCoins(requirements[0].requirement, coinElement);

				effectElement.classList.remove("hiddenTask");
				effectValueElement.textContent = nextEntity.unlocked
					? nextEntity.getEffectDescription()
					: t("unknown");
			} else if (data == milestoneData) {
				essenceElement.classList.remove("hiddenTask");
				essenceElement.textContent =
					format(requirements[0].requirement) + " " + t("essence");

				if (nextEntity.baseData.description != null) {
					effectElement.classList.remove("hiddenTask");
					effectValueElement.textContent = gameData.stats.maxEssenceReached.gt(
						nextEntity.threshold,
					)
						? t(nextEntity.baseData.description)
						: t("unknown");
				}
			}
		}
	}
}

function getHeroicRequiredTooltip(task) {
	const requirementObject = gameData.requirements[task];
	const requirements = requirementObject.requirements;
	const prev = getPreviousTaskInCategory(task);

	let tooltip =
		'<br> <span style="color: red">' +
		t("required") +
		'</span>: <span style="color: orange">';
	let reqlist = "";
	let prevReq = "";

	if (prev != "") {
		var prevTask = gameData.taskData[prev];
		var prevlvl = prevTask.isHero ? prevTask.level : 0;
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
				requirements[0].herequirement == undefined
					? requirements[0].requirement
					: requirements[0].herequirement,
			) +
			" " +
			t("evil") +
			"<br>";
	} else if (requirementObject instanceof EssenceRequirement) {
		reqlist +=
			format(
				requirements[0].herequirement == undefined
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
				requirements[0].herequirement == undefined
					? requirements[0].requirement
					: requirements[0].herequirement,
			) +
			"<br>";
	} else if (requirementObject instanceof DarkMatterRequirement) {
		reqlist +=
			format(
				requirements[0].herequirement == undefined
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
			if (prev != "" && requirement.task == prev) {
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
	tooltip += reqlist + "</span>";
	return tooltip;
}

function renderChangelog() {
	const container = document.getElementById("changelog");
	if (!container) return;

	let html = `<table style="width:100%; border-collapse:collapse;">`;
	for (const entry of CHANGELOG) {
		const items = entry[currentLang] || entry["en"];
		html += `<tr><td style="text-align:center; font-weight:bold; padding-top:0.8em; padding-bottom:0.2em;">version ${entry["version"]} / ${entry["date"]}</td></tr>`;
		for (const item of items) {
			html += `<tr><td style="padding:0.15em 0; vertical-align:top;">${item}</td></tr>`;
		}
	}
	html += `</table>`;
	container.innerHTML = html;
}

function renderSkillTreeButton(element, categoryBought, elementBought, canBuy) {
	if (gameData.perks.both_dark_mater_skills == 0) {
		element.disabled = categoryBought | !canBuy;

		if (categoryBought) {
			if (elementBought) {
				element.textContent = t("accepted");
				element.classList.add("w3-green");
				element.classList.remove("w3-red");
			} else {
				element.textContent = t("rejected");
				element.classList.add("w3-red");
				element.classList.remove("w3-green");
			}
		} else {
			element.textContent = t("buy");
			element.classList.remove("w3-green");
			element.classList.remove("w3-red");
		}
	} else {
		element.disabled = elementBought;

		if (elementBought) {
			element.textContent = t("accepted");
			element.classList.add("w3-green");
			element.classList.remove("w3-red");
		} else {
			element.textContent = t("buy");
			element.classList.remove("w3-green");
			element.classList.remove("w3-red");
		}
	}
}
