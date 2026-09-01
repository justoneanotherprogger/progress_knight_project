// ui/tabs.js — tab content rendering: jobs, skills, shop, challenges, milestones, metaverse, dark matter, settings, rows, perks

function renderJobs() {
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]
        if (!(task instanceof Job)) continue

        const row = getRowByName(task.name)

        task.querySelector(".level", row).textContent = formatLevel(task.level)
        task.querySelector(".xpGain", row).textContent = task.getXpGainFormatted()
        task.querySelector(".xpLeft", row).textContent = task.getXpLeftFormatted()

        let tooltip = t("tt_" + key)

        if (!task.isHero && isHeroesUnlocked()) {
            tooltip += getHeroicRequiredTooltip(key)
        }

        const tooltipElement = task.querySelector(".tooltipText", row)
        if (tooltipElement.innerHTML != tooltip)
            tooltipElement.innerHTML = tooltip

        const maxLevel = row.getElementsByClassName("maxLevel")[0]
        maxLevel.textContent = formatLevel(task.maxLevel)
        gameData.rebirthOneCount > 0 ? maxLevel.classList.remove("hidden") : maxLevel.classList.add("hidden")

        const progressBar = task.querySelector(".progressBar", row)
        progressBar.querySelector(".name").textContent = (task.isHero ? t("great") + " " : "") + t(task.name)
        const progressFill = task.querySelector(".progressFill", row)
        renderProgressBar(task, progressFill, progressBar)

        const valueElement = task.querySelector(".value", row)
        valueElement.querySelector(".income").style.display = true
        valueElement.querySelector(".effect").style.display = false

        formatCoins(task.getIncome(), valueElement.querySelector(".income"))
    }
}

function renderSkills() {
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]

        if (!(task instanceof Skill)) continue

        const row = getRowByName(task.name)

        task.querySelector(".level", row).textContent = formatLevel(task.level)
        task.querySelector(".xpGain", row).textContent = task.getXpGainFormatted()
        task.querySelector(".xpLeft", row).textContent = task.getXpLeftFormatted()

        let tooltip = t("tt_" + key)

        if (!task.isHero && isHeroesUnlocked()) {
            tooltip += getHeroicRequiredTooltip(key)
        }

        const tooltipElement = task.querySelector(".tooltipText", row)
        if (tooltipElement.innerHTML != tooltip)
            tooltipElement.innerHTML = tooltip

        const maxLevel = task.querySelector(".maxLevel", row)
        maxLevel.textContent = formatLevel(task.maxLevel)
        gameData.rebirthOneCount > 0 ? maxLevel.classList.remove("hidden") : maxLevel.classList.add("hidden")

        const progressBar = task.querySelector(".progressBar", row)
        progressBar.querySelector(".name").textContent = (task.isHero ? t("great") + " " : "") + t(task.name)
        const progressFill = task.querySelector(".progressFill", row)
        renderProgressBar(task, progressFill, progressBar)

        const valueElement = task.querySelector(".value", row)
        valueElement.querySelector(".income").style.display = false
        valueElement.querySelector(".effect").style.display = true

        valueElement.querySelector(".effect").textContent = task.getEffectDescription()
    }
}

function renderShop() {
    for (const key in gameData.itemData) {
        const item = gameData.itemData[key]
        const row = getRowByName(item.name)
        const button = row.querySelector(".button")
        button.disabled = gameData.coins < item.getExpense()
        const name = button.querySelector(".name")

        if (isHeroesUnlocked())
            name.classList.add("legendary")
        else
            name.classList.remove("legendary")

        const active = row.querySelector(".active")
        const color = autoBuyEnabled
            ? itemCategories["Properties"].includes(item.name) ? headerRowColors["Properties_Auto"] : headerRowColors["Misc_Auto"]
            : itemCategories["Properties"].includes(item.name) ? headerRowColors["Properties"] : headerRowColors["Misc"]

        active.style.backgroundColor = gameData.currentMisc.includes(item) || item == gameData.currentProperty ? color : "white"
        row.querySelector(".effect").textContent = item.getEffectDescription()
        formatCoins(item.getExpense(), row.querySelector(".expense"))
    }
}

