// ui/dark_matter_tab.js — dark matter tab rendering

import { darkMatterAbilities } from "../../dist/js/dark_matter_abilities_data.js";
import { applyTranslations, t } from "../../dist/js/translations.js";
import { getDarkMatterGain } from "../calculations.js";
import {
	buyAbility,
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

// Описание уровня способности: «умножает на N» плюс негатив, если он есть
// и его не снял перк положительных способностей. Числа берутся из контента,
// текст — из локали, поэтому разойтись они не могут.
function getAbilityDesc(ability, level) {
	// На уровне ровно одна положительная и одна отрицательная цель, поэтому
	// в описание подставляются их множители; у негатива это делитель.
	const { positive, negative } = ability.levels[level];
	const [gain] = Object.values(positive);
	const [loss] = Object.values(negative);

	let desc = t(`${ability.key}_${level}`, format(gain, 0));
	if (loss != null && gameData.perks.positive_dark_mater_skills === 0)
		desc += t(`${ability.key}_${level}_neg`, format(1 / loss, 0));

	return desc;
}

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

// Дерево способностей строится из контента один раз при старте, как строки
// таблиц: блок из шаблона клонируется, id и обработчики проставляются по
// префиксу. Дальше renderDarkMatter только обновляет готовые узлы.
export function buildAbilityTree() {
	const container = document.getElementById("darkMatterAbilityTree");
	const template = document.getElementById("darkMatterAbilityTemplate");
	if (container == null || template == null) return;

	container.innerHTML = "";

	for (const ability of darkMatterAbilities) {
		const block = template.content.firstElementChild.cloneNode(true);
		const rename = (from, to) => {
			const element = block.querySelector(`#${from}`);
			element.id = to;
			return element;
		};

		rename("abilityTitle", ability.key);
		for (const number of [1, 2]) {
			const button = rename(
				`abilityLevel${number}`,
				`${ability.prefix}${number}`,
			);
			button.onclick = () => buyAbility(ability.key, number);
			rename(`abilityLevel${number}Desc`, `${ability.prefix}${number}Desc`);
		}
		rename("abilityCost", `${ability.prefix}Cost`);
		rename("abilityCostValue", `${ability.prefix}CostValue`);
		rename("abilityCurrencyLabel", `${ability.prefix}CurrencyLabel`);
		rename("abilityCurrencyIcon", `${ability.prefix}CurrencyIcon`);
		rename("abilityProgress", `${ability.prefix}Progress`);

		container.appendChild(block);
	}

	// Названия способностей приходят переводами по id, а блоки созданы только
	// что — без этого вызова заголовки ждали бы смены языка.
	applyTranslations();
}

export function renderDarkMatter() {
	// Display currency
	updateButtonText("darkMatterShopCurrency", t("dark_matter"));
	updateButtonText("darkMatterShopDisplay", format(gameData.dark_matter));
	updateButtonText("darkMatterSkillsDisplay", format(gameData.dark_matter));
	updateButtonText("skillTreePageDarkMaterTitle", t("dark_matter"));
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

	for (const ability of darkMatterAbilities) {
		for (const level of [1, 2]) {
			setHTML(
				document.getElementById(`${ability.prefix}${level}Desc`),
				getAbilityDesc(ability, level),
			);
		}
	}

	for (const ability of darkMatterAbilities) {
		updateButtonText(`${ability.prefix}CurrencyLabel`, t("cost"));
		updateButtonText(`${ability.prefix}CurrencyIcon`, t("dark_matter"));
	}

	for (const { key, prefix, cost } of darkMatterAbilities) {
		const level = gameData.dark_matter_shop[key];
		const canAfford = gameData.dark_matter.gte(cost);
		const bought = level !== 0;
		for (const number of [1, 2]) {
			renderSkillTreeButton(
				document.getElementById(`${prefix}${number}`),
				bought,
				[number, 3].includes(level),
				canAfford,
			);
		}
		updateButtonText(`${prefix}CostValue`, format(cost, 0));
		const [percent, pendingPercent] = resourceProgress(
			gameData.dark_matter,
			cost,
			getDarkMatterGain,
			"req_rebirth_button4",
		);
		renderRequirementProgress(
			document.getElementById(`${prefix}Progress`),
			bought ? null : percent,
			bought ? null : pendingPercent,
			"color-dark-matter",
		);
		const costEl = document.getElementById(`${prefix}Cost`);
		if (costEl != null) costEl.hidden = bought;
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
				element.classList.add("button-accepted");
				element.classList.remove("button-rejected");
			} else {
				setElementText(element, t("rejected"));
				element.classList.add("button-rejected");
				element.classList.remove("button-accepted");
			}
		} else {
			setElementText(element, t("buy"));
			element.classList.remove("button-accepted");
			element.classList.remove("button-rejected");
		}
	} else {
		element.disabled = elementBought;

		if (elementBought) {
			setElementText(element, t("accepted"));
			element.classList.add("button-accepted");
			element.classList.remove("button-rejected");
		} else {
			setElementText(element, t("buy"));
			element.classList.remove("button-accepted");
			element.classList.remove("button-rejected");
		}
	}
}
