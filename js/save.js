// save.js — save/load/import/export functions

// --- DTO-формат сейва ---
// Все числа хранятся строками, нулевые/дефолтные значения не пишутся.
// Ключи taskData/itemData/requirements и мета-прогресса берутся из контента
// (gameData после инициализации), из сейва применяются только значения.

// Ресурсы, хранящиеся как Decimal
const DECIMAL_FIELDS = ["coins", "evil", "essence", "dark_matter", "dark_orbs"]

// Ресурсы и таймеры, хранящиеся числами
const NUMBER_FIELDS = [
    "days", "hypercubes", "perks_points",
    "rebirthOneCount", "rebirthOneTime", "rebirthTwoCount", "rebirthTwoTime",
    "rebirthThreeCount", "rebirthThreeTime", "rebirthFourCount", "rebirthFourTime",
    "rebirthFiveCount", "rebirthFiveTime",
    "realtime", "realtimeRun", "boost_cooldown", "boost_timer",
]

// Булевы флаги состояния
const BOOLEAN_FIELDS = ["paused", "boost_active", "autoBuyEnabled"]

// stats, пересчитываемые каждый тик в updateStats — не сериализуются
const TRANSIENT_STATS = ["EvilPerSecond", "EssencePerSecond"]

// stats, хранящиеся как Decimal
const DECIMAL_STATS = ["maxEvilPerSecond", "maxEssencePerSecond", "maxEssenceReached"]

function isDefaultValue(value) {
    if (value === null || value === undefined) return true
    if (typeof value === "bigint") return value === 0n
    if (value instanceof Decimal) return value.eq(new Decimal(0))
    if (typeof value === "number") return value === 0
    if (typeof value === "boolean") return value === false
    if (typeof value === "string") return value === ""
    if (Array.isArray(value)) return value.length === 0
    return false
}

function decimalToString(value) {
    if (value instanceof Decimal) return value.toString()
    return String(value)
}

// Преобразует значение к типу образца (механическое правило: строка из сейва → нужный тип)
function coerceValue(value, template) {
    if (typeof template === "boolean") return value === true || value === 1 || value === "1"
    if (typeof template === "number") return Number(value)
    if (typeof template === "string") return String(value)
    return value
}

// Decimal из значения сейва. У break_infinity mantissa конечна даже у Infinity
// (бесконечность живёт в layer), так что ветка лечит только NaN, как и старый код.
function parseDecimal(value) {
    const decimal = toInfinityNumber(value)
    if (!isFinite(decimal.mantissa)) return new Decimal(0)
    return decimal
}

// --- Сериализация ---

// Значение мета-прогресса: boolean → 1, число/Decimal → строка, null если дефолт
function scalarToString(value) {
    if (typeof value === "boolean") return value ? 1 : null
    if (isDefaultValue(value)) return null
    return decimalToString(value)
}

function serializeMap(map) {
    const dto = {}
    for (const key in map) {
        const value = scalarToString(map[key])
        if (value !== null) dto[key] = value
    }
    return dto
}

function serializeTask(task) {
    const dto = {}
    if (!isDefaultValue(task.level)) dto.level = String(task.level)
    if (!isDefaultValue(task.maxLevel)) dto.maxLevel = String(task.maxLevel)
    if (!isDefaultValue(task.xp)) dto.xp = decimalToString(task.xp)
    if (task.unlocked) dto.unlocked = 1
    return dto
}

function serialize(gameData) {
    const dto = {}

    // Ресурсы
    for (const key of DECIMAL_FIELDS)
        if (!isDefaultValue(gameData[key])) dto[key] = decimalToString(gameData[key])
    for (const key of NUMBER_FIELDS)
        if (!isDefaultValue(gameData[key])) dto[key] = decimalToString(gameData[key])

    // Мета-прогресс — ключи пишем всегда, даже пустыми
    dto.perks = serializeMap(gameData.perks)
    dto.dark_matter_shop = serializeMap(gameData.dark_matter_shop)
    dto.metaverse = serializeMap(gameData.metaverse)
    if (!isDefaultValue(gameData.active_challenge)) dto.active_challenge = gameData.active_challenge
    dto.challenges = serializeMap(gameData.challenges)

    // Таймеры/состояние
    for (const key of BOOLEAN_FIELDS)
        if (gameData[key]) dto[key] = 1

    // Выбор игрока — только id
    dto.currentJob = findTaskId(gameData, gameData.currentJob)
    dto.currentProperty = gameData.currentProperty?.id ?? null
    dto.currentMisc = gameData.currentMisc.map(item => item?.id).filter(id => id != null)

    // Прогресс — без baseData, без isHero
    dto.taskData = {}
    for (const key in gameData.taskData)
        dto.taskData[key] = serializeTask(gameData.taskData[key])

    // Разблокировки — только completed
    dto.itemData = {}
    for (const key in gameData.itemData)
        dto.itemData[key] = gameData.itemData[key].unlocked ? { unlocked: 1 } : {}

    dto.requirements = {}
    for (const key in gameData.requirements)
        dto.requirements[key] = gameData.requirements[key].completed ? { completed: 1 } : {}

    // Настройки и статистика
    dto.settings = serializeSettings(gameData.settings)
    dto.stats = serializeStats(gameData.stats)

    return dto
}