function renderChallenges() {
    document.getElementById("activeChallengeName").textContent = getFormattedTitle(gameData.active_challenge)

    if (gameData.active_challenge == "") {
        document.getElementById("exitChallengeDiv").hidden = true

        for (let i = 1; i <= Object.keys(gameData.challenges).length; i++) {
            const element = document.getElementById("challengeButton" + i)
            if (element != null)
                element.classList.remove("hidden")

        }
    } else {
        document.getElementById("exitChallengeDiv").hidden = false

        for (let i = 1; i <= Object.keys(gameData.challenges).length; i++) {
            const element = document.getElementById("challengeButton" + i)
            if (element != null)
                element.classList.add("hidden")
        }

        renderCurrentChallengeReward("currentChallengeReward")
    }

    //TODO (indomit)

    document.getElementById("challengeGoal1").textContent = t("challenge_1_goal", format(getChallengeGoal("an_unhappy_life")))
    document.getElementById("challengeGoal2").textContent = t("challenge_2_goal", format(getChallengeGoal("rich_and_the_poor")))
    document.getElementById("challengeGoal3").textContent = t("challenge_3_goal", format(getChallengeGoal("time_does_not_fly")))
    document.getElementById("challengeGoal4").textContent = t("challenge_4_goal", format(getChallengeGoal("dance_with_the_devil")))
    document.getElementById("challengeGoal5").textContent = t("challenge_5_goal", getFormattedChallengeTaskGoal("Chairman", Math.floor(getChallengeGoal("legends_never_die"))))
    document.getElementById("challengeGoal6").textContent = t("challenge_6_goal", getFormattedChallengeTaskGoal("Sigma Proioxis", Math.floor(100 * (getChallengeGoal("the_darkest_time") - 1))))

    const challengeRewardIds = ["challenge_1_reward", "challenge_2_reward", "challenge_3_reward", "challenge_4_reward", "challenge_5_reward", "challenge_6_reward"]
    for (let i = 0; i < 6; i++) {
        const rewardElement = document.getElementById(challengeRewardIds[i])
        if (rewardElement != null)
            rewardElement.innerHTML = t("challenge_" + (i + 1) + "_reward", format(getChallengeBonus(i + 1)))
    }

    document.getElementById("challengeReward1").hidden = gameData.challenges.an_unhappy_life == 0
    document.getElementById("challengeReward2").hidden = gameData.challenges.rich_and_the_poor == 0
    document.getElementById("challengeReward3").hidden = gameData.challenges.time_does_not_fly == 0
    document.getElementById("challengeReward4").hidden = gameData.challenges.dance_with_the_devil == 0
    document.getElementById("challengeReward5").hidden = gameData.challenges.legends_never_die == 0
    document.getElementById("challengeReward6").hidden = gameData.challenges.the_darkest_time == 0

    renderCurrentChallengeRewardValue()

    document.getElementById("challengeHappinessBuff").textContent = format(getChallengeBonus("an_unhappy_life"), 2)
    document.getElementById("challengeIncomeBuff").textContent = format(getChallengeBonus("rich_and_the_poor"), 2)
    document.getElementById("challengeTimewarpingBuff").textContent = format(getChallengeBonus("time_does_not_fly"), 2)
    document.getElementById("challengeEssenceGainBuff").textContent = format(getChallengeBonus("dance_with_the_devil"), 2)
    document.getElementById("challengeEvilGainBuff").textContent = format(getChallengeBonus("legends_never_die"), 2)
    document.getElementById("challengeDarkMatterGainBuff").textContent = format(getChallengeBonus("the_darkest_time"), 2)

    const lifespanDebuff = document.getElementById("challenge5MetaverseLifespanDebuff")
    lifespanDebuff.hidden = gameData.rebirthFiveCount == 0
    if (!lifespanDebuff.hidden)
        lifespanDebuff.textContent = t("challenge_5_meta_debuff")
}

function renderCurrentChallengeReward(blockclass) {
    const elements = document.getElementsByClassName(blockclass)
    for (const elementReward of elements) {
        if (elementReward.classList.contains(gameData.active_challenge)) {
            elementReward.classList.remove("hidden")

            if (getChallengeBonus(gameData.active_challenge, true) > getChallengeBonus(gameData.active_challenge))
                elementReward.classList.add("reward")
            else
                elementReward.classList.remove("reward")
        }
        else
            elementReward.classList.add("hidden")
    }
}

function renderCurrentChallengeRewardValue(side_bar = false) {

    for (var i = 1; i <= Object.keys(gameData.challenges).length; i++) {
        document.getElementById((side_bar ? "sidebarC" : "c") + "urrentChallengeBuff" + i).textContent = format(getChallengeBonus(i, true), 2)
        if (side_bar)
            document.getElementById("sidebarChallengeBuff" + i).textContent = format(getChallengeBonus(i), 2)
    }    
}


function renderMilestones() {
    for (const key in milestoneData) {
        const milestone = milestoneData[key]
        const row = getRowByName(milestone.name)
        row.querySelector(".essence").textContent = format(milestone.expense)


        let desc = milestone.description
        if (milestone.getEffect != null)
            desc = "x" + format(milestone.getEffect(), 1) + " " + desc

        if (milestone.baseData.effect != null)
            desc = "x" + format(milestone.baseData.effect, 0) + " " + desc

        row.querySelector(".description").textContent = desc
    }
}

function renderDarkMatterShopButton(elemName, condition) {
    document.getElementById(elemName).disabled = !condition    
}

function renderBoostButton(elemName) {
    // render boost button to look nicier :)
    const boostButton = document.getElementById(elemName)
    if (gameData.boost_active) {
        // active
        boostButton.classList.add("perk-boost-active")
        boostButton.classList.remove("perk-boost-cooldown")
    }
    else if (gameData.boost_cooldown <= 0) {
        // ready
        boostButton.classList.remove("perk-boost-active")
        boostButton.classList.remove("perk-boost-cooldown")
    }
    else {
        // cooldown
        boostButton.classList.add("perk-boost-cooldown")
        boostButton.classList.remove("perk-boost-active")
    }

    boostButton.disabled = !canApplyBoost()
}

