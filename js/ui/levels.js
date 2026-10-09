// ui/levels.js — приведение уровня задачи к единице сравнения с порогом
//
// У задачи один счётчик уровней, а звездная версия отличается только
// флагом isHero. Обычные требования должны принимать звездный уровень за
// STELLAR_LEVEL_RATIO обычных, поэтому сравнивать приходится не level, а
// этой функцией: иначе звездный уровень 5 843 не проходит порог 6 000.

import { gameData, STELLAR_LEVEL_RATIO } from "../data.js";

export function getEffectiveLevel(taskName) {
	const task = gameData.taskData[taskName];
	if (task == null) return 0;
	return task.isHero ? task.level * STELLAR_LEVEL_RATIO : task.level;
}