function serializeSettings(settings) {
    const dto = {}
    for (const key in settings) {
        const value = settings[key]
        if (value instanceof Date) { dto[key] = value.toISOString(); continue }
        if (isDefaultValue(value)) continue
        if (typeof value === "boolean") { dto[key] = 1; continue }
        dto[key] = decimalToString(value)
    }
    return dto
}

function serializeStats(stats) {
    const dto = {}
    for (const key in stats) {
        if (TRANSIENT_STATS.includes(key)) continue
        const value = stats[key]
        if (key === "startDate") {
            dto[key] = value instanceof Date ? value.toISOString() : String(value)
            continue
        }
        if (isDefaultValue(value)) continue
        if (typeof value === "boolean") { dto[key] = 1; continue }
        dto[key] = decimalToString(value)
    }
    return dto
}

// Ключ задачи в контенте по самому объекту
function findTaskId(gameData, task) {
    for (const key in gameData.taskData)
        if (gameData.taskData[key] === task) return key
    return null
}

// --- Десериализация ---

function deserialize(dto, gameData) {
    if (dto == null) return gameData

    // Ресурсы: отсутствующий ключ = 0
    for (const key of DECIMAL_FIELDS)
        gameData[key] = parseDecimal(dto[key])
    for (const key of NUMBER_FIELDS)
        gameData[key] = Number(dto[key] ?? 0)
    for (const key of BOOLEAN_FIELDS)
        gameData[key] = dto[key] ? true : false
    gameData.active_challenge = dto.active_challenge ?? ""

    // Мета-прогресс: ключи из контента, отсутствующие = 0/false
    applyMap(gameData.perks, dto.perks)
    applyMap(gameData.dark_matter_shop, dto.dark_matter_shop)
    applyMap(gameData.metaverse, dto.metaverse)

    // Значения испытаний — Decimal-строки
    applyChallenges(gameData.challenges, dto.challenges)

    // Выбор игрока — id разрешаются по контенту
    gameData.currentJob = gameData.taskData[dto.currentJob] ?? gameData.taskData["job_beggar"]
    gameData.currentProperty = gameData.itemData[dto.currentProperty] ?? gameData.itemData["item_homeless"]
    gameData.currentMisc = (Array.isArray(dto.currentMisc) ? dto.currentMisc : [])
        .map(id => gameData.itemData[id])
        .filter(item => item != null)

    // Прогресс — ключи из контента
    const taskData = dto.taskData ?? {}
    for (const key in gameData.taskData)
        applyTask(gameData.taskData[key], taskData[key])

    const itemData = dto.itemData ?? {}
    for (const key in gameData.itemData)
        gameData.itemData[key].unlocked = itemData[key]?.unlocked ? true : false

    const requirements = dto.requirements ?? {}
    for (const key in gameData.requirements) {
        const requirement = gameData.requirements[key]
        // Сохранённой выполненности доверяем только перманентным и купленным
        // требованиям: у остальных условие могло стать ложным к моменту загрузки
        // (возраст сбросился, эссенция обнулилась), их перевычислят при обращении.
        let keep = requirements[key]?.completed && requirement.permanent
        for (const perk in shopPermanentUnlocks)
            if (shopPermanentUnlocks[perk] === key && gameData.dark_matter_shop[perk]) keep = true
        requirement.completed = !!keep
    }

    applySettings(gameData.settings, dto.settings)
    applyStats(gameData.stats, dto.stats)

    return gameData
}

function applyMap(target, source) {
    source = source ?? {}
    for (const key in target) {
        if (!(key in source)) {
            target[key] = typeof target[key] === "boolean" ? false : 0
            continue
        }
        target[key] = coerceValue(source[key], target[key])
    }
}

