// calculations.js — pure calculation functions

function getHeroXpGainMultipliers(job) {
    let baseMult = job instanceof Job ? HERO_XP_BASE_JOB : 1
    for (const { requirement, multiplier, jobExtra } of HERO_MILESTONE_MULTIPLIERS) {
        if (gameData.requirements[requirement].isCompleted()) {
            baseMult *= multiplier
            if (jobExtra && job instanceof Job) baseMult *= jobExtra
        }
    }
    return baseMult
}

function getDarknessXpGain() {
    return gameData.requirements["Strange Magic"].isCompleted() ? STRANGE_MAGIC_MULTIPLIER : 1
}

function getHappiness() {
    if (gameData.active_challenge == "legends_never_die" || gameData.active_challenge == "the_darkest_time") return 1
    const meditationEffect = getBindedTaskEffect("Meditation")
    const butlerEffect = getBindedItemEffect("Butler")
    const mindreleaseEffect = getBindedTaskEffect("Mind Release")
    const multiverseFragment = getBindedItemEffect("Multiverse Fragment")
    const godsBlessings = gameData.requirements["God's Blessings"].isCompleted() ? GODS_BLESSINGS_MULTIPLIER : 1
    const stairWayToHeaven = getBindedItemEffect("Stairway to heaven")
    const happiness = godsBlessings * meditationEffect() * butlerEffect() * mindreleaseEffect()
        * multiverseFragment() * gameData.currentProperty.getEffect() * getChallengeBonus("an_unhappy_life") * stairWayToHeaven()
    if (gameData.active_challenge == "dance_with_the_devil") return Math.pow(happiness, CHALLENGE_DANCE_HAPPINESS_EXPONENT)
    if (gameData.active_challenge == "an_unhappy_life") return Math.pow(happiness, CHALLENGE_UNHAPPY_HAPPINESS_EXPONENT)
    return happiness
}

function getEvil() {
    return gameData.evil
}

function getEvilXpGain() {
    if (gameData.active_challenge == "legends_never_die" || gameData.active_challenge == "the_darkest_time") return 1
    if (gameData.active_challenge == "dance_with_the_devil") {
        const evilEffect = (Math.pow(getEvil(), EVIL_EFFECT_EXPONENT) / EVIL_EFFECT_DIVISOR) - 1
        return evilEffect < 0 ? 0 : evilEffect
    }
    return getEvil()
}

function getEssence() {
    return gameData.essence
}

function getEssenceXpGain() {
    if (gameData.active_challenge == "dance_with_the_devil" || gameData.active_challenge == "the_darkest_time") {
        const essenceEffect = (Math.pow(getEssence(), ESSENCE_EFFECT_EXPONENT) / ESSENCE_EFFECT_DIVISOR) - 1
        return essenceEffect <= ESSENCE_EFFECT_MIN_THRESHOLD ? 0 : essenceEffect
    }
    return getEssence()
}

function applyMultipliers(value, multipliers) {
    var finalMultiplier = 1
    multipliers.forEach((multiplierFunction) => {
        finalMultiplier *= multiplierFunction()
    })
    return value * finalMultiplier
}

function applySpeed(value) {
    if (value == 0)
        return 0
    if (value == Infinity)
        return Infinity
    return value * getGameSpeed() / updateSpeed
}

function applyUnpausedSpeed(value) {
    if (value == 0)
        return 0
    if (value == Infinity)
        return Infinity
    return value * getUnpausedGameSpeed() / updateSpeed
}

function applySpeedOnBigInt(value) {
    if (value == 0n)
        return 0n
    return value * BigInt(Math.floor(getGameSpeed())) / BigInt(Math.floor(updateSpeed))
}

