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

function fitText(element, maxFontSize) {
    let size = maxFontSize
    element.style.fontSize = size + "px"
    while (element.scrollWidth > element.clientWidth && size > 6) {
        size--
        element.style.fontSize = size + "px"
    }
}

function renderProgressBar(task, progressFill, progressBar){
    if (task.isFinished) {
        let width = 0
        if (task.level > 10000) {
            width = task.level % 100
        }
        else {
            width = 100n * task.xpBigInt / task.getMaxBigIntXp()
            if (width > 100n)
                width = 100n
        }        
        progressFill.style.width = width + "%"
    }
    else
        progressFill.style.width = task.xp / task.getMaxXp() * 100 + "%"

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
