// ui/sidebar.js — sidebar rendering

function renderSideBar() {
    const task = gameData.currentJob
    const quickTaskDisplayElement = document.getElementById("quickTaskDisplay")

    const progressBar = quickTaskDisplayElement.getElementsByClassName("job")[0]
    const currentJobName = progressBar.querySelector(".name")
    currentJobName.style.whiteSpace = "nowrap"
    currentJobName.textContent = (task.isHero ? t("great") + " " : "") + t(task.name) + " " + t("lvl") + " " + formatLevel(task.level)
    fitText(currentJobName, 16)
    const progressFill = progressBar.getElementsByClassName("progressFill")[0]
    renderProgressBar(task, progressFill, progressBar)   

    document.getElementById("ageDisplay").textContent = formatAge(gameData.days)
    document.getElementById("lifespanDisplay").textContent = formatWhole(daysToYears(getLifespan()))
    document.getElementById("realtimeDisplay").textContent = formatTime(gameData.realtime)
    const boostCooldownDisplay = document.getElementById("boostCooldownDisplay")
    boostCooldownDisplay.style.whiteSpace = "nowrap"
    boostCooldownDisplay.textContent = getBoostCooldownString()
    fitText(boostCooldownDisplay, 16)
    updateButtonHTML("pauseButton", "⏳ " + (gameData.paused ? t("play") : t("pause")))
    updateButtonText("rebirthBtn1", t("rebirth_1"))
    setRebirthButton("rebirthBtn2", t("rebirth_2"), "<span class=\"color-evil\">(+" + format(getEvilGain()) + " " + t("evil") + ")</span>")
    setRebirthButton("rebirthBtn3", t("rebirth_3"), "<span class=\"color-essence\">(+" + format(getEssenceGain()) + " " + t("essence") + ")</span>")
    fitText(document.getElementById("rebirthBtn3"), 16)
    setRebirthButton("rebirthBtn4", t("rebirth_4"), "<span class=\"color-dark-matter\">(+" + format(getDarkMatterGain()) + " " + t("dark_matter") + ")</span>")
    fitText(document.getElementById("rebirthBtn4"), 16)
    if (gameData.essence.gt(1e90))
        setRebirthButton("rebirthBtn5", t("rebirth_5"), "<span class=\"color-perk-points\">(+" + formatTreshold(getMetaversePerkPointsGain()) + " " + t("perk_points") + ")</span>")
    else if (gameData.rebirthFiveCount > 0)
        setRebirthButton("rebirthBtn5", t("rebirth_5"), "<span class=\"color-hypercubes\">(" + format(getHypercubeCap(1)) + " " + t("hypercubes") + ")</span>")
    else
        setRebirthButton("rebirthBtn5", t("rebirth_5"), "")
    fitText(document.getElementById("rebirthBtn5"), 16)
    const boostPanel = document.getElementById("boostPanel")
    boostPanel.style.whiteSpace = "nowrap"
    document.getElementById("boostPanel").hidden = gameData.rebirthFiveCount == 0
    renderBoostButton("boostButton")

    formatCoins(gameData.coins, document.getElementById("coinDisplay"))
    setSignDisplay()
    formatCoins(getNet(), document.getElementById("netDisplay"))
    formatCoins(getIncome(), document.getElementById("incomeDisplay"))
    formatCoins(getExpense(), document.getElementById("expenseDisplay"))

    document.getElementById("happinessDisplay").textContent = format(getHappiness())
    document.getElementById("inspirationDisplay").textContent = format(getInspiration())
    document.getElementById("greedDisplay").textContent = format(getGreed())

    document.getElementById("evilDisplay").textContent = format(gameData.evil)
    setTextAll("#evilGainDisplay", format(getEvilGain()))

    document.getElementById("essenceDisplay").textContent = format(gameData.essence)
    setTextAll("#essenceGainDisplay", format(getEssenceGain()))

    document.getElementById("darkMatterDisplay").textContent = format(gameData.dark_matter)
    setTextAll("#darkMatterGainDisplay", format(getDarkMatterGain()))

    document.getElementById("darkOrbsDisplay").textContent = formatTreshold(gameData.dark_orbs)

    document.getElementById("timeWarping").hidden = (getUnpausedGameSpeed() / baseGameSpeed) <= 1
    document.getElementById("timeWarpingDisplay").textContent = "x" + format(getUnpausedGameSpeed() / baseGameSpeed, 2)

    document.getElementById("hypercubesDisplay").textContent = formatTreshold(gameData.hypercubes)


    setTextAll("#hypercubeCapDisplay", format(getHypercubeCap(1)))

    setTextAll("#perkPointsGainDisplay", formatTreshold(getMetaversePerkPointsGain()))


    document.getElementById("rebirthButton5").hidden = getHypercubeCap() == Infinity && gameData.essence.lt(1e90)

    // Embrace evil indicator
    const embraceEvilButton = document.getElementById("rebirthButton2").querySelector(".button")
    if (isNextDarkMagicSkillInReach())
        embraceEvilButton.classList.add("button-evil")
    else
        embraceEvilButton.classList.remove("button-evil")

    // Transcend for Next Milestone indicator
    const transcendButton = document.getElementById("rebirthButton3").querySelector(".button")
    if (isNextMilestoneInReach())
        transcendButton.classList.add("button-transcend")
    else
        transcendButton.classList.remove("button-transcend")

    // Hide the rebirthOneButton from the sidebar when you have `Almighty Eye` unlocked.
    document.getElementById("rebirthButton1").hidden = gameData.requirements["milestone_almighty_eye"].isCompleted()

    // Change sidebar when paused
    if (gameData.paused) {
        document.getElementById("info").classList.add("game-paused")
    } else {
        document.getElementById("info").classList.remove("game-paused")
    }

    // Challenges
    if (gameData.active_challenge == "") {
        document.getElementById("challengeTitle").hidden = true
        document.getElementById("info").classList.remove("challenge")
    } else {
        document.getElementById("challengeName").textContent = getChallengeTranslatedName(gameData.active_challenge)
        document.getElementById("challengeTitle").hidden = false
        document.getElementById("info").classList.add("challenge")
        // challenge reward
        renderCurrentChallengeReward("sidebarChallengeReward")
        renderCurrentChallengeRewardValue(true)
    }

    updateResourceScale()
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

// Scales #resourceStats so its content always fits the space flex gives it.
function updateResourceScale() {
    const stats = document.getElementById("resourceStats")
    if (!stats) return

    const panel = document.getElementById("info")
    const visibleKey = panel.clientHeight + "|" + (document.getElementById("timeWarping").classList.contains("hidden") ? 0 : 1)

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
