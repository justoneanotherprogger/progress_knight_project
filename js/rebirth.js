// rebirth.js — rebirth and milestone logic

function rebirthOne() {
    gameData.rebirthOneCount += 1
    if (gameData.stats.fastest1 == null || gameData.rebirthOneTime < gameData.stats.fastest1)
        gameData.stats.fastest1 = gameData.rebirthOneTime
    gameData.rebirthOneTime = 0

    rebirthReset()
}

function rebirthTwo() {
    gameData.rebirthTwoCount += 1
    gameData.evil += getEvilGain()

    if (gameData.stats.fastest2 == null || gameData.rebirthTwoTime < gameData.stats.fastest2)
        gameData.stats.fastest2 = gameData.rebirthTwoTime
    gameData.rebirthOneTime = 0
    gameData.rebirthTwoTime = 0

    rebirthReset()
    gameData.active_challenge = ""

    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]
        task.maxLevel = 0
    }
}

function rebirthThree() {
    gameData.rebirthThreeCount += 1
    gameData.essence += getEssenceGain()
    if (gameData.essence == Infinity) gameData.essence = REBIRTH_THREE_ESSENCE_CAP
    gameData.evil = evilTranGain()


    if (gameData.stats.fastest3 == null || gameData.rebirthThreeTime < gameData.stats.fastest3)
        gameData.stats.fastest3 = gameData.rebirthThreeTime
    gameData.rebirthOneTime = 0
    gameData.rebirthTwoTime = 0
    gameData.rebirthThreeTime = 0

    const recallEffect = gameData.taskData["Cosmic Recollection"].getEffect();

    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]
        task.maxLevel = Math.floor(recallEffect * task.level);
    }

    rebirthReset()
    gameData.active_challenge = ""
}

function rebirthFour() {
    gameData.rebirthFourCount += 1
    gameData.essence = 0
    gameData.evil = 0
    gameData.dark_matter += getDarkMatterGain()

    if (gameData.metaverse.challenge_altar == 0 && gameData.perks.save_challenges == 0)  {
        for (const challenge in gameData.challenges) {
            gameData.challenges[challenge] = 0
        }
        gameData.requirements["Challenges"].completed = false
    }

    if (gameData.stats.fastest4 == null || gameData.rebirthFourTime < gameData.stats.fastest4)
        gameData.stats.fastest4 = gameData.rebirthFourTime
    gameData.rebirthOneTime = 0
    gameData.rebirthTwoTime = 0
    gameData.rebirthThreeTime = 0
    gameData.rebirthFourTime = 0

    rebirthReset()

    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]
        task.maxLevel = 0
    }

    gameData.active_challenge = ""
}

function rebirthFive() {
    gameData.rebirthFiveCount += 1
    gameData.perks_points += getMetaversePerkPointsGain()
    gameData.essence = 0
    gameData.evil = 0
    gameData.dark_matter = 0
    gameData.dark_orbs = 0
    gameData.dark_matter_shop.dark_orb_generator = 0
    gameData.dark_matter_shop.a_miracle = false

    gameData.dark_matter_shop.a_deal_with_the_chairman = 0
    gameData.dark_matter_shop.a_gift_from_god = 0
    gameData.dark_matter_shop.gotta_be_fast = 0
    gameData.dark_matter_shop.life_coach = 0
    

    if (gameData.perks.keep_dark_mater_skills == 0) {
        gameData.dark_matter_shop.speed_is_life = 0
        gameData.dark_matter_shop.your_greatest_debt = 0
        gameData.dark_matter_shop.essence_collector = 0
        gameData.dark_matter_shop.explosion_of_the_universe = 0
        gameData.dark_matter_shop.multiverse_explorer = 0
    }

    if (gameData.perks.save_challenges == 0) {
        for (const challenge in gameData.challenges) {
            gameData.challenges[challenge] = 0
        }
        gameData.requirements["Challenges"].completed = false
    }

    gameData.requirements["Dark Matter"].completed = false
    gameData.requirements["Dark Matter Skills"].completed = false
    gameData.requirements["Dark Matter Skills2"].completed = false


    if (gameData.stats.fastest5 == null || gameData.rebirthFiveTime < gameData.stats.fastest5)
        gameData.stats.fastest5 = gameData.rebirthFiveTime
    gameData.rebirthOneTime = 0
    gameData.rebirthTwoTime = 0
    gameData.rebirthThreeTime = 0
    gameData.rebirthFourTime = 0
    gameData.rebirthFiveTime = 0

    gameData.boost_active = false
    gameData.boost_timer = 0
    gameData.boost_cooldown = 0

    gameData.hypercubes = 0
    gameData.metaverse.boost_cooldown_modifier = 1
    gameData.metaverse.boost_timer_modifier = 1
    gameData.metaverse.boost_warp_modifier = METAVERSE_BOOST_WARP_DEFAULT
    gameData.metaverse.hypercube_gain_modifier = 1
    gameData.metaverse.evil_tran_gain = 0
    gameData.metaverse.essence_gain_modifier = 0
    gameData.metaverse.challenge_altar = 0
    gameData.metaverse.dark_mater_gain_modifer = 0    

    rebirthReset()

    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]
        task.maxLevel = 0
    }

    gameData.active_challenge = ""
}

