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
        pushTargetEffects(key, task, task.xpMultipliers, "xp")
        task.xpMultipliers.push(getDarkMatterSkillXP)
        task.xpMultipliers.push(getTimeIsAFlatCircleXP)

        if (task instanceof Job) {
            task.incomeMultipliers.push(task.getLevelMultiplier.bind(task))
            pushTargetEffects(key, task, task.incomeMultipliers, "income")
            task.incomeMultipliers.push(getLifeCoachIncomeGain)
            task.incomeMultipliers.push(getGreed)
            task.xpMultipliers.push(getBindedItemEffect("item_personal_squire"))
        } else if (task instanceof Skill) {
            task.xpMultipliers.push(getBindedItemEffect("item_book"))
            task.xpMultipliers.push(getBindedItemEffect("item_study_desk"))
            task.xpMultipliers.push(getBindedItemEffect("item_library"))
            task.xpMultipliers.push(getBindedItemEffect("item_void_blade"))
            task.xpMultipliers.push(getBindedItemEffect("item_universe_fragment"))
            task.xpMultipliers.push(getBindedItemEffect("item_custom_galaxy"))
        }

        if (task.name in jobCategories["category_military"].items) {
            task.xpMultipliers.push(getBindedItemEffect("item_steel_longsword"))
        } else if (key == "skill_strength") {
            task.xpMultipliers.push(getBindedItemEffect("item_dumbbells"))
        } else if (task instanceof Skill && key in skillCategories["category_magic"].items) {
            task.xpMultipliers.push(getBindedItemEffect("item_sapphire_charm"))
            task.xpMultipliers.push(getBindedItemEffect("item_observatory"))
            task.xpMultipliers.push(getTaaAndMagicXpGain)
        } else if (task instanceof Skill && key in skillCategories["category_void_manipulation"].items) {
            task.xpMultipliers.push(getBindedItemEffect("item_void_necklace"))
            task.xpMultipliers.push(getBindedItemEffect("item_void_orb"))
        } else if (task.name in jobCategories["category_mage_collegium"].items) {
            task.xpMultipliers.push(getTaaAndMagicXpGain)
        } else if (task.name in jobCategories["category_the_void"].items) {
            task.xpMultipliers.push(getBindedItemEffect("item_void_armor"))
            task.xpMultipliers.push(getBindedItemEffect("item_void_dust"))
        } else if (task.name in jobCategories["category_galactic_council"].items) {
            task.xpMultipliers.push(getBindedItemEffect("item_celestial_robe"))
        } else if (task instanceof Skill && key in skillCategories["category_dark_magic"].items) {
            task.xpMultipliers.push(getEvilXpGain)
        } else if (task instanceof Skill && key in skillCategories["category_almightiness"].items) {
            task.xpMultipliers.push(getEssenceXpGain)
        } else if (task instanceof Skill && key in skillCategories["category_fundamentals"].items) {
            task.xpMultipliers.push(getBindedItemEffect("item_minds_eye"))
        } else if (task instanceof Skill && key in skillCategories["category_darkness"].items) {
            task.xpMultipliers.push(getDarknessXpGain)
        }
    }

    for (const itemName in gameData.itemData) {
        const item = gameData.itemData[itemName]
        item.expenseMultipliers = []
        pushTargetEffects(itemName, null, item.expenseMultipliers, "expense_reduction")
    }
}

function setCustomEffects() {
    const transcendentMaster = milestoneData["milestone_transcendent_master"]
    transcendentMaster.getEffect = function () {
        return gameData.requirements["milestone_transcendent_master"].isCompleted() ? TRANSCENDENT_MASTER_EFFECT : 1
    }

    const faintHope = milestoneData["milestone_faint_hope"]
    faintHope.getEffect = function () {
        var mult = 1
        if (gameData.requirements["milestone_a_new_hope"].isCompleted()) {
            mult = softcap(FAINT_HOPE_INFINITY, FAINT_HOPE_A_NEW_HOPE_SOFTCAP, FAINT_HOPE_A_NEW_HOPE_DECAY)
        }
        else if (gameData.requirements["milestone_speed_speed_speed"].isCompleted()) {
            mult = FAINT_HOPE_SPEED_COEFFICIENT * Math.exp(FAINT_HOPE_SPEED_EXPONENT * (gameData.requirements["milestone_strong_hope"].isCompleted() ? gameData.rebirthFiveTime
                : gameData.rebirthThreeTime)) * (Math.log(getUnpausedGameSpeed()) / Math.log(2))
            if (mult == Infinity) mult = FAINT_HOPE_INFINITY
            mult = softcap(mult, FAINT_HOPE_SPEED_SOFTCAP, FAINT_HOPE_A_NEW_HOPE_DECAY)
        }
        else if (gameData.requirements["milestone_faint_hope"].isCompleted()) {
            let kickin = FAINT_HOPE_KICKIN_BASE - FAINT_HOPE_KICKIN_LOG_COEFFICIENT * Math.log(gameData.rebirthThreeTime)
            if (kickin < FAINT_HOPE_KICKIN_MIN) kickin = FAINT_HOPE_KICKIN_MIN
            mult = 1 + (gameData.rebirthThreeTime / (FAINT_HOPE_REBIRTH_DIVISOR * kickin)) * (Math.log(getUnpausedGameSpeed()) / Math.log(2))
            mult = softcap(mult, FAINT_HOPE_SOFTCAP)
        }
        return mult
    }

    const riseOfGreatHeroes = milestoneData["milestone_rise_of_great_heroes"]
    riseOfGreatHeroes.getEffect = function () {
        var mult = 1
        if (gameData.requirements["milestone_rise_of_great_heroes"].isCompleted()) {
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