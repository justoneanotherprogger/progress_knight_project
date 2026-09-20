function softcap(value, cap, power = 0.5) {
    if (value <= cap) return value

    // Use Decimal for large numbers to avoid Infinity from Math.pow
    const decValue = toInfinityNumber(value)
    const decCap = toInfinityNumber(cap)
    return decValue.pow(power).times(decCap.pow(1 - power))
}

// Знаки после точки для мантиссы из [1, 1000): до трёх значащих цифр —
// 9.99k, 99.9k, 999k.
function significantDecimals(scaled) {
    if (scaled >= 100) return 0
    if (scaled >= 10) return 1
    return 2
}

// Усечение вместо округления: отображаемое число никогда не превышает
// реальное — 9997 опыта читаются как «9.99k», а не округлённое «10.0k».
// Хвостовые нули сохраняются — фиксированная длина строки не дрожит
// при быстром росте значения.
function formatMantissa(scaled) {
    const decimals = significantDecimals(scaled)
    const factor = Math.pow(10, decimals)
    const truncated = Math.floor(scaled * factor) / factor
    return truncated.toFixed(decimals)
}

function format(number, decimals = 1) {
    // Convert to Decimal for large numbers
    const decNumber = toInfinityNumber(number);

    // Special case: if number is very large (>= 1e1000), use e1000 notation
    if (decNumber.gte(new Decimal('1e1000'))) {
        return formatInfinityNumber(number);
    }

    // Old formatting for smaller numbers - use JS Math for calculations
    const units = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "O", "N", "D", "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Od", "Nd", "V", "Uv", "Dv", "Tv",
    "Qav", "Qiv", "Sxv", "Spv", "Ov", "Nv", "Tr", "Ut", "Dt", "Tt"]

    // what tier? (determines SI symbol)
    const log10 = decNumber.log10();
    const tier = Math.floor(log10 / 3);

    // Малые числа показываем с той точностью, которую просит вызывающий код —
    // на старте игры важны и копейки.
    if (tier <= 0) {
        return decNumber.toFixed(decimals);
    }

    if ((gameData.settings.numberNotation == 0 || tier < 3) && (tier < units.length)) {
        const suffix = units[tier];
        const scale = Math.pow(10, tier * 3);
        return formatMantissa(decNumber / scale) + suffix;
    } else {
        if (gameData.settings.numberNotation == 1) {
            const exp = Math.floor(log10);
            // Math.pow(10, exp) becomes Infinity past 1e308; keep scaling in Decimal
            const scaled = decNumber.div(new Decimal(10).pow(exp)).toNumber();
            return formatMantissa(scaled) + "e" + exp;
        }
        else {
            const exp = Math.floor(log10 / 3);
            const scaled = decNumber.div(new Decimal(10).pow(exp * 3)).toNumber();
            return formatMantissa(scaled) + "e" + exp * 3;
        }
    }
}