function applyMilestones() {
    if (((gameData.requirements["Magic Eye"].isCompleted()) && (gameData.requirements["Rebirth note 2"].isCompleted())) ||
        (gameData.requirements["Almighty Eye"].isCompleted())){
        for (taskName in gameData.taskData) {
            const task = gameData.taskData[taskName]
            const effect = gameData.taskData["Cosmic Recollection"].getEffect()
            const maxlevel = Math.floor(task.level * (effect == 0 ? 1 : effect))
            if (maxlevel > task.maxLevel)
                task.maxLevel = maxlevel
        }
    }

    if (canSimulate()) {
        if (gameData.requirements["Deal with the Devil"].isCompleted() && gameData.requirements["Rebirth note 3"].isCompleted()) {
            if (gameData.evil == 0) gameData.evil = 1
            if (gameData.evil < getEvilGain())
                gameData.evil *= Math.pow(EVIL_GROWTH_EXPONENT_DEAL, 1)
        }
        if (gameData.requirements["Hell Portal"].isCompleted()) {
            if (gameData.evil == 0) gameData.evil = 1
            if (gameData.evil < getEvilGain()) {
                const exponent = gameData.requirements["Mind Control"].isCompleted() ? EVIL_GROWTH_EXPONENT_MIND_CONTROL : EVIL_GROWTH_EXPONENT_HELL
                gameData.evil *= Math.pow(exponent, 1)
            }
        }
        if (gameData.requirements["Galactic Emperor"].isCompleted()) {
            if (gameData.essence == 0) gameData.essence = 1
            if (gameData.essence < getEssenceGain() * PERK_INSTANT_GAIN_MULTIPLIER)
                gameData.essence *= Math.pow(ESSENCE_GROWTH_EXPONENT, 1)
            if (gameData.essence == Infinity) gameData.essence = REBIRTH_THREE_ESSENCE_CAP
        }
    }
}

function rebirthReset(set_tab_to_jobs = true) {
    if (set_tab_to_jobs) {
        if (gameData.settings.selectedTab == Tab.METAVERSE && gameData.hypercubes > 0
            || gameData.settings.selectedTab == Tab.CHALLENGES && gameData.evil > PERK_AUTO_DARK_SHOP_ORBS_THRESHOLD
            || gameData.settings.selectedTab == Tab.MILESTONES && gameData.essence > 0
            || gameData.settings.selectedTab == Tab.DARK_MATTER && gameData.dark_matter > 0
            || gameData.settings.selectedTab == Tab.REBIRTH
        ) {
            // do not switch tab
        }
        else setTab("jobs")
    }
    gameData.coins = 0
    gameData.days = DEFAULT_STARTING_AGE
    gameData.realtime = 0
    gameData.currentJob = gameData.taskData["Beggar"]
    gameData.currentProperty = gameData.itemData["Homeless"]
    gameData.currentMisc = []
    gameData.stats.EssencePerSecond = 0
    gameData.stats.maxEssencePerSecond = 0
    gameData.stats.maxEssencePerSecondRt = 0
    gameData.stats.EvilPerSecond = 0
    gameData.stats.maxEvilPerSecond = 0
    gameData.stats.maxEvilPerSecondRt = 0
    autoBuyEnabled = true

    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]
        if (task.level > task.maxLevel) task.maxLevel = task.level
        task.level = 0
        task.xp = 0
        task.xpBigInt = BigInt(0)
        task.isHero = false
        task.isFinished =false
    }

    for (const itemName in gameData.itemData) {
        var item = gameData.itemData[itemName]
        item.isHero = false
    }

    for (const key in gameData.requirements) {
        const requirement = gameData.requirements[key]
        if (requirement.completed && (permanentUnlocks.includes(key) || metaverseUnlocks.includes(key))) continue
        requirement.completed = false
    }

    // Keep milestones which were bought in the Dark Matter shop
    if (gameData.dark_matter_shop.a_miracle) {
        gameData.requirements["Magic Eye"].completed = true
        if (gameData.rebirthOneCount == 0)
            gameData.rebirthOneCount = 1
    }
}

function applyPerks() {
    if (gameData.perks.instant_evil == 1) {
        if (gameData.evil < getEvilGain() * PERK_INSTANT_GAIN_MULTIPLIER)
            gameData.evil = getEvilGain() * PERK_INSTANT_GAIN_MULTIPLIER
    }
    if (gameData.perks.instant_essence == 1) {
        if (gameData.essence < getEssenceGain() * PERK_INSTANT_GAIN_MULTIPLIER)
            gameData.essence = getEssenceGain() * PERK_INSTANT_GAIN_MULTIPLIER
        if (gameData.essence == Infinity) gameData.essence = REBIRTH_THREE_ESSENCE_CAP
    }
    if (gameData.perks.instant_dark_matter == 1) {
        if (gameData.dark_matter < getDarkMatterGain() * PERK_INSTANT_GAIN_MULTIPLIER)
            gameData.dark_matter = getDarkMatterGain() * PERK_INSTANT_GAIN_MULTIPLIER
    }
}
