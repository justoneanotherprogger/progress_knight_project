// ui/dark_matter_tab.js — dark matter tab rendering

import { t } from "../../dist/js/translations.js";
import { getDarkMatterGain } from "../calculations.js";
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
	getAMiracleCost,
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
import { format, formatTreshold, getDynamicProgress } from "../utils.js";
import {
	renderRequirementProgress,
	resourceProgress,
	setElementText,
	setHTML,
	updateButtonText,
} from "./helpers.js";

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

// Покупки магазина тёмной материи: префикс id в разметке, функция цены,
// признак pending и условие доступности. Прибавку за ребёрт показываем
// только у тёмной материи: сферы на ребёрте не растут, а следующий
// ребёрт их обнуляет.
const SHOP_PURCHASES = [
	{
		idPrefix: "darkOrbGenerator",
		cost: getDarkOrbGeneratorCost,
		pending: true,
		// Генерация сфер ушла в бесконечность: покупать больше нечего.
		available: () => !isDecimalInfinity(getDarkOrbGeneration()),
	},
	// Покупка одноразовая, сбрасывается только на пятом ребёрте: после
	// покупки полоса к цене бессмысленна.
	{
		idPrefix: "aMiracle",
		cost: getAMiracleCost,
		pending: true,
		available: () => !gameData.dark_matter_shop.a_miracle,
	},
	{ idPrefix: "aDealWithTheChairman", cost: getADealWithTheChairmanCost },
	{ idPrefix: "aGiftFromGod", cost: getAGiftFromGodCost },
	{ idPrefix: "gottaBeFast", cost: getGottaBeFastCost },
	{ idPrefix: "lifeCoach", cost: getLifeCoachCost },
];

// Перки дерева: цена одна на оба уровня, поэтому полоса и проверка
// доступности кнопок берут одно и то же число.
const SKILL_PURCHASES = [
	{ key: "speed_is_life", idPrefix: "speedIsLife", cost: 100 },
	{ key: "your_greatest_debt", idPrefix: "yourGreatestDebt", cost: 1000 },
	{ key: "essence_collector", idPrefix: "essenceCollector", cost: 10000 },
	{
		key: "explosion_of_the_universe",
		idPrefix: "explosionOfTheUniverse",
		cost: 100000,
	},
	{
		key: "multiverse_explorer",
		idPrefix: "multiverseExplorer",
		cost: 100000000,
	},
];

