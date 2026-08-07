var gameData = {
  taskData: {},
  itemData: {},

  coins: 0,
  days: 365 * 16,
  corruption: 0,
  innerExp: 0,
  eternalKnowledge: 0,
  paused: false,
  timeWarpingEnabled: true,

  rebirthOneCount: 0,
  rebirthTwoCount: 0,
  rebirthThreeCount: 0,

  currentJob: null,
  currentSkill: null,
  currentProperty: null,
  currentMisc: null,

  settings: {
    stickySidebar: true
  }
}

var tempData = {}

var skillWithLowestMaxXp = null

const autoPromoteElement = document.getElementById("autoPromote")
const autoLearnElement = document.getElementById("autoLearn")

const updateSpeed = 20

const baseLifespan = 365 * 75

const baseGameSpeed = 10

const permanentUnlocks = ["Shop", "Automation", "Quick task display", "Rebirth tab", "Corruption info", "Corruption power info", "InnerExp info", "Time warping info",
"Science", "Technology", "Occultism"]

const jobBaseData = {
  "Cleaner": {name: "Cleaner", maxXp: 100, income: 6}, //maxXp = round(maxXpPrev*4*(tier/(tier+1))*(1.01^tier))
  "Chief cleaner": {name: "Chief cleaner", maxXp: 272, income: 13}, //tier 2
  "Sales intern": {name: "Sales intern", maxXp: 841, income: 28}, //tier 3
  "Experienced salesman": {name: "Experienced salesman", maxXp: 2800, income: 90}, //tier 4
  "Manager": {name: "Manager", maxXp: 9809, income: 200}, //tier 5
  "Chief manager": {name: "Chief manager", maxXp: 35700, income: 500}, //tier 6
  "Store headmaster": {name: "Store headmaster", maxXp: 133963, income: 2000}, //tier 7
  "Brand lord": {name: "Brand lord", maxXp: 515779, income: 5000}, //tier 8

  "Junior": {name: "Junior", maxXp: 500, income: 16}, //maxXp = round(maxXpPrev*6*(tier/(tier+1))*(1.01^tier))
  "Middle": {name: "Middle", maxXp: 2040, income: 32}, //tier 2
  "Middle+": {name: "Middle+", maxXp: 9458, income: 64}, //tier 3
  "Senior": {name: "Senior", maxXp: 47242, income: 128}, //tier 4
  "IT supervisor": {name: "IT supervisor", maxXp: 248259, income: 256}, //tier 5
  "Technical Director": {name: "Technical Director", maxXp: 1355307, income: 512}, //tier 6
  "Head of an IT conglomerate": {name: "Head of an IT conglomerate", maxXp: 7628631, income: 1024}, //tier 7
  "World class guru": {name: "World class guru", maxXp: 44057143, income: 2048}, //tier 8
  "World IT coordinator": {name: "World IT coordinator", maxXp: 260197102, income: 4096}, //tier 9

  "Student": {name: "Student", maxXp: 400000, income: 20}, //maxXp = round(maxXpPrev*8*(tier/(tier+1))*(1.01^tier))
  "Scientist naturalist": {name: "Scientist naturalist", maxXp: 2176210, income: 60}, //tier 2
  "Expert naturalist": {name: "Expert naturalist", maxXp: 13452910, income: 180}, //tier 3
  "Theoretical physicist": {name: "Theoretical physicist", maxXp: 89594570, income: 540}, //tier 4
  "Inventor": {name: "Inventor", maxXp: 627765290, income: 1620}, //tier 5
  "Quantum engineer": {name: "Quantum engineer", maxXp: 4569500610, income: 4860}, //tier 6
  "Science revolutioneer": {name: "Science revolutioneer", maxXp: 34293862020, income: 14580}, //tier 7
  "Mad scientist": {name: "Mad scientist", maxXp: 264073517870, income: 43740}, //tier 8
}

const skillBaseData = {
  "Perception": {name: "Perception", maxXp: 100, effect: 1.2, description: "Abilities XP"},
  "Endurance": {name: "Endurance", maxXp: 100, effect: 1, description: "Positions XP"},
  "Stealth": {name: "Stealth", maxXp: 100, effect: 1, description: "Greed"},
  "Aptitude": {name: "Aptitude", maxXp: 100, effect: 0.5, description: "Positions XP"},
  "Hardening": {name: "Hardening", maxXp: 100, effect: 0.21, description: "Lifespan"},

  "Programming": {name: "Programming", maxXp: 100, effect: 0.7, description: "IT income"},
  "Attentiveness": {name: "Attentiveness", maxXp: 100, effect: 0.8, description: "IT XP"},
  "Language understanding": {name: "Language understanding", maxXp: 100, effect: 1.2, description: "Programming XP"},
  "Luckiness": {name: "Luckiness", maxXp: 100, effect: 0.777, description: "Happiness"},
  "Waiting skill": {name: "Waiting skill", maxXp: 100, effect: 0.85, description: "Gamespeed"},
  "Interest in knowledge": {name: "Interest in knowledge", maxXp: 100, effect: 1, description: "Science XP"},
  "Devil's tongue": {name: "Devil's tongue", maxXp: 100, effect: 1, description: "Greed"},

  "Reversal of aging": {name: "Reversal of aging", maxXp: 500, effect: 0.51, description: "Lifespan"},
  "Time acceleration": {name: "Time acceleration", maxXp: 500, effect: 0.9, description: "Gamespeed"},
  "Time machine": {name: "Time machine", maxXp: 500, effect: 1, description: "Gamespeed"},
  "Cellular restructuration": {name: "Cellular restructuration", maxXp: 500, effect: 0.56, description: "Lifespan"},
  "Deep tech understanding": {name: "Deep tech understanding", maxXp: 500, effect: 0.5, description: "Technologies effect"},

  "Corrupted Wish": {name: "Corrupted Wish", maxXp: 200, effect: 0.75, description: "Inspiration"},
  "Corrupted Soul": {name: "Corrupted Soul", maxXp: 200, effect: 1, description: "Corruption gain"},
  "Corrupted Desire": {name: "Corrupted Desire", maxXp: 200, effect: 0.46, description: "Inspiration"},
  "Corrupted Consciousness": {name: "Corrupted Consciousness", maxXp: 200, effect: 0.8, description: "Corruption gain"},
  "Corrupted Greed": {name: "Corrupted Greed", maxXp: 200, effect: 0.3, description: "Greed"},
  "Corrupted Body": {name: "Corrupted Body", maxXp: 200, effect: 0.2, description: "Lifespan"},
  "Corrupted Time": {name: "Corrupted Time", maxXp: 200, effect: 0.4, description: "Gamespeed"},
  "Corrupted Imagination": {name: "Corrupted Imagination", maxXp: 200, effect: 0.21, description: "Inspiration"},
  "Corrupted Mind": {name: "Corrupted Mind", maxXp: 200, effect: 0.4, description: "Corruption efficiency"},
}

