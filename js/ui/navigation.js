// ui/navigation.js — navigation, settings, tab switching, keyboard shortcuts

import { currentLang, t } from "../../dist/js/translations.js";
import { enterChallenge, exitChallenge } from "../challenges.js";
import { gameData } from "../data.js";
import { getExpense, getIncome, getNet, togglePause } from "../main.js";
import { buyPerk, getMetaversePerkName, getPerkCost } from "../metaverse.js";
import {
	rebirthFive,
	rebirthFour,
	rebirthOne,
	rebirthThree,
	rebirthTwo,
} from "../rebirth.js";
import { removeSpaces, removeStrangeCharacters } from "../utils.js";
import { fitText } from "./helpers.js";
import { updateUI } from "./init.js";
import { getSortedPerks } from "./metaverse_tab.js";

export function setStickySidebar(sticky) {
	gameData.settings.stickySidebar = sticky;
	document.getElementById("settingsStickySidebar").checked = sticky;
	document.getElementById("info").style.position = sticky
		? "sticky"
		: "initial";
	document.getElementById("resources").style.position = sticky
		? "sticky"
		: "initial";
	document.getElementById("tabcolumn").style.position = sticky
		? "sticky"
		: "initial";
}

export function selectElementInGroup(group, index) {
	const elements = document.getElementsByClassName(group);
	for (const el of elements) {
		el.classList.remove("selected");
	}
	elements[index].classList.add("selected");
}

export function refreshLangButtons() {
	const buttons = document.getElementsByClassName("lang-btn");
	for (const el of buttons) {
		el.classList.toggle("selected", el.dataset.lang === currentLang);
	}
}

export function setSignDisplay() {
	const signDisplay = document.getElementById("signDisplay");
	if (!signDisplay) return;

	if (getNet().gt(-1) && getNet().lt(1)) {
		signDisplay.textContent = "";
		signDisplay.style.color = "gray";
	} else if (getIncome().gt(getExpense())) {
		signDisplay.textContent = "+";
		signDisplay.style.color = "green";
	} else {
		signDisplay.textContent = "-";
		signDisplay.style.color = "red";
	}
}

export function getQuerySelector(taskName) {
	return `#row${removeSpaces(removeStrangeCharacters(taskName))}`;
}

export function getRowByName(name) {
	return document.getElementById(
		`row${removeSpaces(removeStrangeCharacters(name))}`,
	);
}

export const Tab = Object.freeze({
	JOBS: "jobs",
	SKILLS: "skills",
	SHOP: "shop",
	CHALLENGES: "challenges",
	MILESTONES: "milestones",
	REBIRTH: "rebirth",
	DARK_MATTER: "darkMatter",
	METAVERSE: "metaverse",
	SETTINGS: "settings",
});

/**
 * @param {Tab} selectedTab
 */
export function setTab(selectedTab) {
	const tabElement = document.getElementById(selectedTab);

	if (tabElement == null) {
		setTab(Tab.JOBS);
		return;
	}

	gameData.settings.selectedTab = selectedTab;

	const element = document.getElementById(`${selectedTab}TabButton`);

	const tabs = Array.prototype.slice.call(
		document.getElementsByClassName("tab"),
	);
	tabs.forEach((tab) => {
		tab.style.display = "none";
	});
	tabElement.style.display = "flex";

	// Рендер после показа: до этого вкладка display:none и fitText измеряет
	// clientWidth = 0, кладя текст в минимальный масштаб. Переключение
	// обычное — моргнуть не успевает, зато посадка текста сразу корректна.
	updateUI();

	const tabButtons = document.getElementsByClassName("tabButton");
	for (const tabButton of tabButtons) {
		tabButton.classList.remove("w3-blue-gray");
	}
	element.classList.add("w3-blue-gray");
}

function setTabGroup(suffix, tab) {
	const element = document.getElementById(`${tab}TabButton`);
	for (const panel of document.getElementsByClassName(`tab${suffix}`)) {
		panel.style.display = "none";
	}
	document.getElementById(tab).style.display = "flex";
	for (const button of document.getElementsByClassName(`tabButton${suffix}`)) {
		button.classList.remove("w3-blue-gray");
	}
	element.classList.add("w3-blue-gray");
}

export function setTabSettings(tab) {
	setTabGroup("Settings", tab);
}

export function setTabDarkMatter(tab) {
	setTabGroup("DarkMatter", tab);
}

export function setTabMetaverse(tab) {
	setTabGroup("Metaverse", tab);
}

export function setTabMilestones(tab) {
	setTabGroup("Milestones", tab);
}

