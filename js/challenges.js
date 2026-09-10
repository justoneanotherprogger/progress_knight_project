function enterChallenge(challengeName) {
    rebirthReset(false)
    gameData.active_challenge = challengeName
    gameData.rebirthOneTime = 0
    gameData.rebirthTwoTime = 0

    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]
        task.maxLevel = 0
    }
}

function exitChallenge() {
    setChallengeProgress()
    rebirthReset(false)
    gameData.active_challenge = ""
    gameData.rebirthOneTime = 0
    gameData.rebirthTwoTime = 0

    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]
        task.maxLevel = 0
    }
}

function toChallengeDecimal(value, fallback = 0) {
    const dec = toInfinityNumber(value)
    // Decimal from break_infinity.js stores NaN as Number.NaN in mantissa
    return Number.isNaN(dec.mantissa) ? new Decimal(fallback) : dec
}

function updateChallengeProgress(key, value) {
    const newValue = toChallengeDecimal(value, 0)
    const current = toChallengeDecimal(gameData.challenges[key], 0)
    if (newValue.gt(current)) {
        gameData.challenges[key] = newValue.toString()
    }
}

function setChallengeProgress() {
    if (gameData.active_challenge == "an_unhappy_life") {
        updateChallengeProgress("an_unhappy_life", getHappiness())
    }
    if (gameData.active_challenge == "rich_and_the_poor") {
        updateChallengeProgress("rich_and_the_poor", getIncome())
    }
    if (gameData.active_challenge == "time_does_not_fly") {
        updateChallengeProgress("time_does_not_fly", getUnpausedGameSpeed() / baseGameSpeed)
    }
    if (gameData.active_challenge == "dance_with_the_devil") {
        updateChallengeProgress("dance_with_the_devil", Math.max(0, getEvilGain() - 10))
    }
    if (gameData.active_challenge == "legends_never_die") {
        updateChallengeProgress("legends_never_die", getChallengeTaskGoalProgress("Chairman"))
    }
    if (gameData.active_challenge == "the_darkest_time") {
        updateChallengeProgress("the_darkest_time", getChallengeTaskGoalProgress("Sigma Proioxis") / 100.0)
    }
}

function getChallengeBonus(challenge_name, current = false) {
    // Convert challenge values to Decimal if they are strings
    const val1 = current ? getHappiness() : toInfinityNumber(gameData.challenges.an_unhappy_life)
    const val2 = current ? getIncome() : toInfinityNumber(gameData.challenges.rich_and_the_poor)
    const val3 = current ? getUnpausedGameSpeed() / baseGameSpeed : toInfinityNumber(gameData.challenges.time_does_not_fly)
    const val4 = current ? Math.max(0, getEvilGain() - 10) : toInfinityNumber(gameData.challenges.dance_with_the_devil)
    const val5 = current ? getChallengeTaskGoalProgress("Chairman") : toInfinityNumber(gameData.challenges.legends_never_die)
    const val6 = current ? getChallengeTaskGoalProgress("Sigma Proioxis") / 100.0 : toInfinityNumber(gameData.challenges.the_darkest_time)

    if (challenge_name == "an_unhappy_life" || challenge_name == 1) {
        return softcap(toChallengeDecimal(val1, 0).add(1).pow(0.31), 500, 0.45)
    }
    if (challenge_name == "rich_and_the_poor" || challenge_name == 2) {
        return softcap(toChallengeDecimal(val2, 0).add(1).pow(0.25), 25, 0.55)
    }
    if (challenge_name == "time_does_not_fly" || challenge_name == 3) {
        return softcap(toChallengeDecimal(val3, 0).add(1).pow(0.055), 2)
    }
    if (challenge_name == "dance_with_the_devil" || challenge_name == 4) {
        return softcap(toChallengeDecimal(val4, 0).add(1).pow(0.09), 2, 0.75)
    }
    if (challenge_name == "legends_never_die" || challenge_name == 5) {
        return softcap(toChallengeDecimal(val5, 0).add(1).pow(0.85), 25, 0.6)
    }
    if (challenge_name == "the_darkest_time" || challenge_name == 6) {
        return softcap(toChallengeDecimal(val6, 0).add(1).pow(0.85), 25, 0.6)
    }
}

function getChallengeGoal(challenge_name) {
    if (challenge_name == "an_unhappy_life" || challenge_name == 1) {
        return toChallengeDecimal(gameData.challenges.an_unhappy_life, 0).add(1)
    }
    if (challenge_name == "rich_and_the_poor" || challenge_name == 2) {
        return toChallengeDecimal(gameData.challenges.rich_and_the_poor, 0).add(1)
    }
    if (challenge_name == "time_does_not_fly" || challenge_name == 3) {
        const goal = toChallengeDecimal(gameData.challenges.time_does_not_fly, 0).add(0.1)
        return goal.lt(1) ? new Decimal(1) : goal
    }
    if (challenge_name == "dance_with_the_devil" || challenge_name == 4) {
        return toChallengeDecimal(gameData.challenges.dance_with_the_devil, 0).add(10.1)
    }
    if (challenge_name == "legends_never_die" || challenge_name == 5) {
        return toChallengeDecimal(gameData.challenges.legends_never_die, 0).add(1)
    }
    if (challenge_name == "the_darkest_time" || challenge_name == 6) {
        return toChallengeDecimal(gameData.challenges.the_darkest_time, 0).add(1)
    }
}