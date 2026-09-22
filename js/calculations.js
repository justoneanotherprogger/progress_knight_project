// calculations.js — pure calculation functions
// Uses Decimal from break_infinity.js

function toInfinityNumber(n) {
  if (typeof n == 'undefined' || n === null) return new Decimal(0);
  return new Decimal(n);
}

function formatInfinityNumber(num) {
  if (typeof num == 'undefined' || num === null) return '0';
  var b = new Decimal(num);
  var str = b.toString();

  // Handle Infinity/NaN
  if (!isFinite(b.mantissa)) return str;

  // break_infinity clamps exponents >= 9e15: toString() yields "Infinity" while
  // mantissa stays finite, so the guard above misses it. Render a word, not e9000000000000000.
  if (str === 'Infinity' || str === '-Infinity') {
    return str.startsWith('-') ? '-' + t('infinity') : t('infinity');
  }

  // For numbers >= 1e1000, show only e1000 notation without mantissa
  if (b.gte(new Decimal('1e1000'))) {
    var exponent = b.exponent.toString();
    // Remove leading '+' if present
    if (exponent.startsWith('+')) {
      exponent = exponent.substring(1);
    }
    return 'e' + exponent;
  }

  // For smaller numbers, show normal Decimal representation with 2 decimal places
  // Remove leading '+' from exponent in e-notation
  if (str.includes('e') && str.includes('+')) {
    return str.replace('e+', 'e');
  }
  // Use toFixed(2) to limit to 2 decimal places
  return parseFloat(str).toFixed(2);
}

function getHeroXpGainMultipliers(job) {
    let baseMult = job instanceof Job ? HERO_XP_BASE_JOB : 1
    for (const id in milestoneData) {
        const baseData = milestoneData[id].baseData
        if (baseData.effect == null)
            continue
        if (gameData.requirements[id].isCompleted()) {
            baseMult *= toInfinityNumber(baseData.effect)
        }
    }
    return baseMult
}

function getDarknessXpGain() {
    return gameData.requirements["milestone_strange_magic"].isCompleted() ? toInfinityNumber(STRANGE_MAGIC_MULTIPLIER) : 1
}

function getHappiness() {
    if (gameData.active_challenge == "legends_never_die" || gameData.active_challenge == "the_darkest_time") return 1
    const meditationEffect = getBindedTaskEffect("skill_meditation")
    const butlerEffect = getBindedItemEffect("item_butler")
    const mindreleaseEffect = getBindedTaskEffect("skill_mind_release")
    const multiverseFragment = getBindedItemEffect("item_multiverse_fragment")
    const godsBlessings = gameData.requirements["milestone_god_s_blessings"].isCompleted() ? toInfinityNumber(GODS_BLESSINGS_MULTIPLIER) : 1
    const stairWayToHeaven = getBindedItemEffect("item_stairway_to_heaven")
    const happiness = godsBlessings * meditationEffect() * butlerEffect() * mindreleaseEffect()
        * multiverseFragment() * gameData.currentProperty.getEffect() * getChallengeBonus("an_unhappy_life") * stairWayToHeaven()
    if (gameData.active_challenge == "dance_with_the_devil") return toInfinityNumber(Math.pow(happiness, CHALLENGE_DANCE_HAPPINESS_EXPONENT))
    if (gameData.active_challenge == "an_unhappy_life") return toInfinityNumber(Math.pow(happiness, CHALLENGE_UNHAPPY_HAPPINESS_EXPONENT))
    return happiness
}

function getEvil() {
    return gameData.evil
}

function getEvilXpGain() {
    if (gameData.active_challenge == "legends_never_die" || gameData.active_challenge == "the_darkest_time") return 1
    if (gameData.active_challenge == "dance_with_the_devil") {
        const evilEffect = getEvil().pow(EVIL_EFFECT_EXPONENT).div(EVIL_EFFECT_DIVISOR).sub(1)
        return evilEffect.lt(0) ? new Decimal(0) : evilEffect
    }
    return getEvil()
}

function getEssence() {
    return gameData.essence
}

