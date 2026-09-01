// gameLoop.js — game loop, auto functions, game state

function update(needUpdateUI = true) {
    makeHeroes()
    increaseRealtime()
    increaseDays()
    autoPerks()
    autoPromote()
    autoBuy()
    applyExpenses()
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]
        if ((task instanceof Skill || task instanceof Job) && gameData.requirements[key].isCompleted()) {
            task.increaseXp()
        }
    }
    increaseCoins()

    gameData.dark_orbs += applySpeed(getDarkOrbGeneration())
    gameData.hypercubes += applySpeed(getHypercubeGeneration())
    if (gameData.hypercubes > getHypercubeCap())
        gameData.hypercubes = getHypercubeCap()

    applyMilestones()
    applyPerks()
    updateStats()
    if (needUpdateUI && !document.hidden)
        updateUI()
    else
        updateRequirements()
}

function updateRequirements() {
    // Call isCompleted on every requirement as that function caches its result in requirement.completed
    for (const i in gameData.requirements) gameData.requirements[i].isCompleted()
}

function updateStats() {
    if (gameData.requirements["Rebirth stats evil"].isCompleted()) {
        gameData.stats.EvilPerSecond = getEvilGain() / gameData.rebirthTwoTime
        if (gameData.stats.EvilPerSecond > gameData.stats.maxEvilPerSecond) {
            gameData.stats.maxEvilPerSecond = gameData.stats.EvilPerSecond
            gameData.stats.maxEvilPerSecondRt = gameData.rebirthTwoTime
        }
    }

    if (gameData.requirements["Rebirth stats essence"].isCompleted()) {
        gameData.stats.EssencePerSecond = getEssenceGain() / gameData.rebirthThreeTime
        if (gameData.stats.EssencePerSecond > gameData.stats.maxEssencePerSecond) {
            gameData.stats.maxEssencePerSecond = gameData.stats.EssencePerSecond
            gameData.stats.maxEssencePerSecondRt = gameData.rebirthThreeTime
        }
    }

    if (gameData.essence > gameData.stats.maxEssenceReached)
        gameData.stats.maxEssenceReached = gameData.essence
}

function autoPerks() {
    if (gameData.perks.auto_boost == 1 && !gameData.boost_active && gameData.boost_cooldown <= 0)
        applyBoost()
    if (gameData.perks.auto_dark_orb == 1 && gameData.dark_matter >= getDarkOrbGeneratorCost() * PERK_AUTO_SACRIFICE_COST_MULTIPLIER && gameData.dark_orbs != Infinity)
        buyDarkOrbGenerator()
    if (gameData.perks.auto_dark_orb == 1 && gameData.dark_matter >= PERK_AUTO_DARK_ORB_MIRACLE_COST && gameData.dark_matter_shop.a_miracle == false)
        buyAMiracle()
    if (gameData.perks.auto_dark_shop == 1 && gameData.dark_orbs >= PERK_AUTO_DARK_SHOP_ORBS_THRESHOLD) {
        buyADealWithTheChairman()
        buyAGiftFromGod()
        buyGottaBeFast()
        buyLifeCoach()
    }
    if (gameData.perks.auto_sacrifice == 1 && gameData.hypercubes > PERK_AUTO_SACRIFICE_HYPERCUBES_THRESHOLD) {
        buyDarkMaterMult()
        buyChallengeAltar()
        buyEssenceMult()
        if (gameData.hypercubes > evilTranCost() * PERK_AUTO_SACRIFICE_COST_MULTIPLIER) buyEvilTran()
        if (gameData.hypercubes > boostDurationCost() * PERK_AUTO_SACRIFICE_COST_MULTIPLIER) buyBoostDuration()
        if (gameData.hypercubes > reduceBoostCooldownCost() * PERK_AUTO_SACRIFICE_COST_MULTIPLIER) buyReduceBoostCooldown()
        if (gameData.hypercubes > hypercubeGainCost() * PERK_AUTO_SACRIFICE_COST_MULTIPLIER) buyHypercubeGain()
    }
}

