// save.js — save/load/import/export functions

// Legacy skill display names (pre-content-framework saves) → new content ids.
// Needed once to carry player progress over when taskData keys switched from names to ids.
const SKILL_LEGACY_IDS = {
    "Concentration": "skill_concentration",
    "Productivity": "skill_productivity",
    "Bargaining": "skill_bargaining",
    "Meditation": "skill_meditation",
    "Strength": "skill_strength",
    "Battle Tactics": "skill_battle_tactics",
    "Muscle Memory": "skill_muscle_memory",
    "Mana Control": "skill_mana_control",
    "Life Essence": "skill_life_essence",
    "Time Warping": "skill_time_warping",
    "Astral Body": "skill_astral_body",
    "Temporal Dimension": "skill_temporal_dimension",
    "All Seeing Eye": "skill_all_seeing_eye",
    "Brainwashing": "skill_brainwashing",
    "Dark Influence": "skill_dark_influence",
    "Evil Control": "skill_evil_control",
    "Intimidation": "skill_intimidation",
    "Demon Training": "skill_demon_training",
    "Blood Meditation": "skill_blood_meditation",
    "Demon's Wealth": "skill_demons_wealth",
    "Dark Knowledge": "skill_dark_knowledge",
    "Soul Drain": "skill_soul_drain",
    "Void Influence": "skill_void_influence",
    "Time Loop": "skill_time_loop",
    "Evil Incarnate": "skill_evil_incarnate",
    "Absolute Wish": "skill_absolute_wish",
    "Void Amplification": "skill_void_amplification",
    "Mind Release": "skill_mind_release",
    "Ceaseless Abyss": "skill_ceaseless_abyss",
    "Void Symbiosis": "skill_void_symbiosis",
    "Void Embodiment": "skill_void_embodiment",
    "Abyss Manipulation": "skill_abyss_manipulation",
    "Cosmic Longevity": "skill_cosmic_longevity",
    "Cosmic Recollection": "skill_cosmic_recollection",
    "Essence Collector": "skill_essence_collector",
    "Galactic Command": "skill_galactic_command",
    "Yin Yang": "skill_yin_yang",
    "Parallel Universe": "skill_parallel_universe",
    "Higher Dimensions": "skill_higher_dimensions",
    "Epiphany": "skill_epiphany",
    "Dark Prince": "skill_dark_prince",
    "Dark Ruler": "skill_dark_ruler",
    "Immortal Ruler": "skill_immortal_ruler",
    "Dark Magician": "skill_dark_magician",
    "Universal Ruler": "skill_universal_ruler",
    "Blinded By Darkness": "skill_blinded_by_darkness"
}

function migrateLegacySkills(gameDataSave) {
    const taskData = gameDataSave.taskData
    if (taskData == null) return

    let migrated = false
    for (const key in taskData) {
        const id = SKILL_LEGACY_IDS[key]
        if (id == null) continue
        const task = taskData[key]
        task.id = id
        if (skillBaseData[id] != null)
            task.name = skillBaseData[id].name
        taskData[id] = task
        delete taskData[key]
        migrated = true
    }
    if (migrated)
        console.log("Migrated legacy skill save keys to content ids")
}