function getEssenceXpGain() {
    if (gameData.active_challenge == "dance_with_the_devil" || gameData.active_challenge == "the_darkest_time") {
        const essenceEffect = getEssence().pow(ESSENCE_EFFECT_EXPONENT).div(ESSENCE_EFFECT_DIVISOR).sub(1)
        return essenceEffect.lte(ESSENCE_EFFECT_MIN_THRESHOLD) ? new Decimal(0) : essenceEffect
    }
    return getEssence()
}

function applyMultipliers(value, multipliers) {
    var finalMultiplier = new Decimal(1)
    multipliers.forEach((multiplierFunction) => {
        finalMultiplier = finalMultiplier.times(toInfinityNumber(multiplierFunction()))
    })
    return toInfinityNumber(value).times(finalMultiplier)
}

function applySpeed(value) {
    if (value == 0)
        return 0
    if (value instanceof Decimal)
        return value.times(getGameSpeed()).div(updateSpeed)
    if (value == Infinity)
        return Infinity
    return value * getGameSpeed() / updateSpeed
}

function applyUnpausedSpeed(value) {
    if (value == 0)
        return 0
    if (value == Infinity)
        return Infinity
    if (value instanceof Decimal)
        return value.times(getUnpausedGameSpeed()).div(updateSpeed)
    return value * getUnpausedGameSpeed() / updateSpeed
}

function getTaskBaseXp(task) {
    if (task.isHero)
        return new Decimal(10).pow(task.baseData.heroxp).times(task.baseData.maxXp)
    return toInfinityNumber(task.baseData.maxXp)
}

function getTaskGrowth(task) {
    return task.isHero ? TASK_HERO_XP_GROWTH : TASK_XP_GROWTH
}

// Стоимость перехода с level на level+1. Растёт геометрически,
// поэтому для больших уровней нужен Decimal, а не Number.
function getTaskMaxXp(task, level) {
    return getTaskBaseXp(task).times(level + 1).times(new Decimal(getTaskGrowth(task)).pow(level))
}

// Суммарная стоимость k уровней, начиная с level.
// Σ (level+1+i)·r^(level+i) раскладывается в сумму двух геометрических прогрессий:
// (level+1)·Σr^i + Σi·r^i, что даёт замкнутую формулу вместо O(k) цикла.
function getTaskXpRange(task, level, k) {
    if (k <= 0) return new Decimal(0)
    const r = new Decimal(getTaskGrowth(task))
    const rm1 = r.sub(1)
    const rk = r.pow(k)
    const geom = rk.sub(1).div(rm1)
    const arith = rk.times(k).times(rm1).sub(r.times(rk.sub(1))).div(rm1.times(rm1))
    return getTaskBaseXp(task).times(r.pow(level)).times(new Decimal(level + 1).times(geom).plus(arith))
}

// Сколько уровней покрывает накопленный xp — максимальное k, для которого
// сумма стоимости k уровней не превосходит xp. Монотонность по k позволяет
// искать уровни галопом и бинарным поиском: O(log k) вызовов формулы суммы.
// Потолок нужен для Infinity-значений xp (множители gain могут дать Infinity):
// тогда сумма никогда не превзойдёт xp, и галоп ушёл бы в бесконечный цикл.
const MAX_LEVELS_PER_TICK = 1e9

function getTaskLevelsToClimb(task, level, xp) {
    let lo = 0
    let hi = 1
    while (hi < MAX_LEVELS_PER_TICK && getTaskXpRange(task, level, hi).lte(xp)) {
        lo = hi
        hi *= 2
    }
    if (hi > MAX_LEVELS_PER_TICK) hi = MAX_LEVELS_PER_TICK
    while (lo + 1 < hi) {
        const mid = Math.floor((lo + hi) / 2)
        if (getTaskXpRange(task, level, mid).lte(xp)) lo = mid
        else hi = mid
    }
    return lo
}