function renderMetaverse() {
    document.getElementById("currentHypercubesCap").hidden = getHypercubeCap() == Infinity
    document.getElementById("currentHypercubesCapValue").textContent = format(getHypercubeCap())

    for (var i = 0; i < 3; i++) {
        const elem = document.getElementById("timeTillNextHypercubePower" + (i + 1))
        const nextH = getNextPowerOfNumber(gameData.hypercubes * Math.pow(10, i))
        elem.textContent =
            format(nextH) + " Hypercubes in " + formatTime(getTimeTillNextHypercubePower(i))
        if (i>0)
            elem.hidden = nextH > getHypercubeCap() || gameData.perks_points == 0 || gameData.hypercubes < 1e20 * Math.pow(10, i)
        else
            elem.hidden = false
    }

    renderBoostButton("boostMetaButton")

    document.getElementById("hypercubesMetaDisplay").textContent = format(gameData.hypercubes)
    document.getElementById("hypercubesBonusMetaDisplay").textContent = "x" + format(getHypercubeGeneration() / 0.03)
    document.getElementById("boostCooldownMetaDisplay").textContent = getBoostCooldownString()  

document.getElementById("reduceBoostCooldown").innerHTML = t("current_cooldown", formatTime(getBoostCooldownSeconds()))
    document.getElementById("reduceBoostCooldownCost").textContent = format(reduceBoostCooldownCost())
    document.getElementById("reduceBoostCooldownBuyButton").disabled = !canBuyReduceBoostCooldown()

    document.getElementById("boostDuration").innerHTML = t("current_duration", formatTime(getBoostTimeSeconds()))
    document.getElementById("boostDurationCost").textContent = format(boostDurationCost())
    document.getElementById("boostDurationBuyButton").disabled = !canBuyBoostDuration()

    document.getElementById("hypercubeGain").innerHTML = t("current_gain_per_s", format(getHypercubeGeneration() * getUnpausedGameSpeed(),2))
    document.getElementById("hypercubeGainCost").textContent = format(hypercubeGainCost())
    document.getElementById("hypercubeGainBuyButton").disabled = !canBuyHypercubeGain()

    document.getElementById("evilTranGain").innerHTML = t("current_gain", format(evilTranGain(), 2))
    document.getElementById("evilTranCost").textContent = format(evilTranCost())
    document.getElementById("evilTranBuyButton").disabled = !canBuyEvilTran()

    document.getElementById("essenceMultGain").innerHTML = t("current_multiplier", format(essenceMultGain(), 2))
    document.getElementById("essenceMultCost").textContent = format(essenceMultCost())
    document.getElementById("essenceMultButton").disabled = !canBuyEssenceMult()

    document.getElementById("challengeAltarCost").textContent = format(challengeAltarCost())
    document.getElementById("challengeAltarState").textContent = gameData.metaverse.challenge_altar == 0 ? "" : "Active"
    document.getElementById("challengeAltarButton").disabled = !canBuyChallengeAltar()
    if (gameData.metaverse.challenge_altar == 0)
        document.getElementById("challengeAltarButton").classList.remove("hidden")
    else
        document.getElementById("challengeAltarButton").classList.add("hidden")

    document.getElementById("darkMatterMultGain").textContent = format(darkMatterMultGain(), 2)
    document.getElementById("darkMatterMultCost").textContent = format(darkMatterMultCost())
    document.getElementById("darkMaterMultButton").disabled = !canBuyDarkMatterMult()

    // Perks
    renderPerks()
}

function renderPerks() {
    document.getElementById("perkPointDisplay").textContent = formatTreshold(gameData.perks_points)
    document.getElementById("totalPerkPointDisplay").textContent = formatTreshold(getTotalPerkPoints())
    // Info

    if (gameData.requirements["The End is near"].isCompleted()) {
        document.getElementById("mppInfo").hidden = true
        document.getElementById("mppInfo2").hidden = false
        document.getElementById("mppDMBuff").innerHTML = t("perks_dm_bonus", format(getUnspentPerksDarkmatterGainBuff()))
    }
    else {
        document.getElementById("mppInfo").hidden = false
        document.getElementById("mppInfo2").hidden = true
        document.getElementById("mppInfo").innerHTML = t("perks_info")
    }



    // PerkButtons
    const total_mpp = getTotalPerkPoints()
    let hide_next = false
    let index = 0

    for (const perkName of getSortedPerks()) {
        const key = perkName[0]
        const button = document.getElementById("id" + key)

        if (hide_next)
            button.classList.add("hidden")
        else {
            button.classList.remove("hidden")

            if (gameData.perks[key] == 0)
                button.classList.remove("active-perk")
            else
                button.classList.add("active-perk")

            const perk_cost = getPerkCost(key)

            if (total_mpp >= perk_cost) {
                button.getElementsByClassName("perkName")[0].textContent = getMetaversePerkName(key)
                button.classList.remove("perk-locked")
            }
            else {
                button.getElementsByClassName("perkName")[0].textContent = "LOCKED"
                button.classList.add("perk-locked")
                if (index % 2 == 1)
                    hide_next = true
            }
        }
        index++
    }
}

