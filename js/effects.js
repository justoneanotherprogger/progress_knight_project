// effects.js — type-based effect registry

const EFFECT_TYPES = {
    all_xp:           { container: "xp",       target: () => true },
    job_xp:           { container: "xp",       target: task => task instanceof Job },
    job_income:       { container: "income",   target: task => task instanceof Job },
    skill_xp:         { container: "xp",       target: task => task instanceof Skill },
    army_xp:          { container: "xp",       target: task => jobCategories["Military"].includes(task.name) },
    army_income:      { container: "income",   target: task => jobCategories["Military"].includes(task.name) },
    strength_xp:      { container: "xp",       target: task => task.id === "skill_strength" },
    magic_xp:         { container: "xp",       target: task => task instanceof Skill && task.id in skillCategories["Magic"] },
    void_xp:          { container: "xp",       target: task => jobCategories["The Void"].includes(task.name) },
    collegium_xp:     { container: "xp",       target: task => jobCategories["Mage Collegium"].includes(task.name) },
    collegium_income: { container: "income",   target: task => jobCategories["Mage Collegium"].includes(task.name) },
    galactic_xp:      { container: "xp",       target: task => jobCategories["Galactic Council"].includes(task.name) },
    expense_reduction:{ container: "expense",  target: () => true },
}

function getEffectsByType(type) {
    const result = []
    for (const key in skillBaseData) {
        const skill = gameData.taskData[key]
        if (skill && skill.baseData.effect.type === type) {
            result.push(skill.getEffect.bind(skill))
        }
    }
    return result
}

function pushEffectsByType(type, list) {
    for (const fn of getEffectsByType(type)) {
        list.push(fn)
    }
}

function getEffectsProduct(type) {
    let product = new Decimal(1)
    for (const fn of getEffectsByType(type)) {
        product = product.times(toInfinityNumber(fn()))
    }
    return product
}
