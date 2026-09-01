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

function forceAutobuy() {
    autoBuyEnabled = true
}

function setCurrentProperty(propertyName) {
    if (gameData.paused)
        return
    autoBuyEnabled = false
    gameData.currentProperty = gameData.itemData[propertyName]
}

function setMisc(miscName) {
    if (gameData.paused)
        return
    autoBuyEnabled = false
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
        createGameObject(data, baseData[key])
}

function createGameObject(data, entity) {
    if ("income" in entity) { data[entity.name] = new Job(entity) }
    else if ("maxXp" in entity) { data[entity.name] = new Skill(entity) }
    else if ("tier" in entity) { data[entity.name] = new Milestone(entity) }
    else {data[entity.name] = new Item(entity)}
    data[entity.name].id = "row " + entity.name
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
    return Math.abs(getIncome() - getExpense())
}

function getIncome() {
    if (gameData.active_challenge == "the_darkest_time")
        return 0
    
    return gameData.currentJob.getIncome() * getDarkMatterSkillIncome()
}

function getExpense() {
    var expense = 0
    expense += gameData.currentProperty.getExpense()
    for (misc of gameData.currentMisc) {
        expense += misc.getExpense()
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

createMilestoneRequirements()

tempData["requirements"] = {}
for (const key in gameData.requirements) {
    const requirement = gameData.requirements[key]
    tempData["requirements"][key] = requirement
}

loadGameData()

initializeUI()

setCustomEffects()
addMultipliers()

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

    // fps for debug only
    //var thisFrameTime = (thisLoop = new Date) - lastLoop;
    //frameTime += (thisFrameTime - frameTime) / filterStrength;
    //lastLoop = thisLoop;

    ticking = false;
}, 1000 / updateSpeed)
var saveloop = setInterval(saveGameData, 3000)

/* FPS */
/*
var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;
var fpsOut = document.getElementById('fps');
setInterval(function () {
    fpsOut.innerHTML = (1000 / frameTime).toFixed(1) + " fps";
}, 1000);
*/

// Re-apply translations when language changes
document.addEventListener('i18n:changed', () => {
    updateUI();
    refreshSettingsButtons();
    refreshLangButtons();
});
