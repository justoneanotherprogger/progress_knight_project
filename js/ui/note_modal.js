// ui/note_modal.js — модалка новой заметки.
//
// Модалка одна и переиспользуемая: текст главы копируется в неё из разметки
// заметки, поэтому заводить ключ локали на каждую главу не нужно. Показ
// ловит renderRequirements() в момент, когда глава только что появилась.

import { t } from "../../dist/js/translations.js";
import { setModalPause } from "../calculations.js";
import { gameData } from "../data.js";
import { saveGameData } from "../save.js";

// Кнопку подтверждения глушим: без этого модалка закрывается тем же кликом,
// которым игрок нажал на вкладку или кнопку под ней.
const CONFIRM_DELAY_MS = 1500;

let confirmTimer = null;

export function showNoteModal(note) {
	const title = note.querySelector("summary")?.textContent ?? "";
	const body = note.querySelector(".note-body")?.innerHTML ?? "";
	const extras = [...note.querySelectorAll(".note-extra > *")]
		.map((element) => element.outerHTML)
		.join("");

	document.getElementById("noteModalTitle").textContent = title;
	document.getElementById("noteModalBody").innerHTML = body + extras;
	document.getElementById("noteModalOk").textContent = t("note_modal_ok");

	setModalPause(true);

	const okButton = document.getElementById("noteModalOk");
	okButton.disabled = true;
	document.getElementById("noteModal").classList.remove("hidden");

	clearTimeout(confirmTimer);
	confirmTimer = setTimeout(() => {
		okButton.disabled = false;
	}, CONFIRM_DELAY_MS);
}

function hideNoteModal() {
	document.getElementById("noteModal").classList.add("hidden");
	setModalPause(false);
	// Страховка: автосейв раз в 3 секунды, а игрок может закрыть вкладку
	// сразу после подтверждения. Пауза модалки в сейв не пишется, но
	// сам прогресс записать сразу не помешает.
	saveGameData();
}

export function initNoteModal() {
	document
		.getElementById("noteModalOk")
		.addEventListener("click", hideNoteModal);
}

// Главы, пройденные в прошлом, показываем сразу и без модалки: иначе на
// возврате в игру модалка вылезла бы на каждую из них. Смотрим completed
// сразу после загрузки сейва — дальше его затирают расчёты, которые дёргают
// isCompleted() мимо рендера (calculations.js), и признак «только что
// появилась» становится неразличимым с «давно выполнена».
export function revealSeenNotes() {
	for (const key in gameData.requirements) {
		if (!key.startsWith("req_rebirth_note")) continue;
		const requirement = gameData.requirements[key];
		if (!requirement.completed) continue;
		for (const selector of requirement.querySelectors) {
			for (const element of document.querySelectorAll(selector))
				element.classList.remove("hidden");
		}
	}
}
