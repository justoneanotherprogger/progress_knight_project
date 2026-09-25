// ui/sidebar.js — sidebar rendering

// Элементы сайдбара статичны: DOM не пересоздаётся ни при ребёрне, ни при
// загрузке сейва, поэтому getElementById кэшируется один раз.
const elCache = {}
function el(id) {
    return elCache[id] ??= document.getElementById(id)
}

// Текст пишется только при смене: безусловный textContent каждый кадр
// форсит перерасчёт layout, даже когда строка не изменилась.
function setText(id, text) {
    const e = el(id)
    if (e.textContent != text) e.textContent = text
}

function renderSideBar() {
    const task = gameData.currentJob

    const progressBar = el("quickTaskDisplay").getElementsByClassName("job")[0]
    const currentJobName = progressBar.querySelector(".name")
    currentJobName.style.whiteSpace = "nowrap"
    currentJobName.textContent = (task.isHero ? t("great") + " " : "") + t(task.name) + " " + t("lvl") + " " + formatLevel(task.level)
    fitText(currentJobName, 16)
    const progressFill = progressBar.getElementsByClassName("progressFill")[0]
    renderProgressBar(task, progressFill, progressBar)

    setText("ageDisplay", formatAge(gameData.days))
    setText("lifespanDisplay", formatWhole(daysToYears(getLifespan())))
    setText("realtimeDisplay", formatTime(gameData.realtime))
    const lifespanRow = el("lifespanRow")
    lifespanRow.style.whiteSpace = "nowrap"
    fitText(lifespanRow, 16)

    // Смерть — рендер, а не расчёт: isAlive() чистая и в DOM не ходит.
    el("deathText").classList.toggle("hidden", isAlive())
    const boostCooldownDisplay = el("boostCooldownDisplay")
    boostCooldownDisplay.style.whiteSpace = "nowrap"
    boostCooldownDisplay.textContent = getBoostCooldownString()
    fitText(boostCooldownDisplay, 16)
    updateButtonHTML("pauseButton", "⏳ " + (gameData.paused ? t("play") : t("pause")))
    updateButtonText("rebirthBtn1", t("rebirth_1"))
    setRebirthButton("rebirthBtn2", t("rebirth_2"), "color-evil", "(+" + format(getEvilGain()) + " " + t("evil") + ")")
    setRebirthButton("rebirthBtn3", t("rebirth_3"), "color-essence", "(+" + format(getEssenceGain()) + " " + t("essence") + ")")
    fitText(el("rebirthBtn3"), 16)
    setRebirthButton("rebirthBtn4", t("rebirth_4"), "color-dark-matter", "(+" + format(getDarkMatterGain()) + " " + t("dark_matter") + ")")
    fitText(el("rebirthBtn4"), 16)
    if (gameData.essence.gt(1e90))
        setRebirthButton("rebirthBtn5", t("rebirth_5"), "color-perk-points", "(+" + formatTreshold(getMetaversePerkPointsGain()) + " " + t("perk_points") + ")")
    else if (gameData.rebirthFiveCount > 0)
        setRebirthButton("rebirthBtn5", t("rebirth_5"), "color-hypercubes", "(" + format(getHypercubeCap(1)) + " " + t("hypercubes") + ")")
    else
        setRebirthButton("rebirthBtn5", t("rebirth_5"), "", "")
    fitText(el("rebirthBtn5"), 16)
    const boostPanel = el("boostPanel")
    boostPanel.style.whiteSpace = "nowrap"
    boostPanel.hidden = gameData.rebirthFiveCount == 0
    renderBoostButton("boostButton")

    formatCoins(gameData.coins, el("coinDisplay"))
    setSignDisplay()
    formatCoins(getNet(), el("netDisplay"))
    formatCoins(getIncome(), el("incomeDisplay"))
    formatCoins(getExpense(), el("expenseDisplay"))

    setText("happinessDisplay", format(getHappiness()))
    setText("inspirationDisplay", format(getInspiration()))
    setText("greedDisplay", format(getGreed()))

    setText("evilDisplay", format(gameData.evil))
    setTextAll("#evilGainDisplay", format(getEvilGain()))

    setText("essenceDisplay", format(gameData.essence))
    setTextAll("#essenceGainDisplay", format(getEssenceGain()))

    setText("darkMatterDisplay", format(gameData.dark_matter))
    setTextAll("#darkMatterGainDisplay", format(getDarkMatterGain()))

    setText("darkOrbsDisplay", formatTreshold(gameData.dark_orbs))

    el("timeWarping").hidden = (getUnpausedGameSpeed() / baseGameSpeed) <= 1
    setText("timeWarpingDisplay", "x" + format(getUnpausedGameSpeed() / baseGameSpeed, 2))

    setText("hypercubesDisplay", formatTreshold(gameData.hypercubes))


    setTextAll("#hypercubeCapDisplay", format(getHypercubeCap(1)))

    setTextAll("#perkPointsGainDisplay", formatTreshold(getMetaversePerkPointsGain()))


    // Записываем hidden только при реальной смене: обёртка может схлопнуться
    // между mousedown и mouseup и съесть клик по кнопке ребёрна.
    const rebirthButton5 = el("rebirthButton5")
    const rebirth5Hidden = getHypercubeCap() == Infinity && gameData.essence.lt(1e90)
    if (rebirthButton5.hidden != rebirth5Hidden)
        rebirthButton5.hidden = rebirth5Hidden

    // Embrace evil indicator
    const embraceEvilButton = el("rebirthButton2").querySelector(".button")
    if (isNextDarkMagicSkillInReach())
        embraceEvilButton.classList.add("button-evil")
    else
        embraceEvilButton.classList.remove("button-evil")

    // Transcend for Next Milestone indicator
    const transcendButton = el("rebirthButton3").querySelector(".button")
    if (isNextMilestoneInReach())
        transcendButton.classList.add("button-transcend")
    else
        transcendButton.classList.remove("button-transcend")

    // Hide the rebirthOneButton from the sidebar when you have `Almighty Eye` unlocked.
    el("rebirthButton1").hidden = gameData.requirements["milestone_almighty_eye"].isCompleted()

    // Change sidebar when paused
    el("info").classList.toggle("game-paused", gameData.paused)

    // Challenges
    if (gameData.active_challenge == "") {
        el("challengeTitle").hidden = true
        el("info").classList.remove("challenge")
    } else {
        setText("challengeName", getChallengeTranslatedName(gameData.active_challenge))
        el("challengeTitle").hidden = false
        el("info").classList.add("challenge")
        // challenge reward
        renderCurrentChallengeReward("sidebarChallengeReward")
        renderCurrentChallengeRewardValue(true)
    }

    updateResourceScale()
    document.querySelectorAll("#resourceStats .text-caption").forEach(e => {
        e.style.whiteSpace = "nowrap"
        fitText(e, k => `calc(20px * var(--stats-scale) * ${k})`)
    })
}