function getEvilGain() {
    const evilControl = gameData.taskData["skill_evil_control"]
    const bloodMeditation = gameData.taskData["skill_blood_meditation"]
    const absoluteWish = gameData.taskData ["skill_absolute_wish"]
    const oblivionEmbodiment = gameData.taskData ["skill_void_embodiment"]
    const yingYang = gameData.taskData["skill_yin_yang"]
    const inferno = gameData.requirements["milestone_inferno"].isCompleted() ? toInfinityNumber(INFERNO_MULTIPLIER) : 1
    const theDevilInsideYou = gameData.requirements["milestone_the_devil_inside_you"].isCompleted() ? toInfinityNumber(THE_DEVIL_INSIDE_YOU_MULTIPLIER) : 1
    const stairWayToHell = getBindedItemEffect("item_highway_to_hell")
    const evilBooster = (gameData.perks.evil_booster == 1) ? toInfinityNumber(EVIL_BOOSTER_MULTIPLIER) : 1
    return toInfinityNumber(1)
        .times(evilControl.getEffect())
        .times(bloodMeditation.getEffect())
        .times(absoluteWish.getEffect())
        .times(oblivionEmbodiment.getEffect())
        .times(yingYang.getEffect())
        .times(inferno)
        .times(getChallengeBonus("legends_never_die"))
        .times(getDarkMatterSkillEvil())
        .times(theDevilInsideYou)
        .times(stairWayToHell())
        .times(evilBooster)
        .times(getGreed())
}

function getEssenceGain() {
    const essenceControl = gameData.taskData["skill_yin_yang"]
    const essenceCollector = gameData.taskData["skill_essence_collector"]
    const transcendentMaster = milestoneData["milestone_transcendent_master"]
    const faintHope = milestoneData["milestone_faint_hope"]
    const rise = milestoneData["milestone_rise_of_great_heroes"]
    const darkMagician = gameData.taskData["skill_dark_magician"]

    const theNewGold = gameData.requirements["milestone_the_new_gold"].isCompleted() ? toInfinityNumber(THE_NEW_GOLD_MULTIPLIER) : toInfinityNumber(1)
    const lifeIsValueable = gameData.requirements["milestone_life_is_valueable"].isCompleted() ? toInfinityNumber(gameData.dark_matter) : toInfinityNumber(1)

    return toInfinityNumber(essenceControl.getEffect())
        .times(essenceCollector.getEffect())
        .times(transcendentMaster.getEffect())
        .times(faintHope.getEffect())
        .times(rise.getEffect())
        .times(getChallengeBonus("dance_with_the_devil"))
        .times(getAGiftFromGodEssenceGain())
        .times(darkMagician.getEffect())
        .times(getDarkMatterSkillEssence())
        .times(theNewGold)
        .times(lifeIsValueable)
        .times(essenceMultGain())
        .times(getGreed())
}

function getDarkMatterGain() {
    const darkRuler = gameData.taskData["skill_dark_ruler"]
    const darkMatterHarvester = gameData.requirements["milestone_dark_matter_harvester"].isCompleted() ? toInfinityNumber(DARK_MATTER_HARVESTER_MULTIPLIER) : 1
    const darkMatterMining = milestoneData["milestone_dark_matter_mining"].getEffect()
    const darkMatterMillionaire = gameData.requirements["milestone_dark_matter_millionaire"].isCompleted() ? toInfinityNumber(DARK_MATTER_MILLIONAIRE_MULTIPLIER) : 1
    const Desintegration = gameData.itemData["item_desintegration"].getEffect()
    const TheEndIsNear = getUnspentPerksDarkmatterGainBuff()
    return toInfinityNumber(1)
        .times(darkRuler.getEffect())
        .times(darkMatterHarvester)
        .times(darkMatterMining)
        .times(darkMatterMillionaire)
        .times(getChallengeBonus("the_darkest_time"))
        .times(getDarkMatterSkillDarkMater())
        .times(darkMatterMultGain())
        .times(Desintegration == 0 ? 1 : Desintegration)
        .times(TheEndIsNear)
        .times(getGreed())
}

function getDarkMatter() {
    return gameData.dark_matter;
}