const itemBaseData = {
  "Parents house": {name: "Parents house", expense: 0, effect: 1},
  "Placeholder8": {name: "Placeholder8", expense: 17, effect: 1.4}, // expense ~ floor(expensePrev+4^log(effect, 5)+effect^2+50*effect*log(effect, 5))
  "Hostel": {name: "Hostel", expense: 65, effect: 2},
  "3-star hotel room": {name: "3-star hotel room", expense: 178, effect: 3},
  "5-star hotel room": {name: "5-star hotel room", expense: 457, effect: 5},
  "Small apartment": {name: "Small apartment", expense: 1279, effect: 10},
  "Apartment": {name: "Apartment", expense: 3720, effect: 21},
  "Placeholder1": {name: "Placeholder1", expense: 11093, effect: 45},
  "Placeholder2": {name: "Placeholder2", expense: 35452, effect: 100},
  "Placeholder3": {name: "Placeholder3", expense: 140951, effect: 250},
  "Placeholder4": {name: "Placeholder4", expense: 694507, effect: 650},
  "Placeholder5": {name: "Placeholder5", expense: 5167474, effect: 2000},
  "Placeholder6": {name: "Placeholder6", expense: 42760863, effect: 6000},
  "Placeholder7": {name: "Placeholder7", expense: 448919312, effect: 20000},

  "Miscplaceholder8": {name: "Miscplaceholder8", expense: 10, effect: 1.2, description: "Inspiration"},
  "Gym membership": {name: "Gym membership", expense: 20, effect: 1.5, description: "Body XP"},
  "Library card": {name: "Library card", expense: 22, effect: 1.5, description: "Mind XP"},
  "Laptop": {name: "Laptop", expense: 250, effect: 2, description: "Inspiration"},
  "Miscplaceholder9": {name: "Miscplaceholder9", expense: 1000, effect: 2, description: "Interest in knowledge XP"},
  "Car": {name: "Car", expense: 2000, effect: 2, description: "Happiness"},
  "Miscplaceholder7": {name: "Miscplaceholder7", expense: 7500, effect: 2, description: "Positions XP"},
  "Personal assistant": {name: "Personal assistant", expense: 20000, effect: 2, description: "Abilities XP"},
  "Professional mentor": {name: "Professional mentor", expense: 100000, effect: 2, description: "Programming XP"},
  "Miscplaceholder6": {name: "Miscplaceholder6", expense: 600000, effect: 2, description: "Mind XP"},
  "Miscplaceholder1": {name: "Miscplaceholder1", expense: 2500000, effect: 3, description: "Positions XP"},
  "Miscplaceholder2": {name: "Miscplaceholder2", expense: 12000000, effect: 1.5, description: "Happiness"},
  "Miscplaceholder3": {name: "Miscplaceholder3", expense: 70000000, effect: 3, description: "Technologies XP"},
  "Miscplaceholder4": {name: "Miscplaceholder4", expense: 300000000, effect: 10, description: "Body & Mind XP"},
  "Miscplaceholder5": {name: "Miscplaceholder5", expense: 1000000000, effect: 3, description: "Positions XP"},
}

const jobCategories = {
  "Service": ["Cleaner", "Chief cleaner", "Sales intern", "Experienced salesman", "Manager", "Chief manager", "Store headmaster", "Brand lord"],
  "IT": ["Junior", "Middle", "Middle+", "Senior", "IT supervisor", "Technical Director", "Head of an IT conglomerate", "World class guru", "World IT coordinator"],
  "Science": ["Student", "Scientist naturalist", "Expert naturalist", "Theoretical physicist", "Inventor", "Quantum engineer", "Science revolutioneer", "Mad scientist"],
}

const skillCategories = {
  "Body": ["Perception", "Endurance", "Stealth", "Aptitude", "Hardening"],
  "Mind": ["Programming", "Attentiveness", "Language understanding", "Luckiness", "Waiting skill", "Interest in knowledge", "Devil's tongue"],
  "Technology": ["Reversal of aging", "Time acceleration", "Time machine", "Cellular restructuration", "Deep tech understanding"],
  "Occultism": ["Corrupted Wish", "Corrupted Soul", "Corrupted Desire", "Corrupted Consciousness", "Corrupted Greed", "Corrupted Body", "Corrupted Time", "Corrupted Imagination", "Corrupted Mind"],
}

const itemCategories = {
  "Properties": ["Parents house", "Placeholder8", "Hostel", "3-star hotel room", "5-star hotel room", "Small apartment", "Apartment", "Placeholder1", "Placeholder2", "Placeholder3", "Placeholder4", "Placeholder5", "Placeholder6", "Placeholder7"],
  "Misc": ["Miscplaceholder8", "Gym membership", "Library card", "Laptop", "Miscplaceholder9", "Car", "Miscplaceholder7", "Personal assistant", "Professional mentor", "Miscplaceholder6", "Miscplaceholder1", "Miscplaceholder2", "Miscplaceholder3", "Miscplaceholder4", "Miscplaceholder5"]
}

const headerRowColors = {
  // "No category": "#8d8d8d",
  "Service": "#2dd700",
  // "Media": "#ff5900",
  "IT": "#3972fe",
  "Science": "#ffca00",
  // "Medical science": "#2dd700",

  "Occultism": "#a246ff",
  "Body": "#db092b",
  "Mind": "#3972fe",
  // "Perception": "#ff5900",
  // "Endurance": "#dc0055",
  "Technology": "#2dd700",
  // "Intelligence": "#3972fe",
  // "Aptitude": "#a246ff",
  // "Luckiness": "#ffca00",

  "Properties": "#219ebc",
  "Misc": "#b56576",
}

const tooltips = {
}

const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc", "Nv", "Vg", "Uv", "Dv", "Tv", "Qt", "Qv", "Sv", "Oc", "Nd", "Tg", "OMG"];

const jobTabButton = document.getElementById("jobTabButton")

function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}

function getBindedTaskEffect(taskName) {
  var task = gameData.taskData[taskName]
  return task.getEffect.bind(task)
}

function getBindedItemEffect(itemName) {
  var item = gameData.itemData[itemName]
  return item.getEffect.bind(item)
}

function addMultipliers() {
  for (taskName in gameData.taskData) {
    var task = gameData.taskData[taskName]

    task.xpMultipliers = []
    if (task instanceof Job) task.incomeMultipliers = []

    task.xpMultipliers.push(task.getMaxLevelMultiplier.bind(task))
    task.xpMultipliers.push(getHappiness)
    task.xpMultipliers.push(getInspiration)

    if (task instanceof Job) {
      task.incomeMultipliers.push(task.getLevelMultiplier.bind(task))
      task.incomeMultipliers.push(getGreed)
      task.xpMultipliers.push(getBindedTaskEffect("Endurance"))
      task.xpMultipliers.push(getBindedTaskEffect("Aptitude"))
      task.xpMultipliers.push(getBindedItemEffect("Miscplaceholder5"))
      task.xpMultipliers.push(getBindedItemEffect("Miscplaceholder7"))
      task.xpMultipliers.push(getBindedItemEffect("Miscplaceholder1"))
    } else if (task instanceof Skill) {
      task.xpMultipliers.push(getBindedTaskEffect("Perception"))
      task.xpMultipliers.push(getBindedItemEffect("Personal assistant"))
    }

    if (jobCategories["IT"].includes(task.name)) {
      task.xpMultipliers.push(getBindedTaskEffect("Attentiveness"))
      task.incomeMultipliers.push(getBindedTaskEffect("Programming"))
    } else if (jobCategories["Science"].includes(task.name)) {
      task.xpMultipliers.push(getBindedTaskEffect("Interest in knowledge"))
    } else if (skillCategories["Body"].includes(task.name)) {
      task.xpMultipliers.push(getBindedItemEffect("Gym membership"))
      task.xpMultipliers.push(getBindedItemEffect("Miscplaceholder4"))
    } else if (skillCategories["Mind"].includes(task.name)) {
      task.xpMultipliers.push(getBindedItemEffect("Miscplaceholder4"))
      task.xpMultipliers.push(getBindedItemEffect("Miscplaceholder6"))
      task.xpMultipliers.push(getBindedItemEffect("Library card"))
    } else if (skillCategories["Technology"].includes(task.name)) {
      task.xpMultipliers.push(getBindedItemEffect("Miscplaceholder3"))
    } else if (skillCategories["Occultism"].includes(task.name)) {
      task.xpMultipliers.push(getCorruption)
    }

    if (task.name == "Programming") {
      task.xpMultipliers.push(getBindedTaskEffect("Language understanding"))
      task.xpMultipliers.push(getBindedItemEffect("Professional mentor"))
    }
    if (task.name == "Interest in knowledge") {
      task.xpMultipliers.push(getBindedItemEffect("Miscplaceholder9"))
    }
  }

  for (itemName in gameData.itemData) {
    var item = gameData.itemData[itemName]
    item.expenseMultipliers = []
  }
}