function renderDarkMatter() {
    // Display currency
    document.getElementById("darkMatterShopDisplay").textContent = format(gameData.dark_matter)
    document.getElementById("darkMatterSkillsDisplay").textContent = gameData.settings.layout == 0 ? "" : format(gameData.dark_matter)    
    document.getElementById("darkOrbsShopDisplay").textContent = formatTreshold(gameData.dark_orbs)

    // Dark Matter Shop
    document.getElementById("dark_orb_generator_desc").innerHTML = t("dark_orb_generator_desc", format(getDarkOrbGeneration()))
    document.getElementById("darkOrbGeneratorCost").textContent = format(getDarkOrbGeneratorCost())

    document.getElementById("aDealWithTheChairmanCost").textContent = format(getADealWithTheChairmanCost())
    document.getElementById("a_deal_with_chairman_desc").innerHTML = t("a_deal_with_chairman_desc", format(getTaaAndMagicXpGain()))

    document.getElementById("a_gift_from_god_desc").innerHTML = t("a_gift_from_god_desc", format(getAGiftFromGodEssenceGain()))
    document.getElementById("aGiftFromGodCost").textContent = format(getAGiftFromGodCost())

    document.getElementById("gotta_be_fast_desc").innerHTML = t("gotta_be_fast_desc", format(getGottaBeFastGain(), 2))
    document.getElementById("gottaBeFastCost").textContent = format(getGottaBeFastCost())

    document.getElementById("life_coach_desc").innerHTML = t("life_coach_desc", format(getLifeCoachIncomeGain()))
    document.getElementById("lifeCoachCost").textContent = format(getLifeCoachCost())

    if (gameData.dark_matter_shop.a_miracle)
        document.getElementById("aMiracleBuyButton").classList.add("hidden")

    if (getDarkOrbGeneration() != Infinity)
        document.getElementById("darkOrbGeneratorBuyButton").classList.remove("hidden")
    else
        document.getElementById("darkOrbGeneratorBuyButton").classList.add("hidden")

    // enable/disable buttons

    renderDarkMatterShopButton("darkOrbGeneratorBuyButton", canBuyDarkOrbGenerator())
    renderDarkMatterShopButton("aMiracleBuyButton", canBuyAMiracle())
    renderDarkMatterShopButton("aDealWithTheChairmanBuyButton", canBuyADealWithTheChairman())
    renderDarkMatterShopButton("aGiftFromGodBuyButton", canBuyAGiftFromGod())
    renderDarkMatterShopButton("gottaBeFastBuyButton", canBuyGottaBeFast())
    renderDarkMatterShopButton("lifeCoachBuyButton", canBuyLifeCoach())

    // Dark Matter Ability tree
    renderSkillTreeButton(document.getElementById("speedIsLife1"), gameData.dark_matter_shop.speed_is_life != 0, [1, 3].includes(gameData.dark_matter_shop.speed_is_life), gameData.dark_matter >= 100)
    renderSkillTreeButton(document.getElementById("speedIsLife2"), gameData.dark_matter_shop.speed_is_life != 0, [2, 3].includes(gameData.dark_matter_shop.speed_is_life), gameData.dark_matter >= 100)

    renderSkillTreeButton(document.getElementById("yourGreatestDebt1"), gameData.dark_matter_shop.your_greatest_debt != 0, [1, 3].includes(gameData.dark_matter_shop.your_greatest_debt), gameData.dark_matter >= 1000)
    renderSkillTreeButton(document.getElementById("yourGreatestDebt2"), gameData.dark_matter_shop.your_greatest_debt != 0, [2, 3].includes(gameData.dark_matter_shop.your_greatest_debt), gameData.dark_matter >= 1000)

    renderSkillTreeButton(document.getElementById("essenceCollector1"), gameData.dark_matter_shop.essence_collector != 0, [1, 3].includes(gameData.dark_matter_shop.essence_collector), gameData.dark_matter >= 10000)
    renderSkillTreeButton(document.getElementById("essenceCollector2"), gameData.dark_matter_shop.essence_collector != 0, [2, 3].includes(gameData.dark_matter_shop.essence_collector), gameData.dark_matter >= 10000)

    renderSkillTreeButton(document.getElementById("explosionOfTheUniverse1"), gameData.dark_matter_shop.explosion_of_the_universe != 0, [1, 3].includes(gameData.dark_matter_shop.explosion_of_the_universe), gameData.dark_matter >= 100000)
    renderSkillTreeButton(document.getElementById("explosionOfTheUniverse2"), gameData.dark_matter_shop.explosion_of_the_universe != 0, [2, 3].includes(gameData.dark_matter_shop.explosion_of_the_universe), gameData.dark_matter >= 100000)

    renderSkillTreeButton(document.getElementById("multiverseExplorer1"), gameData.dark_matter_shop.multiverse_explorer != 0, [1, 3].includes(gameData.dark_matter_shop.multiverse_explorer), gameData.dark_matter >= 100000000)
    renderSkillTreeButton(document.getElementById("multiverseExplorer2"), gameData.dark_matter_shop.multiverse_explorer != 0, [2, 3].includes(gameData.dark_matter_shop.multiverse_explorer), gameData.dark_matter >= 100000000)

    const effects = document.getElementsByClassName("negative-effect")
    for (const effect of effects) {
        effect.hidden = (gameData.perks.positive_dark_mater_skills == 1)
    }

    // turn off OR
    const ors = document.getElementsByClassName("darkMatterSkillOR")
    for (const elem of ors) {
        elem.hidden = (gameData.perks.both_dark_mater_skills == 1)
    }
}