function getDarkMatterXpGain() {
    if (getDarkMatter().lt(1))
        return 1

    return getDarkMatter().add(1);
}

// Героические навыки Тьмы получают множитель материи отдельным слоем —
// квадратом бонуса, поверх общего для навыков Тьмы. isHero — живое поле
// задачи, читается на каждом тике, поэтому слой откатывается при
// перерождении и возвращается при новой героизации.
function getHeroicDarkMatterXpGain(task) {
    return task.isHero ? getDarkMatterXpGain().pow(2) : 1
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
    const boostWarping = gameData.boost_active ? METAVERSE_BOOST_WARP_DEFAULT : 1
    const timeWarping = gameData.taskData["skill_time_warping"]
    const temporalDimension = gameData.taskData["skill_temporal_dimension"]
    const timeLoop = gameData.taskData["skill_time_loop"]
    const warpDrive = (gameData.requirements["milestone_eternal_time"].isCompleted()) ? WARP_DRIVE_MULTIPLIER : 1
    const speedSpeedSpeed = gameData.requirements["milestone_speed_speed_speed"].isCompleted() ? SPEED_SPEED_SPEED_MULTIPLIER : 1
    const timeIsAFlatCircle = gameData.requirements["milestone_time_is_a_flat_circle"].isCompleted() ? TIME_IS_A_FLAT_CIRCLE_MULTIPLIER : 1
    const timeWarpingSpeed = boostWarping * timeWarping.getEffect() * temporalDimension.getEffect() * timeLoop.getEffect() * warpDrive * speedSpeedSpeed * timeIsAFlatCircle
    const gameSpeed = baseGameSpeed * timeWarpingSpeed * getChallengeBonus("time_does_not_fly") * getGottaBeFastGain() * getDarkMatterSkillTimeWarping() * gameData.settings.adminSpeedMultiplier
    if (gameData.active_challenge == "time_does_not_fly" || gameData.active_challenge == "the_darkest_time")
        return Math.pow(gameSpeed, CHALLENGE_TIME_WARP_EXPONENT)
    if (gameData.active_challenge == "legends_never_die")
        return Math.pow(gameSpeed, CHALLENGE_LEGENDS_WARP_EXPONENT)
    return gameSpeed
}

function getLifespan() {
    const coinpile = COINPILE_MULTIPLIER * gameData.coins.plus(1).log(COINPILE_LOG_BASE)
    const immortality = gameData.taskData["skill_life_essence"]
    const superImmortality = gameData.taskData["skill_astral_body"]
    const higherDimensions = gameData.taskData["skill_higher_dimensions"]
    const abyss = gameData.taskData["skill_ceaseless_abyss"]
    const cosmicLongevity = gameData.taskData["skill_cosmic_longevity"]
    const soulDrain = gameData.taskData["skill_soul_drain"]
    const speedSpeedSpeed = gameData.requirements["milestone_speed_speed_speed"].isCompleted() ? SPEED_SPEED_SPEED_LIFESPAN : 1
    const lifeIsValueable = gameData.requirements["milestone_life_is_valueable"].isCompleted() ? LIFE_IS_VALUABLE_MULTIPLIER : 1
    const lifespan = (baseLifespan + coinpile) * immortality.getEffect() * superImmortality.getEffect() * abyss.getEffect()
        * cosmicLongevity.getEffect() * soulDrain.getEffect() * higherDimensions.getEffect() * lifeIsValueable * speedSpeedSpeed
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
    return gameData.requirements["milestone_new_beginning"].isCompleted() && (gameData.taskData["job_one_above_all"].level >= HERO_LEVEL_UNLOCK_THRESHOLD || gameData.taskData["job_one_above_all"].isHero)
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
    const totalEvil = gameData.evil.add(getEvilGain())

    for (const key in gameData.taskData) {
        const skill = gameData.taskData[key]
        if (key in skillCategories["category_dark_magic"].items) {
            const requirement = gameData.requirements[key]
            if (!requirement.isCompleted()) {
                if (totalEvil.gte(requirement.requirements[0].requirement)) {
                    return true
                }
            }
        }
    }

    return false
}
