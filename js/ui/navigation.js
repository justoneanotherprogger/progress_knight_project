// ui/navigation.js — navigation, settings, tab switching, keyboard shortcuts

function setStickySidebar(sticky) {
    gameData.settings.stickySidebar = sticky;
    settingsStickySidebar.checked = sticky;
    info.style.position = sticky ? 'sticky' : 'initial';
    resources.style.position = sticky ? 'sticky' : 'initial';
    tabcolumn.style.position = sticky ? 'sticky' : 'initial';
}

function selectElementInGroup(group, index) {
    const elements = document.getElementsByClassName(group)
    for (const el of elements) {
        el.classList.remove("selected")
    }
    elements[index].classList.add("selected")
}

function refreshLangButtons() {
    const buttons = document.getElementsByClassName("lang-btn")
    for (const el of buttons) {
        el.classList.toggle("selected", el.dataset.lang == currentLang)
    }
}

function setLayout(id) {
    gameData.settings.layout = id
    if (id == 0) {
        document.getElementById("skillsTabButton").classList.add("hidden")
        document.getElementById("shopTabButton").classList.add("hidden")

        document.getElementById("skills").classList.add("hidden")
        document.getElementById("shop").classList.add("hidden")

        document.getElementById("tabcolumn").classList.add("plain-tab-column")
        document.getElementById("tabcolumn").classList.remove("tabs-tab-column")

        document.getElementById("maincolumn").classList.add("plain-main-column")
        document.getElementById("maincolumn").classList.remove("tabs-main-column")

        document.getElementById("jobs").appendChild(document.getElementById("skillPage"))
        document.getElementById("jobs").appendChild(document.getElementById("itemPage"))
    } else {
        document.getElementById("skillsTabButton").classList.remove("hidden")
        document.getElementById("shopTabButton").classList.remove("hidden")

        document.getElementById("skills").classList.remove("hidden")
        document.getElementById("shop").classList.remove("hidden")

        document.getElementById("tabcolumn").classList.add("tabs-tab-column")
        document.getElementById("tabcolumn").classList.remove("plain-tab-column")

        document.getElementById("maincolumn").classList.add("tabs-main-column")
        document.getElementById("maincolumn").classList.remove("plain-main-column")

        document.getElementById("skills").appendChild(document.getElementById("skillPage"))
        document.getElementById("shop").appendChild(document.getElementById("itemPage"))
    }

    // dark matter layout
    if (id == 0) {
        document.getElementById("tabcolumnDarkMater").classList.add("hidden")
        document.getElementById("shopTab").appendChild(document.getElementById("skillTreePage"))
        setTabDarkMatter("shopTab")

        document.getElementById("maincolumnDarkMatter").classList.remove("settings-main-column")
        document.getElementById("skillTreePageDarkMaterTitle").textContent = "Dark Matter Abilities "
    }
    else {
        document.getElementById("tabcolumnDarkMater").classList.remove("hidden")
        document.getElementById("skillTreeTab").appendChild(document.getElementById("skillTreePage"))

        document.getElementById("maincolumnDarkMatter").classList.add("settings-main-column")
        document.getElementById("skillTreePageDarkMaterTitle").textContent = "Dark Matter: "

    }

    // metaverse layout

    if (id == 0) {
        document.getElementById("tabcolumnMetaverse").classList.add("hidden")
        document.getElementById("metaverseTab1").appendChild(document.getElementById("metaversePage2"))
        setTabMetaverse("metaverseTab1")

        document.getElementById("maincolumnMetaverse").classList.remove("settings-main-column")
    }
    else {
        document.getElementById("tabcolumnMetaverse").classList.remove("hidden")
        document.getElementById("metaverseTab2").appendChild(document.getElementById("metaversePage2"))

        document.getElementById("maincolumnMetaverse").classList.add("settings-main-column")     
    }

    selectElementInGroup("Layout", id == 0 ? 1 : 0)
}