function renderSettings() {
    // Stats
    const date = new Date(gameData.stats.startDate)
    document.getElementById("startDateDisplay").textContent = date.toLocaleDateString()

    const currentDate = new Date()
    document.getElementById("playedDaysDisplay").textContent = format((currentDate.getTime() - date.getTime()) / (1000 * 3600 * 24), 2)
    document.getElementById("playedRealTimeDisplay").textContent = formatTime(gameData.realtimeRun)

    document.getElementById("playedGameTimeDisplay").textContent = format(gameData.totalDays, 2)

    if (gameData.rebirthOneCount > 0)
        document.getElementById("statsRebirth1").classList.remove("hidden")
    else
        document.getElementById("statsRebirth1").classList.add("hidden")

    if (gameData.rebirthTwoCount > 0)
        document.getElementById("statsRebirth2").classList.remove("hidden")
    else
        document.getElementById("statsRebirth2").classList.add("hidden")

    if (gameData.rebirthThreeCount > 0)
        document.getElementById("statsRebirth3").classList.remove("hidden")
    else
        document.getElementById("statsRebirth3").classList.add("hidden")

    if (gameData.rebirthFourCount > 0)
        document.getElementById("statsRebirth4").classList.remove("hidden")
    else
        document.getElementById("statsRebirth4").classList.add("hidden")

    if (gameData.rebirthFiveCount > 0)
        document.getElementById("statsRebirth5").classList.remove("hidden")
    else
        document.getElementById("statsRebirth5").classList.add("hidden")

    document.getElementById("rebirthOneCountDisplay").textContent = gameData.rebirthOneCount
    document.getElementById("rebirthTwoCountDisplay").textContent = gameData.rebirthTwoCount
    document.getElementById("rebirthThreeCountDisplay").textContent = gameData.rebirthThreeCount
    document.getElementById("rebirthFourCountDisplay").textContent = gameData.rebirthFourCount
    document.getElementById("rebirthFiveCountDisplay").textContent = gameData.rebirthFiveCount

    document.getElementById("rebirthOneTimeDisplay").textContent = formatTime(gameData.rebirthOneTime, true)
    document.getElementById("rebirthTwoTimeDisplay").textContent = formatTime(gameData.rebirthTwoTime, true)
    document.getElementById("rebirthThreeTimeDisplay").textContent = formatTime(gameData.rebirthThreeTime, true)
    document.getElementById("rebirthFourTimeDisplay").textContent = formatTime(gameData.rebirthFourTime, true)
    document.getElementById("rebirthFiveTimeDisplay").textContent = formatTime(gameData.rebirthFiveTime, true)

    document.getElementById("rebirthOneFastestDisplay").textContent = formatTime(gameData.stats.fastest1, true)
    document.getElementById("rebirthTwoFastestDisplay").textContent = formatTime(gameData.stats.fastest2, true)
    document.getElementById("rebirthThreeFastestDisplay").textContent = formatTime(gameData.stats.fastest3, true)
    document.getElementById("rebirthFourFastestDisplay").textContent = formatTime(gameData.stats.fastest4, true)
    document.getElementById("rebirthFiveFastestDisplay").textContent = formatTime(gameData.stats.fastest5, true)

    // Gain Stats
    document.getElementById("evilPerSecondDisplay").textContent = format(gameData.stats.EvilPerSecond, 3)
    document.getElementById("maxEvilPerSecondDisplay").textContent = format(gameData.stats.maxEvilPerSecond, 3)
    document.getElementById("maxEvilPerSecondRtDisplay").textContent = formatTime(gameData.stats.maxEvilPerSecondRt)

    document.getElementById("essencePerSecondDisplay").textContent = format(gameData.stats.EssencePerSecond, 3)
    document.getElementById("maxEssencePerSecondDisplay").textContent = format(gameData.stats.maxEssencePerSecond, 3)
    document.getElementById("maxEssencePerSecondRtDisplay").textContent = formatTime(gameData.stats.maxEssencePerSecondRt)

    // Challenge Stats
    document.getElementById("stats_challenge_1").hidden = gameData.challenges.an_unhappy_life == 0
    document.getElementById("stats_challenge_2").hidden = gameData.challenges.rich_and_the_poor == 0
    document.getElementById("stats_challenge_3").hidden = gameData.challenges.time_does_not_fly == 0
    document.getElementById("stats_challenge_4").hidden = gameData.challenges.dance_with_the_devil == 0
    document.getElementById("stats_challenge_5").hidden = gameData.challenges.legends_never_die == 0
    document.getElementById("stats_challenge_6").hidden = gameData.challenges.the_darkest_time == 0

    document.getElementById("challengeHappinessBuffDisplay").textContent = format(getChallengeBonus("an_unhappy_life"), 2)
    document.getElementById("challengeIncomeBuffDisplay").textContent = format(getChallengeBonus("rich_and_the_poor"), 2)
    document.getElementById("challengeTimewarpingBuffDisplay").textContent = format(getChallengeBonus("time_does_not_fly"), 2)
    document.getElementById("challengeEssenceGainBuffDisplay").textContent = format(getChallengeBonus("dance_with_the_devil"), 2)
    document.getElementById("challengeEvilGainBuffDisplay").textContent = format(getChallengeBonus("legends_never_die"), 2)
    document.getElementById("challengeDarkMaterGainBuffDisplay").textContent = format(getChallengeBonus("the_darkest_time"), 2)
}

