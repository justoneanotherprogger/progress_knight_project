// multipliers.js — multiplier setup functions

function addMultipliers() {
    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]

        task.xpMultipliers = []
        if (task instanceof Job) task.incomeMultipliers = []

        task.xpMultipliers.push(task.getMaxLevelMultiplier.bind(task))
        task.xpMultipliers.push(getHappiness)
        task.xpMultipliers.push(getInspiration)
        task.xpMultipliers.push(getDarkMatterXpGain)
        task.xpMultipliers.push(getBindedTaskEffect("Dark Influence"))
        task.xpMultipliers.push(getBindedTaskEffect("Demon Training"))
        task.xpMultipliers.push(getBindedTaskEffect("Void Influence"))
        task.xpMultipliers.push(getBindedTaskEffect("Parallel Universe"))
        task.xpMultipliers.push(getBindedTaskEffect("Immortal Ruler"))
        task.xpMultipliers.push(getBindedTaskEffect("Blinded By Darkness"))
        task.xpMultipliers.push(getDarkMatterSkillXP)
        task.xpMultipliers.push(getTimeIsAFlatCircleXP)

        if (task instanceof Job) {
            task.incomeMultipliers.push(task.getLevelMultiplier.bind(task))
            task.incomeMultipliers.push(getBindedTaskEffect("Demon's Wealth"))
            task.incomeMultipliers.push(getLifeCoachIncomeGain)
            task.incomeMultipliers.push(getGreed)
            task.xpMultipliers.push(getBindedTaskEffect("Productivity"))
            task.xpMultipliers.push(getBindedTaskEffect("Dark Knowledge"))
            task.xpMultipliers.push(getBindedItemEffect("Personal Squire"))
        } else if (task instanceof Skill) {
            task.xpMultipliers.push(getBindedTaskEffect("Concentration"))
            task.xpMultipliers.push(getBindedItemEffect("Book"))
            task.xpMultipliers.push(getBindedItemEffect("Study Desk"))
            task.xpMultipliers.push(getBindedItemEffect("Library"))
            task.xpMultipliers.push(getBindedItemEffect("Void Blade"))
            task.xpMultipliers.push(getBindedTaskEffect("Void Symbiosis"))
            task.xpMultipliers.push(getBindedItemEffect("Universe Fragment"))
            task.xpMultipliers.push(getBindedItemEffect("Custom Galaxy"))
            task.xpMultipliers.push(getBindedTaskEffect("Evil Incarnate"))
            task.xpMultipliers.push(getBindedTaskEffect("Dark Prince"))
        }

        if (jobCategories["Military"].includes(task.name)) {
            task.incomeMultipliers.push(getBindedTaskEffect("Strength"))
            task.xpMultipliers.push(getBindedTaskEffect("Battle Tactics"))
            task.xpMultipliers.push(getBindedItemEffect("Steel Longsword"))
        } else if (task.name == "Strength") {
            task.xpMultipliers.push(getBindedTaskEffect("Muscle Memory"))
            task.xpMultipliers.push(getBindedItemEffect("Dumbbells"))
        } else if (skillCategories["Magic"].includes(task.name)) {
            task.xpMultipliers.push(getBindedItemEffect("Sapphire Charm"))
            task.xpMultipliers.push(getBindedItemEffect("Observatory"))
            task.xpMultipliers.push(getBindedTaskEffect("Universal Ruler"))
            task.xpMultipliers.push(getTaaAndMagicXpGain)
        } else if (skillCategories["Void Manipulation"].includes(task.name)) {
            task.xpMultipliers.push(getBindedItemEffect("Void Necklace"))
            task.xpMultipliers.push(getBindedItemEffect("Void Orb"))
        } else if (jobCategories["Mage Collegium"].includes(task.name)) {
            task.xpMultipliers.push(getBindedTaskEffect("Mana Control"))
            task.xpMultipliers.push(getTaaAndMagicXpGain)
            task.incomeMultipliers.push(getBindedTaskEffect("All Seeing Eye"))
        } else if (jobCategories["The Void"].includes(task.name)) {
            task.xpMultipliers.push(getBindedTaskEffect("Void Amplification"))
            task.xpMultipliers.push(getBindedItemEffect("Void Armor"))
            task.xpMultipliers.push(getBindedItemEffect("Void Dust"))
        } else if (jobCategories["Galactic Council"].includes(task.name)) {
            task.xpMultipliers.push(getBindedItemEffect("Celestial Robe"))
            task.xpMultipliers.push(getBindedTaskEffect("Epiphany"))
        } else if (skillCategories["Dark Magic"].includes(task.name)) {
            task.xpMultipliers.push(getEvilXpGain)
        } else if (skillCategories["Almightiness"].includes(task.name)) {
            task.xpMultipliers.push(getEssenceXpGain)
        } else if (skillCategories["Fundamentals"].includes(task.name)) {
            task.xpMultipliers.push(getBindedItemEffect("Mind's Eye"))
        } else if (skillCategories["Darkness"].includes(task.name)) {
            task.xpMultipliers.push(getDarknessXpGain)
        }
    }

    for (const itemName in gameData.itemData) {
        const item = gameData.itemData[itemName]
        item.expenseMultipliers = []
        item.expenseMultipliers.push(getBindedTaskEffect("Bargaining"))
        item.expenseMultipliers.push(getBindedTaskEffect("Intimidation"))
        item.expenseMultipliers.push(getBindedTaskEffect("Brainwashing"))
        item.expenseMultipliers.push(getBindedTaskEffect("Abyss Manipulation"))
        item.expenseMultipliers.push(getBindedTaskEffect("Galactic Command"))
    }
}