function assignMethods() {
    for (const key in gameData.taskData) {
        let task = gameData.taskData[key]
        if (task.baseData.income) {
            const jobId = task.id || task.baseData.id || task.name
            if (jobBaseData[jobId] == null) continue
            task.id = jobId
            task.baseData = jobBaseData[jobId]
            task = Object.assign(new Job(jobBaseData[jobId]), task)
        } else {
            const skillId = task.id || task.baseData.id || SKILL_LEGACY_IDS[task.name] || task.name
            if (skillBaseData[skillId] == null) continue
            task.id = skillId
            task.name = skillBaseData[skillId].name
            task.baseData = skillBaseData[skillId]
            task = Object.assign(new Skill(skillBaseData[skillId]), task)
        }

        // There are two cases. The number is stored as a large number or in the scientific notation.
        if (typeof task.xpBigInt === "string" && task.xpBigInt.includes("e"))
            task.xpBigInt = BigInt(exponentialToRawNumberString(task.xpBigInt))
        else
            task.xpBigInt = BigInt(task.xpBigInt)

        gameData.taskData[key] = task
    }

    for (const key in gameData.itemData) {
        let item = gameData.itemData[key]
        item.baseData = itemBaseData[item.name]
        item = Object.assign(new Item(itemBaseData[item.name]), item)
        gameData.itemData[key] = item
    }

    for (const key in gameData.requirements) {
        let requirement = gameData.requirements[key]
        if (requirement.type == "task") {
            requirement = Object.assign(new TaskRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "coins") {
            requirement = Object.assign(new CoinRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "age") {
            requirement = Object.assign(new AgeRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "evil") {
            requirement = Object.assign(new EvilRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "essence") {
            requirement = Object.assign(new EssenceRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "darkMatter") {
            requirement = Object.assign(new DarkMatterRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "darkOrb") {
            requirement = Object.assign(new DarkOrbsRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "metaverse") {
            requirement = Object.assign(new MetaverseRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "hypercube") {
            requirement = Object.assign(new HypercubeRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "perkpoint") {
            requirement = Object.assign(new PerkPointRequirement(requirement.querySelectors, requirement.requirements), requirement)
        }
        

        const tempRequirement = tempData["requirements"][key]
        requirement.elements = tempRequirement.elements
        requirement.requirements = tempRequirement.requirements
        gameData.requirements[key] = requirement
    }

    gameData.currentJob = gameData.taskData[gameData.currentJob.name]
    gameData.currentProperty = gameData.itemData[gameData.currentProperty.name]
    const newArray = []
    for (const misc of gameData.currentMisc) {
        newArray.push(gameData.itemData[misc.name])
    }
    gameData.currentMisc = newArray
}

function replaceSaveDict(dict, saveDict) {
    for (const key in dict) {
        if (!(key in saveDict)) {
            saveDict[key] = dict[key]
        } else if (dict == gameData.requirements) {
            if (saveDict[key].type != tempData["requirements"][key].type) {
                saveDict[key] = tempData["requirements"][key]
            }
            else {
                saveDict[key].querySelectors = tempData["requirements"][key].querySelectors
            }

        }
    }

    for (const key in saveDict) {
        if (!(key in dict)) {
            delete saveDict[key]
        }
    }
}

function saveGameData() {
    localStorage.setItem("gameDataSave", JSON.stringify(gameData))
}

function peekSettingFromSave(setting) {
    try {
        const save = localStorage.getItem("gameDataSave")
        if (save == null)
            return gameData.settings[setting]
        const gameDataSave = JSON.parse(save)
        if (gameDataSave.settings == undefined || gameDataSave.settings[setting] == undefined)
            return gameData.settings[setting]
        return gameDataSave.settings[setting]
    } catch (error) {
        console.error(error)
        console.log(localStorage.getItem("gameDataSave"))
        alert("It looks like you tried to load a corrupted save... If this issue persists, feel free to contact the developers!")
    }
}

function loadGameData() {
    try {
        const gameDataSave = JSON.parse(localStorage.getItem("gameDataSave"))

        if (gameDataSave !== null) {
            migrateLegacySkills(gameDataSave)

            // When the game contains completedTimes, add 1 Dark Matter and remove the instance.
            if ("completedTimes" in gameDataSave && gameDataSave["completedTimes"] > 0) {
                delete gameDataSave["completedTimes"]
                gameDataSave.dark_matter += 1
                console.log("Gave 1 free Dark Matter")
            }

            // remove milestoneData from gameData
            if ("milestoneData" in gameDataSave) {
                delete gameDataSave["milestoneData"]                
            }

            replaceSaveDict(gameData, gameDataSave)
            replaceSaveDict(gameData.requirements, gameDataSave.requirements)
            replaceSaveDict(gameData.taskData, gameDataSave.taskData)
            replaceSaveDict(gameData.itemData, gameDataSave.itemData)
            replaceSaveDict(gameData.settings, gameDataSave.settings)
            replaceSaveDict(gameData.stats, gameDataSave.stats)
            replaceSaveDict(gameData.challenges, gameDataSave.challenges)
            replaceSaveDict(gameData.dark_matter_shop, gameDataSave.dark_matter_shop)
            replaceSaveDict(gameData.metaverse, gameDataSave.metaverse)
            replaceSaveDict(gameData.perks, gameDataSave.perks)
            gameData = gameDataSave

            if (gameData.coins == null)
                gameData.coins = 0

            // Coins are stored as Decimal
            gameData.coins = toInfinityNumber(gameData.coins)

            // A save can get poisoned with Infinity (e.g. by a pre-Decimal income overflow)
            if (!isFinite(gameData.coins.mantissa))
                gameData.coins = new Decimal(0)

            if (gameData.essence == null)
                gameData.essence = 0

            // Essence is stored as Decimal
            gameData.essence = toInfinityNumber(gameData.essence)

            if (!isFinite(gameData.essence.mantissa))
                gameData.essence = new Decimal(0)

            if (gameData.days == null)
                gameData.days = DEFAULT_STARTING_AGE

            if (gameData.evil == null)
                gameData.evil = 0

            // Evil is stored as Decimal
            gameData.evil = toInfinityNumber(gameData.evil)

            if (!isFinite(gameData.evil.mantissa))
                gameData.evil = new Decimal(0)

            // Per-second stats are stored as Decimal
            for (const key of ["EvilPerSecond", "maxEvilPerSecond", "EssencePerSecond", "maxEssencePerSecond", "maxEssenceReached"]) {
                gameData.stats[key] = toInfinityNumber(gameData.stats[key] ?? 0)
                if (!isFinite(gameData.stats[key].mantissa))
                    gameData.stats[key] = new Decimal(0)
            }

            if (gameData.dark_matter == null || isNaN(gameData.dark_matter))
                gameData.dark_matter = 0

            // Dark Matter is stored as Decimal
            gameData.dark_matter = toInfinityNumber(gameData.dark_matter)

            if (!isFinite(gameData.dark_matter.mantissa))
                gameData.dark_matter = new Decimal(0)

            if (gameData.dark_orbs == null || isNaN(gameData.dark_orbs))
                gameData.dark_orbs = 0

            // Dark orbs are stored as Decimal
            gameData.dark_orbs = toInfinityNumber(gameData.dark_orbs)

            if (gameData.hypercubes == null || isNaN(gameData.hypercubes))
                gameData.hypercubes = 0

            if (gameData.perks_points == null || isNaN(gameData.perks_points))
                gameData.perks_points = 0

            if (gameData.settings.theme == null) {
                gameData.settings.theme = 1
            }

            if (gameData.rebirthOneTime == null || gameData.rebirthOneTime === 0) {
                gameData.rebirthOneTime = gameData.realtime
            }

            if (gameData.rebirthTwoTime == null || gameData.rebirthTwoTime === 0) {
                gameData.rebirthTwoTime = gameData.realtime
            }

            if (gameData.rebirthThreeTime == null || gameData.rebirthThreeTime === 0) {
                gameData.rebirthThreeTime = gameData.realtime
            }

            if (gameData.rebirthFourTime == null || gameData.rebirthFourTime === 0) {
                gameData.rebirthFourTime = gameData.realtime
            }

            // Remove invalid active misc items
            gameData.currentMisc = gameData.currentMisc.filter((element) => element instanceof Item)
        }
    } catch (error) {
        console.error(error)
        console.log(localStorage.getItem("gameDataSave"))
        alert("It looks like you tried to load a corrupted save... If this issue persists, feel free to contact the developers!")
    }

    assignMethods()
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
        const data = JSON.parse(window.atob(importExportBox.value))
        clearInterval(gameloop)
        gameData = data
        saveGameData()
        location.reload()
    } catch (error) {
        alert("It looks like you tried to load a corrupted save... If this issue persists, feel free to contact the developers!")
    }
}

function exportGameData() {
    const importExportBox = document.getElementById("importExportBox")
    const saveString = window.btoa(JSON.stringify(gameData))
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