// Keeps the quick bar's bottom edge above the window's bottom edge, leaving
// room for both the browser-default body margin-bottom (8px) and the
// .w3-margin offset (0.8em, styles.css).  After accounting for both, the
// page height lands exactly on the window edge so no phantom scrollbar
// appears.
// sticky top can be 146px (pinned under the resources bar) or higher (page at top).
// Recalculated on scroll/resize only — never per frame — so the layout it
// triggers cannot feed back into the measurement. top is clamped to the
// sticky offset so a scrolled-off panel cannot request an unbounded height.
const BASE_EM = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
const QUICK_BAR_BOTTOM_GAP = 8 + Math.round(BASE_EM * 0.8)

function updateQuickBarHeight() {
    const panel = document.getElementById("info")
    if (!panel) return

    const top = Math.max(146, panel.getBoundingClientRect().top)
    const desired = Math.max(0, window.innerHeight - top - QUICK_BAR_BOTTOM_GAP)
    const current = parseFloat(panel.style.height)

    if (isNaN(current) || Math.abs(current - desired) > 0.5)
        panel.style.height = desired + "px"
}

window.addEventListener("resize", updateQuickBarHeight, { passive: true })
window.addEventListener("scroll", updateQuickBarHeight, { passive: true })
updateQuickBarHeight()

const resourceScaleCache = { key: "", desired: 0, scale: 1 }
const RESOURCE_SCALE_INTERVAL = 1000

// Scales #resourceStats so its content always fits the space flex gives it.
function updateResourceScale() {
    const stats = document.getElementById("resourceStats")
    if (!stats) return

    // clientHeight/scrollHeight — forced layout, а панель стабильна почти
    // всё время. Не чаще раза в секунду: при ресайзе или смене масштаба
    // поправится в течение интервала.
    const now = performance.now()
    if (now - (resourceScaleCache.at || 0) < RESOURCE_SCALE_INTERVAL)
        return
    resourceScaleCache.at = now

    const panel = document.getElementById("info")
    // Св-ство hidden, а не класс: строка выше прячет через .hidden, а класс
    // hidden тут не появляется — ключ не менялся бы и переобмер не срабатывал.
    const visibleKey = panel.clientHeight + "|" + (document.getElementById("timeWarping").hidden ? 0 : 1)

    if (resourceScaleCache.key != visibleKey) {
        stats.style.setProperty("--stats-scale", 1)
        resourceScaleCache.desired = stats.scrollHeight
        stats.style.setProperty("--stats-scale", resourceScaleCache.scale)
        resourceScaleCache.key = visibleKey
    }

    const available = stats.clientHeight
    const scale = available <= 0 ? 1 : Math.min(1, available / resourceScaleCache.desired)
    if (scale != resourceScaleCache.scale) {
        stats.style.setProperty("--stats-scale", scale)
        resourceScaleCache.scale = scale
    }
}

// Re-measure periodically even when panel height is stable: right after a
// reload the first frame can capture a half-rendered state and freeze the
// scale at ~0.5 with empty space left over.
setInterval(() => {
    updateQuickBarHeight()
    resourceScaleCache.key = ""
    updateResourceScale()
}, 1000)