function setCustomEffects() {
  var techUnderstanding = gameData.taskData["Deep tech understanding"]
  var timeAcceleration = gameData.taskData["Time acceleration"]
  timeAcceleration.getEffect = function() {
    var multiplier = (Math.pow(2, Math.log(timeAcceleration.level / 50 + 1) * timeAcceleration.baseData.effect)) * techUnderstanding.getEffect()
    return multiplier
  }

  var agingReversal = gameData.taskData["Reversal of aging"]
  agingReversal.getEffect = function() {
    var multiplier = (Math.pow(2, Math.log(agingReversal.level / 50 + 1) * agingReversal.baseData.effect)) * techUnderstanding.getEffect()
    return multiplier
  }

  var timeMachine = gameData.taskData["Time machine"]
  timeMachine.getEffect = function() {
    var multiplier = (Math.pow(2, Math.log(timeMachine.level / 50 + 1) * timeMachine.baseData.effect)) * techUnderstanding.getEffect()
    return multiplier
  }
}

function getHappiness() {
  var luckinessEffect = getBindedTaskEffect("Luckiness")
  var carEffect = getBindedItemEffect("Car")
  var misceffect2 = getBindedItemEffect("Miscplaceholder2")
  var happiness = luckinessEffect() * carEffect() * misceffect2() * gameData.currentProperty.getEffect()
  return happiness
}

function getInspiration() {
  var corwishEffect = getBindedTaskEffect("Corrupted Wish")
  var cordesEffect = getBindedTaskEffect("Corrupted Desire")
  var imaginationEffect = getBindedTaskEffect("Corrupted Imagination")
  var laptopEffect = getBindedItemEffect("Laptop")
  var misc8Effect = getBindedItemEffect("Miscplaceholder8")
  var inspiration = getAgeModifier() * corwishEffect() * cordesEffect() * imaginationEffect() * laptopEffect() * misc8Effect()
  return inspiration
}

function getGreed() {
  var adultAge = 20 * 365
  var age = gameData.days
  var modifier = getBaseLog(adultAge, age)
  var corgreedEffect = getBindedTaskEffect("Corrupted Greed")
  var stealtheffect = getBindedTaskEffect("Stealth")
  var devileffect = getBindedTaskEffect("Devil's tongue")
  var greed = modifier * corgreedEffect() * stealtheffect() * devileffect()
  return greed
}

function getCorruption() {
  var corruptedMind = gameData.taskData["Corrupted Mind"]
  return gameData.corruption * corruptedMind.getEffect()
}

function getInnerExp() {
  return gameData.innerExp
}

function applyMultipliers(value, multipliers) {
  var finalMultiplier = 1
  multipliers.forEach(
    function(multiplierFunction) {
      var multiplier = multiplierFunction()
      finalMultiplier *= multiplier
    }
  )
  var finalValue = Math.round(value * finalMultiplier)
  return finalValue
}

function applySpeed(value) {
  finalValue = value * getGameSpeed() / updateSpeed
  return finalValue
}

function getCorruptionGain() {
  var corruptedSoul = gameData.taskData["Corrupted Soul"]
  var corruptedConsciousness = gameData.taskData["Corrupted Consciousness"]
  var ageModifier = getBaseLog(200, daysToYears(gameData.days) + 1)
  var corruption = ageModifier * corruptedSoul.getEffect() * corruptedConsciousness.getEffect()
  return corruption
}

function getInnerExpGain() {
  // var Control = gameData.taskData["Yin Yang"]
  var innerExp = 1
  return innerExp
}

function getGameSpeed(forTaskbar=0) {
  var waiting = gameData.taskData["Waiting skill"]
  var acceleration = gameData.taskData["Time acceleration"]
  var timeMachine = gameData.taskData["Time machine"]
  var corruptedTime = gameData.taskData["Corrupted Time"]
  if (forTaskbar) {
    var timeWarpingSpeed = waiting.getEffect() * acceleration.getEffect() * timeMachine.getEffect() * corruptedTime.getEffect()
    var gameSpeed = timeWarpingSpeed
  } else {
    var timeWarpingSpeed = gameData.timeWarpingEnabled ? waiting.getEffect() * acceleration.getEffect() * timeMachine.getEffect() * corruptedTime.getEffect() : 1
    var gameSpeed = baseGameSpeed * +!gameData.paused * +isAlive() * timeWarpingSpeed
  }
  return gameSpeed
}

function applyExpenses() {
  var coins = applySpeed(getExpense())
  gameData.coins -= coins
  if (gameData.coins < 0) {
    goBankrupt()
  }
}

function getExpense() {
  var expense = 0
  expense += gameData.currentProperty.getExpense()
  for (misc of gameData.currentMisc) {
    expense += misc.getExpense()
  }
  return expense
}

function goBankrupt() {
  gameData.coins = 0
  gameData.currentProperty = gameData.itemData["Parents house"]
  gameData.currentMisc = []
}

function initUI() {
  setStickySidebar(gameData.settings.stickySidebar);
}

function setTab(element, selectedTab) {
  var tabs = Array.prototype.slice.call(document.getElementsByClassName("tab"))
  tabs.forEach(
    function(tab) {
      tab.style.display = "none"
    }
  )
  document.getElementById(selectedTab).style.display = "block"

  var tabButtons = document.getElementsByClassName("tabButton")
  for (tabButton of tabButtons) {
    tabButton.classList.remove("w3-blue-gray")
  }
  element.classList.add("w3-blue-gray")
}

function setPause() {
  gameData.paused = !gameData.paused
}

function setTimeWarping() {
  gameData.timeWarpingEnabled = !gameData.timeWarpingEnabled
}

function setTask(taskName) {
  var task = gameData.taskData[taskName]
  task instanceof Job ? gameData.currentJob = task : gameData.currentSkill = task
}

function setProperty(propertyName) {
  var property = gameData.itemData[propertyName]
  gameData.currentProperty = property
}