function renderRequirements() {
    for (const key in gameData.requirements) {
        const requirement = gameData.requirements[key]
        for (const element of requirement.elements) {
            if (requirement.isCompleted()) {
                element.classList.remove("hidden")
            } else {
                element.classList.add("hidden")
            }
        }
    }
}

function renderHeaderRows(categories) {
    for (const categoryName in categories) {
        const className = removeSpaces(categoryName)
        const headerRow = document.getElementsByClassName(className)[0]
        const categoryElement = headerRow.getElementsByClassName("category")[0].querySelector(".name")
        if (categoryElement)
            categoryElement.textContent = t(categoryName)
        else
            headerRow.getElementsByClassName("category")[0].textContent = t(categoryName)
        const maxLevelElement = headerRow.querySelector(".maxLevel")
        gameData.rebirthOneCount > 0 ? maxLevelElement.classList.remove("hidden") : maxLevelElement.classList.add("hidden")
    }
}

function createRequiredRow(categoryName) {
    const requiredRow = document.querySelector(".requiredRowTemplate").content.firstElementChild.cloneNode(true)
    const graySpans = requiredRow.querySelectorAll("span.w3-text-gray")
    graySpans[0].textContent = t("required")
    if (graySpans.length > 1) graySpans[1].textContent = t("next_effect")
    requiredRow.classList.add("requiredRow")
    requiredRow.classList.add(removeSpaces(categoryName))
    requiredRow.id = "req_" + categoryName
    return requiredRow
}

function createHeaderRow(templates, categoryType, categoryName) {
    const headerRow = templates.headerRow.content.firstElementChild.cloneNode(true)
    const categoryElement = headerRow.getElementsByClassName("category")[0]

    if (categoryType == itemCategories) {
        categoryElement.getElementsByClassName("name")[0].textContent = t(categoryName)
    } else {
        categoryElement.textContent = t(categoryName)
    }


    if (categoryType == jobCategories || categoryType == skillCategories) {
        headerRow.getElementsByClassName("valueType")[0].textContent = categoryType == jobCategories ? t("income_day") : t("effect")
        const headers = headerRow.getElementsByTagName("th")
        headers[1].textContent = t("level")
        headers[3].textContent = t("xp_day")
        headers[4].textContent = t("xp_left")
        headers[5].textContent = t("max_level")
    } else if (categoryType == itemCategories) {
        const headers = headerRow.getElementsByTagName("th")
        headers[1].textContent = t("active")
        headers[2].textContent = t("effect")
        headers[3].textContent = t("cost")
    }

    headerRow.style.backgroundColor = headerRowColors[categoryName]
    headerRow.style.color = (gameData.settings.theme == 2) ? headerRowTextColors[categoryName] : "#ffffff"
    headerRow.classList.add(removeSpaces(categoryName))
    headerRow.classList.add("headerRow")

    return headerRow
}

function createRow(templates, name, categoryName, categoryType) {
    const row = templates.row.content.firstElementChild.cloneNode(true)
    row.getElementsByClassName("name")[0].textContent = t(name)
    row.getElementsByClassName("tooltipText")[0].textContent = t("tt_" + name)
    row.id = "row" + removeSpaces(removeStrangeCharacters(name))

    if (categoryType == itemCategories) {
        row.getElementsByClassName("button")[0].onclick = categoryName == "Properties" ? () => { setCurrentProperty(name) } : () => { setMisc(name) }
    }

    return row
}

function createAllRows(categoryType, tableId) {
    const templates = {
        headerRow: document.getElementsByClassName(
            categoryType == itemCategories
                ? "headerRowItemTemplate"
                : (categoryType == milestoneCategories ? "headerRowMilestoneTemplate" : "headerRowTaskTemplate")

        )[0],
        row: document.getElementsByClassName(
            categoryType == itemCategories
                ? "rowItemTemplate"
                : (categoryType == milestoneCategories ? "rowMilestoneTemplate": "rowTaskTemplate"))[0],
    }

    const table = document.getElementById(tableId)

    for (const categoryName in categoryType) {
        const headerRow = createHeaderRow(templates, categoryType, categoryName)
        table.appendChild(headerRow)

        const category = categoryType[categoryName]
        category.forEach(function(name) {
            const row = createRow(templates, name, categoryName, categoryType)
            table.appendChild(row)
        })

        const requiredRow = createRequiredRow(categoryName)
        table.append(requiredRow)
    }
}

