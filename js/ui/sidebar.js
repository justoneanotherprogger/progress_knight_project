// ui/sidebar.js — sidebar rendering

import { t } from "../../dist/js/translations.js";
import {
	getDarkMatterGain,
	getEssenceGain,
	getEvilGain,
	getGreed,
	getHappiness,
	getInspiration,
	getLifespan,
	getNextDarkMagicRequired,
	getNextDarkMatterRequired,
	getNextMilestoneRequired,
	getUnpausedGameSpeed,
	isAlive,
	isNextDarkMagicSkillInReach,
} from "../calculations.js";
import { baseGameSpeed, gameData } from "../data.js";
import { getExpense, getIncome, getNet } from "../main.js";
import {
	getBoostCooldownString,
	getHypercubeCap,
	getMetaversePerkPointsGain,
} from "../metaverse.js";
import { isMilestoneInReach } from "../milestones.js";
import {
	daysToYears,
	format,
	formatAge,
	formatCoins,
	formatLevel,
	formatTime,
	formatTreshold,
	formatWhole,
	getChallengeTranslatedName,
	getDynamicProgress,
} from "../utils.js";
import {
	renderCurrentChallengeReward,
	renderCurrentChallengeRewardValue,
} from "./challenges_tab.js";
import {
	fitText,
	renderProgressBar,
	renderRequirementProgress,
	setElementText,
	setRebirthButton,
	updateButtonHTML,
	updateButtonText,
} from "./helpers.js";
import { renderBoostButton } from "./metaverse_tab.js";
import { setSignDisplay } from "./navigation.js";

// Элементы сайдбара статичны: DOM не пересоздаётся ни при ребёрне, ни при
// загрузке сейва, поэтому getElementById кэшируется один раз.
export const elCache = {};
export function el(id) {
	elCache[id] ??= document.getElementById(id);
	return elCache[id];
}

// Текст пишется только при смене: безусловный textContent каждый кадр
// форсит перерасчёт layout, даже когда строка не изменилась.
export function setText(id, text) {
	const e = el(id);
	if (e.textContent !== text) e.textContent = text;
}