function setMisc(miscName) {
  var misc = gameData.itemData[miscName]
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

function createData(data, baseData) {
  for (key in baseData) {
    var entity = baseData[key]
    createEntity(data, entity)
  }
}

function createEntity(data, entity) {
  if ("income" in entity) {data[entity.name] = new Job(entity)}
  else if ("maxXp" in entity) {data[entity.name] = new Skill(entity)}
  else {data[entity.name] = new Item(entity)}
  data[entity.name].id = "row " + entity.name
}

function createRequiredRow(categoryName) {
  var requiredRow = document.getElementsByClassName("requiredRowTemplate")[0].content.firstElementChild.cloneNode(true)
  requiredRow.classList.add("requiredRow")
  requiredRow.classList.add(removeSpaces(categoryName))
  requiredRow.id = categoryName
  return requiredRow
}

function createHeaderRow(templates, categoryType, categoryName) {
  var headerRow = templates.headerRow.content.firstElementChild.cloneNode(true)
  headerRow.getElementsByClassName("category")[0].textContent = categoryName
  if (categoryType != itemCategories) {
    headerRow.getElementsByClassName("valueType")[0].textContent = categoryType == jobCategories ? "Income/day" : "Effect"
  }

  headerRow.style.backgroundColor = headerRowColors[categoryName]
  headerRow.style.color = "#333333"
  headerRow.classList.add(removeSpaces(categoryName))
  headerRow.classList.add("headerRow")

  return headerRow
}

function createRow(templates, name, categoryName, categoryType) {
  var row = templates.row.content.firstElementChild.cloneNode(true)
  row.getElementsByClassName("name")[0].textContent = name
  row.getElementsByClassName("tooltipText")[0].textContent = tooltips[name]
  row.id = "row " + name
  if (categoryType != itemCategories) {
    row.getElementsByClassName("progressBar")[0].onclick = function() {setTask(name)}
  } else {
    row.getElementsByClassName("button")[0].onclick = categoryName == "Properties" ? function() {setProperty(name)} : function() {setMisc(name)}
    row.getElementsByClassName("alternate-button")[0].onclick = categoryName == "Properties" ? function() {setProperty(name)} : function() {setMisc(name)}
  }

  return row
}

function createAllRows(categoryType, tableId) {
  var templates = {
    headerRow: document.getElementsByClassName(categoryType == itemCategories ? "headerRowItemTemplate" : "headerRowTaskTemplate")[0],
    row: document.getElementsByClassName(categoryType == itemCategories ? "rowItemTemplate" : "rowTaskTemplate")[0],
  }

  var table = document.getElementById(tableId)

  for (categoryName in categoryType) {
    var headerRow = createHeaderRow(templates, categoryType, categoryName)
    table.appendChild(headerRow)

    var category = categoryType[categoryName]
    category.forEach(
      function(name) {
        var row = createRow(templates, name, categoryName, categoryType)
        table.appendChild(row)
      }
    )

    var requiredRow = createRequiredRow(categoryName)
    table.append(requiredRow)
  }
}

function updateQuickTaskDisplay(taskType) {
  var currentTask = taskType == "job" ? gameData.currentJob : gameData.currentSkill
  var quickTaskDisplayElement = document.getElementById("quickTaskDisplay")
  var progressBar = quickTaskDisplayElement.getElementsByClassName(taskType)[0]
  progressBar.getElementsByClassName("name")[0].textContent = currentTask.name + " lvl " + currentTask.level
  progressBar.getElementsByClassName("progressFill")[0].style.width = currentTask.xp / currentTask.getMaxXp() * 100 + "%"
}

function updateRequiredRows(data, categoryType) {
  var requiredRows = document.getElementsByClassName("requiredRow")
  for (requiredRow of requiredRows) {
    var nextEntity = null
    var category = categoryType[requiredRow.id]
    if (category == null) {continue}
    for (i = 0; i < category.length; i++) {
      var entityName = category[i]
      if (i >= category.length - 1) break
      var requirements = gameData.requirements[entityName]
      if (requirements && i == 0) {
        if (!requirements.isCompleted()) {
          nextEntity = data[entityName]
          break
        }
      }

      var nextIndex = i + 1
      if (nextIndex >= category.length) {break}
      var nextEntityName = category[nextIndex]
      nextEntityRequirements = gameData.requirements[nextEntityName]

      if (!nextEntityRequirements.isCompleted()) {
        nextEntity = data[nextEntityName]
        break
      }
    }

    if (nextEntity == null) {
      requiredRow.classList.add("hiddenTask")
    } else {
      requiredRow.classList.remove("hiddenTask")
      var requirementObject = gameData.requirements[nextEntity.name]
      var requirements = requirementObject.requirements

      var coinElement = requiredRow.getElementsByClassName("coins")[0]
      var levelElement = requiredRow.getElementsByClassName("levels")[0]
      var corruptionElement = requiredRow.getElementsByClassName("corruption")[0]
      var innerExpElement = requiredRow.getElementsByClassName("innerExp")[0]

      coinElement.classList.add("hiddenTask")
      levelElement.classList.add("hiddenTask")
      corruptionElement.classList.add("hiddenTask")
      innerExpElement.classList.add("hiddenTask")

      var finalText = ""
      if (data == gameData.taskData) {
        if (requirementObject instanceof CorruptionRequirement) {
          corruptionElement.classList.remove("hiddenTask")
          corruptionElement.textContent = format(requirements[0].requirement) + " corruption"
        } else if (requirementObject instanceof InnerExpRequirement) {
          innerExpElement.classList.remove("hiddenTask")
          innerExpElement.textContent = format(requirements[0].requirement) + " Inner Experience"
        } else {
          levelElement.classList.remove("hiddenTask")
          for (requirement of requirements) {
            var task = gameData.taskData[requirement.task]
            if (task.level >= requirement.requirement) continue
            var text = " " + requirement.task + " level " + format(task.level) + "/" + format(requirement.requirement) + ","
            finalText += text
          }
          finalText = finalText.substring(0, finalText.length - 1)
          levelElement.textContent = finalText
        }
      }
      else if (data == gameData.itemData) {
        coinElement.classList.remove("hiddenTask")
        formatCoins(requirements[0].requirement, coinElement)
      }
    }
  }
}

function updateTaskRows() {
  for (key in gameData.taskData) {
    var task = gameData.taskData[key]
    var row = document.getElementById("row " + task.name)
    row.getElementsByClassName("level")[0].textContent = task.level
    row.getElementsByClassName("xpGain")[0].textContent = format(task.getXpGain())
    row.getElementsByClassName("xpLeft")[0].textContent = format(task.getXpLeft())

    var maxLevel = row.getElementsByClassName("maxLevel")[0]
    maxLevel.textContent = task.maxLevel
    gameData.rebirthOneCount > 0 ? maxLevel.classList.remove("hidden") : maxLevel.classList.add("hidden")

    var progressFill = row.getElementsByClassName("progressFill")[0]
    progressFill.style.width = task.xp / task.getMaxXp() * 100 + "%"
    task == gameData.currentJob || task == gameData.currentSkill ? progressFill.classList.add("current") : progressFill.classList.remove("current")

    var valueElement = row.getElementsByClassName("value")[0]
    valueElement.getElementsByClassName("income")[0].style.display = task instanceof Job
    valueElement.getElementsByClassName("effect")[0].style.display = task instanceof Skill

    var skipSkillElement = row.getElementsByClassName("skipSkill")[0]
    skipSkillElement.style.display = task instanceof Skill && autoLearnElement.checked ? "block" : "none"

    if (task instanceof Job) {
      formatCoins(task.getIncome(), valueElement.getElementsByClassName("income")[0])
    } else {
      valueElement.getElementsByClassName("effect")[0].textContent = task.getEffectDescription()
    }
  }
}

function setStickySidebar(sticky) {
  gameData.settings.stickySidebar = sticky;
  settingsStickySidebar.checked = sticky;
  info.style.position = sticky ? 'sticky' : 'initial';
  resources.style.position = sticky ? 'sticky' : 'initial';
  tabs.style.position = sticky ? 'sticky' : 'initial';
}

function updateItemRows() {
  for (key in gameData.itemData) {
    var item = gameData.itemData[key]
    var row = document.getElementById("row " + item.name)
    var button = row.getElementsByClassName("button")[0]
    button.disabled = gameData.coins < item.getExpense()
    var active = row.getElementsByClassName("active")[0]
    var color = itemCategories["Properties"].includes(item.name) ? headerRowColors["Properties"] : headerRowColors["Misc"]
    active.style.backgroundColor = gameData.currentMisc.includes(item) || item == gameData.currentProperty ? color : "white"
    var circle = row.getElementsByClassName("w3-circle")[0]
    if (itemCategories["Misc"].includes(item.name)) {
      circle.style.borderRadius = 0
      active.style.borderRadius = 0
    }
    row.getElementsByClassName("effect")[0].textContent = item.getEffectDescription()
    formatCoins(item.getExpense(), row.getElementsByClassName("expense")[0])
  }
}

function updateHeaderRows(categories) {
  for (categoryName in categories) {
    var className = removeSpaces(categoryName)
    var headerRow = document.getElementsByClassName(className)[0]
    var maxLevelElement = headerRow.getElementsByClassName("maxLevel")[0]
    gameData.rebirthOneCount > 0 ? maxLevelElement.classList.remove("hidden") : maxLevelElement.classList.add("hidden")
    var skipSkillElement = headerRow.getElementsByClassName("skipSkill")[0]
    skipSkillElement.style.display = categories == skillCategories && autoLearnElement.checked ? "block" : "none"
  }
}

function updateText() {
  //Sidebar
  document.getElementById("ageDisplay").textContent = daysToYears(gameData.days)
  document.getElementById("dayDisplay").textContent = getDay()
  document.getElementById("lifespanDisplay").textContent = format(daysToYears(getLifespan()), 1)
  document.getElementById("pauseButton").textContent = gameData.paused ? "Play" : "Pause"

  formatCoins(gameData.coins, document.getElementById("coinDisplay"))
  setSignDisplay()
  formatCoins(getNet(), document.getElementById("netDisplay"))
  formatCoins(getIncome(), document.getElementById("incomeDisplay"))
  formatCoins(getExpense(), document.getElementById("expenseDisplay"))

  document.getElementById("happinessDisplay").textContent = format(getHappiness().toFixed(1), 2)
  document.getElementById("inspirationDisplay").textContent = format(getInspiration().toFixed(1), 2)
  document.getElementById("greedDisplay").textContent = format(getGreed().toFixed(1), 2)

  document.getElementById("corruptionDisplay").textContent = format(gameData.corruption.toFixed(2), 2)
  document.getElementById("corruptionPowerDisplay").textContent = format(gameData.taskData["Corrupted Mind"].getEffect().toFixed(2) * 100, 2)
  document.getElementById("corruptionGainDisplay").textContent = format(getCorruptionGain().toFixed(2), 2)

  document.getElementById("innerExpDisplay").textContent = format(gameData.innerExp.toFixed(2), 2)
  document.getElementById("innerExpGainDisplay").textContent = format(getInnerExpGain().toFixed(2), 2)

  document.getElementById("timeWarpingDisplay").textContent = "x" + format((getGameSpeed(1)).toFixed(2), 2)
  document.getElementById("timeWarpingButton").textContent = gameData.timeWarpingEnabled ? "Disable warp" : "Enable warp"

  document.getElementById("rebirthNote0").textContent = gameData.rebirthOneCount ? "Looks like that smartphone saves all your memory from past lives so you can reach any point faster than before." : "You stumble upon a strange smartphone on your 25th birthday. You do not know anything about its manufacturer and the device does not respond to your actions. However, you feel a strange desire to keep the phone, so you put it in your pocket just in case."
}

function setSignDisplay() {
  var signDisplay = document.getElementById("signDisplay")
  if (getIncome() > getExpense()) {
    signDisplay.textContent = "+"
    signDisplay.style.color = "green"
  } else if (getExpense() > getIncome()) {
    signDisplay.textContent = "-"
    signDisplay.style.color = "red"
  } else {
    signDisplay.textContent = ""
    signDisplay.style.color = "gray"
  }
}

function getNet() {
  var net = Math.abs(getIncome() - getExpense())
  return net
}

function hideEntities() {
  for (key in gameData.requirements) {
    var requirement = gameData.requirements[key]
    var completed = requirement.isCompleted()
    for (element of requirement.elements) {
      if (completed) {
        element.classList.remove("hidden")
      } else {
        element.classList.add("hidden")
      }
    }
  }
}

function createItemData(baseData) {
  for (var item of baseData) {
    gameData.itemData[item.name] = "happiness" in item ? new Property(task) : new Misc(task)
    gameData.itemData[item.name].id = "item " + item.name
  }
}

function doCurrentTask(task) {
  task.increaseXp()
  if (task instanceof Job) {
    increaseCoins()
  }
}

function getIncome() {
  var income = 0
  income += gameData.currentJob.getIncome()
  return income
}

function increaseCoins() {
  var coins = applySpeed(getIncome())
  gameData.coins += coins
}

function daysToYears(days) {
  var years = Math.floor(days / 365)
  return years
}

function getCategoryFromEntityName(categoryType, entityName) {
  for (categoryName in categoryType) {
    var category = categoryType[categoryName]
    if (category.includes(entityName)) {
      return category
    }
  }
}

function getNextEntity(data, categoryType, entityName) {
  var category = getCategoryFromEntityName(categoryType, entityName)
  var nextIndex = category.indexOf(entityName) + 1
  if (nextIndex > category.length - 1) return null
  var nextEntityName = category[nextIndex]
  var nextEntity = data[nextEntityName]
  return nextEntity
}

function autoPromote() {
  if (!autoPromoteElement.checked) return
  var nextEntity = getNextEntity(gameData.taskData, jobCategories, gameData.currentJob.name)
  if (nextEntity == null) return
  var requirement = gameData.requirements[nextEntity.name]
  if (requirement.isCompleted()) gameData.currentJob = nextEntity
}

function checkSkillSkipped(skill) {
  var row = document.getElementById("row " + skill.name)
  var isSkillSkipped = row.getElementsByClassName("checkbox")[0].checked
  return isSkillSkipped
}

function setSkillWithLowestMaxXp() {
  var enabledSkills = []

  for (skillName in gameData.taskData) {
    var skill = gameData.taskData[skillName]
    var requirement = gameData.requirements[skillName]
    if (skill instanceof Skill) {
      if(requirement == null) {
        requirement = gameData.requirements["Perception"];
      }
      if (requirement.isCompleted() && !checkSkillSkipped(skill)) {
        enabledSkills.push(skill)
      }
    }
  }

  if (enabledSkills.length == 0) {
    skillWithLowestMaxXp = gameData.taskData["Perception"]
    return
  }

  enabledSkills.sort((lhs, rhs) => { return lhs.getXpLeft() / lhs.getXpGain() - rhs.getXpLeft() / rhs.getXpGain() })

  var skillName = enabledSkills[0].name
  skillWithLowestMaxXp = gameData.taskData[skillName]
}

function getKeyOfLowestValueFromDict(dict) {
  var values = []
  for (key in dict) {
    var value = dict[key]
    values.push(value)
  }

  values.sort(function(a, b){return a - b})

  for (key in dict) {
    var value = dict[key]
    if (value == values[0]) {
      return key
    }
  }
}

function autoLearn() {
  if (!autoLearnElement.checked || !skillWithLowestMaxXp) return
  gameData.currentSkill = skillWithLowestMaxXp
}

function yearsToDays(years) {
  var days = years * 365
  return days
}

function getDay() {
  var day = Math.floor(gameData.days - daysToYears(gameData.days) * 365)
  return day
}

function increaseDays() {
  var increase = applySpeed(1)
  gameData.days += increase
}

function format(number,decimals= 1) {
  // what tier? (determines SI symbol)
  var tier = Math.log10(number) / 3 | 0;
  // if zero, we don't need a suffix
  if(tier == 0) return number;
  // get suffix and determine scale
  var suffix = units[tier];
  var scale = Math.pow(10, tier * 3);
  // scale the number
  var scaled = number / scale;
  // format number and add suffix
  return scaled.toFixed(decimals) + suffix;
}

function formatCoins(coins, element) {
  var tiers = ["c", "cg", "s", "sg", "g", "gg", "p", "pg", "d", "dg"]
  var colors = {
    "d": "#c0eaed",
    "p": "#79b9c7",
    "g": "#E5C100",
    "s": "#a8a8a8",
    "c": "#a15c2f",
    "dg": "#c0eaed",
    "pg": "#79b9c7",
    "gg": "#E5C100",
    "sg": "#a8a8a8",
    "cg": "#a15c2f"
  }
  var finalTier = Math.floor(getBaseLog(1000, coins + 1))
  var tier = tiers[finalTier]
  element.children[0].style.color = colors[tier]
  element.children[0].style.textShadow = "0 0 0"
  if (finalTier % 2 == 1) {
    element.children[0].style.textShadow = "0 0 9px"
  }
  var text = Math.floor(coins)
  element.children[0].textContent = format(String(text),2) + " ℧"
}

function getTaskElement(taskName) {
  var task = gameData.taskData[taskName]
  var element = document.getElementById(task.id)
  return element
}

function getItemElement(itemName) {
  var item = gameData.itemData[itemName]
  var element = document.getElementById(item.id)
  return element
}

function getElementsByClass(className) {
  var elements = document.getElementsByClassName(removeSpaces(className))
  return elements
}

function setLightDarkMode() {
  var body = document.getElementById("body")
  body.classList.contains("dark") ? body.classList.remove("dark") : body.classList.add("dark")
}

function removeSpaces(string) {
  var string = string.replace(/ /g, "")
  return string
}

function rebirthOne() {
  gameData.rebirthOneCount += 1
  rebirthReset()
}

function rebirthTwo() {
  gameData.rebirthTwoCount += 1
  gameData.corruption += getCorruptionGain()
  rebirthReset()
  for (taskName in gameData.taskData) {
    var task = gameData.taskData[taskName]
    task.maxLevel = 0
  }
}

function rebirthThree() {
  gameData.rebirthThreeCount += 1
	if (gameData.innerExp < 30000) {
	  gameData.innerExp += getInnerExpGain()
	} else {
		gameData.innerExp += getInnerExpGain() * 1.5;
	}
	gameData.corruption = 0
  rebirthReset()
	for (taskName in gameData.taskData) {
    var task = gameData.taskData[taskName]
    task.maxLevel = Math.floor(task.maxLevel);
  }
}

function rebirthReset() {
  setTab(jobTabButton, "jobs")
  setPause()
  gameData.coins = 0
  gameData.days = 365 * 16
  gameData.currentJob = gameData.taskData["Cleaner"]
  gameData.currentSkill = gameData.taskData["Perception"]
  gameData.currentProperty = gameData.itemData["Parents house"]
  gameData.currentMisc = []
  for (taskName in gameData.taskData) {
    var task = gameData.taskData[taskName]
    if (task.level > task.maxLevel) task.maxLevel = task.level
    task.level = 0
    task.xp = 0
  }
  for (key in gameData.requirements) {
    var requirement = gameData.requirements[key]
    if (requirement.completed && permanentUnlocks.includes(key)) continue
    requirement.completed = false
  }
}

function getLifespan() {
  var hardening = gameData.taskData["Hardening"]
  var agingReversal = gameData.taskData["Reversal of aging"]
  var corruptedBody = gameData.taskData["Corrupted Body"]
  var cellRes = gameData.taskData["Cellular restructuration"]
  var coinPile = 15 * getBaseLog(10, gameData.coins + 1)
  var corruptionProlongation = 365 * getBaseLog(10, getCorruption() + 1)
  var lifespan = (baseLifespan + coinPile + corruptionProlongation) * hardening.getEffect() * agingReversal.getEffect() * corruptedBody.getEffect() * cellRes.getEffect()
  return lifespan
}

function getAgeModifier() {
  var age = gameData.days
  var lifespan = getLifespan()
  var modifier = getBaseLog(10, lifespan / (age + 1)) + 0.7
  return modifier
}

function isAlive() {
  var condition = gameData.days < getLifespan()
  var deathText = document.getElementById("deathText")
  if (!condition) {
    gameData.days = getLifespan()
    deathText.classList.remove("hidden")
  }
  else {
    deathText.classList.add("hidden")
  }
  return condition
}

function assignMethods() {
  for (key in gameData.taskData) {
    var task = gameData.taskData[key]
    if (task.baseData.income) {
      task.baseData = jobBaseData[task.name]
      task = Object.assign(new Job(jobBaseData[task.name]), task)
    } else {
      task.baseData = skillBaseData[task.name]
      task = Object.assign(new Skill(skillBaseData[task.name]), task)
    }
    gameData.taskData[key] = task
  }
  for (key in gameData.itemData) {
    var item = gameData.itemData[key]
    item.baseData = itemBaseData[item.name]
    item = Object.assign(new Item(itemBaseData[item.name]), item)
    gameData.itemData[key] = item
  }
  for (key in gameData.requirements) {
    var requirement = gameData.requirements[key]
    if (requirement.type == "task") {
      requirement = Object.assign(new TaskRequirement(requirement.elements, requirement.requirements), requirement)
    } else if (requirement.type == "coins") {
      requirement = Object.assign(new CoinRequirement(requirement.elements, requirement.requirements), requirement)
    } else if (requirement.type == "age") {
      requirement = Object.assign(new AgeRequirement(requirement.elements, requirement.requirements), requirement)
    } else if (requirement.type == "corruption") {
      requirement = Object.assign(new CorruptionRequirement(requirement.elements, requirement.requirements), requirement)
    } else if (requirement.type == "innerExp") {
      requirement = Object.assign(new InnerExpRequirement(requirement.elements, requirement.requirements), requirement)
    }

    var tempRequirement = tempData["requirements"][key]
    requirement.elements = tempRequirement.elements
    requirement.requirements = tempRequirement.requirements
    gameData.requirements[key] = requirement
  }
  gameData.currentJob = gameData.taskData[gameData.currentJob.name]
  gameData.currentSkill = gameData.taskData[gameData.currentSkill.name]
  gameData.currentProperty = gameData.itemData[gameData.currentProperty.name]
  var newArray = []
  for (misc of gameData.currentMisc) {
    newArray.push(gameData.itemData[misc.name])
  }
  gameData.currentMisc = newArray
}

function replaceSaveDict(dict, saveDict) {
  for (key in dict) {
    if (!(key in saveDict)) {
      saveDict[key] = dict[key]
    } else if (dict == gameData.requirements) {
      if (saveDict[key].type != tempData["requirements"][key].type) {
        saveDict[key] = tempData["requirements"][key]
      }
    }
  }
  for (key in saveDict) {
    if (!(key in dict)) {
      delete saveDict[key]
    }
  }
}

function saveGameData() {
  localStorage.setItem("gameDataSave", JSON.stringify(gameData))
}

function loadGameData() {
  var gameDataSave = JSON.parse(localStorage.getItem("gameDataSave"))
  if (gameDataSave !== null) {
    replaceSaveDict(gameData, gameDataSave)
    replaceSaveDict(gameData.requirements, gameDataSave.requirements)
    replaceSaveDict(gameData.taskData, gameDataSave.taskData)
    replaceSaveDict(gameData.itemData, gameDataSave.itemData)
    replaceSaveDict(gameData.settings, gameDataSave.settings)
    gameData = gameDataSave
  }
  assignMethods()
}

function updateUI() {
  updateTaskRows()
  updateItemRows()
  updateRequiredRows(gameData.taskData, jobCategories)
  updateRequiredRows(gameData.taskData, skillCategories)
  updateRequiredRows(gameData.itemData, itemCategories)
  updateHeaderRows(jobCategories)
  updateHeaderRows(skillCategories)
  updateQuickTaskDisplay("job")
  updateQuickTaskDisplay("skill")
  hideEntities()
  updateText()
}

function update() {
  increaseDays()
  autoPromote()
  autoLearn()
  doCurrentTask(gameData.currentJob)
  doCurrentTask(gameData.currentSkill)
  applyExpenses()
  updateUI()
}

function resetGameData() {
  localStorage.clear()
  location.reload()
}

function importGameData() {
  var importExportBox = document.getElementById("importExportBox")
  var data = JSON.parse(window.atob(importExportBox.value))
  gameData = data
  saveGameData()
  location.reload()
}

function exportGameData() {
  var importExportBox = document.getElementById("importExportBox")
  importExportBox.value = window.btoa(JSON.stringify(gameData))
}

// Keyboard shortcuts + Loadouts ( courtesy of Pseiko )

function changeTab(direction){
  var tabs = Array.prototype.slice.call(document.getElementsByClassName("tab"))
  var tabButtons = Array.prototype.slice.call(document.getElementsByClassName("tabButton"))
  var currentTab = 0
  for (i in tabs) {
    if (!tabs[i].style.display.includes("none")) currentTab = i*1
  }
  var targetTab = currentTab+direction
  targetTab = Math.max(0,targetTab)
  if( targetTab > (tabs.length-1)) targetTab = 0
  while(tabButtons[targetTab].style.display.includes("none")){
    targetTab = targetTab+direction
    targetTab = Math.max(0,targetTab)
    if( targetTab > (tabs.length-1)) targetTab = 0
  }
	button = tabButtons[targetTab]
	setTab(button, tabs[targetTab].id)
}

loadouts = {}

function saveLoadout(num){
	loadouts[num] = {
		job : gameData.currentJob.name,
		skill: gameData.currentSkill.name,
		property:gameData.currentProperty.name,
		misc: []
	}
	for (i in gameData.currentMisc) loadouts[num].misc.push(gameData.currentMisc[i].name)
}

function loadLoadout(num){
	if (num in loadouts) {
		gameData.currentMisc = []
		for (i in  loadouts[num].misc) setMisc( loadouts[num].misc[i])
		setProperty(loadouts[num].property)
		setTask(loadouts[num].skill)
		setTask(loadouts[num].job)
	}
  document.getElementById("autoLearn").checked = true
  document.getElementById("autoPromote").checked= true
}

window.addEventListener('keydown', function(e) {
  if (e.key == "1" && e.altKey) saveLoadout(1)
  if (e.key == "1" ) loadLoadout(1)
  if (e.key == "2" && e.altKey) saveLoadout(2)
  if (e.key == "2" ) loadLoadout(2)
  if (e.key == "3" && e.altKey) saveLoadout(3)
  if (e.key == "3" ) loadLoadout(3)

	if(e.key==" " && !e.repeat ) {
		setPause()
		if(e.target == document.body) {
			e.preventDefault();
		}
	}
  if(e.key=="ArrowRight") changeTab(1)
  if(e.key=="ArrowLeft") changeTab(-1)
  if(e.key=="l" || e.key=="L") document.getElementById("autoLearn").checked = !document.getElementById("autoLearn").checked
  if(e.key=="p" || e.key=="P") document.getElementById("autoPromote").checked = !document.getElementById("autoPromote").checked
});

//Init

createAllRows(jobCategories, "jobTable")
createAllRows(skillCategories, "skillTable")
createAllRows(itemCategories, "itemTable")

createData(gameData.taskData, jobBaseData)
createData(gameData.taskData, skillBaseData)
createData(gameData.itemData, itemBaseData)

gameData.currentJob = gameData.taskData["Cleaner"]
gameData.currentSkill = gameData.taskData["Perception"]
gameData.currentProperty = gameData.itemData["Parents house"]
gameData.currentMisc = []

gameData.requirements = {
  //Other
  "Science": new TaskRequirement(getElementsByClass("Science"), [{task: "Interest in knowledge", requirement: 1}]),
  "Technology": new TaskRequirement(getElementsByClass("Technology"), [{task: "Interest in knowledge", requirement: 400}]),
  "Occultism": new CorruptionRequirement(getElementsByClass("Occultism"), [{requirement: 1}]),
  "Shop": new CoinRequirement([document.getElementById("shopTabButton")], [{requirement: gameData.itemData["Miscplaceholder8"].getExpense() * 1000}]),
  "Rebirth tab": new AgeRequirement([document.getElementById("rebirthTabButton")], [{requirement: 25}]),
  "Rebirth note 1": new AgeRequirement([document.getElementById("rebirthNote1")], [{requirement: 45}]),
  "Rebirth note 2": new AgeRequirement([document.getElementById("rebirthNote2")], [{requirement: 70}]),
  "Rebirth note 3": new AgeRequirement([document.getElementById("rebirthNote3")], [{requirement: 200}]),
  "Rebirth note 4": new AgeRequirement([document.getElementById("rebirthNote4")], [{requirement: 1000}]),
  "Rebirth note 5": new AgeRequirement([document.getElementById("rebirthNote5")], [{requirement: 10000}]),
  "Rebirth note 6": new AgeRequirement([document.getElementById("rebirthNote6")], [{requirement: 100000}]),
  "Corruption info": new CorruptionRequirement([document.getElementById("corruptionInfo")], [{requirement: 1}]),
  "Corruption power info": new TaskRequirement([document.getElementById("corruptionPower")], [{task: "Corrupted Mind", requirement: 1}]),
  "InnerExp info": new InnerExpRequirement([document.getElementById("innerExpInfo")], [{requirement: 1}]),
  "Time warping info": new TaskRequirement([document.getElementById("timeWarping")], [{task: "Waiting skill", requirement: 1}]),

  "Automation": new AgeRequirement([document.getElementById("automation")], [{requirement: 25}]),
  "Quick task display": new AgeRequirement([document.getElementById("quickTaskDisplay")], [{requirement: 20}]),

  // Jobs
  //Service
  "Cleaner": new TaskRequirement([getTaskElement("Cleaner")], []),
  "Chief cleaner": new TaskRequirement([getTaskElement("Chief cleaner")], [{task: "Cleaner", requirement: 10}, {task: "Perception", requirement: 15}]),
  "Sales intern": new TaskRequirement([getTaskElement("Sales intern")], [{task: "Chief cleaner", requirement: 10}, {task: "Perception", requirement: 30}]),
  "Experienced salesman": new TaskRequirement([getTaskElement("Experienced salesman")], [{task: "Sales intern", requirement: 10}, {task: "Perception", requirement: 80}]),
  "Manager": new TaskRequirement([getTaskElement("Manager")], [{task: "Experienced salesman", requirement: 10}, {task: "Perception", requirement: 180}]),
  "Chief manager": new TaskRequirement([getTaskElement("Chief manager")], [{task: "Manager", requirement: 10}, {task: "Perception", requirement: 300}]),
  "Store headmaster": new TaskRequirement([getTaskElement("Store headmaster")], [{task: "Chief manager", requirement: 10}, {task: "Perception", requirement: 500}]),
  "Brand lord": new TaskRequirement([getTaskElement("Brand lord")], [{task: "Store headmaster", requirement: 20}, {task: "Perception", requirement: 1000}]),

  //IT
  "Junior": new TaskRequirement([getTaskElement("Junior")], [{task: "Sales intern", requirement: 10}, {task: "Programming", requirement: 20}]),
  "Middle": new TaskRequirement([getTaskElement("Middle")], [{task: "Junior", requirement: 10}, {task: "Programming", requirement: 60}]),
  "Middle+": new TaskRequirement([getTaskElement("Middle+")], [{task: "Middle", requirement: 10}, {task: "Programming", requirement: 200}]),
  "Senior": new TaskRequirement([getTaskElement("Senior")], [{task: "Middle+", requirement: 10}, {task: "Programming", requirement: 350}]),
  "IT supervisor": new TaskRequirement([getTaskElement("IT supervisor")], [{task: "Senior", requirement: 10}, {task: "Programming", requirement: 500}]),
  "Technical Director": new TaskRequirement([getTaskElement("Technical Director")], [{task: "IT supervisor", requirement: 10}, {task: "Programming", requirement: 1000}]),
  "Head of an IT conglomerate": new TaskRequirement([getTaskElement("Head of an IT conglomerate")], [{task: "Technical Director", requirement: 10}, {task: "Programming", requirement: 1500}]),
  "World class guru": new TaskRequirement([getTaskElement("World class guru")], [{task: "Head of an IT conglomerate", requirement: 10}, {task: "Interest in knowledge", requirement: 1500}]),
  "World IT coordinator": new TaskRequirement([getTaskElement("World IT coordinator")], [{task: "World class guru", requirement: 20}, {task: "Programming", requirement: 2000}, {task: "Devil's tongue", requirement: 1200}]),

  // Science
  "Student": new TaskRequirement([getTaskElement("Student")], [{task: "Interest in knowledge", requirement: 10}]),
  "Scientist naturalist": new TaskRequirement([getTaskElement("Scientist naturalist")], [{task: "Student", requirement: 10}, {task: "Interest in knowledge", requirement: 300}]),
  "Expert naturalist": new TaskRequirement([getTaskElement("Expert naturalist")], [{task: "Scientist naturalist", requirement: 10}, {task: "Interest in knowledge", requirement: 400}]),
  "Theoretical physicist": new TaskRequirement([getTaskElement("Theoretical physicist")], [{task: "Expert naturalist", requirement: 10}, {task: "Interest in knowledge", requirement: 600}]),
  "Inventor": new TaskRequirement([getTaskElement("Inventor")], [{task: "Theoretical physicist", requirement: 10}, {task: "Interest in knowledge", requirement: 1200}]),
  "Quantum engineer": new TaskRequirement([getTaskElement("Quantum engineer")], [{task: "Inventor", requirement: 10}, {task: "Interest in knowledge", requirement: 2000}]),
  "Science revolutioneer": new TaskRequirement([getTaskElement("Science revolutioneer")], [{task: "Quantum engineer", requirement: 10}, {task: "Interest in knowledge", requirement: 3000}]),
  "Mad scientist": new TaskRequirement([getTaskElement("Mad scientist")], [{task: "Science revolutioneer", requirement: 20}, {task: "Interest in knowledge", requirement: 4000}]),

  // Skills
  // Body
  "Perception": new TaskRequirement([getTaskElement("Perception")], []),
  "Endurance": new TaskRequirement([getTaskElement("Endurance")], [{task: "Perception", requirement: 10}]),
  "Stealth": new TaskRequirement([getTaskElement("Stealth")], [{task: "Perception", requirement: 30}]),
  "Aptitude": new TaskRequirement([getTaskElement("Aptitude")], [{task: "Endurance", requirement: 100}]),
  "Hardening": new TaskRequirement([getTaskElement("Hardening")], [{task: "Endurance", requirement: 300}, {task: "Scientist naturalist", requirement: 10}]),

  // Mind
  "Programming": new TaskRequirement([getTaskElement("Programming")], [{task: "Perception", requirement: 10}]),
  "Attentiveness": new TaskRequirement([getTaskElement("Attentiveness")], [{task: "Programming", requirement: 30}, {task: "Perception", requirement: 30}]),
  "Language understanding": new TaskRequirement([getTaskElement("Language understanding")], [{task: "Programming", requirement: 50}]),
  "Luckiness": new TaskRequirement([getTaskElement("Luckiness")], [{task: "Perception", requirement: 80}]),
  "Waiting skill": new TaskRequirement([getTaskElement("Waiting skill")], [{task: "Perception", requirement: 200}, {task: "Endurance", requirement: 200}]),
  "Interest in knowledge": new TaskRequirement([getTaskElement("Interest in knowledge")], [{task: "Language understanding", requirement: 250}, {task: "Aptitude", requirement: 250}]),
  "Devil's tongue": new TaskRequirement([getTaskElement("Devil's tongue")], [{task: "Language understanding", requirement: 300}, {task: "Corrupted Consciousness", requirement: 10}]),

  // Technology
  "Reversal of aging": new TaskRequirement([getTaskElement("Reversal of aging")], [{task: "Expert naturalist", requirement: 10}]),
  "Time acceleration": new TaskRequirement([getTaskElement("Time acceleration")], [{task: "Theoretical physicist", requirement: 10}]),
  "Time machine": new TaskRequirement([getTaskElement("Time machine")], [{task: "Inventor", requirement: 10}]),
  "Cellular restructuration": new TaskRequirement([getTaskElement("Cellular restructuration")], [{task: "Quantum engineer", requirement: 10}]),
  "Deep tech understanding": new TaskRequirement([getTaskElement("Deep tech understanding")], [{task: "Mad scientist", requirement: 100}]),

  // Occultism
  "Corrupted Wish": new CorruptionRequirement([getTaskElement("Corrupted Wish")], [{requirement: 1}]),
  "Corrupted Soul": new CorruptionRequirement([getTaskElement("Corrupted Soul")], [{requirement: 1}]),
  "Corrupted Desire": new CorruptionRequirement([getTaskElement("Corrupted Desire")], [{requirement: 20}]),
  "Corrupted Consciousness": new CorruptionRequirement([getTaskElement("Corrupted Consciousness")], [{requirement: 50}]),
  "Corrupted Greed": new CorruptionRequirement([getTaskElement("Corrupted Greed")], [{requirement: 250}]),
  "Corrupted Body": new CorruptionRequirement([getTaskElement("Corrupted Body")], [{requirement: 1000}]),
  "Corrupted Time": new CorruptionRequirement([getTaskElement("Corrupted Time")], [{requirement: 5000}]),
  "Corrupted Imagination": new CorruptionRequirement([getTaskElement("Corrupted Imagination")], [{requirement: 10000}]),
  "Corrupted Mind": new CorruptionRequirement([getTaskElement("Corrupted Mind")], [{requirement: 50000}]),

  // Shop
  //Properties
  "Parents house": new CoinRequirement([getItemElement("Parents house")], [{requirement: gameData.itemData["Parents house"].getExpense() * 100}]),
  "Placeholder8": new CoinRequirement([getItemElement("Placeholder8")], [{requirement: gameData.itemData["Placeholder8"].getExpense() * 100}]),
  "Hostel": new CoinRequirement([getItemElement("Hostel")], [{requirement: gameData.itemData["Hostel"].getExpense() * 100}]),
  "3-star hotel room": new CoinRequirement([getItemElement("3-star hotel room")], [{requirement: gameData.itemData["3-star hotel room"].getExpense() * 100}]),
  "5-star hotel room": new CoinRequirement([getItemElement("5-star hotel room")], [{requirement: gameData.itemData["5-star hotel room"].getExpense() * 100}]),
  "Small apartment": new CoinRequirement([getItemElement("Small apartment")], [{requirement: gameData.itemData["Small apartment"].getExpense() * 100}]),
  "Apartment": new CoinRequirement([getItemElement("Apartment")], [{requirement: gameData.itemData["Apartment"].getExpense() * 100}]),
  "Placeholder1": new CoinRequirement([getItemElement("Placeholder1")], [{requirement: gameData.itemData["Placeholder1"].getExpense() * 100}]),
  "Placeholder2": new CoinRequirement([getItemElement("Placeholder2")], [{requirement: gameData.itemData["Placeholder2"].getExpense() * 100}]),
  "Placeholder3": new CoinRequirement([getItemElement("Placeholder3")], [{requirement: gameData.itemData["Placeholder3"].getExpense() * 100}]),
  "Placeholder4": new CoinRequirement([getItemElement("Placeholder4")], [{requirement: gameData.itemData["Placeholder4"].getExpense() * 100}]),
  "Placeholder5": new CoinRequirement([getItemElement("Placeholder5")], [{requirement: gameData.itemData["Placeholder5"].getExpense() * 100}]),
  "Placeholder6": new CoinRequirement([getItemElement("Placeholder6")], [{requirement: gameData.itemData["Placeholder6"].getExpense() * 100}]),
  "Placeholder7": new CoinRequirement([getItemElement("Placeholder7")], [{requirement: gameData.itemData["Placeholder7"].getExpense() * 100}]),

  //Misc
  "Miscplaceholder8": new CoinRequirement([getItemElement("Miscplaceholder8")], [{requirement: gameData.itemData["Miscplaceholder8"].getExpense() * 0}]),
  "Gym membership": new CoinRequirement([getItemElement("Gym membership")], [{requirement: gameData.itemData["Gym membership"].getExpense() * 100}]),
  "Library card": new CoinRequirement([getItemElement("Library card")], [{requirement: gameData.itemData["Library card"].getExpense() * 100}]),
  "Laptop": new CoinRequirement([getItemElement("Laptop")], [{requirement: gameData.itemData["Laptop"].getExpense() * 100}]),
  "Miscplaceholder9": new CoinRequirement([getItemElement("Miscplaceholder9")], [{requirement: gameData.itemData["Miscplaceholder9"].getExpense() * 200}]),
  "Car": new CoinRequirement([getItemElement("Car")], [{requirement: gameData.itemData["Car"].getExpense() * 100}]),
  "Personal assistant": new CoinRequirement([getItemElement("Personal assistant")], [{requirement: gameData.itemData["Personal assistant"].getExpense() * 100}]),
  "Professional mentor": new CoinRequirement([getItemElement("Professional mentor")], [{requirement: gameData.itemData["Professional mentor"].getExpense() * 100}]),
  "Miscplaceholder1": new CoinRequirement([getItemElement("Miscplaceholder1")], [{requirement: gameData.itemData["Miscplaceholder1"].getExpense() * 100}]),
  "Miscplaceholder2": new CoinRequirement([getItemElement("Miscplaceholder2")], [{requirement: gameData.itemData["Miscplaceholder2"].getExpense() * 100}]),
  "Miscplaceholder3": new CoinRequirement([getItemElement("Miscplaceholder3")], [{requirement: gameData.itemData["Miscplaceholder3"].getExpense() * 100}]),
  "Miscplaceholder4": new CoinRequirement([getItemElement("Miscplaceholder4")], [{requirement: gameData.itemData["Miscplaceholder4"].getExpense() * 100}]),
  "Miscplaceholder5": new CoinRequirement([getItemElement("Miscplaceholder5")], [{requirement: gameData.itemData["Miscplaceholder5"].getExpense() * 100}]),
  "Miscplaceholder6": new CoinRequirement([getItemElement("Miscplaceholder6")], [{requirement: gameData.itemData["Miscplaceholder6"].getExpense() * 100}]),
  "Miscplaceholder7": new CoinRequirement([getItemElement("Miscplaceholder7")], [{requirement: gameData.itemData["Miscplaceholder7"].getExpense() * 100}]),
}

tempData["requirements"] = {}
for (key in gameData.requirements) {
  var requirement = gameData.requirements[key]
  tempData["requirements"][key] = requirement
}

loadGameData()

initUI()

setCustomEffects()
addMultipliers()

setTab(jobTabButton, "jobs")

update()
setInterval(update, 1000 / updateSpeed)
setInterval(saveGameData, 3000)
setInterval(setSkillWithLowestMaxXp, 1000)