function updateRequiredRows(data, categoryType) {
    const requiredRows = document.getElementsByClassName("requiredRow")
    for (const requiredRow of requiredRows) {
        let nextEntity = null
        const category = categoryType[requiredRow.id.substring(4)]
        if (category == null) {continue}
        for (let i = 0; i < category.length; i++) {
            const entityName = category[i]
            if (i >= category.length - 1) break

            const requirements = gameData.requirements[entityName]
            if (requirements && i == 0) {
                if (!requirements.isCompleted()) {
                    nextEntity = data[entityName]
                    break
                }
            }

            const nextIndex = i + 1
            if (nextIndex >= category.length) {break}
            const nextEntityName = category[nextIndex]
            nextEntityRequirements = gameData.requirements[nextEntityName]

            if (!nextEntityRequirements.isCompleted()) {
                nextEntity = data[nextEntityName]
                break
            }
        }

        if (nextEntity == null) {
            requiredRow.classList.add("hiddenTask")
        } else {
            requiredRow.classList.remove("hiddenTask")
            const requirementObject = gameData.requirements[nextEntity.name]            
            const requirements = requirementObject.requirements

            const coinElement = requiredRow.querySelector(".coins")
            const levelElement = requiredRow.querySelector(".levels")
            const evilElement = requiredRow.querySelector(".evil")
            const essenceElement = requiredRow.querySelector(".essence")
            const darkMatterElement = requiredRow.querySelector(".darkMatter")
            const hypercubeElement = requiredRow.querySelector(".hypercube")
            const effectElement = requiredRow.querySelector(".effect")
            const effectValueElement = requiredRow.querySelector(".effectValue")

            if (!coinElement || !levelElement || !evilElement || !essenceElement ||
                !darkMatterElement || !hypercubeElement || !effectElement || !effectValueElement) {
                console.warn("requiredRow повреждён:", requiredRow.id, requiredRow.outerHTML.slice(0, 300))
                continue
            }

            coinElement.classList.add("hiddenTask")
            levelElement.classList.add("hiddenTask")
            evilElement.classList.add("hiddenTask")
            essenceElement.classList.add("hiddenTask")
            darkMatterElement.classList.add("hiddenTask")
            hypercubeElement.classList.add("hiddenTask")
            effectElement.classList.add("hiddenTask")

            let finalText = ""
            let effectText = ""
            if (data == gameData.taskData) {
                const task = gameData.taskData[nextEntity.name]
                effectElement.classList.remove("hiddenTask")
                effectValueElement.textContent = task.unlocked ? (task.baseData.description != null ? t(task.baseData.description) : t("reward_income")) : t("unknown")

                if (requirementObject instanceof EvilRequirement) {
                    evilElement.classList.remove("hiddenTask")                    
                    evilElement.textContent = format(requirements[0].requirement) + " " + t("evil")                   
                } else if (requirementObject instanceof EssenceRequirement) {
                    essenceElement.classList.remove("hiddenTask")
                    essenceElement.textContent = format(requirements[0].requirement) + " " + t("essence")
                } else if (requirementObject instanceof DarkMatterRequirement) {
                    darkMatterElement.classList.remove("hiddenTask")
                    darkMatterElement.textContent = format(requirements[0].requirement) + " " + t("dark_matter")
                } else if (requirementObject instanceof MetaverseRequirement) {

                } else if (requirementObject instanceof HypercubeRequirement) {
                    hypercubeElement.classList.remove("hiddenTask")
                    hypercubeElement.textContent = format(requirements[0].requirement) + " " + t("hypercubes")
                } else if (requirementObject instanceof AgeRequirement) {
                    essenceElement.classList.remove("hiddenTask")
                    essenceElement.textContent = t("age") + " " + format(requirements[0].requirement)
                }
                else {
                    levelElement.classList.remove("hiddenTask")
                    for (const requirement of requirements) {
                        const task = gameData.taskData[requirement.task]
                        if (task.level >= requirement.requirement) continue
                        finalText += " " + t(requirement.task) + " " + formatLevel(task.level) + "/" + formatLevel(requirement.requirement) + ","
                    }
                    finalText = finalText.substring(0, finalText.length - 1)
                    levelElement.textContent = finalText
                }
            }
            else if (data == gameData.itemData) {
                coinElement.classList.remove("hiddenTask")
                formatCoins(requirements[0].requirement, coinElement)

                const item = gameData.itemData[nextEntity.name]
                
                effectElement.classList.remove("hiddenTask")
                effectValueElement.textContent = item.unlocked ? (item.baseData.description != null ? t(item.baseData.description) : t("reward_happiness")) : t("unknown")
            }
            else if (data == milestoneData) {
                essenceElement.classList.remove("hiddenTask")
                essenceElement.textContent = format(requirements[0].requirement) + " " + t("essence")

                const milestone = milestoneData[nextEntity.name]
                if (milestone.baseData.description != null) {
                    effectElement.classList.remove("hiddenTask")
                    effectValueElement.textContent = (gameData.stats.maxEssenceReached > milestone.expense) ? t(milestone.baseData.description) : t("unknown")
                }
            }
        }
    }
}

