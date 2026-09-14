// effects.js — type-based effect registry

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