function autoPromote() {
    let maxIncome = 0;
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]
        if (task instanceof Job && gameData.requirements[key].isCompleted()) {
            const income = task.getIncome();
            if (income > maxIncome) {
                maxIncome = income
                gameData.currentJob = task
            }
        }
    }
}

function autoBuy() {
    if (!autoBuyEnabled) return

    let usedExpense = 0
    const income = getIncome()

    for (const key in gameData.itemData) {
        if (gameData.requirements[key].isCompleted()) {
            const item = gameData.itemData[key]
            const expense = item.getExpense()

            if (itemCategories['Properties'].indexOf(key) != -1) {
                if (expense < income && expense >= usedExpense) {
                    gameData.currentProperty = item
                    usedExpense = expense
                }
            }
        }
    }

    for (const key in gameData.currentMisc) {
        usedExpense += gameData.currentMisc[key].getExpense()
    }

    for (const key in gameData.itemData) {
        if (gameData.requirements[key].isCompleted()) {
            const item = gameData.itemData[key]
            const expense = item.getExpense()
            if (itemCategories['Misc'].indexOf(key) != -1) {
                if (expense < income - usedExpense) {
                    if (gameData.currentMisc.indexOf(item) == -1) {
                        gameData.currentMisc.push(item)
                        usedExpense += expense
                    }
                }
            }
        }
    }   
}

function increaseCoins() {
    gameData.coins += applySpeed(getIncome())
}

function increaseDays() {
    gameData.days += applySpeed(1)
    gameData.totalDays += applySpeed(1)
}

function increaseRealtime() {
    if (!canSimulate())
        return;

    const realDiff = 1.0 / updateSpeed

    gameData.realtime += realDiff
    gameData.realtimeRun += realDiff
    gameData.rebirthOneTime += realDiff
    gameData.rebirthTwoTime += realDiff
    gameData.rebirthThreeTime += realDiff
    gameData.rebirthFourTime += realDiff
    gameData.rebirthFiveTime += realDiff

    if (gameData.boost_active) {
        gameData.boost_timer -= realDiff
        if (gameData.boost_timer < 0) {
            gameData.boost_timer = 0
            gameData.boost_active = false
            gameData.boost_cooldown = getBoostCooldownSeconds()
        }
    }
    else {
        gameData.boost_cooldown -= realDiff

        if (gameData.boost_cooldown < 0) 
            gameData.boost_cooldown = 0
    }
}

function applyExpenses() {
    if (gameData.coins == Infinity)
        return

    gameData.coins -= applySpeed(getExpense())

    if (gameData.coins < 0) {
        gameData.coins = 0
        if (getIncome() < getExpense())
            goBankrupt()
    }
}

function goBankrupt() {
    gameData.coins = 0
    gameData.currentProperty = gameData.itemData["Homeless"]
    gameData.currentMisc = []
    autoBuyEnabled = true
}

function makeHero(task) {
    if ((task instanceof Job || task instanceof Skill) && !task.isHero) {
        task.level = 0
        task.maxLevel = 0
        task.xp = 0
        task.isHero = true
    }
}

function makeHeroes() {
    if (!isHeroesUnlocked()) return

    for (const taskname in gameData.taskData) {
        const task = gameData.taskData[taskname]

        if (task.isHero)
            continue

        const prev = getPreviousTaskInCategory(taskname)

        if (prev != "" && (!gameData.taskData[prev].isHero || gameData.taskData[prev].level < HERO_PREV_LEVEL_MIN))
                continue

        const req = gameData.requirements[taskname]
        let isNewHero = true

        if (req instanceof TaskRequirement) {
            if (!req.isCompletedActual(true))
                continue
            for (const requirement of req.requirements)
                if (!(gameData.taskData[requirement.task] && gameData.taskData[requirement.task].isHero)) {
                    isNewHero = false
                    break
                }
        }
        else if (req instanceof EssenceRequirement) {
            if (!req.isCompletedActual(true))
                continue
        }

        if (isNewHero)
            makeHero(task)
    }

    for (const key in gameData.itemData) {
        const item = gameData.itemData[key]
        if (item.isHero)
            continue
        item.isHero = true
        gameData.currentProperty = gameData.itemData["Homeless"]
        gameData.currentMisc = []
    }
}
