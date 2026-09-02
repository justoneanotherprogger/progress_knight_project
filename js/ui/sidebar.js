// ui/sidebar.js — sidebar rendering

function renderSideBar() {
    const task = gameData.currentJob
    const quickTaskDisplayElement = document.getElementById("quickTaskDisplay")

    const progressBar = quickTaskDisplayElement.getElementsByClassName("job")[0]
    progressBar.querySelector(".name").textContent = (task.isHero ? t("great") + " " : "") + t(task.name) + " " + t("lvl") + " " + formatLevel(task.level)
    const progressFill = progressBar.getElementsByClassName("progressFill")[0]
    renderProgressBar(task, progressFill, progressBar)   

    document.getElementById("ageDisplay").textContent = formatAge(gameData.days)
    document.getElementById("lifespanDisplay").textContent = formatWhole(daysToYears(getLifespan()))
    document.getElementById("realtimeDisplay").textContent = formatTime(gameData.realtime)
    document.getElementById("boostCooldownDisplay").textContent = getBoostCooldownString()            
    updateButtonText("pauseButton", gameData.paused ? t("play") : t("pause"))
    updateButtonText("rebirthBtn1", t("rebirth_1"))
    setRebirthButton("rebirthBtn2", t("rebirth_2"), "<span class=\"color-evil\">(+" + format(getEvilGain()) + " " + t("evil") + ")</span>")
    setRebirthButton("rebirthBtn3", t("rebirth_3"), "<span class=\"color-essence\">(+" + format(getEssenceGain()) + " " + t("essence") + ")</span>")
    setRebirthButton("rebirthBtn4", t("rebirth_4"), "<span class=\"color-dark-matter\">(+" + format(getDarkMatterGain()) + " " + t("dark_matter") + ")</span>")
    if (gameData.essence > 1e90)
        setRebirthButton("rebirthBtn5", t("rebirth_5"), "<span class=\"color-perk-points\">(+" + formatTreshold(getMetaversePerkPointsGain()) + " " + t("perk_points") + ")</span>")
    else if (gameData.rebirthFiveCount > 0)
        setRebirthButton("rebirthBtn5", t("rebirth_5"), "<span class=\"color-hypercubes\">(" + format(getHypercubeCap(1)) + " " + t("hypercubes") + ")</span>")
    else
        setRebirthButton("rebirthBtn5", t("rebirth_5"), "")
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


    document.getElementById("rebirthButton5").hidden = getHypercubeCap() == Infinity && gameData.essence < 1e90

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
    document.getElementById("rebirthButton1").hidden = gameData.requirements["Almighty Eye"].isCompleted()

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

    if (getDarkMatter() == 0)
        gameData.requirements["Dark Matter info"].completed = false
}