export function createPerks(perkLayoutName) {
	const buttonTemplate = document.getElementsByClassName("perkItem");
	const perksLayout = document.getElementById(perkLayoutName);
	for (const perkName of getSortedPerks()) {
		const perk = createPerk(buttonTemplate, perkName[0]);
		perksLayout.appendChild(perk);
	}
}

export function createPerk(template, name) {
	const button = template[0].content.firstElementChild.cloneNode(true);
	const perkNameEl = button.getElementsByClassName("perkName")[0];
	perkNameEl.textContent = getMetaversePerkName(name);
	fitText(perkNameEl, 18);
	button.getElementsByClassName("perkCostLabel")[0].textContent = t("cost");
	button.getElementsByClassName("perkCost")[0].textContent = getPerkCost(name);
	button.getElementsByClassName("perkCurrency")[0].textContent = t("mpp_short");
	button.id = `id${removeSpaces(removeStrangeCharacters(name))}`;
	button.onclick = () => {
		buyPerk(name);
	};

	return button;
}

// Keyboard shortcuts + Loadouts ( courtesy of Pseiko )
export function changeTab(direction) {
	const tabs = Array.prototype.slice.call(
		document.getElementsByClassName("tab"),
	);
	const tabButtons = Array.prototype.slice.call(
		document.getElementsByClassName("tabButton"),
	);

	let currentTab = 0;
	for (const i in tabs) {
		if (
			!tabs[i].style.display.includes("none") &&
			!tabs[i].classList.contains("hidden")
		)
			currentTab = i * 1;
	}
	let targetTab = currentTab + direction;
	if (targetTab < 0) {
		setTab(Tab.SETTINGS);
		return;
	}
	targetTab = Math.max(0, targetTab);
	if (targetTab > tabs.length - 1) targetTab = 0;
	while (
		tabButtons[targetTab].style.display.includes("none") ||
		tabButtons[targetTab].classList.contains("hidden")
	) {
		targetTab = targetTab + direction;
		targetTab = Math.max(0, targetTab);
		if (targetTab > tabs.length - 1) targetTab = 0;
	}

	setTab(tabs[targetTab].id);
}

export function toggleChallenge(challengeName) {
	if (!gameData.requirements.req_challenges_tab_button.isCompleted()) return;

	if (gameData.active_challenge === "") {
		if (gameData.requirements[`req_challenge_${challengeName}`].isCompleted())
			enterChallenge(challengeName);
	} else if (gameData.active_challenge === challengeName) exitChallenge();
	else {
		exitChallenge();
		if (gameData.requirements[`req_challenge_${challengeName}`].isCompleted())
			enterChallenge(challengeName);
	}
}

window.addEventListener("keydown", (e) => {
	if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
		if (e.key === " " && !e.repeat) {
			// Space на сфокусированной кнопке должен нажимать её, а не паузу: иначе
			// хоткей и встроенная активация кнопки срабатывают вдвоём, и пауза
			// выглядит как «ничего не произошло». На body (фокуса на контроле нет) —
			// пауза, и preventDefault гасит прокрутку страницы.
			if (e.target === document.body) {
				e.preventDefault();
				togglePause();
			}
		}
		if (e.key === "ArrowRight") changeTab(1);
		if (e.key === "ArrowLeft") changeTab(-1);

		// The "dangerous" keybinds can be disabled.
		if (!gameData.settings.enableKeybinds) return;

		if (e.key === "q") {
			if (gameData.requirements.req_rebirth_button1.isCompleted()) rebirthOne();
		}

		if (e.key === "e") {
			if (gameData.requirements.req_rebirth_button2.isCompleted()) rebirthTwo();
		}

		if (e.key === "t") {
			if (gameData.requirements.req_rebirth_button3.isCompleted())
				rebirthThree();
		}

		if (e.key === "u") {
			if (gameData.requirements.req_rebirth_button4.isCompleted())
				rebirthFour();
		}

		if (e.key === "g") {
			if (gameData.requirements.req_rebirth_button5.isCompleted())
				rebirthFive();
		}

		switch (e.key) {
			case "1":
				toggleChallenge("an_unhappy_life");
				break;
			case "2":
				toggleChallenge("rich_and_the_poor");
				break;
			case "3":
				toggleChallenge("time_does_not_fly");
				break;
			case "4":
				toggleChallenge("dance_with_the_devil");
				break;
			case "5":
				toggleChallenge("legends_never_die");
				break;
			case "6":
				toggleChallenge("the_darkest_time");
				break;
		}
	}
});