export function renderSideBar() {
	const task = gameData.currentJob;

	const progressBar = el("quickTaskDisplay").getElementsByClassName("job")[0];
	const currentJobName = progressBar.querySelector(".name");
	currentJobName.style.whiteSpace = "nowrap";
	currentJobName.textContent =
		(task.isHero ? `${t("great")} ` : "") +
		t(task.name) +
		" " +
		t("lvl") +
		" " +
		formatLevel(task.level);
	fitText(currentJobName, 16);
	const progressFill = progressBar.getElementsByClassName("progressFill")[0];
	renderProgressBar(task, progressFill, progressBar);

	setText("ageDisplay", formatAge(gameData.days));
	setText("lifespanDisplay", formatWhole(daysToYears(getLifespan())));
	setText("realtimeDisplay", formatTime(gameData.realtime));
	const lifespanRow = el("lifespanRow");
	lifespanRow.style.whiteSpace = "nowrap";
	fitText(lifespanRow, 16);

	// Смерть — рендер, а не расчёт: isAlive() чистая и в DOM не ходит.
	el("deathText").classList.toggle("hidden", isAlive());
	const boostCooldownDisplay = el("boostCooldownDisplay");
	boostCooldownDisplay.style.whiteSpace = "nowrap";
	setElementText(boostCooldownDisplay, getBoostCooldownString());
	fitText(boostCooldownDisplay, 16);
	updateButtonHTML(
		"pauseButton",
		`⏳ ${gameData.paused ? t("play") : t("pause")}`,
	);
	updateButtonText("rebirthBtn1", t("rebirth_1"));
	setRebirthButton(
		"rebirthBtn2",
		t("rebirth_2"),
		"color-evil",
		`(+${format(getEvilGain())} ${t("evil")})`,
	);
	renderRebirthProgress(
		"rebirthBtn2",
		gameData.evil,
		gameData.evil.add(getEvilGain()),
		nearestEvilTarget(),
		"color-evil",
	);
	setRebirthButton(
		"rebirthBtn3",
		t("rebirth_3"),
		"color-essence",
		`(+${format(getEssenceGain())} ${t("essence")})`,
	);
	renderRebirthProgress(
		"rebirthBtn3",
		gameData.essence,
		gameData.essence.add(getEssenceGain()),
		getNextMilestoneRequired("essence"),
		"color-essence",
	);
	fitText(el("rebirthBtn3"), 16);
	setRebirthButton(
		"rebirthBtn4",
		t("rebirth_4"),
		"color-dark-matter",
		`(+${format(getDarkMatterGain())} ${t("dark_matter")})`,
	);
	renderRebirthProgress(
		"rebirthBtn4",
		gameData.dark_matter,
		gameData.dark_matter.add(getDarkMatterGain()),
		getNextDarkMatterRequired(),
		"color-dark-matter",
	);
	fitText(el("rebirthBtn4"), 16);
	if (gameData.essence.gt(1e90))
		setRebirthButton(
			"rebirthBtn5",
			t("rebirth_5"),
			"color-perk-points",
			"(+" +
				formatTreshold(getMetaversePerkPointsGain()) +
				" " +
				t("perk_points") +
				")",
		);
	else if (gameData.rebirthFiveCount > 0)
		setRebirthButton(
			"rebirthBtn5",
			t("rebirth_5"),
			"color-hypercubes",
			`(${format(getHypercubeCap(1))} ${t("hypercubes")})`,
		);
	else setRebirthButton("rebirthBtn5", t("go_to_metaverse"), "", "");
	fitText(el("rebirthBtn5"), 16);
	const boostPanel = el("boostPanel");
	boostPanel.style.whiteSpace = "nowrap";
	// Класс, а не свойство hidden: у панели инлайновый display:flex, он сильнее
	// браузерного [hidden] и свойство перестало её прятать. Класс .hidden из
	// styles.css сильнее инлайна.
	boostPanel.classList.toggle(
		"hidden",
		!gameData.requirements.req_metaverse_tab_button.isCompleted(),
	);
	renderBoostButton("boostButton");

	formatCoins(gameData.coins, el("coinDisplay"));
	setSignDisplay();
	formatCoins(getNet(), el("netDisplay"));
	formatCoins(getIncome(), el("incomeDisplay"));
	formatCoins(getExpense(), el("expenseDisplay"));

	setText("happinessDisplay", format(getHappiness()));
	setText("inspirationDisplay", format(getInspiration()));
	setText("greedDisplay", format(getGreed()));

	setText("evilDisplay", format(gameData.evil));

	setText("essenceDisplay", format(gameData.essence));

	setText("darkMatterDisplay", format(gameData.dark_matter));

	setText("darkOrbsDisplay", formatTreshold(gameData.dark_orbs));

	el("timeWarping").hidden = getUnpausedGameSpeed() / baseGameSpeed <= 1;
	setText(
		"timeWarpingDisplay",
		`x${format(getUnpausedGameSpeed() / baseGameSpeed, 2)}`,
	);

	setText("hypercubesDisplay", formatTreshold(gameData.hypercubes));

	// Записываем hidden только при реальной смене: обёртка может схлопнуться
	// между mousedown и mouseup и съесть клик по кнопке ребёрна.
	const rebirthButton5 = el("rebirthButton5");
	const rebirth5Hidden =
		getHypercubeCap() === Infinity && gameData.essence.lt(1e90);
	if (rebirthButton5.hidden !== rebirth5Hidden)
		rebirthButton5.hidden = rebirth5Hidden;

	// Embrace evil indicator
	const embraceEvilButton = el("rebirthButton2").querySelector(".button");
	if (isNextDarkMagicSkillInReach() || isMilestoneInReach("evil"))
		embraceEvilButton.classList.add("button-evil");
	else embraceEvilButton.classList.remove("button-evil");

	// Transcend for Next Milestone indicator
	const transcendButton = el("rebirthButton3").querySelector(".button");
	if (isMilestoneInReach("essence"))
		transcendButton.classList.add("button-transcend");
	else transcendButton.classList.remove("button-transcend");

	// Hide the rebirthOneButton from the sidebar when you have `Almighty Eye` unlocked.
	el("rebirthButton1").hidden =
		gameData.requirements.milestone_almighty_eye.isCompleted();

	// Change sidebar when paused
	el("info").classList.toggle("game-paused", gameData.paused);

	// Challenges
	// Прячем обёртку, а не кнопки: renderRequirements() (ui/table.js)
	// переписывает .hidden у #rebirthButton1..5 каждый кадр, а первую и
	// пятую скрывает ещё и этот модуль. И классом, а не атрибутом hidden:
	// vendor/w3.css:39 задаёт .w3-button{display:inline-block} и перебивает
	// браузерное [hidden]{display:none} — так же делает renderRequirements().
	if (gameData.active_challenge === "") {
		el("challengeTitle").hidden = true;
		el("info").classList.remove("challenge");
		el("rebirthGroup").classList.remove("hidden");
		el("exit_challenge").classList.add("hidden");
	} else {
		setText(
			"challengeName",
			getChallengeTranslatedName(gameData.active_challenge),
		);
		el("challengeTitle").hidden = false;
		el("info").classList.add("challenge");
		el("rebirthGroup").classList.add("hidden");
		el("exit_challenge").classList.remove("hidden");
		// challenge reward
		renderCurrentChallengeReward("sidebarChallengeReward");
		renderCurrentChallengeRewardValue();
	}

	updateResourceScale();
	document.querySelectorAll("#resourceStats .text-caption").forEach((e) => {
		e.style.whiteSpace = "nowrap";
		fitText(e, (k) => `calc(20px * var(--stats-scale) * ${k})`);
	});
}

