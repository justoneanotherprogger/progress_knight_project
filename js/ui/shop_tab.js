// ui/shop_tab.js — shop tab rendering

import { itemCategories } from "../../dist/js/items_data.js";
import { t } from "../../dist/js/translations.js";
import { isHeroesUnlocked } from "../calculations.js";
import { gameData } from "../data.js";
import { formatCoins } from "../utils.js";
import { getRowByName } from "./navigation.js";

export function renderShop() {
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
		if (els.name.textContent !== nameText) els.name.textContent = nameText;

		if (els.tooltip) {
			const tooltipText = t(item.baseData.tooltip);
			if (els.tooltip.textContent !== tooltipText)
				els.tooltip.textContent = tooltipText;
		}

		els.name.classList.toggle("legendary", isHeroesUnlocked());

		const color = itemCategories[item.categoryId].headerColor;
		const bgColor =
			gameData.currentMisc.includes(item) || item === gameData.currentProperty
				? color
				: "white";
		if (els.active.style.backgroundColor !== bgColor)
			els.active.style.backgroundColor = bgColor;

		const effectText = item.getEffectDescription();
		if (els.effect.textContent !== effectText)
			els.effect.textContent = effectText;
		formatCoins(item.getExpense(), els.expense);
	}

	const autoBuyToggle = document.getElementById("autoBuyToggle");
	if (autoBuyToggle && autoBuyToggle.checked !== gameData.autoBuyEnabled)
		autoBuyToggle.checked = gameData.autoBuyEnabled;
}