function applyChallenges(challenges, source) {
    source = source ?? {}
    for (const key in challenges)
        challenges[key] = key in source ? String(source[key]) : 0
}

function applyTask(task, saved) {
    saved = saved ?? {}
    task.level = Number(saved.level ?? 0)
    task.maxLevel = Number(saved.maxLevel ?? 0)
    task.xp = parseDecimal(saved.xp)
    task.unlocked = saved.unlocked ? true : false
}

function applySettings(settings, source) {
    // Нет блока в сейве — остаётся дефолт целиком
    if (source == null) return
    for (const key in settings) {
        if (!(key in source)) continue  // недостающее добирается из дефолта
        settings[key] = coerceValue(source[key], settings[key])
    }
}

function applyStats(stats, source) {
    if (source == null) source = {}
    for (const key in stats) {
        if (TRANSIENT_STATS.includes(key)) continue  // пересчитываются каждый тик
        if (!(key in source)) {
            if (key === "startDate") stats[key] = new Date().toISOString()
            else if (DECIMAL_STATS.includes(key)) stats[key] = new Decimal(0)
            else if (typeof stats[key] === "boolean") stats[key] = false
            else stats[key] = 0
            continue
        }
        if (key === "startDate") {
            stats[key] = source[key] instanceof Date ? source[key].toISOString() : String(source[key])
            continue
        }
        stats[key] = DECIMAL_STATS.includes(key)
            ? parseDecimal(source[key])
            : coerceValue(source[key], stats[key])
    }
}

// --- Save / load ---

function saveGameData() {
    localStorage.setItem("gameDataSave", JSON.stringify(serialize(gameData)))
}

function peekSettingFromSave(setting) {
    try {
        const save = localStorage.getItem("gameDataSave")
        if (save == null)
            return gameData.settings[setting]
        const gameDataSave = JSON.parse(save)
        if (gameDataSave.settings == undefined || gameDataSave.settings[setting] == undefined)
            return gameData.settings[setting]
        return coerceValue(gameDataSave.settings[setting], gameData.settings[setting])
    } catch (error) {
        console.error(error)
        console.log(localStorage.getItem("gameDataSave"))
        alert("It looks like you tried to load a corrupted save... If this issue persists, feel free to contact the developers!")
    }
}

function loadGameData() {
    try {
        const dto = JSON.parse(localStorage.getItem("gameDataSave"))

        if (dto !== null) {
            deserialize(dto, gameData)
        }
    } catch (error) {
        console.error(error)
        console.log(localStorage.getItem("gameDataSave"))
        alert("It looks like you tried to load a corrupted save... If this issue persists, feel free to contact the developers!")
    }
}

function resetGameData() {
    clearInterval(saveloop)
    clearInterval(gameloop)
    if (!confirm('Are you sure you want to reset the game?')) {
        gameloop = setInterval(update, 1000 / updateSpeed)
        saveloop = setInterval(saveGameData, 3000)
        return
    }
    localStorage.clear()
    location.reload()
}

function importGameData() {
    try {
        const importExportBox = document.getElementById("importExportBox")
        if (importExportBox.value == "") {
            alert("It looks like you tried to load an empty save... Paste save data into the box, then click \"Import Save\" again.")
            return
        }
        const saveString = window.atob(importExportBox.value)
        // Валидируем, что это JSON, и пишем DTO как есть — применять его будет loadGameData после перезагрузки
        JSON.parse(saveString)
        clearInterval(gameloop)
        localStorage.setItem("gameDataSave", saveString)
        location.reload()
    } catch (error) {
        alert("It looks like you tried to load a corrupted save... If this issue persists, feel free to contact the developers!")
    }
}

function exportGameData() {
    const importExportBox = document.getElementById("importExportBox")
    const saveString = window.btoa(JSON.stringify(serialize(gameData)))
    importExportBox.value = saveString
    copyTextToClipboard(saveString)
    setTimeout(() => {
        if (importExportBox.value == saveString) {
            importExportBox.value = ""
        }
    }, EXPORT_TOOLTIP_TIMEOUT)
}

function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const tooltip = document.getElementById("exportTooltip");
        tooltip.innerHTML = t("save_copied") ;
    }, err => {
    })
}

function outExportButton() {
    const tooltip = document.getElementById("exportTooltip");
    tooltip.textContent = "";
}
