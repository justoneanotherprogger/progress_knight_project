// ui/dark_matter_tab.js — dark matter tab rendering

import { darkMatterAbilities } from "../../dist/js/dark_matter_abilities_data.js";
import { darkMatterShop } from "../../dist/js/dark_matter_shop_data.js";
import { applyTranslations, t } from "../../dist/js/translations.js";
import { getDarkMatterGain } from "../calculations.js";
import {
	buyAbility,
	buyShopPurchase,
	canBuyShopPurchase,
	getShopCost,
	getShopGain,
	isDecimalInfinity,
} from "../dark_matter.js";
import { gameData } from "../data.js";
import { hasAbilityPerk } from "../metaverse.js";
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
	if (loss != null && !hasAbilityPerk("negative"))
		desc += t(`${ability.key}_${level}_neg`, format(1 / loss, 0));

	return desc;
}

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

function buildShopSection(containerId, purchases) {
	const container = document.getElementById(containerId);
	const template = document.getElementById("darkMatterShopItemTemplate");

	for (const purchase of purchases) {
		const block = template.content.firstElementChild.cloneNode(true);
		const rename = (from, to) => {
			const element = block.querySelector(`#${from}`);
			element.id = to;
			return element;
		};

		rename("purchaseTitle", purchase.name_key);
		rename("purchaseDesc", `${purchase.prefix}Desc`);
		rename("purchaseStateRow", `${purchase.prefix}StateRow`).hidden =
			!purchase.one_time;
		rename("purchaseState", `${purchase.prefix}State`);
		rename("purchaseCost", `${purchase.prefix}Cost`);
		rename("purchaseCostLabel", `${purchase.prefix}CostLabel`);
		rename("purchaseCostValue", `${purchase.prefix}CostValue`);
		rename("purchaseProgress", `${purchase.prefix}Progress`);

		const currency = rename("purchaseCurrency", `${purchase.prefix}Currency`);
		currency.classList.add(
			purchase.currency === "dark_orbs"
				? "color-dark-orbs"
				: "color-dark-matter",
		);
		if (purchase.currency === "dark_orbs") currency.classList.add("orb-text");

		const button = rename("purchaseBuyButton", `${purchase.prefix}BuyButton`);
		button.onclick = () => buyShopPurchase(purchase.key);

		container.appendChild(block);
	}
}

// Магазин строится из данных при старте, как дерево способностей: две
// секции по валюте, дальше renderDarkMatter только обновляет готовые узлы.
export function buildShop() {
	buildShopSection(
		"darkMatterShopDarkMatter",
		darkMatterShop.filter((purchase) => purchase.currency === "dark_matter"),
	);
	buildShopSection(
		"darkMatterShopDarkOrbs",
		darkMatterShop.filter((purchase) => purchase.currency === "dark_orbs"),
	);

	applyTranslations();
}

// У описания нет параметра, когда у покупки нет награды: «Чудо» — разовое
// открытие, ему показывать нечего.
function getPurchaseDesc(purchase) {
	if (purchase.gain == null) return t(purchase.desc_key);

	return t(purchase.desc_key, format(getShopGain(purchase.gain.target)));
}

export function renderDarkMatter() {
	// Display currency
	updateButtonText("darkMatterShopCurrency", t("dark_matter"));
	updateButtonText("darkMatterShopDisplay", format(gameData.dark_matter));
	updateButtonText("darkMatterSkillsDisplay", format(gameData.dark_matter));
	updateButtonText("skillTreePageDarkMaterTitle", t("dark_matter"));
	updateButtonText("darkOrbsShopDisplay", formatTreshold(gameData.dark_orbs));

	for (const purchase of darkMatterShop) {
		const cost = getShopCost(purchase.key);
		const [percent, pendingPercent] =
			purchase.currency === "dark_matter"
				? resourceProgress(
						gameData.dark_matter,
						cost,
						getDarkMatterGain,
						"req_rebirth_button4",
					)
				: [getDynamicProgress(gameData.dark_orbs, cost), null];

		updateButtonText(`${purchase.prefix}CostLabel`, t("cost"));
		updateButtonText(`${purchase.prefix}Currency`, t(purchase.currency));
		updateButtonText(`${purchase.prefix}CostValue`, format(cost));
		updateButtonText(`${purchase.prefix}BuyButton`, t("buy"));
		// setHTML, а не innerHTML: описание меняется только при покупке, а
		// прямая запись пересоздаёт узлы каждый кадр, и вложенный span с
		// классом color-dark-orbs терял бы ореол, который ему ставит
		// wobbleDarkOrbs.
		setHTML(
			document.getElementById(`${purchase.prefix}Desc`),
			getPurchaseDesc(purchase),
		);

		// Купленная одноразовая покупка и генератор, ушедший в бесконечность,
		// прячут цену и кнопку; у остальных цена растёт и остаётся на месте.
		const bought = purchase.one_time && gameData.dark_matter_shop[purchase.key];
		const exhausted =
			purchase.requires_finite_gain &&
			isDecimalInfinity(getShopGain(purchase.gain.target));
		const hidden = Boolean(bought || exhausted);

		renderRequirementProgress(
			document.getElementById(`${purchase.prefix}Progress`),
			hidden ? null : percent,
			hidden ? null : pendingPercent,
			"color-dark-matter",
		);
		document
			.getElementById(`${purchase.prefix}Cost`)
			.classList.toggle("hidden", hidden);
		renderDarkMatterShopButton(
			`${purchase.prefix}BuyButton`,
			canBuyShopPurchase(purchase.key),
		);
		document
			.getElementById(`${purchase.prefix}BuyButton`)
			.classList.toggle("hidden", hidden);

		if (purchase.one_time)
			updateButtonText(
				`${purchase.prefix}State`,
				gameData.dark_matter_shop[purchase.key] ? t("active") : "",
			);
	}

	// Reset abilities button
	updateButtonText("resetAbilitiesButton", t("reset_abilities"));

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
		elem.hidden = hasAbilityPerk("level");
	}
}

function renderSkillTreeButton(element, categoryBought, elementBought, canBuy) {
	if (!hasAbilityPerk("level")) {
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
