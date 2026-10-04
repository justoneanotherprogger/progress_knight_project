// ui/dark_matter_tab.js — dark matter tab rendering

import { t } from "../../dist/js/translations.js";
import {
	canBuyADealWithTheChairman,
	canBuyAGiftFromGod,
	canBuyAMiracle,
	canBuyDarkOrbGenerator,
	canBuyGottaBeFast,
	canBuyLifeCoach,
	getADealWithTheChairmanCost,
	getAGiftFromGodCost,
	getAGiftFromGodEssenceGain,
	getDarkOrbGeneration,
	getDarkOrbGeneratorCost,
	getGottaBeFastCost,
	getGottaBeFastGain,
	getLifeCoachCost,
	getLifeCoachIncomeGain,
	getTaaAndMagicXpGain,
	isDecimalInfinity,
} from "../dark_matter.js";
import { gameData } from "../data.js";
import { format, formatTreshold } from "../utils.js";
import { setHTML } from "./helpers.js";
import { renderSkillTreeButton } from "./tabs.js";

export function renderDarkMatterShopButton(elemName, condition) {
	document.getElementById(elemName).disabled = !condition;
}

export function getDarkMatterSkillDesc(key, level) {
	// key: "speed_is_life", "your_greatest_debt", etc.
	// level: 1, 2 (we only show 1 or 2 in UI, 3 is handled internally)
	let desc = t(`${key}_${level}`);

	// Негатив есть у обоих уровней и по расчёту действует на обоих
	// (dark_matter.js: [1, 3] и [2, 3]). Перк положительных способностей
	// отключает его в расчёте — значит, и в тексте его быть не должно.
	if (gameData.perks.positive_dark_mater_skills === 0)
		desc += t(`${key}_${level}_neg`);

	return desc;
}

// Ключ способности → префикс id в разметке. Мапой, а не преобразованием имён:
// id в разметке в camelCase, из ключа он не выводится. Полный перенос этих
// данных в контент заведён задачей в трекере.
const SKILL_DESC_IDS = {
	speed_is_life: "speedIsLife",
	your_greatest_debt: "yourGreatestDebt",
	essence_collector: "essenceCollector",
	explosion_of_the_universe: "explosionOfTheUniverse",
	multiverse_explorer: "multiverseExplorer",
};