function getEvilGain() {
    const evilControl = gameData.taskData["Evil Control"]
    const bloodMeditation = gameData.taskData["Blood Meditation"]
    const absoluteWish = gameData.taskData ["Absolute Wish"]
    const oblivionEmbodiment = gameData.taskData ["Void Embodiment"]
    const yingYang = gameData.taskData["Yin Yang"]
    const inferno = gameData.requirements["Inferno"].isCompleted() ? INFERNO_MULTIPLIER : 1    
    const theDevilInsideYou = gameData.requirements["The Devil inside you"].isCompleted() ? THE_DEVIL_INSIDE_YOU_MULTIPLIER : 1
    const stairWayToHell = getBindedItemEffect("Highway to hell")
    const evilBooster = (gameData.perks.evil_booster == 1) ? EVIL_BOOSTER_MULTIPLIER : 1
    return evilControl.getEffect() * bloodMeditation.getEffect() * absoluteWish.getEffect()
        * oblivionEmbodiment.getEffect() * yingYang.getEffect() * inferno * getChallengeBonus("legends_never_die")
        * getDarkMatterSkillEvil() * theDevilInsideYou * stairWayToHell() * evilBooster
}

function getEssenceGain() {
    const essenceControl = gameData.taskData["Yin Yang"]
    const essenceCollector = gameData.taskData["Essence Collector"]
    const transcendentMaster = milestoneData["Transcendent Master"]
    const faintHope = milestoneData["Faint Hope"]
    const rise = milestoneData["Rise of Great Heroes"]
    const darkMagician = gameData.taskData["Dark Magician"]

    const theNewGold = gameData.requirements["The new gold"].isCompleted() ? THE_NEW_GOLD_MULTIPLIER : 1
    const lifeIsValueable = gameData.requirements["Life is valueable"].isCompleted() ? gameData.dark_matter : 1

    return essenceControl.getEffect() * essenceCollector.getEffect() * transcendentMaster.getEffect()
        * faintHope.getEffect() * rise.getEffect() * getChallengeBonus("dance_with_the_devil")
        * getAGiftFromGodEssenceGain() * darkMagician.getEffect() * getDarkMatterSkillEssence() 
        * theNewGold * lifeIsValueable *  essenceMultGain()
}

function getDarkMatterGain() {
    const darkRuler = gameData.taskData["Dark Ruler"]
    const darkMatterHarvester = gameData.requirements["Dark Matter Harvester"].isCompleted() ? DARK_MATTER_HARVESTER_MULTIPLIER : 1
    const darkMatterMining = gameData.requirements["Dark Matter Mining"].isCompleted() ? DARK_MATTER_MINING_MULTIPLIER : 1
    const darkMatterMillionaire = gameData.requirements["Dark Matter Millionaire"].isCompleted() ? DARK_MATTER_MILLIONAIRE_MULTIPLIER : 1
    const Desintegration = gameData.itemData['Desintegration'].getEffect()
    const TheEndIsNear = getUnspentPerksDarkmatterGainBuff() 
    return 1 * darkRuler.getEffect() * darkMatterHarvester * darkMatterMining * darkMatterMillionaire * getChallengeBonus("the_darkest_time") * getDarkMatterSkillDarkMater() * darkMatterMultGain() *
        (Desintegration == 0 ? 1 : Desintegration) * TheEndIsNear
}

function getDarkMatter() {
    return gameData.dark_matter;
}

function getDarkMatterXpGain() {
    if (getDarkMatter() < 1)
        return 1

    return getDarkMatter() + 1;
}

function getDarkOrbs() {
    return gameData.dark_orbs
}

function getGameSpeed() {
    if (!canSimulate())
        return 0

    return getUnpausedGameSpeed()
}

