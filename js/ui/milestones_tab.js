// ui/milestones_tab.js — milestones tab and evil slot shop rendering

import { t } from "../../dist/js/translations.js";
import { getEvilGain } from "../calculations.js";
import { gameData } from "../data.js";
import { milestoneData } from "../milestones.js";
import {
	canBuyJobSlot,
	canBuySkillSlot,
	getJobSlotCost,
	getJobSlotCount,
	getMaxJobSlotCount,
	getMaxSkillSlotCount,
	getSkillSlotCost,
	getSkillSlotCount,
	isSlotShopUnlocked,
} from "../slots.js";
import { format } from "../utils.js";
import {
	fitText,
	renderRequirementProgress,
	resourceProgress,
} from "./helpers.js";
import { getRowByName } from "./navigation.js";

// Строки вех статичны: порог и перевод большую часть времени не меняются,
// а getRowByName + querySelector — по три поиска по дереву на строку.
// Закэшированные элементы и последний записанный текст живут на самой вехе.
export function renderMilestones() {
	// Магазин слотов за зло: до вехи #42 скрыт, дальше обновляется каждый кадр.
	// Панелью магазина рулит setTabGroup, скрываем только кнопку подвкладки.
	const shopUnlocked = isSlotShopUnlocked();
	document.getElementById("evilSlotShopTabButton").style.display = shopUnlocked
		? ""
		: "none";
	if (shopUnlocked) {
		const byId = (id) => document.getElementById(id);
		const setText = (el, text) => {
			if (el.textContent !== text) el.textContent = text;
		};

		const countLabel = t("evil_slot_count_label");
		setText(byId("evilSlotJobCountLabel"), countLabel);
		setText(byId("evilSlotSkillCountLabel"), countLabel);

		const costLabel = t("cost");
		setText(byId("evilSlotJobCostLabel"), costLabel);
		setText(byId("evilSlotSkillCostLabel"), costLabel);

		const currencyLabel = t("evil");
		setText(byId("evilSlotJobCurrency"), currencyLabel);
		setText(byId("evilSlotSkillCurrency"), currencyLabel);

		const jobButton = byId("evilSlotJobBuyButton");
		setText(
			jobButton,
			getJobSlotCount() >= getMaxJobSlotCount() ? t("max") : t("buy"),
		);
		jobButton.disabled = !canBuyJobSlot();
		const skillButton = byId("evilSlotSkillBuyButton");
		setText(
			skillButton,
			getSkillSlotCount() >= getMaxSkillSlotCount() ? t("max") : t("buy"),
		);
		skillButton.disabled = !canBuySkillSlot();

		setText(byId("evilSlotJobCount"), format(getJobSlotCount()));
		setText(byId("evilSlotSkillCount"), format(getSkillSlotCount()));
		setText(byId("evilSlotJobCost"), format(getJobSlotCost()));
		setText(byId("evilSlotSkillCost"), format(getSkillSlotCost()));

		// Полоса к цене слота: зло против цены, вторая половина — с прибавкой
		// за ребёрн, если он открыт. Слоты куплены до упора — цены нет,
		// полосу прячем.
		const slotBars = [
			[
				"evilSlotJobProgress",
				getJobSlotCost(),
				getJobSlotCount(),
				getMaxJobSlotCount(),
			],
			[
				"evilSlotSkillProgress",
				getSkillSlotCost(),
				getSkillSlotCount(),
				getMaxSkillSlotCount(),
			],
		];
		for (const [id, cost, count, maxCount] of slotBars) {
			const progress =
				count < maxCount
					? resourceProgress(
							gameData.evil,
							cost,
							getEvilGain,
							"req_rebirth_button2",
						)
					: [null, null];
			renderRequirementProgress(
				byId(id),
				progress[0],
				progress[1],
				"color-evil",
			);
		}
	}

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
		if (els.essence.textContent !== essenceText)
			els.essence.textContent = essenceText;

		let desc = t(milestone.description);
		const effect = milestone.getEffect();
		if (effect != null) desc = `x${format(effect, 1)} ${desc}`;

		if (els.description.textContent !== desc)
			els.description.textContent = desc;

		const nameText = t(milestone.name);
		if (els.name.textContent !== nameText) els.name.textContent = nameText;
		els.name.style.whiteSpace = "nowrap";
		fitText(els.name, 16);

		if (els.tooltip) {
			const tooltipText = t(milestone.tooltip);
			if (els.tooltip.textContent !== tooltipText)
				els.tooltip.textContent = tooltipText;
		}
	}

	// Классом, а не свойством: в разметке баннер спрятан классом .hidden,
	// а свойство hidden его не снимает — баннер оставался невидимым всегда.
	const congrats = document.getElementById("congratulationsBanner");
	if (congrats != null)
		congrats.classList.toggle(
			"hidden",
			!gameData.requirements.milestone_the_end.isCompleted(),
		);
}