function getCoinsData() {
    switch (gameData.settings.currencyNotation) {
        case 0: return [
            { "name": "p", "color": "#79b9c7", "value": 1e6 },
            { "name": "g", "color": "#E5C100", "value": 10000 },
            { "name": "s", "color": "#a8a8a8", "value": 100 },
            { "name": "c", "color": "#a15c2f", "value": 1 },
        ];
        case 1: return [
            { "name": " 𒀱", "color": "#ffffff", "value": 1e62, "class": "currency-shadow-rainbow" },
            { "name": " 𒀱", "color": "#ffffff", "value": 1e47, "class": "currency-shadow" },
            { "name": " 𒇫", "color": "#66ccff", "value": 1e41, "class": "currency-shadow" },
            { "name": "🜊", "color": "#00ff00", "value": 1e35, "class": "currency-bold" },
            { "name": "✹", "color": "#ffffcc", "value": 1e30 },
            { "name": "∰", "color": "#ff0083", "value": 1e26 },
            { "name": "Φ", "color": "#27b897", "value": 1e23 },
            { "name": "Ξ", "color": "#cd72ff", "value": 1e20 },
            { "name": "Δ", "color": "#f5c211", "value": 1e17 },
            { "name": "d", "color": "#ffffff", "value": 1e14 },
            { "name": "r", "color": "#ed333b", "value": 1e12 },
            { "name": "S", "color": "#6666ff", "value": 1e10 },
            { "name": "e", "color": "#2ec27e", "value": 1e8 },
            { "name": "p", "color": "#79b9c7", "value": 1e6 },
            { "name": "g", "color": "#E5C100", "value": 10000 },
            { "name": "s", "color": "#a8a8a8", "value": 100 },
            { "name": "c", "color": "#a15c2f", "value": 1 },
        ];
        case 2: return [
            { "name": "", "color": "#E5C100", "value": 240, "prefix": "£" },
            { "name": "s", "color": "#a8a8a8", "value": 12 },
            { "name": "d", "color": "#a15c2f", "value": 1 },
        ];
        default: throw new Error("Invalid currency notation set");
    }
}

function formatWhole(number, decimals = 1) {
    if (number >= 1e3 || (number <= 0.99 && number != 0)) {
        return format(number, decimals)
    }
    return format(number, 0);
}

function formatCoins(coins, element) {
    for (const c of element.children) {
        c.textContent = "";
    }

    const coinsDec = toInfinityNumber(coins)

    switch (gameData.settings.currencyNotation) {
        case 0:
        case 1:
        case 2:
            const money2 = getCoinsData()

            let coinsUsed = 0
            for (let i = 0; i < money2.length; i++) {
                const m = money2[i];
                const prev = money2[i - 1];
                const diff = prev ? prev.value / m.value : Infinity;
                const scaled = coinsDec.div(m.value).floor()
                const amount = diff === Infinity ? scaled : scaled.minus(toInfinityNumber(diff).times(scaled.div(diff).floor()))
                if ((amount.gt(0) || (coinsDec.lt(1) && m.value == 1))) {
                    element.children[coinsUsed].textContent = (m.prefix ?? "") + format(amount, amount.lt(1000) ? 0 : 2) + m.name
                    element.children[coinsUsed].style.color = m.color
                    element.children[coinsUsed].className = m.class ? m.class : ""
                    coinsUsed++
                }
                if (coinsUsed >= 2 || amount.gte(100)) break;
            }
            break;
        case 3:
            element.children[0].textContent = "$" + format(coinsDec.div(100), 2)
            element.children[0].style.color = "#E5C100"
            element.children[0].className = ""
            break;
        default:
            throw new Error("Invalid currency notation set");
    }
}

function formatTime(sec_num, show_ms = false) {
    if (sec_num == null) {
        return "unknown"
    }
    if (sec_num < 0) {
        return '-' + formatTime(-sec_num, show_ms)
    }

    if (sec_num >= 31536000) {
        let years = Math.floor(sec_num / 31536000)
        if (years >= 1000) {
            return formatWhole(years) + ' years'
        }
        return years + 'y ' + formatTime(sec_num % 31536000, show_ms)
    }
    if (sec_num >= 86400) {
        let days = Math.floor(sec_num / 86400)
        return days + 'd ' + formatTime(sec_num % 86400, show_ms)
    }

    let hours = Math.floor(sec_num / 3600)
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60)
    let seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60))
    let ms = Math.floor((sec_num - Math.floor(sec_num)) * 1000)
    let mss = (show_ms ? "." + ms.toString().padStart(3, "0") : "")

    if (hours < 10) hours = "0" + hours
    if (minutes < 10) minutes = "0" + minutes
    if (seconds < 10) seconds = "0" + seconds
    return (sec_num > 3600 ? hours + ':' : "") + minutes + ':' + seconds + mss
}

function formatTreshold(number, decimals = 1, treshold = 100000) {
    if (number < treshold)
        return Math.floor(number)
    else
        return format(number, decimals)
}