function getUnpausedGameSpeed() {
    const boostWarping = gameData.boost_active ? gameData.metaverse.boost_warp_modifier : 1
    const timeWarping = gameData.taskData["Time Warping"]
    const temporalDimension = gameData.taskData["Temporal Dimension"]
    const timeLoop = gameData.taskData["Time Loop"]
    const warpDrive = (gameData.requirements["Eternal Time"].isCompleted()) ? WARP_DRIVE_MULTIPLIER : 1
    const speedSpeedSpeed = gameData.requirements["Speed speed speed"].isCompleted() ? SPEED_SPEED_SPEED_MULTIPLIER : 1
    const timeIsAFlatCircle = gameData.requirements["Time is a flat circle"].isCompleted() ? TIME_IS_A_FLAT_CIRCLE_MULTIPLIER : 1
    const timeWarpingSpeed = boostWarping * timeWarping.getEffect() * temporalDimension.getEffect() * timeLoop.getEffect() * warpDrive * speedSpeedSpeed * timeIsAFlatCircle
    const gameSpeed = baseGameSpeed * timeWarpingSpeed * getChallengeBonus("time_does_not_fly") * getGottaBeFastGain() * getDarkMatterSkillTimeWarping() 
    if (gameData.active_challenge == "time_does_not_fly" || gameData.active_challenge == "the_darkest_time")
        return Math.pow(gameSpeed, CHALLENGE_TIME_WARP_EXPONENT)
    if (gameData.active_challenge == "legends_never_die")
        return Math.pow(gameSpeed, CHALLENGE_LEGENDS_WARP_EXPONENT)
    return gameSpeed
}

function getLifespan() {
    const coinpile = COINPILE_MULTIPLIER * getBaseLog(COINPILE_LOG_BASE, gameData.coins + 1)
    const immortality = gameData.taskData["Life Essence"]
    const superImmortality = gameData.taskData["Astral Body"]
    const higherDimensions = gameData.taskData["Higher Dimensions"]
    const abyss = gameData.taskData["Ceaseless Abyss"]
    const cosmicLongevity = gameData.taskData["Cosmic Longevity"]
    const speedSpeedSpeed = gameData.requirements["Speed speed speed"].isCompleted() ? SPEED_SPEED_SPEED_LIFESPAN : 1
    const lifeIsValueable = gameData.requirements["Life is valueable"].isCompleted() ? LIFE_IS_VALUABLE_MULTIPLIER : 1
    const lifespan = (baseLifespan + coinpile) * immortality.getEffect() * superImmortality.getEffect() * abyss.getEffect()
        * cosmicLongevity.getEffect() * higherDimensions.getEffect() * lifeIsValueable * speedSpeedSpeed
    if (gameData.active_challenge == "legends_never_die" || gameData.active_challenge == "the_darkest_time")
        return Math.pow(lifespan, LIFESPAN_CHALLENGE_EXPONENT) + LIFESPAN_CHALLENGE_FLAT
    if (gameData.rebirthFiveCount > 0) return Infinity
    return lifespan
}

function isAlive() {
    const condition = gameData.days < getLifespan() || getLifespan() == Infinity
    const deathText = document.getElementById("deathText")
    if (!condition) {
        gameData.days = getLifespan()
        deathText.classList.remove("hidden")
    }
    else {
        deathText.classList.add("hidden")
    }
    return condition && !tempData.hasError
}



function canSimulate() {
    return !gameData.paused && isAlive()
}

function isHeroesUnlocked() {
    return gameData.requirements["New Beginning"].isCompleted() && (gameData.taskData["One Above All"].level >= HERO_LEVEL_UNLOCK_THRESHOLD || gameData.taskData["One Above All"].isHero)
}

function getInspiration() {
    const age = gameData.days
    const lifespan = getLifespan() == Infinity ? INSPIRATION_INFINITY_FALLBACK : getLifespan()
    return getBaseLog(INSPIRATION_LOG_BASE, lifespan / (age + 1)) + INSPIRATION_FLAT_BONUS
}

function getGreed() {
    const age = gameData.days
    return getBaseLog(GREED_ADULT_AGE, age)
}

function isNextDarkMagicSkillInReach() {
    const totalEvil = gameData.evil + getEvilGain()

    for (const key in gameData.taskData) {
        const skill = gameData.taskData[key]
        if (skillCategories["Dark Magic"].includes(key)) {
            const requirement = gameData.requirements[key]
            if (!requirement.isCompleted()) {
                if (totalEvil >= requirement.requirements[0].requirement) {
                    return true
                }
            }
        }
    }

    return false
}