function setFontSize(id) {
    const fontSizes = {
        0: "xx-small",
        1: "x-small",
        2: "small",
        3: "medium",
        4: "large",
        5: "x-large",
        6: "xx-large",
        7: "xxx-large",
    }

    if (id < 0) id = 0
    if (id > 7) id = 7

    gameData.settings.fontSize = id
    document.getElementById("body").style.fontSize = fontSizes[id]
}

function updateFontSizeIndicator() {
    const label = document.getElementById("font_size")
    if (label) label.innerHTML = t("font_size") + " " + gameData.settings.fontSize + "/7"
}

function setSignDisplay() {
    const signDisplay = document.getElementById("signDisplay")
    if (!signDisplay) return

    if (getNet() > -1 && getNet() < 1) {
        signDisplay.textContent = ""
        signDisplay.style.color = "gray"
    } else if (getIncome() > getExpense()) {
        signDisplay.textContent = "+"
        signDisplay.style.color = "green"
    } else {
        signDisplay.textContent = "-"
        signDisplay.style.color = "red"
    }
}

function getQuerySelector(taskName) {    
    return "#row" + removeSpaces(removeStrangeCharacters(taskName))
}

function getRowByName(name) {
    return document.getElementById("row" + removeSpaces(removeStrangeCharacters(name)))
}

const Tab = Object.freeze({
    JOBS: "jobs",
    SKILLS: "skills",
    SHOP: "shop",
    CHALLENGES: "challenges",
    MILESTONES: "milestones",
    REBIRTH: "rebirth",
    DARK_MATTER: "darkMatter",
    METAVERSE: "metaverse",
    SETTINGS: "settings"
})

/**
 * @param {Tab} selectedTab
 */
function setTab(selectedTab) {
    const tabElement = document.getElementById(selectedTab)

    if (tabElement == null) {
        setTab(Tab.JOBS)
        return
    }

    gameData.settings.selectedTab = selectedTab

    // Update the UI when switching tabs to prevent flikering.
    updateUI()

    const element = document.getElementById(selectedTab + "TabButton")

    const tabs = Array.prototype.slice.call(document.getElementsByClassName("tab"))
    tabs.forEach(function(tab) {
        tab.style.display = "none"
    })
    tabElement.style.display = "flex"

    const tabButtons = document.getElementsByClassName("tabButton")
    for (tabButton of tabButtons) {
        tabButton.classList.remove("w3-blue-gray")
    }
    element.classList.add("w3-blue-gray")
}

function setTabSettings(tab) {
    const element = document.getElementById(tab + "TabButton")

    const tabs = Array.prototype.slice.call(document.getElementsByClassName("tabSettings"))
    tabs.forEach(function (tab) {
        tab.style.display = "none"
    })
    document.getElementById(tab).style.display = "flex"

    const tabButtons = document.getElementsByClassName("tabButtonSettings")
    for (const tabButton of tabButtons) {
        tabButton.classList.remove("w3-blue-gray")
    }
    element.classList.add("w3-blue-gray")
}

function setTabDarkMatter(tab) {
    const element = document.getElementById(tab + "TabButton")

    const tabs = Array.prototype.slice.call(document.getElementsByClassName("tabDarkMatter"))
    tabs.forEach(function (tab) {
        tab.style.display = "none"
    })
    document.getElementById(tab).style.display = "flex"

    const tabButtons = document.getElementsByClassName("tabButtonDarkMatter")
    for (const tabButton of tabButtons) {
        tabButton.classList.remove("w3-blue-gray")
    }
    element.classList.add("w3-blue-gray")
}

function setTabMetaverse(tab) {
    const element = document.getElementById(tab + "TabButton")

    const tabs = Array.prototype.slice.call(document.getElementsByClassName("tabMetaverse"))
    tabs.forEach(function (tab) {
        tab.style.display = "none"
    })
    document.getElementById(tab).style.display = "flex"

    const tabButtons = document.getElementsByClassName("tabButtonMetaverse")
    for (const tabButton of tabButtons) {
        tabButton.classList.remove("w3-blue-gray")
    }
    element.classList.add("w3-blue-gray")
}

