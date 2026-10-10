// ui/helpers.js — small UI utility functions

import { gameData } from "../data.js";
import { getDynamicProgress } from "../utils.js";

// То же, что updateButtonText, но для элемента, который уже в руках: в циклах
// id нет, а getElementById на каждой итерации лишний. textContent пересоздаёт
// узел даже при совпадающей строке, поэтому проверка обязательна.
export function setElementText(element, text) {
	if (element.textContent !== text) element.textContent = text;
}

export function updateButtonText(id, text) {
	setElementText(document.getElementById(id), text);
}

export function updateButtonHTML(id, html) {
	const element = document.getElementById(id);
	if (element.dataset.html !== html) {
		element.innerHTML = html;
		element.dataset.html = html;
	}
}

// Сравнивать innerHTML с источником бесполезно: браузер нормализует
// разметку (style="color: red" → "color: red;"), и строки не сходятся
// никогда — тултип с разметкой переписывался бы каждый кадр. Поэтому
// помним, что сами записали.
export function setHTML(element, html) {
	if (element.dataset.html !== html) {
		element.innerHTML = html;
		element.dataset.html = html;
	}
}

// innerHTML здесь нельзя: значение gain меняется каждый кадр, и пересоздание
// узла под курсором между mousedown и mouseup съедает клик. Цвет живёт на
// самом span, перезаписывается только текст.
export function setRebirthButton(id, label, gainClass, gainText) {
	const button = document.getElementById(id);
	const labelEl = button.querySelector(".rebirth-label");
	const gainEl = button.querySelector(".rebirth-gain");
	if (labelEl.textContent !== label) labelEl.textContent = label;
	if (gainEl.dataset.gainClass !== gainClass) {
		gainEl.className = `rebirth-gain ${gainClass}`;
		gainEl.dataset.gainClass = gainClass;
	}
	if (gainEl.textContent !== gainText) gainEl.textContent = gainText;
}

// size — число (макс. размер в px) либо функция k → CSS-строка, для
// элементов под масштабированием контейнера (calc от --stats-scale).

// Посадка текста может слететь только при смене текста или геометрии
// контейнера. Текст проверяем каждый кадр (чтение textContent дёшево),
// а геометрию — не чаще FIT_TEXT_INTERVAL: имена задач статичны, а
// clientWidth/getComputedStyle форсят layout, и на ~100 элементах за кадр
// проверка кэша стоила четверть кадра. При смене шрифта, --stats-scale или
// ресайзе посадка поправится в течение интервала.
export const FIT_TEXT_INTERVAL = 1000;

export function fitText(element, size) {
	const toCss = typeof size === "function" ? size : (k) => `${k * size}px`;
	const text = element.textContent;
	if (
		text === element.dataset.fitTextText &&
		performance.now() - (element._fitTextAt || 0) < FIT_TEXT_INTERVAL
	)
		return;
	element._fitTextAt = performance.now();

	// computed font-size в ключе — иначе элемент под calc-масштабом не
	// переизмерится, когда --stats-scale сменится, а клиентская ширина та же.
	const cacheKey = `${text}|${element.clientWidth}|${getComputedStyle(element).fontSize}`;
	if (element.dataset.fitText === cacheKey) return;

	// Скрытый элемент (display:none) не измеряется: clientWidth = 0 даёт
	// минимальный масштаб, а кэш потом держит испорченную посадку до
	// следующей смены текста. Поправится, когда вкладку покажут.
	if (element.clientWidth === 0) return;

	// Ширина текста линейна относительно font-size, поэтому достаточно
	// одного замера при полном размере: k = clientWidth / scrollWidth.
	// Цикл shrink давал до десятка forced layout на элемент (запись стиля
	// + чтение scrollWidth на каждой итерации).
	element.style.fontSize = toCss(1);
	const fullWidth = element.scrollWidth;
	let k = Math.max(0.3, Math.min(1, element.clientWidth / fullWidth));
	element.style.fontSize = toCss(k);
	// Погрешность округления пикселей может оставить текст на 1px шире:
	// добиваем посадки парой шагов вместо десятка итераций на каждый элемент.
	for (
		let guard = 0;
		element.scrollWidth > element.clientWidth && k > 0.3 && guard < 4;
		guard++
	) {
		k = Math.max(0.3, k - 0.05);
		element.style.fontSize = toCss(k);
	}
	element.dataset.fitText = cacheKey;
	element.dataset.fitTextText = text;
}

// Тултипы открываются по :hover, но «влезает ли снизу» CSS не решает.
// Меряем один раз за наведение и поднимаем на разницу с нижним краем.
// Граница — не окно: таблицы лежат в .column с overflow-y:hidden, и обрезает
// именно она, а её низ выше низа окна. По окну меряли — сдвига не было.
// visibility:hidden элемент из вёрстки не убирает — прямоугольник настоящий,
// поэтому замер не ждёт показа. Сдвиг перезаписывается каждым новым
// наведением, так что сбрасывать его на уходе курсора не нужно.
document.addEventListener("mouseover", (e) => {
	const owner = e.target.closest(".tooltip");
	if (!owner) return;
	const tip = owner.querySelector(".tooltipText");
	if (!tip) return;
	const clip = tip.closest(".column");
	const limit = clip
		? Math.min(clip.getBoundingClientRect().bottom, window.innerHeight)
		: window.innerHeight;
	// Замерять со сдвигом от прошлого наведения нельзя: getBoundingClientRect
	// его учитывает, overflow выходит ноль, и тултип прыгает обратно за край.
	// Поэтому сначала сбрасываем — меряем настоящее положение.
	tip.style.transform = "";
	const overflow = tip.getBoundingClientRect().bottom - limit;
	tip.style.transform = overflow > 0 ? `translateY(${-overflow}px)` : "";
});

