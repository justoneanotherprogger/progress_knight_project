// slots.js — активные слоты задач: опыт получают только задачи в слотах.
// Размер слотов и авто-выбор работ пока захардкодены; вехи за зло (#42)
// переключают их здесь — это единственная точка изменений.

import { Skill } from "./classes.js";
import { gameData } from "./data.js";

export function getSkillSlotCount() {
	return 1;
}

// Авто-выбор работ открывается вехой за зло (#42). Пока выключен —
// работу выбирает игрок кликом по строке.
export function isJobAutoSelectUnlocked() {
	return false;
}

// Время до следующего уровня. Общий множитель скорости на порядок
// не влияет, поэтому считаем без applySpeed.
function timeToLevel(task) {
	const gain = task.getXpGain();
	if (!gain.gt(0)) return Infinity;
	const time = task.getXpLeft().div(gain).toNumber();
	return Number.isFinite(time) ? time : Infinity;
}

// Ручная фаза: единственная активная работа — выбранная игроком.
// Когда авто-выбор откроют вехой, здесь появится топ-N работ по timeToLevel.
export function getActiveJobs() {
	const current = gameData.currentJob;
	if (current && gameData.requirements[current.id].isCompleted())
		return [current];
	return [gameData.taskData.job_beggar];
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
