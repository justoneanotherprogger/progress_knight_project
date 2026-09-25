// ui/helpers.js — small UI utility functions

function setTextAll(selector, text) {
    document.querySelectorAll(selector).forEach(el => {
        if (el.textContent != text) el.textContent = text
    })
}

function updateButtonText(id, text) {
    const element = document.getElementById(id)
    if (element.textContent != text) {
        element.textContent = text
    }
}

function updateButtonHTML(id, html) {
    const element = document.getElementById(id)
    if (element.dataset.html != html) {
        element.innerHTML = html
        element.dataset.html = html
    }
}

// Сравнивать innerHTML с источником бесполезно: браузер нормализует
// разметку (style="color: red" → "color: red;"), и строки не сходятся
// никогда — тултип с разметкой переписывался бы каждый кадр. Поэтому
// помним, что сами записали.
function setHTML(element, html) {
    if (element.dataset.html != html) {
        element.innerHTML = html
        element.dataset.html = html
    }
}

// innerHTML здесь нельзя: значение gain меняется каждый кадр, и пересоздание
// узла под курсором между mousedown и mouseup съедает клик. Цвет живёт на
// самом span, перезаписывается только текст.
function setRebirthButton(id, label, gainClass, gainText) {
    const button = document.getElementById(id)
    const labelEl = button.querySelector(".rebirth-label")
    const gainEl = button.querySelector(".rebirth-gain")
    if (labelEl.textContent != label) labelEl.textContent = label
    if (gainEl.dataset.gainClass != gainClass) {
        gainEl.className = "rebirth-gain " + gainClass
        gainEl.dataset.gainClass = gainClass
    }
    if (gainEl.textContent != gainText) gainEl.textContent = gainText
}

// size — число (макс. размер в px) либо функция k → CSS-строка, для
// элементов под масштабированием контейнера (calc от --stats-scale).

// Посадка текста может слететь только при смене текста или геометрии
// контейнера. Текст проверяем каждый кадр (чтение textContent дёшево),
// а геометрию — не чаще FIT_TEXT_INTERVAL: имена задач статичны, а
// clientWidth/getComputedStyle форсят layout, и на ~100 элементах за кадр
// проверка кэша стоила четверть кадра. При смене шрифта, --stats-scale или
// ресайзе посадка поправится в течение интервала.
const FIT_TEXT_INTERVAL = 1000

function fitText(element, size) {
    const toCss = typeof size === "function" ? size : k => k * size + "px"
    const text = element.textContent
    if (text === element.dataset.fitTextText
        && performance.now() - (element._fitTextAt || 0) < FIT_TEXT_INTERVAL)
        return
    element._fitTextAt = performance.now()

    // computed font-size в ключе — иначе элемент под calc-масштабом не
    // переизмерится, когда --stats-scale сменится, а клиентская ширина та же.
    const cacheKey = text + "|" + element.clientWidth + "|" + getComputedStyle(element).fontSize
    if (element.dataset.fitText == cacheKey) return

    // Скрытый элемент (display:none) не измеряется: clientWidth = 0 даёт
    // минимальный масштаб, а кэш потом держит испорченную посадку до
    // следующей смены текста. Поправится, когда вкладку покажут.
    if (element.clientWidth === 0) return

    // Ширина текста линейна относительно font-size, поэтому достаточно
    // одного замера при полном размере: k = clientWidth / scrollWidth.
    // Цикл shrink давал до десятка forced layout на элемент (запись стиля
    // + чтение scrollWidth на каждой итерации).
    element.style.fontSize = toCss(1)
    const fullWidth = element.scrollWidth
    let k = Math.max(0.3, Math.min(1, element.clientWidth / fullWidth))
    element.style.fontSize = toCss(k)
    // Погрешность округления пикселей может оставить текст на 1px шире:
    // добиваем посадки парой шагов вместо десятка итераций на каждый элемент.
    for (let guard = 0; element.scrollWidth > element.clientWidth && k > 0.3 && guard < 4; guard++) {
        k = Math.max(0.3, k - 0.05)
        element.style.fontSize = toCss(k)
    }
    element.dataset.fitText = cacheKey
    element.dataset.fitTextText = text
}

// Тултипы открываются по :hover, но «влезает ли снизу» CSS не решает.
// Меряем один раз за наведение и поднимаем на разницу с нижним краем.
// Граница — не окно: таблицы лежат в .column с overflow-y:hidden, и обрезает
// именно она, а её низ выше низа окна. По окну меряли — сдвига не было.
// visibility:hidden элемент из вёрстки не убирает — прямоугольник настоящий,
// поэтому замер не ждёт показа. Сдвиг перезаписывается каждым новым
// наведением, так что сбрасывать его на уходе курсора не нужно.
document.addEventListener("mouseover", e => {
    const tip = e.target.closest(".tooltipText")
    if (!tip) return
    const clip = tip.closest(".column")
    const limit = clip
        ? Math.min(clip.getBoundingClientRect().bottom, window.innerHeight)
        : window.innerHeight
    const overflow = tip.getBoundingClientRect().bottom - limit
    tip.style.transform = overflow > 0 ? "translateY(" + -overflow + "px)" : ""
})

function renderProgressBar(task, progressFill, progressBar){
    let width
    if (task.level > 10000) {
        // На таких уровнях реальный прогресс по xp незаметен глазу,
        // поэтому полосу водит по level — как визуальный пульс.
        width = task.level % 100
    }
    else {
        width = task.xp.div(task.getMaxXp()).times(100).toNumber()
    }
    if (width > 100)
        width = 100
    progressFill.style.width = width + "%"

    if (task.isHero) {
        progressFill.classList.add("progress-fill-hero")
        progressBar.classList.add("progress-bar-hero")

        if (task == gameData.currentJob) {
            progressFill.classList.add("current-hero")
            progressFill.classList.remove("current")
        }
        else {
            progressFill.classList.remove("current")
            progressFill.classList.remove("current-hero")
        }

        progressFill.classList.remove("progress-fill")
        progressBar.classList.remove("progress-bar")
    }
    else {
        progressFill.classList.remove("progress-fill-hero")
        progressBar.classList.remove("progress-bar-hero")

        if (task == gameData.currentJob) {
            progressFill.classList.add("current")
            progressFill.classList.remove("current-hero")
        }
        else {
            progressFill.classList.remove("current")
            progressFill.classList.remove("current-hero")
        }

        progressFill.classList.add("progress-fill")
        progressBar.classList.add("progress-bar")
    }
}
