// main.js — entry point

onerror = () => {
    document.getElementById("errorInfo").hidden = false
    tempData.hasError = true
    setTimeout(() => {
        document.getElementById("errorInfo").hidden = true
    }, ERROR_DISPLAY_TIMEOUT)
}

document.querySelector("#changelogTabTabButton").addEventListener('click', async function () {
    renderChangelog();
});

function togglePause() {
    gameData.paused = !gameData.paused
}

function toggleAutoBuy() {
    gameData.autoBuyEnabled = document.getElementById("autoBuyToggle").checked
}

function setCurrentProperty(propertyName) {
    if (gameData.paused)
        return
    gameData.autoBuyEnabled = false
    gameData.currentProperty = gameData.itemData[propertyName]
}

function setMisc(miscName) {
    if (gameData.paused)
        return
    gameData.autoBuyEnabled = false
    const misc = gameData.itemData[miscName]
    if (gameData.currentMisc.includes(misc)) {
        for (i = 0; i < gameData.currentMisc.length; i++) {
            if (gameData.currentMisc[i] == misc) {
                gameData.currentMisc.splice(i, 1)
            }
        }
    } else {
        gameData.currentMisc.push(misc)
    }
}

function createGameObjects(data, baseData) {
    for (const key in baseData)
        createGameObject(data, baseData[key], key)
}

function createGameObject(data, entity, id) {
    if ("income" in entity) { data[id] = new Job({...entity, id}) }
    else if ("maxXp" in entity) { data[id] = new Skill({...entity, id}) }
    else if ("tier" in entity) { data[id] = new Milestone({...entity, id}) }
    else { data[id] = new Item({...entity, id}) }
}

function createSkillRequirements() {
    for (const key in skillBaseData) {
        const skill = skillBaseData[key]
        const req = skill.requirement
        const selector = getQuerySelector(key)
        let requirement
        if (req.type === "task") {
            requirement = new TaskRequirement([selector], req.tasks.map(t => ({
                task: t.task, requirement: t.level, herequirement: t.hero
            })))
        } else if (req.type === "evil") {
            requirement = new EvilRequirement([selector], [{ requirement: req.value }])
        } else if (req.type === "essence") {
            requirement = new EssenceRequirement([selector], [{ requirement: req.value }])
        } else if (req.type === "darkMatter") {
            requirement = new DarkMatterRequirement([selector], [{ requirement: req.value }])
        }
        gameData.requirements[key] = requirement
    }
}

function setCurrency(index) {
    gameData.settings.currencyNotation = index
    selectElementInGroup("CurrencyNotation", index)
}

function setNotation(index) {
    gameData.settings.numberNotation = index
    selectElementInGroup("Notation", index)
}

function getNet() {
    return getIncome().minus(getExpense()).abs()
}

function getIncome() {
    if (gameData.active_challenge == "the_darkest_time")
        return new Decimal(0)
    
    return gameData.currentJob.getIncome().times(getDarkMatterSkillIncome())
}

function getExpense() {
    var expense = toInfinityNumber(gameData.currentProperty.getExpense())
    for (misc of gameData.currentMisc) {
        expense = expense.plus(misc.getExpense())
    }
    return expense
}

function setTheme(index, reload=false) {
    const body = document.getElementById("body")

    body.classList.remove("dark")
    body.classList.remove("colorblind")


    if (index == 0) {
        // lignt
    }
    else if (index == 1) {
        // dark
        body.classList.add("dark")
    }
    else if (index == 2){
        // colorblind Tritanopia
        body.classList.add("colorblind")
    }

    gameData.settings.theme = index
    selectElementInGroup("Theme", index)

    if (reload) {
        saveGameData()
        location.reload()
    }
}

function setEnableKeybinds(enableKeybinds) {
    gameData.settings.enableKeybinds = enableKeybinds
    selectElementInGroup("EnableKeybinds", enableKeybinds ? 0 : 1)
    document.getElementById("keybindsList").classList.toggle("hidden", !enableKeybinds)
}


// Initialization

// Loads the game save, does the initial render and starts the game update and render loop.

createGameObjects(gameData.taskData, jobBaseData)
createGameObjects(gameData.taskData, skillBaseData)
createGameObjects(gameData.itemData, itemBaseData)
createGameObjects(milestoneData, milestoneBaseData)

gameData.currentJob = gameData.taskData["Beggar"]
gameData.currentProperty = gameData.itemData["Homeless"]
gameData.currentMisc = []

gameData.requirements = requirementsBaseData

createSkillRequirements()
createMilestoneRequirements()

tempData["requirements"] = {}
for (const key in gameData.requirements) {
    const requirement = gameData.requirements[key]
    tempData["requirements"][key] = requirement
}

loadGameData()

initializeUI()
initAdminPanel()

setCustomEffects()
addMultipliers()

applyTranslations()
update()

setTab(gameData.settings.selectedTab)
setTabSettings("settingsTab")
setTabDarkMatter("shopTab")
setTabMetaverse("metaverseTab1")

let ticking = false;

var gameloop = setInterval(function() {
    if (ticking) return;
    ticking = true;
    update();

    ticking = false;
}, 1000 / updateSpeed)
var saveloop = setInterval(saveGameData, 3000)

// Re-apply translations when language changes
document.addEventListener('i18n:changed', () => {
    updateUI();
    refreshSettingsButtons();
    refreshLangButtons();
    updateFontSizeIndicator();
    renderChangelog();
});