export function renderProgressBar(task, progressFill, progressBar) {
	let width;
	if (task.level > 10000) {
		// На таких уровнях реальный прогресс по xp незаметен глазу,
		// поэтому полосу водит по level — как визуальный пульс.
		width = task.level % 100;
	} else {
		width = task.xp.div(task.getMaxXp()).times(100).toNumber();
	}
	if (width > 100) width = 100;
	progressFill.style.width = `${width}%`;

	if (task.isHero) {
		progressFill.classList.add("progress-fill-hero");
		progressBar.classList.add("progress-bar-hero");

		if (task === gameData.currentJob) {
			progressFill.classList.add("current-hero");
			progressFill.classList.remove("current");
		} else {
			progressFill.classList.remove("current");
			progressFill.classList.remove("current-hero");
		}

		progressFill.classList.remove("progress-fill");
		progressBar.classList.remove("progress-bar");
	} else {
		progressFill.classList.remove("progress-fill-hero");
		progressBar.classList.remove("progress-bar-hero");

		if (task === gameData.currentJob) {
			progressFill.classList.add("current");
			progressFill.classList.remove("current-hero");
		} else {
			progressFill.classList.remove("current");
			progressFill.classList.remove("current-hero");
		}

		progressFill.classList.add("progress-fill");
		progressBar.classList.add("progress-bar");
	}
}

// Колеблется текст, а не ореол: ореол теперь чёрный и неподвижный, он
// только обводит буквы. Текст белый, и смещение на нём читается. Список
// берём заново: одно из этих мест — span внутри перевода, он появляется
// в DOM в рантайме, и кэш, собранный на старте, его бы не увидел.
export function wobbleDarkOrbs() {
	for (const node of document.querySelectorAll(".color-dark-orbs")) {
		const angle = Math.random() * Math.PI * 2;
		const amplitude = 2;
		node.style.transform = `translate(${Math.cos(angle) * amplitude}px, ${Math.sin(angle) * amplitude}px)`;
	}
}

const progressWidth = (percent) =>
	`${Math.floor(Math.min(Math.max(percent, 0), 100) * 100) / 100}%`;

function toggleComplete(element, complete) {
	if (element.classList.contains("is-complete") !== complete)
		element.classList.toggle("is-complete", complete);
}

// Полосы прогресса требований: строка «Требуется для следующего» в таблицах,
// кнопки ребёрна, цены в магазинах. Разметка и CSS пришли из апстрима
// (indomit/progress_knight_2). percent === null — порога нет, полоса
// прячется. Рендер идёт каждый кадр, поэтому ширина и классы пишутся
// только при смене: запись стиля без проверки форсит layout таблицы.
export function renderRequirementProgress(
	container,
	percent,
	pendingPercent,
	colorClass = "color-income",
) {
	if (!container) return;
	// Полосы ищутся один раз на контейнер: вызовов много (строки таблиц,
	// кнопки ребёрна, магазины), а querySelector на каждом кадре на каждом
	// контейнере — лишняя работа. Разметку контейнера не перезаписывают,
	// поэтому кэш не протухает.
	if (!container._reqBars)
		container._reqBars = [
			container.querySelector(".req-progress-bar"),
			container.querySelector(".req-pending-bar"),
		];
	const [bar, pending] = container._reqBars;
	if (!bar || !pending) return;

	const pendingValue = pendingPercent ?? percent;
	const visible = Number.isFinite(percent);
	const target = visible ? "visible" : "hidden";
	if (container.dataset.reqVisible !== target) {
		container.style.visibility = target;
		container.dataset.reqVisible = target;
	}
	if (!visible) return;

	const barWidth = progressWidth(percent);
	if (bar.style.width !== barWidth) bar.style.width = barWidth;
	const pendingWidth = progressWidth(pendingValue);
	if (pending.style.width !== pendingWidth) pending.style.width = pendingWidth;

	if (bar.dataset.reqColor !== colorClass) {
		for (const element of [bar, pending]) {
			if (element.dataset.reqColor)
				element.classList.remove(element.dataset.reqColor);
			element.classList.add(colorClass);
			element.dataset.reqColor = colorClass;
		}
	}
	toggleComplete(bar, percent >= 100);
	toggleComplete(pending, pendingValue >= 100);
}

// Прогресс к требованию против порога: текущий ресурс и тот же ресурс с
// прибавкой за ребёрн, если он открыт — до ребёрна прибавки нет, показывать
// её раньше времени враньё (в апстриме за это отвечал allowRebirth внутри
// getXGainAvailable). Ресурс приходит и Decimal, и числом (гиперкубы), отсюда
// обёртка. Шесть веток требований повторяли эту пару вызовов, отсюда хелпер.
export function resourceProgress(
	current,
	required,
	gain,
	rebirthRequirementKey,
) {
	const base = new Decimal(current);
	const pending = gameData.requirements[rebirthRequirementKey].isCompleted()
		? base.add(gain())
		: base;
	return [
		getDynamicProgress(base, required),
		getDynamicProgress(pending, required),
	];
}

export function getTaskNameLocale(taskRef) {
	const entity = gameData.taskData[taskRef];
	return entity ? entity.name : taskRef;
}