function getHeroicRequiredTooltip(task) {
    const requirementObject = gameData.requirements[task]
    const requirements = requirementObject.requirements
    const prev = getPreviousTaskInCategory(task)

    let tooltip = "<br> <span style=\"color: red\">" + t("required") + "</span>: <span style=\"color: orange\">"
    let reqlist = ""
    let prevReq = ""

    if (prev != "") {
        var prevTask = gameData.taskData[prev]
        var prevlvl = (prevTask.isHero ? prevTask.level : 0)
        if (prevlvl < 20)
            prevReq = t("great") + " " + t(prev) + " " + prevlvl + "/20<br>"
    }

    if (requirementObject instanceof EvilRequirement) {
        reqlist += format((requirements[0].herequirement == undefined) ? requirements[0].requirement : requirements[0].herequirement) + " " + t("evil") + "<br>"
    } else if (requirementObject instanceof EssenceRequirement) {
        reqlist += format((requirements[0].herequirement == undefined) ? requirements[0].requirement : requirements[0].herequirement) + " " + t("essence") + "<br>"
    } else if (requirementObject instanceof AgeRequirement) {
        reqlist += t("age") + " " + format((requirements[0].herequirement == undefined) ? requirements[0].requirement : requirements[0].herequirement) + "<br>"
    } else if (requirementObject instanceof DarkMatterRequirement) {
        reqlist += format((requirements[0].herequirement == undefined) ? requirements[0].requirement : requirements[0].herequirement) + " " + t("dark_matter") + "<br>"
    } else {
        for (const requirement of requirements) {
            const task_check = gameData.taskData[requirement.task]

            const reqvalue = (requirement.herequirement == null ? requirement.requirement : requirement.herequirement)

            if (task_check.isHero && task_check.level >= reqvalue) continue
            if (prev != "" && task_check.name == prevTask.name) {
                if (reqvalue <= 20)
                    continue
                else
                    prevReq = " " + t("great") + " " + t(requirement.task) + " " + (task_check.isHero ? task_check.level : 0) + "/" + reqvalue + "<br>"
            } else {
                reqlist += " " + t("great") + " " + t(requirement.task) + " " + (task_check.isHero ? task_check.level : 0) + "/" + reqvalue + "<br>"
            }
        }
    }

    reqlist += prevReq
    reqlist = reqlist.substring(0, reqlist.length - 4)
    tooltip += reqlist + "</span>"
    return tooltip
}

function renderChangelog() {
    const container = document.getElementById("changelog")
    if (!container) return

    const langLabels = { en: t("lang_en"), ru: t("lang_ru") }
    let html = `<table style="width:100%; border-collapse:collapse;">`
    html += `<tr><th style="text-align:left; width:50%; color:inherit;">${langLabels.en}</th><th style="text-align:left; color:inherit;">${langLabels.ru}</th></tr>`
    for (const entry of CHANGELOG) {
        const items = entry["en"]
        const itemsRu = entry["ru"] || []
        const maxItems = Math.max(items.length, itemsRu.length)
        html += `<tr><td colspan="2" style="text-align:center; font-weight:bold; padding-top:0.8em; padding-bottom:0.2em;">version ${entry["version"]} / ${entry["date"]}</td></tr>`
        for (let i = 0; i < maxItems; i++) {
            html += `<tr>`
            html += `<td style="padding:0.15em 0.5em 0.15em 0; vertical-align:top;">${items[i] || ""}</td>`
            html += `<td style="padding:0.15em 0 0.15em 0.5em; vertical-align:top;">${itemsRu[i] || ""}</td>`
            html += `</tr>`
        }
    }
    html += `</table>`
    container.innerHTML = html
}

function renderSkillTreeButton(element, categoryBought, elementBought, canBuy) {
    if (gameData.perks.both_dark_mater_skills == 0) {

        element.disabled = categoryBought | !canBuy

        if (categoryBought) {
            if (elementBought) {
                element.textContent = "Accepted"
                element.classList.add("w3-green")
                element.classList.remove("w3-red")
            } else {
                element.textContent = "Rejected"
                element.classList.add("w3-red")
                element.classList.remove("w3-green")
            }
        }
        else {
            element.textContent = "Buy"
            element.classList.remove("w3-green")
            element.classList.remove("w3-red")
        }
    }
    else {
        element.disabled = elementBought

        if (elementBought) {
            element.textContent = "Accepted"
            element.classList.add("w3-green")
            element.classList.remove("w3-red")
        } else {
            element.textContent = "Buy"
            element.classList.remove("w3-green")
            element.classList.remove("w3-red")
        }
    }
}

function getSortedPerks() {
    let sortable = [];
    for (var perkname in perks_cost) {
        sortable.push([perkname, perks_cost[perkname]]);
    }

    sortable.sort(function (a, b) {
        return a[1] - b[1];
    });

    return sortable
}
