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

function setRebirthButton(id, label, gainHTML) {
    const button = document.getElementById(id)
    const labelEl = button.querySelector(".rebirth-label")
    const gainEl = button.querySelector(".rebirth-gain")
    if (labelEl.textContent != label) labelEl.textContent = label
    if (gainEl.dataset.html != gainHTML) {
        gainEl.innerHTML = gainHTML
        gainEl.dataset.html = gainHTML
    }
}

// size — число (макс. размер в px) либо функция k → CSS-строка, для
// элементов под масштабированием контейнера (calc от --stats-scale).
function fitText(element, size) {
    const toCss = typeof size === "function" ? size : k => k * size + "px"
    // computed font-size в ключе — иначе элемент под calc-масштабом не
    // переизмерится, когда --stats-scale сменится, а клиентская ширина та же.
    const cacheKey = element.textContent + "|" + element.clientWidth + "|" + getComputedStyle(element).fontSize
    if (element.dataset.fitText == cacheKey) return

    let k = 1
    element.style.fontSize = toCss(k)
    const originalHeight = element.offsetHeight
    while (element.scrollWidth > element.clientWidth && k > 0.3) {
        k -= 0.05
        element.style.fontSize = toCss(k)
    }
    element.style.minHeight = (k < 1 ? originalHeight : "") + "px"
    element.dataset.fitText = cacheKey
}

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
