// ui/init.js — initialization and UI update loop

function initializeUI() {
    /*
        Initializes the UI. Adds all html elements required for rendering.
    */

    createAllRows(jobCategories, "jobTable")
    createAllRows(skillCategories, "skillTable")
    createAllRows(itemCategories, "itemTable")
    createAllRows(milestoneCategories, "milestoneTable")

    createPerks("perksLayout")

    setLayout(peekSettingFromSave("layout"))
    setFontSize(peekSettingFromSave("fontSize"))
    setNotation(peekSettingFromSave("numberNotation"))
    setCurrency(peekSettingFromSave("currencyNotation"))
    setStickySidebar(peekSettingFromSave("stickySidebar"))

    setTheme(peekSettingFromSave("theme"))
    selectElementInGroup("EnableKeybinds", peekSettingFromSave("enableKeybinds") ? 0 : 1)

    for (const key in gameData.requirements) {
        const requirement = gameData.requirements[key]
        requirement.queryElements()
    }

    refreshSettingsButtons()
    refreshLangButtons()
}

function refreshSettingsButtons() {
    const legends = {
        CurrencyNotation: ["currency_medieval", "currency_extended", "currency_british", "currency_modern"],
        Notation: ["notation_standard", "notation_scientific", "notation_engineering"],
        Layout: ["layout_standard", "layout_wide"],
        Theme: ["theme_light", "theme_dark", "theme_colorblind"],
        EnableKeybinds: ["enabled", "disabled"]
    }
    for (const cls in legends) {
        const buttons = document.getElementsByClassName(cls)
        const keys = legends[cls]
        for (let i = 0; i < keys.length; i++) {
            if (buttons[i]) buttons[i].textContent = t(keys[i])
        }
    }
    const fontButtons = document.querySelectorAll('#settings button[onclick*="setFontSize"]')
    if (fontButtons[0]) fontButtons[0].textContent = t("font_smaller")
    if (fontButtons[1]) fontButtons[1].textContent = t("font_larger")
    const importBox = document.getElementById("importExportBox")
    if (importBox) importBox.placeholder = t("import_save_placeholder")

    const keyHints = {
        key1: "shortcut_q",
        key2: "shortcut_e",
        key3: "shortcut_t",
        key4: "shortcut_u",
        key5: "shortcut_g",
        keyChallenge: "shortcut_challenge"
    }
    for (const id in keyHints) {
        const el = document.getElementById(id)
        if (el) el.textContent = t(keyHints[id])
    }
}

function updateUI() {
    /*
        NOTE: To ensure that performance does not decrease,
        please only call the render function when the user can actually see the content.
        If they can always see the content put the function call at the top of this function.

        NOTE2: Do NOT render anything to the screen outside of this function.
    */

    // Always render the sidebar.
    renderSideBar()

    // Always render all the requirements.
    renderRequirements()

    const currentTab = gameData.settings.selectedTab

    if (currentTab == Tab.JOBS) {
        updateRequiredRows(gameData.taskData, jobCategories)
        renderHeaderRows(jobCategories)
        renderJobs()
    }

    if (currentTab == Tab.SKILLS || gameData.settings.layout == 0 && currentTab == Tab.JOBS) {
        updateRequiredRows(gameData.taskData, skillCategories)
        renderHeaderRows(skillCategories)
        renderSkills()
    }

    if (currentTab == Tab.SHOP || gameData.settings.layout == 0 && currentTab == Tab.JOBS) {
        updateRequiredRows(gameData.itemData, itemCategories)
        renderShop()
    }

    if (currentTab == Tab.CHALLENGES)
        renderChallenges()

    if (currentTab == Tab.MILESTONES) {
        updateRequiredRows(milestoneData, milestoneCategories)
        renderMilestones()
    }

    if (currentTab == Tab.DARK_MATTER)
        renderDarkMatter()

    if (currentTab == Tab.METAVERSE)
        renderMetaverse()

    if (currentTab == Tab.SETTINGS)
        renderSettings()
}
