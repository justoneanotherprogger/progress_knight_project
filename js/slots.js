// slots.js — активные слоты задач: опыт получают только задачи в слотах.
// Размер слотов покупается в магазине за зло (открывается вехой #42) и работает
// всегда; авто-выбор работ — вторая веха, и он влияет только на то, кто выбирает
// currentJob (autoPromote в gameLoop.js).

import { Job, Skill } from "./classes.js";
import { gameData } from "./data.js";

// Цены слотов и множитель за каждую купленную — подобраны на плейтесте.
const JOB_SLOT_COST_BASE = 100;
const SKILL_SLOT_COST_BASE = 1500;
const SLOT_COST_MULTIPLIER = 10;

// Слоты — это «сколько куплено сверх одного»: базовая работа и базовый навык
// уже качаются, поэтому базовое число = 1 + счётчик из gameData.evil_shop.
export function getJobSlotCount() {
	return 1 + gameData.evil_shop.job_slots;
}

export function getSkillSlotCount() {
	return 1 + gameData.evil_shop.skill_slots;
}

// Авто-выбор работ открывается вехой за зло. Пока закрыт — работу выбирает
// игрок кликом по строке.
export function isJobAutoSelectUnlocked() {
	return gameData.requirements.milestone_evil_autoselect_jobs.isCompleted();
}

// Магазин слотов открывается вехой за зло.
export function isSlotShopUnlocked() {
	return gameData.requirements.milestone_evil_shop.isCompleted();
}

// Время до следующего уровня. Общий множитель скорости на порядок
// не влияет, поэтому считаем без applySpeed.
function timeToLevel(task) {
	const gain = task.getXpGain();
	if (!gain.gt(0)) return Infinity;
	const time = task.getXpLeft().div(gain).toNumber();
	return Number.isFinite(time) ? time : Infinity;
}

// Базовый слот: работа, выбранная игроком, иначе нищенство.
function getBaseJob() {
	const current = gameData.currentJob;
	if (current && gameData.requirements[current.id].isCompleted())
		return current;
	return gameData.taskData.job_beggar;
}

// Слоты работ: базовая плюс самые быстрые остальные по времени до уровня.
export function getActiveJobs() {
	const base = getBaseJob();
	const extra = getJobSlotCount() - 1;
	if (extra <= 0) return [base];

	const eligible = [];
	for (const key in gameData.taskData) {
		const task = gameData.taskData[key];
		if (!(task instanceof Job) || task === base) continue;
		if (!gameData.requirements[key].isCompleted()) continue;
		eligible.push(task);
	}
	eligible.sort((a, b) => timeToLevel(a) - timeToLevel(b));
	return [base, ...eligible.slice(0, extra)];
}

export function getActiveSkills() {
	const eligible = [];
	for (const key in gameData.taskData) {
		const task = gameData.taskData[key];
		if (!(task instanceof Skill)) continue;
		if (!gameData.requirements[key].isCompleted()) continue;
		eligible.push(task);
	}
	eligible.sort((a, b) => timeToLevel(a) - timeToLevel(b));
	return eligible.slice(0, getSkillSlotCount());
}

// Магазин слотов
export function getJobSlotCost() {
	return new Decimal(JOB_SLOT_COST_BASE).times(
		new Decimal(SLOT_COST_MULTIPLIER).pow(gameData.evil_shop.job_slots),
	);
}

export function getSkillSlotCost() {
	return new Decimal(SKILL_SLOT_COST_BASE).times(
		new Decimal(SLOT_COST_MULTIPLIER).pow(gameData.evil_shop.skill_slots),
	);
}

export function canBuyJobSlot() {
	const cost = getJobSlotCost();
	return gameData.evil.gte(cost);
}

export function canBuySkillSlot() {
	const cost = getSkillSlotCost();
	return gameData.evil.gte(cost);
}

export function buyJobSlot() {
	if (canBuyJobSlot()) {
		gameData.evil = gameData.evil.sub(getJobSlotCost());
		gameData.evil_shop.job_slots += 1;
	}
}

export function buySkillSlot() {
	if (canBuySkillSlot()) {
		gameData.evil = gameData.evil.sub(getSkillSlotCost());
		gameData.evil_shop.skill_slots += 1;
	}
}
