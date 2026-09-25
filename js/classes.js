class Task {
    constructor(baseData) {
        this.baseData = baseData
        this.name = baseData.name
        this.level = 0
        this.maxLevel = 0
        this.xp = new Decimal(0)
        this.isHero = false
        this.unlocked = false

        this.xpMultipliers = []

        this.elementsCache = {}
    }

    getMaxXp() {
        return getTaskMaxXp(this, this.level)
    }

    getXpLeft() {
        return this.getMaxXp().minus(this.xp)
    }

    getMaxLevelMultiplier() {
        if (gameData.active_challenge == "dance_with_the_devil" || gameData.active_challenge == "the_darkest_time") {
           return (10 / (this.maxLevel + 1))
        }
        else {
            let effect = gameData.taskData['skill_cosmic_recollection'].getEffect();
            effect = effect == 0 ? 1 : effect
            return (this.baseData.heroxp < 1000) ? 1 + this.maxLevel / 10 : 1 + this.maxLevel / effect
        }
    }

    getXpGain() {
        return applyMultipliers(10, this.xpMultipliers)
            .times(toInfinityNumber(this.isHero ? getHeroXpGainMultipliers(this) : 1))
    }

    getXpGainFormatted() {
        return format(this.getXpGain())
    }

    getXpLeftFormatted() {
        return format(this.getXpLeft())
    }

    increaseXp() {
        this.xp = this.xp.plus(applySpeed(this.getXpGain()))

        if (this.xp.gte(this.getMaxXp())) {
            const levels = getTaskLevelsToClimb(this, this.level, this.xp)
            this.xp = this.xp.minus(getTaskXpRange(this, this.level, levels))
            this.level += levels
            this.unlocked = true
        }
    }

    querySelector(selector, row) {
        const cachedElement = this.elementsCache[selector]

        if (cachedElement !== undefined)
            return cachedElement

        const element = row.querySelector(selector)
        this.elementsCache[selector] = element
        return element
    }

}

class Milestone {
    constructor(baseData) {
        this.baseData = baseData
        this.name = baseData.name
        this.id = null
        this.tier = baseData.tier
        this.threshold = baseData.threshold
        this.description = baseData.description
        this.tooltip = baseData.tooltip
        this.unlocked = false
    }

    // Кастомные формулы (setCustomEffects) подменяют этот метод,
    // плоские эффекты считаются из baseData.effect.base.
    getEffect() {
        const effect = this.baseData.effect
        if (effect == null) return null
        if (!gameData.requirements[this.id].isCompleted()) return toInfinityNumber(1)
        return toInfinityNumber(effect.base)
    }

    getTier() { return this.tier }
}

class Job extends Task {
    constructor(baseData) {
        super(baseData)
        this.incomeMultipliers = []
        this.categoryId = this.findJobCategoryId()
    }

    getLevelMultiplier() {
        return 1 + Math.log10(this.level + 1)
    }

    getCategoryHeroIncomeMult() {
        const categoryId = this.categoryId || (this.categoryId = this.findJobCategoryId())
        if (!categoryId) return 1
        return jobCategories[categoryId].heroIncomeMult ?? 1
    }

    findJobCategoryId() {
        for (const categoryId in jobCategories)
            if (this.name in jobCategories[categoryId].items)
                return categoryId
        return null
    }

    getIncome() {
        const income = toInfinityNumber(this.isHero ? heroIncomeMult
            * this.getCategoryHeroIncomeMult()
            : 1)
            .times(applyMultipliers(this.baseData.income, this.incomeMultipliers))
            .times(getChallengeBonus("rich_and_the_poor"))
        return gameData.active_challenge == "rich_and_the_poor" || gameData.active_challenge == "the_darkest_time" ? income.pow(CHALLENGE_RICH_INCOME_EXPONENT) : income
    }
}

class Skill extends Task {
    constructor(baseData) {
        super(baseData)
    }

    getEffect() {
        const level = this.level
        const hero = this.isHero
        const value = this.baseData.effect.base
        const formula = this.baseData.effect.formula || {}

        switch (formula.kind) {
            case "log": {
                const logBase = hero && formula.logHeroBase !== undefined
                    ? formula.logHeroBase
                    : (formula.logBase || Math.E)
                const result = 1 + value * Math.log(level + 1) / Math.log(logBase)
                return formula.floor !== undefined ? Math.max(result, formula.floor) : result
            }
            case "linear":
                return 1 + level * value * (hero && formula.heroScale !== undefined ? formula.heroScale : 1)
            default: // power
                const levelEff = hero ? SKILL_HERO_LEVEL_MULTIPLIER * level + SKILL_HERO_FLAT_BONUS : level
                return 1 + value * levelEff * Math.pow(SKILL_LEVEL_EXPONENT_BASE, getBaseLog(10, level + 1))
        }
    }

    getEffectDescription() {
        return "x" + format(this.getEffect(), 2) + " " + t(labelKey(this.baseData.effect.target))
    }
}