// Keeps the quick bar's bottom edge above the window's bottom edge, leaving
// room for both the browser-default body margin-bottom (8px) and the
// .game-frame offset (0.8em, styles.css).  After accounting for both, the
// page height lands exactly on the window edge so no phantom scrollbar
// appears.
// sticky top — это измеренная нижняя граница топбара (см.
// updateQuickBarHeight), либо фактическое положение панели, пока страница
// не прокручена и панель стоит ниже этой границы.
// Recalculated on scroll/resize only — never per frame — so the layout it
// triggers cannot feed back into the measurement. top is clamped to the
// sticky offset so a scrolled-off panel cannot request an unbounded height.
export const BASE_EM =
	parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
export const QUICK_BAR_BOTTOM_GAP = 8 + Math.round(BASE_EM * 0.8);

export function updateQuickBarHeight() {
	const panel = document.getElementById("info");
	if (!panel) return;

	// Липкая граница — фактическая нижняя граница топбара: она зависит от
	// шрифта и от того, что нарисовано в шапке, поэтому меряем, а не держим
	// число в разметке. От панели замер не зависит, обратной связи нет.
	const bar = document.getElementById("resources");
	const barBottom = bar ? bar.getBoundingClientRect().bottom : 0;
	const currentTop = parseFloat(panel.style.top);
	if (Number.isNaN(currentTop) || Math.abs(currentTop - barBottom) > 0.5)
		panel.style.top = `${barBottom}px`;

	const top = Math.max(barBottom, panel.getBoundingClientRect().top);
	const desired = Math.max(0, window.innerHeight - top - QUICK_BAR_BOTTOM_GAP);
	const current = parseFloat(panel.style.height);

	if (Number.isNaN(current) || Math.abs(current - desired) > 0.5)
		panel.style.height = `${desired}px`;
}

window.addEventListener("resize", updateQuickBarHeight, { passive: true });
window.addEventListener("scroll", updateQuickBarHeight, { passive: true });
updateQuickBarHeight();

// Один тултип на весь экран: слой #tooltipLayer живёт вне .game-frame
// (templates/index.html), поэтому его не режут overflow ни панели топбара,
// ни .column с таблицами. Источник текста и сторона — на самом элементе
// (data-tip, data-tip-side), поэтому список ключей в коде не нужен.
const tooltipLayer = el("tooltipLayer");
const TIP_GAP = 5;
const TIP_PAD = 8;
let activeTip = null;

