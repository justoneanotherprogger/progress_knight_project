// multipliers.js — multiplier setup functions

function addMultipliers() {
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]

        task.xpMultipliers = []
        if (task instanceof Job) task.incomeMultipliers = []

        task.xpMultipliers.push(task.getMaxLevelMultiplier.bind(task))
        task.xpMultipliers.push(getHappiness)
        task.xpMultipliers.push(getInspiration)
        task.xpMultipliers.push(getDarkMatterXpGain)
        pushEffectsByType("all_xp", task.xpMultipliers)
        task.xpMultipliers.push(getDarkMatterSkillXP)
        task.xpMultipliers.push(getTimeIsAFlatCircleXP)

        if (task instanceof Job) {
            task.incomeMultipliers.push(task.getLevelMultiplier.bind(task))
            pushEffectsByType("job_income", task.incomeMultipliers)
            task.incomeMultipliers.push(getLifeCoachIncomeGain)
            task.incomeMultipliers.push(getGreed)
            pushEffectsByType("job_xp", task.xpMultipliers)
            task.xpMultipliers.push(getBindedItemEffect("Personal Squire"))
        } else if (task instanceof Skill) {
            pushEffectsByType("skill_xp", task.xpMultipliers)
            task.xpMultipliers.push(getBindedItemEffect("Book"))
            task.xpMultipliers.push(getBindedItemEffect("Study Desk"))
            task.xpMultipliers.push(getBindedItemEffect("Library"))
            task.xpMultipliers.push(getBindedItemEffect("Void Blade"))
            task.xpMultipliers.push(getBindedItemEffect("Universe Fragment"))
            task.xpMultipliers.push(getBindedItemEffect("Custom Galaxy"))
        }

        if (jobCategories["Military"].includes(task.name)) {
            pushEffectsByType("army_income", task.incomeMultipliers)
            pushEffectsByType("army_xp", task.xpMultipliers)
            task.xpMultipliers.push(getBindedItemEffect("Steel Longsword"))
        } else if (task.id == "skill_strength") {
            pushEffectsByType("strength_xp", task.xpMultipliers)
            task.xpMultipliers.push(getBindedItemEffect("Dumbbells"))
        } else if (task instanceof Skill && task.id in skillCategories["Magic"]) {
            pushEffectsByType("magic_xp", task.xpMultipliers)
            task.xpMultipliers.push(getBindedItemEffect("Sapphire Charm"))
            task.xpMultipliers.push(getBindedItemEffect("Observatory"))
            task.xpMultipliers.push(getTaaAndMagicXpGain)
        } else if (task instanceof Skill && task.id in skillCategories["Void Manipulation"]) {
            task.xpMultipliers.push(getBindedItemEffect("Void Necklace"))
            task.xpMultipliers.push(getBindedItemEffect("Void Orb"))
        } else if (jobCategories["Mage Collegium"].includes(task.name)) {
            pushEffectsByType("collegium_xp", task.xpMultipliers)
            task.xpMultipliers.push(getTaaAndMagicXpGain)
            pushEffectsByType("collegium_income", task.incomeMultipliers)
        } else if (jobCategories["The Void"].includes(task.name)) {
            pushEffectsByType("void_xp", task.xpMultipliers)
            task.xpMultipliers.push(getBindedItemEffect("Void Armor"))
            task.xpMultipliers.push(getBindedItemEffect("Void Dust"))
        } else if (jobCategories["Galactic Council"].includes(task.name)) {
            task.xpMultipliers.push(getBindedItemEffect("Celestial Robe"))
            pushEffectsByType("galactic_xp", task.xpMultipliers)
        } else if (task instanceof Skill && task.id in skillCategories["Dark Magic"]) {
            task.xpMultipliers.push(getEvilXpGain)
        } else if (task instanceof Skill && task.id in skillCategories["Almightiness"]) {
            task.xpMultipliers.push(getEssenceXpGain)
        } else if (task instanceof Skill && task.id in skillCategories["Fundamentals"]) {
            task.xpMultipliers.push(getBindedItemEffect("Mind's Eye"))
        } else if (task instanceof Skill && task.id in skillCategories["Darkness"]) {
            task.xpMultipliers.push(getDarknessXpGain)
        }
    }

    for (const itemName in gameData.itemData) {
        const item = gameData.itemData[itemName]
        item.expenseMultipliers = []
        pushEffectsByType("expense_reduction", item.expenseMultipliers)
    }
}

function setCustomEffects() {
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