function setCustomEffects() {
    for (const taskName of EXPENSE_REDUCTION_TASKS) {
        const task = gameData.taskData[taskName]
        task.getEffect = function () {
            const base = task.isHero ? EXPENSE_REDUCTION_LOG_BASE_HERO : EXPENSE_REDUCTION_LOG_BASE_NORMAL
            const multiplier = 1 - getBaseLog(base, task.level + 1) / EXPENSE_REDUCTION_DIVISOR
            return multiplier < EXPENSE_REDUCTION_MIN ? EXPENSE_REDUCTION_MIN : multiplier
        }
    }

    const timeWarping = gameData.taskData["Time Warping"]
    timeWarping.getEffect = function() {
        const base = timeWarping.isHero ? TIME_WARPING_LOG_BASE_HERO : TIME_WARPING_LOG_BASE_NORMAL
        return 1 + getBaseLog(base, timeWarping.level + 1)
    }

    const immortality = gameData.taskData["Life Essence"]
    immortality.getEffect = function () {
        const base = immortality.isHero ? LIFE_ESSENCE_LOG_BASE_HERO : LIFE_ESSENCE_LOG_BASE_NORMAL
        return 1 + getBaseLog(base, immortality.level + 1)
    }

    const unholyRecall = gameData.taskData["Cosmic Recollection"];
    unholyRecall.getEffect = function() {
        return unholyRecall.level * (unholyRecall.isHero ? COSMIC_RECOLLECTION_EFFECT_HERO : COSMIC_RECOLLECTION_EFFECT_NORMAL);
    }

    const transcendentMaster = milestoneData["Transcendent Master"]
    transcendentMaster.getEffect = function () {
        return gameData.requirements["Transcendent Master"].isCompleted() ? TRANSCENDENT_MASTER_EFFECT : 1
    }

    const faintHope = milestoneData["Faint Hope"]
    faintHope.getEffect = function () {
        var mult = 1
        if (gameData.requirements["A New Hope"].isCompleted()) { 
            mult = softcap(FAINT_HOPE_INFINITY, FAINT_HOPE_A_NEW_HOPE_SOFTCAP, FAINT_HOPE_A_NEW_HOPE_DECAY)
        }
        else if (gameData.requirements["Speed speed speed"].isCompleted()) {
            mult = FAINT_HOPE_SPEED_COEFFICIENT * Math.exp(FAINT_HOPE_SPEED_EXPONENT * (gameData.requirements["Strong Hope"].isCompleted() ? gameData.rebirthFiveTime
                : gameData.rebirthThreeTime)) * (Math.log(getUnpausedGameSpeed()) / Math.log(2))
            if (mult == Infinity) mult = FAINT_HOPE_INFINITY
            mult = softcap(mult, FAINT_HOPE_SPEED_SOFTCAP, FAINT_HOPE_A_NEW_HOPE_DECAY)
        }
        else if (gameData.requirements["Faint Hope"].isCompleted()) {
            let kickin = FAINT_HOPE_KICKIN_BASE - FAINT_HOPE_KICKIN_LOG_COEFFICIENT * Math.log(gameData.rebirthThreeTime)
            if (kickin < FAINT_HOPE_KICKIN_MIN) kickin = FAINT_HOPE_KICKIN_MIN
            mult = 1 + (gameData.rebirthThreeTime / (FAINT_HOPE_REBIRTH_DIVISOR * kickin)) * (Math.log(getUnpausedGameSpeed()) / Math.log(2))
            mult = softcap(mult, FAINT_HOPE_SOFTCAP)
        }
        return mult
    }

    const riseOfGreatHeroes = milestoneData["Rise of Great Heroes"]
    riseOfGreatHeroes.getEffect = function () {
        var mult = 1
        if (gameData.requirements["Rise of Great Heroes"].isCompleted()) {
            var countHeroes = 0
            for (const taskName in gameData.taskData) {
                if (gameData.taskData[taskName].isHero)
                    countHeroes++
            }
            mult = 1 + RISE_HEROES_NUMERATOR * countHeroes / RISE_HEROES_DENOMINATOR
        }

        return mult
    }
}