function placeTip(owner) {
	const rect = owner.getBoundingClientRect();
	const width = tooltipLayer.offsetWidth;
	const height = tooltipLayer.offsetHeight;
	// Центрируем по элементу, затем сдвигаем плашку на разницу — как у
	// тултипов таблиц. Формулой от ширины нельзя: offsetWidth округлён,
	// а transform считал бы от неокруглённой, и к краю выходил бы кусок.
	let left = rect.left + rect.width / 2 - width / 2;
	// Граница — clientWidth: innerWidth включает полосу прокрутки, и плашка
	// уезжала за видимую область на её ширину.
	const limit = document.documentElement.clientWidth - TIP_PAD;
	if (left + width > limit) left -= left + width - limit;
	if (left < TIP_PAD) left = TIP_PAD;
	tooltipLayer.style.left = `${left}px`;
	tooltipLayer.style.top =
		owner.dataset.tipSide === "top"
			? `${rect.top - height - TIP_GAP}px`
			: `${rect.bottom + TIP_GAP}px`;
}

function hideTip() {
	activeTip = null;
	tooltipLayer.classList.remove("visible");
}

for (const owner of document.querySelectorAll("[data-tip]")) {
	owner.addEventListener("mouseenter", () => {
		activeTip = owner;
		tooltipLayer.innerHTML = t(owner.dataset.tip);
		placeTip(owner);
		tooltipLayer.classList.add("visible");
	});
	owner.addEventListener("mouseleave", hideTip);
}

// Панель сайдбара прокручивается: плашка над вопросиком уехала бы с ним.
el("info").addEventListener(
	"scroll",
	() => {
		if (activeTip) placeTip(activeTip);
	},
	{ passive: true },
);

export const resourceScaleCache = { key: "", desired: 0, scale: 1 };
export const RESOURCE_SCALE_INTERVAL = 300;

// Scales #resourceStats so its content always fits the space flex gives it.
export function updateResourceScale() {
	const stats = document.getElementById("resourceStats");
	if (!stats) return;

	// clientHeight/scrollHeight — forced layout, а панель стабильна почти
	// всё время. Гейтим по времени, а не по ключу: при ресайзе ширина панели
	// меняется каждый кадр, и проверка ключа дала бы переобмер в полсекунды —
	// панель заметно дёргалась бы, пока не устаканилась.
	const now = performance.now();
	if (now - (resourceScaleCache.at || 0) < RESOURCE_SCALE_INTERVAL) return;
	resourceScaleCache.at = now;

	const panel = document.getElementById("info");
	// Св-ство hidden, а не класс: строка выше прячет через .hidden, а класс
	// hidden тут не появляется — ключ не менялся бы и переобмер не срабатывал.
	const visibleKey =
		panel.clientHeight +
		"|" +
		(document.getElementById("timeWarping").hidden ? 0 : 1);

	if (resourceScaleCache.key !== visibleKey) {
		stats.style.setProperty("--stats-scale", 1);
		resourceScaleCache.desired = stats.scrollHeight;
		stats.style.setProperty("--stats-scale", resourceScaleCache.scale);
		resourceScaleCache.key = visibleKey;
	}

	const available = stats.clientHeight;
	const scale =
		available <= 0 ? 1 : Math.min(1, available / resourceScaleCache.desired);
	if (scale !== resourceScaleCache.scale) {
		stats.style.setProperty("--stats-scale", scale);
		resourceScaleCache.scale = scale;
	}
}

// Re-measure periodically even when panel height is stable: right after a
// reload the first frame can capture a half-rendered state and freeze the
// scale at ~0.5 with empty space left over.
setInterval(() => {
	updateQuickBarHeight();
	resourceScaleCache.key = "";
	updateResourceScale();
}, 1000);

function renderRebirthProgress(
	buttonId,
	current,
	pending,
	required,
	colorClass,
) {
	renderRequirementProgress(
		el(buttonId).querySelector(".req-progress-container"),
		required == null ? null : getDynamicProgress(current, required),
		required == null ? null : getDynamicProgress(pending, required),
		colorClass,
	);
}

/* Полоса «принять зло» идёт к ближайшей из двух целей — тёмному навыку или вехе
   за зло: подсветка button-evil считает обе, полоса раньше считала только навык. */
function nearestEvilTarget() {
	const skillTarget = getNextDarkMagicRequired();
	const milestoneTarget = getNextMilestoneRequired("evil");
	if (skillTarget == null) return milestoneTarget;
	if (milestoneTarget == null) return skillTarget;
	return Math.min(skillTarget, milestoneTarget);
}
