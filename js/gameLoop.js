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

    const orbGeneration = getDarkOrbGeneration()
    gameData.dark_orbs = gameData.dark_orbs.add(orbGeneration.mul(getGameSpeed() / updateSpeed))
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
    if (gameData.requirements["req_stats_evil_gain"].isCompleted()) {
        gameData.stats.EvilPerSecond = getEvilGain().div(gameData.rebirthTwoTime)
        if (gameData.stats.EvilPerSecond.gt(gameData.stats.maxEvilPerSecond)) {
            gameData.stats.maxEvilPerSecond = gameData.stats.EvilPerSecond
            gameData.stats.maxEvilPerSecondRt = gameData.rebirthTwoTime
        }
    }

    if (gameData.requirements["req_stats_essence_gain"].isCompleted()) {
        gameData.stats.EssencePerSecond = getEssenceGain().div(gameData.rebirthThreeTime)
        if (gameData.stats.EssencePerSecond.gt(gameData.stats.maxEssencePerSecond)) {
            gameData.stats.maxEssencePerSecond = gameData.stats.EssencePerSecond
            gameData.stats.maxEssencePerSecondRt = gameData.rebirthThreeTime
        }
    }

    if (gameData.essence.gt(gameData.stats.maxEssenceReached))
        gameData.stats.maxEssenceReached = gameData.essence
}

function autoPerks() {
    if (gameData.perks.auto_boost == 1 && !gameData.boost_active && gameData.boost_cooldown <= 0)
        applyBoost()
    if (gameData.perks.auto_dark_orb == 1 && gameData.dark_matter.gte(getDarkOrbGeneratorCost().times(PERK_AUTO_SACRIFICE_COST_MULTIPLIER)) && !isDecimalInfinity(gameData.dark_orbs))
        buyDarkOrbGenerator()
    if (gameData.perks.auto_dark_orb == 1 && gameData.dark_matter.gte(PERK_AUTO_DARK_ORB_MIRACLE_COST) && gameData.dark_matter_shop.a_miracle == false)
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
    let maxIncome = new Decimal(0);
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]
        if (task instanceof Job && gameData.requirements[key].isCompleted()) {
            const income = task.getIncome();
            if (income.gt(maxIncome)) {
                maxIncome = income
                gameData.currentJob = task
            }
        }
    }
}

function autoBuy() {
    if (!gameData.autoBuyEnabled) return

    let usedExpense = new Decimal(0)
    const income = getIncome()

    for (const key in gameData.itemData) {
        if (gameData.requirements[key].isCompleted()) {
            const item = gameData.itemData[key]
            const expense = item.getExpense()

            if (item.categoryId == "category_properties") {
                if (expense.lt(income) && expense.gte(usedExpense)) {
                    gameData.currentProperty = item
                    usedExpense = expense
                }
            }
        }
    }

    for (const key in gameData.currentMisc) {
        usedExpense = usedExpense.plus(gameData.currentMisc[key].getExpense())
    }

    for (const key in gameData.itemData) {
        if (gameData.requirements[key].isCompleted()) {
            const item = gameData.itemData[key]
            const expense = item.getExpense()
            if (item.categoryId == "category_misc") {
                if (expense.lt(income.minus(usedExpense))) {
                    if (gameData.currentMisc.indexOf(item) == -1) {
                        gameData.currentMisc.push(item)
                        usedExpense = usedExpense.plus(expense)
                    }
                }
            }
        }
    }   
}

function increaseCoins() {
    const gain = applySpeed(getIncome())
    const gainIsFinite = gain instanceof Decimal ? isFinite(gain.mantissa) : isFinite(gain)
    if (!gainIsFinite || !isFinite(gameData.coins.mantissa))
        return

    gameData.coins = gameData.coins.plus(gain)
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
    if (!isFinite(gameData.coins.mantissa))
        return

    gameData.coins = gameData.coins.minus(applySpeed(getExpense()))

    if (gameData.coins.lt(0)) {
        gameData.coins = new Decimal(0)
        if (getIncome().lt(getExpense()))
            goBankrupt()
    }
}

function goBankrupt() {
    gameData.coins = new Decimal(0)
    gameData.currentProperty = gameData.itemData["item_homeless"]
    gameData.currentMisc = []
}

function makeHero(task) {
    if ((task instanceof Job || task instanceof Skill) && !task.isHero) {
        task.level = 0
        task.maxLevel = 0
        task.xp = new Decimal(0)
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
        gameData.currentProperty = gameData.itemData["item_homeless"]
        gameData.currentMisc = []
    }
}