function formatLevel(level) {
    if (level >= 100000)
        return format(level)

    return level.toLocaleString()
}

function formatAge(days) {
    const years = daysToYears(days)
    const day = getCurrentDay(days)
    if (years > 10000)
        return t("age") + " " + format(years)
    else
        return t("age") + " " + years + " " + t("day") + " " + day
}

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}


function daysToYears(days) {
    return Math.floor(days / 365)
}

function getCurrentDay(days) {
    return Math.floor(days - daysToYears(days) * 365)
}

function removeSpaces(string) {
    return string.replace(/ /g, "")
}

function removeStrangeCharacters(string) {
    return string.replace(/'/g, "")
}

function getChallengeTaskGoalProgress(taskName) {
    if (!Object.keys(gameData.taskData).includes(taskName))
        return 0
    if (gameData.taskData[taskName].isHero)
        return gameData.taskData[taskName].level * 1000
    else
        return gameData.taskData[taskName].level
}

function getFormattedChallengeTaskGoal(taskName, level) {
    if (level < 100000)
        return t(taskName) + " " + t("lvl") + " " + formatLevel(level)
    else
        return t("great") + " " + t(taskName) + " " + t("lvl") + " " + formatLevel(Math.ceil(level / 1000))
}

function getFormattedTitle(parameter) {    
    let title = parameter.replaceAll("_", " ")
    title = title.charAt(0).toUpperCase() + title.slice(1)

    return title
}

const CHALLENGE_KEY_TO_NUMBER = {
    an_unhappy_life: 1,
    rich_and_the_poor: 2,
    time_does_not_fly: 3,
    dance_with_the_devil: 4,
    legends_never_die: 5,
    the_darkest_time: 6,
}

function getChallengeTranslatedName(challengeKey) {
    const num = CHALLENGE_KEY_TO_NUMBER[challengeKey]
    return num ? t("challenge_" + num + "_name") : challengeKey
}

// --- Admin speed control ---
const ADMIN_PASSWORD_HASH = "26fa8e11b8b065f18e533c8f40889ccd019546d631772508ca68c272e686e45a"

async function checkAdminPassword() {
    const input = document.getElementById("adminPasswordInput").value
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (hashHex === ADMIN_PASSWORD_HASH) {
        gameData.settings.isAdmin = true
        document.getElementById("adminPasswordRow").classList.add("hidden")
        document.getElementById("adminSpeedRow").classList.remove("hidden")
        document.getElementById("adminSpeedSlider").value = gameData.settings.adminSpeedMultiplier
        document.getElementById("adminSpeedInput").value = gameData.settings.adminSpeedMultiplier
        document.getElementById("adminSpeedDisplay").textContent = "x" + gameData.settings.adminSpeedMultiplier
    } else {
        document.getElementById("adminPasswordInput").value = ""
        document.getElementById("adminPasswordInput").style.borderColor = "red"
        setTimeout(() => { document.getElementById("adminPasswordInput").style.borderColor = "" }, 1500)
    }
}

function setAdminSpeed(value) {
    value = Math.max(1, Math.min(1000000, parseInt(value) || 1))
    gameData.settings.adminSpeedMultiplier = value
    document.getElementById("adminSpeedSlider").value = Math.min(value, 1000)
    document.getElementById("adminSpeedInput").value = value
    document.getElementById("adminSpeedDisplay").textContent = "x" + value
}

function initAdminPanel() {
    if (gameData.settings.isAdmin) {
        document.getElementById("adminPasswordRow").classList.add("hidden")
        document.getElementById("adminSpeedRow").classList.remove("hidden")
        document.getElementById("adminSpeedSlider").value = gameData.settings.adminSpeedMultiplier
        document.getElementById("adminSpeedInput").value = gameData.settings.adminSpeedMultiplier
        document.getElementById("adminSpeedDisplay").textContent = "x" + gameData.settings.adminSpeedMultiplier
    }
}