export function renderDarkMatter() {
	// Display currency
	updateButtonText("darkMatterShopCurrency", t("dark_matter"));
	updateButtonText("darkMatterShopDisplay", format(gameData.dark_matter));
	updateButtonText("darkMatterSkillsDisplay", format(gameData.dark_matter));
	updateButtonText("darkOrbsShopDisplay", formatTreshold(gameData.dark_orbs));

	// Полоса к цене каждой покупки магазина: у тёмной материи с прибавкой
	// за ребёрт, у сфер — без неё.
	for (const purchase of SHOP_PURCHASES) {
		const cost = purchase.cost();
		const [percent, pendingPercent] = purchase.pending
			? resourceProgress(
					gameData.dark_matter,
					cost,
					getDarkMatterGain,
					"req_rebirth_button4",
				)
			: [getDynamicProgress(gameData.dark_orbs, cost), null];
		const visible = purchase.available?.() ?? true;
		renderRequirementProgress(
			document.getElementById(`${purchase.idPrefix}Progress`),
			visible ? percent : null,
			visible ? pendingPercent : null,
			"color-dark-matter",
		);
	}

	// Shop button texts
	updateButtonText("darkOrbGeneratorBuyButton", t("buy"));
	updateButtonText("aMiracleBuyButton", t("buy"));
	updateButtonText("aDealWithTheChairmanBuyButton", t("buy"));
	updateButtonText("aGiftFromGodBuyButton", t("buy"));
	updateButtonText("gottaBeFastBuyButton", t("buy"));
	updateButtonText("lifeCoachBuyButton", t("buy"));

	// Reset abilities button
	updateButtonText("resetAbilitiesButton", t("reset_abilities"));

	// Cost labels
	updateButtonText("darkOrbGeneratorCostLabel", t("cost"));
	updateButtonText("darkOrbGeneratorCurrency", t("dark_matter"));
	updateButtonText("aMiracleCostLabel", t("cost"));
	updateButtonText("aMiracleCurrency", t("dark_matter"));
	updateButtonText(
		"aMiracleState",
		gameData.dark_matter_shop.a_miracle ? t("active") : "",
	);
	updateButtonText("aDealWithTheChairmanCostLabel", t("cost"));
	updateButtonText("aDealWithTheChairmanCurrency", t("dark_orbs"));
	updateButtonText("aGiftFromGodCostLabel", t("cost"));
	updateButtonText("aGiftFromGodCurrency", t("dark_orbs"));
	updateButtonText("gottaBeFastCostLabel", t("cost"));
	updateButtonText("gottaBeFastCurrency", t("dark_orbs"));
	updateButtonText("lifeCoachCostLabel", t("cost"));
	updateButtonText("lifeCoachCurrency", t("dark_orbs"));

	// Dark Matter Shop
	// setHTML, а не innerHTML: описания статичны и меняются только при покупке,
	// а прямая запись пересоздаёт узлы каждый кадр, и вложенный span с классом
	// color-dark-orbs терял бы ореол, который ему ставит wobbleDarkOrbs.
	setHTML(
		document.getElementById("darkOrbGeneratorDesc"),
		t("dark_orb_generator_desc", format(getDarkOrbGeneration())),
	);
	updateButtonText("darkOrbGeneratorCost", format(getDarkOrbGeneratorCost()));

	updateButtonText(
		"aDealWithTheChairmanCost",
		format(getADealWithTheChairmanCost()),
	);
	setHTML(
		document.getElementById("aDealWithTheChairmanDesc"),
		t("a_deal_with_chairman_desc", format(getTaaAndMagicXpGain())),
	);

	setHTML(
		document.getElementById("aGiftFromGodDesc"),
		t("a_gift_from_god_desc", format(getAGiftFromGodEssenceGain())),
	);
	updateButtonText("aGiftFromGodCost", format(getAGiftFromGodCost()));

	setHTML(
		document.getElementById("gottaBeFastDesc"),
		t("gotta_be_fast_desc", format(getGottaBeFastGain(), 2)),
	);
	updateButtonText("gottaBeFastCost", format(getGottaBeFastCost()));

	setHTML(
		document.getElementById("lifeCoachDesc"),
		t("life_coach_desc", format(getLifeCoachIncomeGain())),
	);
	updateButtonText("lifeCoachCost", format(getLifeCoachCost()));

	if (gameData.dark_matter_shop.a_miracle)
		document.getElementById("aMiracleBuyButton").classList.add("hidden");
	else document.getElementById("aMiracleBuyButton").classList.remove("hidden");

	if (gameData.dark_matter_shop.a_miracle)
		document.getElementById("aMiracleCost").classList.add("hidden");
	else document.getElementById("aMiracleCost").classList.remove("hidden");

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
	updateButtonText("speedIsLifeCurrencyLabel", t("cost"));
	updateButtonText("speedIsLifeCurrencyIcon", t("dark_matter"));
	updateButtonText("yourGreatestDebtCurrencyLabel", t("cost"));
	updateButtonText("yourGreatestDebtCurrencyIcon", t("dark_matter"));
	updateButtonText("essenceCollectorCurrencyLabel", t("cost"));
	updateButtonText("essenceCollectorCurrencyIcon", t("dark_matter"));
	updateButtonText("explosionOfTheUniverseCurrencyLabel", t("cost"));
	updateButtonText("explosionOfTheUniverseCurrencyIcon", t("dark_matter"));
	updateButtonText("multiverseExplorerCurrencyLabel", t("cost"));
	updateButtonText("multiverseExplorerCurrencyIcon", t("dark_matter"));

	// Dark Matter Ability tree
	// Кнопки обоих уровней перка и его полоса смотрят на одно и то же
	// состояние и цену.
	for (const { key, idPrefix, cost } of SKILL_PURCHASES) {
		const level = gameData.dark_matter_shop[key];
		const canAfford = gameData.dark_matter.gte(cost);
		for (const number of [1, 2]) {
			renderSkillTreeButton(
				document.getElementById(`${idPrefix}${number}`),
				level !== 0,
				[number, 3].includes(level),
				canAfford,
			);
		}
		const [percent, pendingPercent] = resourceProgress(
			gameData.dark_matter,
			cost,
			getDarkMatterGain,
			"req_rebirth_button4",
		);
		renderRequirementProgress(
			document.getElementById(`${idPrefix}Progress`),
			percent,
			pendingPercent,
			"color-dark-matter",
		);
	}

	// turn off OR
	const ors = document.getElementsByClassName("darkMatterSkillOR");
	for (const elem of ors) {
		setElementText(elem, t("or"));
		elem.hidden = gameData.perks.both_dark_mater_skills === 1;
	}
}

function renderSkillTreeButton(element, categoryBought, elementBought, canBuy) {
	if (gameData.perks.both_dark_mater_skills === 0) {
		element.disabled = categoryBought | !canBuy;

		if (categoryBought) {
			if (elementBought) {
				setElementText(element, t("accepted"));
				element.classList.add("w3-green");
				element.classList.remove("w3-red");
			} else {
				setElementText(element, t("rejected"));
				element.classList.add("w3-red");
				element.classList.remove("w3-green");
			}
		} else {
			setElementText(element, t("buy"));
			element.classList.remove("w3-green");
			element.classList.remove("w3-red");
		}
	} else {
		element.disabled = elementBought;

		if (elementBought) {
			setElementText(element, t("accepted"));
			element.classList.add("w3-green");
			element.classList.remove("w3-red");
		} else {
			setElementText(element, t("buy"));
			element.classList.remove("w3-green");
			element.classList.remove("w3-red");
		}
	}
}