function createPerks(perkLayoutName) {
    const buttonTemplate = document.getElementsByClassName("perkItem")
    const perksLayout = document.getElementById(perkLayoutName)
    for (const perkName of getSortedPerks()) {
        const perk = createPerk(buttonTemplate, perkName[0])
        perksLayout.appendChild(perk)
    }
}

function createPerk(template, name) {
    const button = template[0].content.firstElementChild.cloneNode(true)
    button.getElementsByClassName("perkName")[0].textContent = getMetaversePerkName(name)
    button.getElementsByClassName("perkCost")[0].textContent = getPerkCost(name)
    button.id = "id" + removeSpaces(removeStrangeCharacters(name))
    button.onclick = () => { buyPerk(name) }    

    return button
}

// Keyboard shortcuts + Loadouts ( courtesy of Pseiko )
function changeTab(direction){
    const tabs = Array.prototype.slice.call(document.getElementsByClassName("tab"))
    const tabButtons = Array.prototype.slice.call(document.getElementsByClassName("tabButton"))

    let currentTab = 0
    for (const i in tabs) {
        if (!tabs[i].style.display.includes("none") && !tabs[i].classList.contains("hidden"))
             currentTab = i*1
    }
    let targetTab = currentTab + direction
    if (targetTab < 0) {
        setTab(Tab.SETTINGS)
        return
    }
    targetTab = Math.max(0,targetTab)
    if (targetTab > tabs.length - 1) targetTab = 0
    while (tabButtons[targetTab].style.display.includes("none") || tabButtons[targetTab].classList.contains("hidden")){
        targetTab = targetTab + direction
        targetTab = Math.max(0, targetTab)
        if (targetTab > tabs.length-1) targetTab = 0
    }

    setTab(tabs[targetTab].id)
}

function toggleChallenge(challengeName) {
    if (!gameData.requirements["Challenges"].isCompleted())
        return

    if (gameData.active_challenge == "") {
        if (gameData.requirements["Challenge_" + challengeName].isCompleted())
            enterChallenge(challengeName)
    }
    else if (gameData.active_challenge == challengeName)
        exitChallenge()
    else {
        exitChallenge()
        if (gameData.requirements["Challenge_" + challengeName].isCompleted())
            enterChallenge(challengeName)
    }
}

window.addEventListener('keydown', function (e) {
    if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
        if (e.key == " " && !e.repeat) {
            togglePause()
            if (e.target == document.body) {
                e.preventDefault();
            }
        }
        if (e.key == "ArrowRight") changeTab(1)
        if (e.key == "ArrowLeft") changeTab(-1)

        // The "dangerous" keybinds can be disabled.
        if (!gameData.settings.enableKeybinds)
            return

        if (e.key == "q") {
            if (gameData.requirements["Rebirth button 1"].isCompleted())
                rebirthOne()
        }

        if (e.key == "e") {
            if (gameData.requirements["Rebirth button 2"].isCompleted())
                rebirthTwo()
        }

        if (e.key == "t") {
            if (gameData.requirements["Rebirth button 3"].isCompleted())
                rebirthThree()
        }

        if (e.key == "u") {
            if (gameData.requirements["Rebirth button 4"].isCompleted())
                rebirthFour()
        }

        if (e.key == "g") {
            if (gameData.requirements["Rebirth button 5"].isCompleted())
                rebirthFive()
        }

        switch (e.key) {
            case "1": toggleChallenge("an_unhappy_life"); break
            case "2": toggleChallenge("rich_and_the_poor"); break
            case "3": toggleChallenge("time_does_not_fly"); break
            case "4": toggleChallenge("dance_with_the_devil"); break
            case "5": toggleChallenge("legends_never_die"); break
            case "6": toggleChallenge("the_darkest_time"); break
        }
    }
});