export function renderDarkMatter() {
	// Display currency
	document.getElementById("darkMatterShopCurrency").textContent =
		t("dark_matter");
	document.getElementById("darkMatterShopDisplay").textContent = format(
		gameData.dark_matter,
	);
	document.getElementById("darkMatterSkillsDisplay").textContent = format(
		gameData.dark_matter,
	);
	document.getElementById("darkOrbsShopDisplay").textContent = formatTreshold(
		gameData.dark_orbs,
	);

	// Shop button texts
	document.getElementById("darkOrbGeneratorBuyButton").textContent = t("buy");
	document.getElementById("aMiracleBuyButton").textContent = t("buy");
	document.getElementById("aDealWithTheChairmanBuyButton").textContent =
		t("buy");
	document.getElementById("aGiftFromGodBuyButton").textContent = t("buy");
	document.getElementById("gottaBeFastBuyButton").textContent = t("buy");
	document.getElementById("lifeCoachBuyButton").textContent = t("buy");

	// Reset abilities button
	document.getElementById("resetAbilitiesButton").textContent =
		t("reset_abilities");

	// Shop item titles (ensure translated even if applyTranslations missed them)
	document.getElementById("dark_orb_generator").textContent =
		t("dark_orb_generator");
	document.getElementById("a_miracle").textContent = t("a_miracle");
	document.getElementById("a_deal_with_chairman").textContent = t(
		"a_deal_with_chairman",
	);
	document.getElementById("a_gift_from_god").textContent = t("a_gift_from_god");
	document.getElementById("gotta_be_fast").textContent = t("gotta_be_fast");
	document.getElementById("life_coach").textContent = t("life_coach");

	// Cost labels
	document.getElementById("darkOrbGeneratorCostLabel").textContent = t("cost");
	document.getElementById("darkOrbGeneratorCurrency").textContent =
		t("dark_matter");
	document.getElementById("aMiracleCostLabel").textContent = t("cost");
	document.getElementById("aMiracleCurrency").textContent = t("dark_matter");
	document.getElementById("aDealWithTheChairmanCostLabel").textContent =
		t("cost");
	document.getElementById("aDealWithTheChairmanCurrency").textContent =
		t("dark_orbs");
	document.getElementById("aGiftFromGodCostLabel").textContent = t("cost");
	document.getElementById("aGiftFromGodCurrency").textContent = t("dark_orbs");
	document.getElementById("gottaBeFastCostLabel").textContent = t("cost");
	document.getElementById("gottaBeFastCurrency").textContent = t("dark_orbs");
	document.getElementById("lifeCoachCostLabel").textContent = t("cost");
	document.getElementById("lifeCoachCurrency").textContent = t("dark_orbs");

	// Dark Matter Shop
	// setHTML, а не innerHTML: описания статичны и меняются только при покупке,
	// а прямая запись пересоздаёт узлы каждый кадр — вложенный span с классом
	// color-dark-orbs начинал анимацию заново и не подрагивал.
	setHTML(
		document.getElementById("darkOrbGeneratorDesc"),
		t("dark_orb_generator_desc", format(getDarkOrbGeneration())),
	);
	document.getElementById("darkOrbGeneratorCost").textContent = format(
		getDarkOrbGeneratorCost(),
	);

	document.getElementById("aDealWithTheChairmanCost").textContent = format(
		getADealWithTheChairmanCost(),
	);
	setHTML(
		document.getElementById("aDealWithTheChairmanDesc"),
		t("a_deal_with_chairman_desc", format(getTaaAndMagicXpGain())),
	);

	setHTML(
		document.getElementById("aGiftFromGodDesc"),
		t("a_gift_from_god_desc", format(getAGiftFromGodEssenceGain())),
	);
	document.getElementById("aGiftFromGodCost").textContent = format(
		getAGiftFromGodCost(),
	);

	setHTML(
		document.getElementById("gottaBeFastDesc"),
		t("gotta_be_fast_desc", format(getGottaBeFastGain(), 2)),
	);
	document.getElementById("gottaBeFastCost").textContent = format(
		getGottaBeFastCost(),
	);

	setHTML(
		document.getElementById("lifeCoachDesc"),
		t("life_coach_desc", format(getLifeCoachIncomeGain())),
	);
	document.getElementById("lifeCoachCost").textContent = format(
		getLifeCoachCost(),
	);

	if (gameData.dark_matter_shop.a_miracle)
		document.getElementById("aMiracleBuyButton").classList.add("hidden");

	if (!isDecimalInfinity(getDarkOrbGeneration()))
		document
			.getElementById("darkOrbGeneratorBuyButton")
			.classList.remove("hidden");
	else
		document
			.getElementById("darkOrbGeneratorBuyButton")
			.classList.add("hidden");

	// enable/disable buttons

	renderDarkMatterShopButton(
		"darkOrbGeneratorBuyButton",
		canBuyDarkOrbGenerator(),
	);
	renderDarkMatterShopButton("aMiracleBuyButton", canBuyAMiracle());
	renderDarkMatterShopButton(
		"aDealWithTheChairmanBuyButton",
		canBuyADealWithTheChairman(),
	);
	renderDarkMatterShopButton("aGiftFromGodBuyButton", canBuyAGiftFromGod());
	renderDarkMatterShopButton("gottaBeFastBuyButton", canBuyGottaBeFast());
	renderDarkMatterShopButton("lifeCoachBuyButton", canBuyLifeCoach());

	// Dark Matter Ability tree — titles
	document.getElementById("speed_is_life").textContent = t("speed_is_life");
	document.getElementById("your_greatest_debt").textContent =
		t("your_greatest_debt");
	document.getElementById("essence_collector").textContent =
		t("essence_collector");
	document.getElementById("explosion_of_the_universe").textContent = t(
		"explosion_of_the_universe",
	);
	document.getElementById("multiverse_explorer").textContent = t(
		"multiverse_explorer",
	);

	// Skill tree title label
	document.getElementById("skillTreePageDarkMaterTitle").textContent =
		`${t("dark_matter")}: `;

	// Ability descriptions
	// setHTML, а не innerHTML: текст меняется только при покупке перка или
	// уровня, а innerHTML пересоздаёт узлы на каждом кадре.
	for (const [key, idPrefix] of Object.entries(SKILL_DESC_IDS)) {
		for (const level of [1, 2]) {
			setHTML(
				document.getElementById(`${idPrefix}${level}Desc`),
				getDarkMatterSkillDesc(key, level),
			);
		}
	}

	// Dark Matter Ability tree - cost labels and currency
	document.getElementById("speedIsLifeCurrencyLabel").textContent = t("cost");
	document.getElementById("speedIsLifeCurrencyIcon").textContent =
		t("dark_matter");
	document.getElementById("yourGreatestDebtCurrencyLabel").textContent =
		t("cost");
	document.getElementById("yourGreatestDebtCurrencyIcon").textContent =
		t("dark_matter");
	document.getElementById("essenceCollectorCurrencyLabel").textContent =
		t("cost");
	document.getElementById("essenceCollectorCurrencyIcon").textContent =
		t("dark_matter");
	document.getElementById("explosionOfTheUniverseCurrencyLabel").textContent =
		t("cost");
	document.getElementById("explosionOfTheUniverseCurrencyIcon").textContent =
		t("dark_matter");
	document.getElementById("multiverseExplorerCurrencyLabel").textContent =
		t("cost");
	document.getElementById("multiverseExplorerCurrencyIcon").textContent =
		t("dark_matter");

	// Dark Matter Ability tree
	renderSkillTreeButton(
		document.getElementById("speedIsLife1"),
		gameData.dark_matter_shop.speed_is_life !== 0,
		[1, 3].includes(gameData.dark_matter_shop.speed_is_life),
		gameData.dark_matter.gte(100),
	);
	renderSkillTreeButton(
		document.getElementById("speedIsLife2"),
		gameData.dark_matter_shop.speed_is_life !== 0,
		[2, 3].includes(gameData.dark_matter_shop.speed_is_life),
		gameData.dark_matter.gte(100),
	);

	renderSkillTreeButton(
		document.getElementById("yourGreatestDebt1"),
		gameData.dark_matter_shop.your_greatest_debt !== 0,
		[1, 3].includes(gameData.dark_matter_shop.your_greatest_debt),
		gameData.dark_matter.gte(1000),
	);
	renderSkillTreeButton(
		document.getElementById("yourGreatestDebt2"),
		gameData.dark_matter_shop.your_greatest_debt !== 0,
		[2, 3].includes(gameData.dark_matter_shop.your_greatest_debt),
		gameData.dark_matter.gte(1000),
	);

	renderSkillTreeButton(
		document.getElementById("essenceCollector1"),
		gameData.dark_matter_shop.essence_collector !== 0,
		[1, 3].includes(gameData.dark_matter_shop.essence_collector),
		gameData.dark_matter.gte(10000),
	);
	renderSkillTreeButton(
		document.getElementById("essenceCollector2"),
		gameData.dark_matter_shop.essence_collector !== 0,
		[2, 3].includes(gameData.dark_matter_shop.essence_collector),
		gameData.dark_matter.gte(10000),
	);

	renderSkillTreeButton(
		document.getElementById("explosionOfTheUniverse1"),
		gameData.dark_matter_shop.explosion_of_the_universe !== 0,
		[1, 3].includes(gameData.dark_matter_shop.explosion_of_the_universe),
		gameData.dark_matter.gte(100000),
	);
	renderSkillTreeButton(
		document.getElementById("explosionOfTheUniverse2"),
		gameData.dark_matter_shop.explosion_of_the_universe !== 0,
		[2, 3].includes(gameData.dark_matter_shop.explosion_of_the_universe),
		gameData.dark_matter.gte(100000),
	);

	renderSkillTreeButton(
		document.getElementById("multiverseExplorer1"),
		gameData.dark_matter_shop.multiverse_explorer !== 0,
		[1, 3].includes(gameData.dark_matter_shop.multiverse_explorer),
		gameData.dark_matter.gte(100000000),
	);
	renderSkillTreeButton(
		document.getElementById("multiverseExplorer2"),
		gameData.dark_matter_shop.multiverse_explorer !== 0,
		[2, 3].includes(gameData.dark_matter_shop.multiverse_explorer),
		gameData.dark_matter.gte(100000000),
	);

	// turn off OR
	const ors = document.getElementsByClassName("darkMatterSkillOR");
	for (const elem of ors) {
		elem.textContent = t("or");
		elem.hidden = gameData.perks.both_dark_mater_skills === 1;
	}
}