function getItemEffectDescriptionKey(target) {
    if (!target) return "effect_happiness"
    switch (target.type) {
        case "happiness": return "effect_happiness"
        case "evil_gain": return "effect_evil_gain"
        case "hypercube_gain": return "effect_hypercube_gain"
        case "dark_matter_gain": return "effect_dark_matter_gain"
        case "xp": {
            const scope = target.scope || {}
            if (scope.task) return labelKey({ kind: "task", task: scope.task })
            if (scope.kind) return labelKey({ kind: scope.kind, category: scope.category })
                || (scope.kind === "job" ? "effect_job_xp" : "effect_skill_xp")
            return "effect_skill_xp"
        }
    }
    return "effect_skill_xp"
}

class Item {
    constructor(baseData) {
        this.baseData = baseData
        this.name = baseData.name
        this.id = null
        this.categoryId = null
        this.expenseMultipliers = []
        this.isHero = false
        this.unlocked = false
    }

    getEffect() {
        let effect = this.baseData.effect.base

        if (this.isHero) {
            if (this.categoryId === "category_misc") {
                if (gameData.currentMisc.includes(this)) {
                    effect *= this.baseData.effect.heroeffect
                    this.unlocked = true
                }
            }

            if (this.categoryId === "category_properties") {
                if (gameData.currentProperty == this) {
                    effect = this.baseData.effect.heroeffect
                    this.unlocked = true
                }
                else
                    effect = 1
            }
        } else {
            if (gameData.currentProperty != this && !gameData.currentMisc.includes(this))
                return 1
            else
                this.unlocked = true
        }

        return effect
    }

    getEffectDescription() {
        let effect = this.baseData.effect.base

        if (this.isHero) {
            if (this.categoryId === "category_misc") {
                effect *= this.baseData.effect.heroeffect
            }

            if (this.categoryId === "category_properties") {
                effect = this.baseData.effect.heroeffect
            }
        }

        const descKey = this.categoryId === "category_properties"
            ? "happiness"
            : getItemEffectDescriptionKey(this.baseData.effect.target)
        return "x" + format(effect) + " " + t(descKey)
    }

    getExpense(heroic) {
        if (heroic === undefined)
            heroic = this.isHero
        return toInfinityNumber(heroic ? JOB_INCOME_HERO_BASE_MULTIPLIER * Math.pow(10, this.baseData.expense.heroExp) * heroIncomeMult : 1)
            .times(applyMultipliers(this.baseData.expense.base, this.expenseMultipliers))
    }
}

class Requirement {
    constructor(querySelectors, requirements) {
        this.querySelectors = querySelectors
        this.elements = []
        this.requirements = requirements
        this.completed = false
        this.permanent = false
    }

    queryElements() {
        this.querySelectors.forEach(querySelector => {
            this.elements.push(...document.querySelectorAll(querySelector))
        })
    }

    // Выполненность фиксируется на уровне забега: условие могло стать ложным
    // к середине забега (предок-герой обнулил уровень, эссенция потрачена),
    // но открытое должно оставаться открытым. rebirthReset() сносит completed
    // для неперманентных, permanentUnlocks/metaverseUnlocks и купленное в
    // магазине тёмной материи живут вечно.
    isCompleted() {
        if (this.completed) return true
        const completed = this.isCompletedActual()
        if (completed) this.completed = true
        return completed
    }

    isCompletedActual(isHero = false) {
        for (const requirement of this.requirements) {
            if (!this.getCondition(isHero, requirement)) {
                return false
            }
        }
        return true
    }
}

class TaskRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "task"
    }

    getCondition(isHero, requirement) {
        if (isHero && requirement.herequirement != null)
            return gameData.taskData[requirement.task].level >= requirement.herequirement
        else
            return gameData.taskData[requirement.task].level >= requirement.requirement
    }
}

class CoinRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "coins"
    }

    getCondition(isHero, requirement) {
        return gameData.coins.gte(requirement.requirement)
    }
}

class AgeRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "age"
    }

    getCondition(isHero, requirement) {
        return daysToYears(gameData.days) >= requirement.requirement
    }
}

class EvilRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "evil"
    }

    getCondition(isHero, requirement) {
        // strict: «есть любое зло» — оно дробное, как материя (см. DarkMatterRequirement)
        return requirement.strict
            ? gameData.evil.gt(requirement.requirement)
            : gameData.evil.gte(requirement.requirement)
    }
}

class EssenceRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "essence"
    }

    getCondition(isHero, requirement) {
        if (isHero && requirement.herequirement != null)
            return gameData.essence.gte(requirement.herequirement)
        else
            return gameData.essence.gte(requirement.requirement)

    }
}

class DarkMatterRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "darkMatter"
    }

    getCondition(isHero, requirement) {
        // strict: «есть любая материя» — она дробная, и порог 1 прячет топбар
        // и категорию при значениях вроде 0.3 сразу после ребёрна.
        return requirement.strict
            ? gameData.dark_matter.gt(requirement.requirement)
            : gameData.dark_matter.gte(requirement.requirement)
    }
}

class DarkOrbsRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "darkOrb"
    }

    getCondition(isHero, requirement) {
        return gameData.dark_orbs >= requirement.requirement
    }
}

class MetaverseRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "metaverse"
    }

    getCondition(isHero, requirement) {
        return gameData.rebirthFiveCount >= requirement.requirement
    }
}

class HypercubeRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "hypercube"
    }

    getCondition(isHero, requirement) {
        return gameData.hypercubes >= requirement.requirement
    }
}

class PerkPointRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "perkpoint"
    }

    getCondition(isHero, requirement) {
        return gameData.perks_points >= requirement.requirement
    }
}