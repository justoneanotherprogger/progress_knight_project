var gameData = {
    taskData: {},
    itemData: {},

    coins: new Decimal(0),
    days: 365 * 16,
    totalDays: 0,
evil: new Decimal(0),
essence: new Decimal(0),
dark_matter: new Decimal(0),
    dark_orbs: new Decimal(0),
    hypercubes: 0,
    perks_points: 0,
    perks: {
        auto_dark_orb: 0,
        auto_dark_shop: 0,
        auto_boost: 0,
        instant_evil: 0,
        instant_essence: 0,
        hypercube_boost: 0,
        positive_dark_mater_skills: 0,
        save_challenges: 0,
        auto_sacrifice: 0,
        double_perk_points_gain: 0,
        instant_dark_matter: 0,
        keep_dark_mater_skills: 0,
        hyper_speed: 0,
        both_dark_mater_skills: 0,
        evil_booster: 0,
        more_perk_points : 0
    },


    paused: false,
    timeWarpingEnabled: true,

    rebirthOneCount: 0,
    rebirthOneTime: 0,
    rebirthTwoCount: 0,
    rebirthTwoTime: 0,
    rebirthThreeCount: 0,
    rebirthThreeTime: 0,
    rebirthFourCount: 0,
    rebirthFourTime: 0,
    rebirthFiveCount: 0,
    rebirthFiveTime: 0,

    currentJob: null,
    currentProperty: null,
    currentMisc: null,
    autoBuyEnabled: true,

    settings: {
        stickySidebar: true,
        theme: 1,
        currencyNotation: 3,
        numberNotation: 1,
        layout: 1,
        fontSize: 3,
        selectedTab: 'jobs',
        enableKeybinds: false,
        isAdmin: false,
        adminSpeedMultiplier: 1,
    },
    stats: {
        startDate: new Date(),
        fastest1: null,
        fastest2: null,
        fastest3: null,
        fastest4: null,
        fastest5: null,
        fastestGame: null,
        EvilPerSecond: new Decimal(0),
        maxEvilPerSecond: new Decimal(0),
        maxEvilPerSecondRt: 0,
        EssencePerSecond: new Decimal(0),
        maxEssencePerSecond: new Decimal(0),
        maxEssencePerSecondRt: 0,
        maxEssenceReached: new Decimal(0),
    },
    active_challenge: "",
    challenges: {
        an_unhappy_life: 0,
        rich_and_the_poor: 0,
        time_does_not_fly: 0,
        dance_with_the_devil: 0,
        legends_never_die: 0,
        the_darkest_time: 0,
    },
    dark_matter_shop: {
        // Upgradables.
        dark_orb_generator: 0,
        a_deal_with_the_chairman: 0,
        a_gift_from_god: 0,
        life_coach: 0,
        gotta_be_fast: 0,

        // Permanent unlocks
        a_miracle: false,

        // SKill tree
        speed_is_life: 0,
        your_greatest_debt: 0,
        essence_collector: 0,
        explosion_of_the_universe: 0,
        multiverse_explorer: 0,
    },
    metaverse: {
        boost_cooldown_modifier: 1,
        boost_timer_modifier: 1,
        boost_warp_modifier: 100,
        hypercube_gain_modifier: 1,
        evil_tran_gain: 0,
        essence_gain_modifier: 0,
        challenge_altar: 0,
        dark_mater_gain_modifer: 0,
    },

    realtime: 0.0,
    realtimeRun: 0.0,

    // new 3.0 stuff    
    boost_cooldown: 0.0,
    boost_timer: 0.0,
    boost_active: false,
}

var tempData = {}

const updateSpeed = 20
const baseLifespan = 365 * 65
const baseGameSpeed = 30
const heroIncomeMult = 2.5e18

// --- Hero XP ---
const HERO_XP_BASE_JOB = 50000

// --- Lifespan ---
const COINPILE_LOG_BASE = 10
const COINPILE_MULTIPLIER = 20
const LIFESPAN_CHALLENGE_EXPONENT = 0.72
const LIFESPAN_CHALLENGE_FLAT = 365 * 25
const DEFAULT_STARTING_AGE = 365 * 16

// --- Income ---
const CHALLENGE_RICH_INCOME_EXPONENT = 0.35

// --- Game speed ---
const CHALLENGE_TIME_WARP_EXPONENT = 0.7
const CHALLENGE_LEGENDS_WARP_EXPONENT = 0.75
const WARP_DRIVE_MULTIPLIER = 2
const SPEED_SPEED_SPEED_MULTIPLIER = 1000
const TIME_IS_A_FLAT_CIRCLE_MULTIPLIER = 1000

// --- Happiness ---
const GODS_BLESSINGS_MULTIPLIER = 10000000
const CHALLENGE_DANCE_HAPPINESS_EXPONENT = 0.075
const CHALLENGE_UNHAPPY_HAPPINESS_EXPONENT = 0.5

// --- Evil / Essence gain ---
const EVIL_EFFECT_DIVISOR = 1e3
const EVIL_EFFECT_EXPONENT = 0.35
const ESSENCE_EFFECT_DIVISOR = 1e2
const ESSENCE_EFFECT_EXPONENT = 0.35
const ESSENCE_EFFECT_MIN_THRESHOLD = 0.01

// --- Evil Gain multipliers ---
const INFERNO_MULTIPLIER = 5
const THE_DEVIL_INSIDE_YOU_MULTIPLIER = 1e15
const EVIL_BOOSTER_MULTIPLIER = 1e50
const THE_NEW_GOLD_MULTIPLIER = 1000

// --- Dark Matter Gain ---
const DARK_MATTER_HARVESTER_MULTIPLIER = 10
const DARK_MATTER_MINING_MULTIPLIER = 3
const DARK_MATTER_MILLIONAIRE_MULTIPLIER = 500

// --- Lifespan ---
const LIFE_IS_VALUABLE_MULTIPLIER = 1e5
const SPEED_SPEED_SPEED_LIFESPAN = 1000

// --- Inspiration / Greed ---
const INSPIRATION_LOG_BASE = 10
const INSPIRATION_FLAT_BONUS = 0.7
const INSPIRATION_INFINITY_FALLBACK = 1e300
const GREED_ADULT_AGE = 20 * 365

// --- Dark Matter XP ---
const STRANGE_MAGIC_MULTIPLIER = 1e50

const TRANSCENDENT_MASTER_EFFECT = 1.5

// --- Faint Hope ---
const FAINT_HOPE_INFINITY = 1e308
const FAINT_HOPE_A_NEW_HOPE_SOFTCAP = 10000000
const FAINT_HOPE_A_NEW_HOPE_DECAY = 0.01
const FAINT_HOPE_SPEED_COEFFICIENT = 7.5275
const FAINT_HOPE_SPEED_EXPONENT = 0.0053
const FAINT_HOPE_KICKIN_MIN = 0.15
const FAINT_HOPE_KICKIN_LOG_COEFFICIENT = 0.082
const FAINT_HOPE_KICKIN_BASE = 1.1754
const FAINT_HOPE_REBIRTH_DIVISOR = 7750
const FAINT_HOPE_SOFTCAP = 200
const FAINT_HOPE_SPEED_SOFTCAP = 10000000

// --- Rise of Great Heroes ---
const RISE_HEROES_NUMERATOR = 6
const RISE_HEROES_DENOMINATOR = 74

// --- Milestone / passive growth ---
const EVIL_GROWTH_EXPONENT_DEAL = 1.001
const EVIL_GROWTH_EXPONENT_HELL = 1.01
const EVIL_GROWTH_EXPONENT_MIND_CONTROL = 1.07
const ESSENCE_GROWTH_EXPONENT = 1.002

// --- Heroes unlock ---
const HERO_LEVEL_UNLOCK_THRESHOLD = 2000
const HERO_PREV_LEVEL_MIN = 20

// --- Rebirth max level cap ---
const REBIRTH_THREE_ESSENCE_CAP = 1e308

// --- Perks thresholds ---
const PERK_AUTO_DARK_ORB_MIRACLE_COST = 100
const PERK_AUTO_DARK_SHOP_ORBS_THRESHOLD = 1000
const PERK_AUTO_SACRIFICE_HYPERCUBES_THRESHOLD = 1000
const PERK_AUTO_SACRIFICE_COST_MULTIPLIER = 100
const PERK_INSTANT_GAIN_MULTIPLIER = 10

// --- Metaverse ---
const METAVERSE_BOOST_WARP_DEFAULT = 100

// --- Save ---
const EXPORT_TOOLTIP_TIMEOUT = 15 * 1000
const ERROR_DISPLAY_TIMEOUT = 30 * 1000

// --- Skill effect ---
const SKILL_HERO_LEVEL_MULTIPLIER = 1000
const SKILL_HERO_FLAT_BONUS = 8000
const SKILL_LEVEL_EXPONENT_BASE = 1.01

// --- Job income hero ---
const JOB_INCOME_HERO_BASE_MULTIPLIER = 4

// --- Hero milestone XP multipliers (data for getHeroXpGainMultipliers) ---
const HERO_MILESTONE_MULTIPLIERS = [
  { requirement: "Rise of Great Heroes", multiplier: 10000 },
  { requirement: "Lazy Heroes", multiplier: 1e12 },
  { requirement: "Dirty Heroes", multiplier: 1e15 },
  { requirement: "Angry Heroes", multiplier: 1e15 },
  { requirement: "Tired Heroes", multiplier: 1e15 },
  { requirement: "Scared Heroes", multiplier: 1e15 },
  { requirement: "Good Heroes", multiplier: 1e15 },
  { requirement: "Funny Heroes", multiplier: 1e25 },
  { requirement: "Beautiful Heroes", multiplier: 1e50 },
  { requirement: "Awesome Heroes", multiplier: 1e10 },
  { requirement: "Furious Heroes", multiplier: 1e12, jobExtra: 1000000 },
  { requirement: "Superb Heroes", multiplier: 1e3 },
]



const requirementsBaseData = {
    // Categories
    "category_mage_collegium": new TaskRequirement([".category_mage_collegium"], [{ task: "skill_concentration", requirement: 200 }, { task: "skill_meditation", requirement: 200 }]),
    "category_galactic_council": new AgeRequirement([".category_galactic_council"], [{ requirement: 10000 }]),
    "category_the_void": new AgeRequirement([".category_the_void"], [{ requirement: 1000 }]),
    "category_void_manipulation": new AgeRequirement([".category_void_manipulation"], [{ requirement: 1000 }]),
    "category_celestial_powers": new AgeRequirement([".category_celestial_powers"], [{ requirement: 10000 }]),
    "category_dark_magic": new EvilRequirement([".category_dark_magic"], [{ requirement: 1 }]),
    "category_almightiness": new EssenceRequirement([".category_almightiness"], [{ requirement: 1 }]),
    "category_darkness": new DarkMatterRequirement([".category_darkness"], [{ requirement: 1 }]),
    "Heroic Milestones": new EssenceRequirement([removeSpaces(".Heroic Milestones")], [{ requirement: 400000 }]),
    "Dark Milestones": new EssenceRequirement([removeSpaces(".Dark Milestones")], [{ requirement: 5e10 }]),
    "Metaverse Milestones": new EssenceRequirement([removeSpaces(".Metaverse Milestones")], [{ requirement: 1e60 }]),
    "category_metaverse_guards": new EssenceRequirement([".category_metaverse_guards"], [{ requirement: 1e90 }]),
    
    // Rebirth items
    "Rebirth tab": new AgeRequirement(["#rebirthTabButton"], [{ requirement: 25 }]),
    "Rebirth note 0": new AgeRequirement(["#rebirth_note_0"], [{ requirement: 25 }]),
    "Rebirth note 1": new AgeRequirement(["#rebirth_note_1"], [{ requirement: 45 }]),
    "Rebirth note 2": new AgeRequirement(["#rebirth_note_2"], [{ requirement: 65 }]),
    "Rebirth note 2 info": new AgeRequirement(["#rebirth_note_2_info"], [{ requirement: 65 }]),
    "Rebirth note 2 hint": new AgeRequirement(["#rebirth_note_2_hint"], [{ requirement: 65 }]),
    "Rebirth note 3": new AgeRequirement(["#rebirth_note_3"], [{ requirement: 200 }]),
    "Rebirth note 3 hint": new AgeRequirement(["#rebirth_note_3_hint"], [{ requirement: 200 }]),
    "Rebirth note 3 info": new AgeRequirement(["#rebirth_note_3_info"], [{ requirement: 200 }]),
    "Rebirth note 4": new AgeRequirement(["#rebirth_note_4"], [{ requirement: 1000 }]),
    "Rebirth note 4 hint": new AgeRequirement(["#rebirth_note_4_hint"], [{ requirement: 1000 }]),
    "Rebirth note 4 unlock": new AgeRequirement(["#rebirth_note_4_unlock"], [{ requirement: 1000 }]),
    "Rebirth note 5": new AgeRequirement(["#rebirth_note_5"], [{ requirement: 10000 }]),
    "Rebirth note 5 unlock": new AgeRequirement(["#rebirth_note_5_unlock"], [{ requirement: 10000 }]),
    "Rebirth note 5 info": new AgeRequirement(["#rebirth_note_5_info"], [{ requirement: 10000 }]),
    "Rebirth note 5 warning": new AgeRequirement(["#rebirth_note_5_warning"], [{ requirement: 10000 }]),
    "Rebirth note 6": new TaskRequirement(["#rebirth_note_6"], [{ task: "skill_cosmic_recollection", requirement: 1 }]),
    "Rebirth note 7": new EssenceRequirement(["#rebirth_note_7"], [{ requirement: 5e10 }]),
    "Rebirth note 7 info": new EssenceRequirement(["#rebirth_note_7_info"], [{ requirement: 5e10 }]),
    "Rebirth note 8": new EssenceRequirement(["#rebirth_note_8"], [{ requirement: 1e60 }]),
    "Rebirth note 8 info": new EssenceRequirement(["#rebirth_note_8_info"], [{ requirement: 1e60 }]),
    "Hypercube cap text": new EssenceRequirement(["#hypercube_cap_text"], [{ requirement: 1e60 }]),
    "Perk points gain text": new EssenceRequirement(["#perk_points_gain_text"], [{ requirement: 1e60 }]),

    "Rebirth button 1": new AgeRequirement(["#rebirthButton1"], [{ requirement: 65 }]),
    "Rebirth button 2": new AgeRequirement(["#rebirthButton2"], [{ requirement: 200 }]),
    "Rebirth button 3": new TaskRequirement(["#rebirthButton3"], [{ task: "skill_cosmic_recollection", requirement: 1 }]),
    "Rebirth button 4": new EssenceRequirement(["#rebirthButton4"], [{ requirement: 5e10 }]),
    "Rebirth button 5": new EssenceRequirement(["#rebirthButton5"], [{ requirement: 1e60 }]),

    "Rebirth stats evil": new AgeRequirement(["#stats_evil_gain"], [{ requirement: 200 }]),
    "Rebirth stats essence": new TaskRequirement(["#stats_essence_gain"], [{ task: "skill_cosmic_recollection", requirement: 1 }]),

    // Sidebar items
    "Quick task display": new AgeRequirement(["#quickTaskDisplay"], [{ requirement: 20 }]),
    "Evil info": new EvilRequirement(["#evilInfo"], [{ requirement: 1 }]),
    "Essence info": new EssenceRequirement(["#essenceInfo"], [{ requirement: 1 }]),
    "Dark Matter info": new DarkMatterRequirement(["#darkMatterInfo"], [{ requirement: 1 }]),
    "Dark Orbs info": new DarkOrbsRequirement(["#darkOrbsInfo"], [{ requirement: 1 }]),
    "Hypercubes info": new HypercubeRequirement(["#hypercubesInfo"], [{ requirement: 1 }]),

    // Common work
    "job_beggar": new TaskRequirement([getQuerySelector("job_beggar")], []),
    "job_farmer": new TaskRequirement([getQuerySelector("job_farmer")], [{ task: "job_beggar", requirement: 10 }]),
    "job_fisherman": new TaskRequirement([getQuerySelector("job_fisherman")], [{ task: "job_farmer", requirement: 10 }]),
    "job_miner": new TaskRequirement([getQuerySelector("job_miner")], [{ task: "skill_strength", requirement: 10 }, { task: "job_fisherman", requirement: 10 }]),
    "job_blacksmith": new TaskRequirement([getQuerySelector("job_blacksmith")], [{ task: "skill_strength", requirement: 30 }, { task: "job_miner", requirement: 10 }]),
    "job_merchant": new TaskRequirement([getQuerySelector("job_merchant")], [{ task: "skill_bargaining", requirement: 50 }, { task: "job_blacksmith", requirement: 10 }]),

    // Military
    "job_squire": new TaskRequirement([getQuerySelector("job_squire")], [{ task: "skill_strength", requirement: 5 }]),
    "job_footman": new TaskRequirement([getQuerySelector("job_footman")], [{ task: "skill_strength", requirement: 20 }, { task: "job_squire", requirement: 10 }]),
    "job_veteran_footman": new TaskRequirement([getQuerySelector("job_veteran_footman")], [{ task: "skill_battle_tactics", requirement: 40 }, { task: "job_footman", requirement: 10 }]),
    "job_centenary": new TaskRequirement([getQuerySelector("job_centenary")], [{ task: "skill_strength", requirement: 100 }, { task: "job_veteran_footman", requirement: 10 }]),
    "job_knight": new TaskRequirement([getQuerySelector("job_knight")], [{ task: "skill_battle_tactics", requirement: 150 }, { task: "job_centenary", requirement: 10 }]),
    "job_veteran_knight": new TaskRequirement([getQuerySelector("job_veteran_knight")], [{ task: "skill_strength", requirement: 300 }, { task: "job_knight", requirement: 10 }]),
    "job_holy_knight": new TaskRequirement([getQuerySelector("job_holy_knight")], [{ task: "skill_mana_control", requirement: 500 }, { task: "job_veteran_knight", requirement: 10 }]),
    "job_lieutenant_general": new TaskRequirement([getQuerySelector("job_lieutenant_general")], [{ task: "skill_mana_control", requirement: 1000 }, { task: "skill_battle_tactics", requirement: 1000 }, { task: "job_holy_knight", requirement: 10 }]),

    // Mage Collegium
    "job_student": new TaskRequirement([getQuerySelector("job_student")], [{ task: "skill_concentration", requirement: 200 }, { task: "skill_meditation", requirement: 200 }]),
    "job_apprentice_mage": new TaskRequirement([getQuerySelector("job_apprentice_mage")], [{ task: "skill_mana_control", requirement: 400 }, { task: "job_student", requirement: 10 }]),
    "job_adept_mage": new TaskRequirement([getQuerySelector("job_adept_mage")], [{ task: "skill_mana_control", requirement: 700 }, { task: "job_apprentice_mage", requirement: 10 }]),
    "job_master_wizard": new TaskRequirement([getQuerySelector("job_master_wizard")], [{ task: "skill_mana_control", requirement: 1000 }, { task: "job_adept_mage", requirement: 10 }]),
    "job_archmage": new TaskRequirement([getQuerySelector("job_archmage")], [{ task: "skill_mana_control", requirement: 1200 }, { task: "job_master_wizard", requirement: 10 }]),
    "job_chronomancer": new TaskRequirement([getQuerySelector("job_chronomancer")], [{ task: "skill_mana_control", requirement: 1500 }, { task: "skill_meditation", requirement: 1500 }, { task: "job_archmage", requirement: 25 }]),
    "job_chairman": new TaskRequirement([getQuerySelector("job_chairman")], [{ task: "skill_mana_control", requirement: 2000 }, { task: "skill_productivity", requirement: 2000 }, { task: "job_chronomancer", requirement: 50 }]),
    "job_imperator": new TaskRequirement([getQuerySelector("job_imperator")], [{ task: "skill_all_seeing_eye", requirement: 3000, herequirement: 650 }, { task: "skill_concentration", requirement: 3000 }, { task: "job_chairman", requirement: 666 }]),

    // The Void
    "job_corrupted": new AgeRequirement([getQuerySelector("job_corrupted")], [{ requirement: 1000 }]),
    "job_void_slave": new TaskRequirement([getQuerySelector("job_void_slave")], [{ task: "job_corrupted", requirement: 30 }]),
    "job_void_fiend": new TaskRequirement([getQuerySelector("job_void_fiend")], [{ task: "skill_brainwashing", requirement: 3000 }, { task: "job_void_slave", requirement: 200 }]),
    "job_abyss_anomaly": new TaskRequirement([getQuerySelector("job_abyss_anomaly")], [{ task: "skill_mind_release", requirement: 3000, herequirement: 100 }, { task: "job_void_fiend", requirement: 200, herequirement: 100 }]),
    "job_void_wraith": new TaskRequirement([getQuerySelector("job_void_wraith")], [{ task: "skill_temporal_dimension", requirement: 3400 }, { task: "job_abyss_anomaly", requirement: 300, herequirement: 180 }]),
    "job_void_reaver": new TaskRequirement([getQuerySelector("job_void_reaver")], [{ task: "skill_void_amplification", requirement: 3400, herequirement: 180 }, { task: "job_void_wraith", requirement: 250, herequirement: 125 }]),
    "job_void_lord": new TaskRequirement([getQuerySelector("job_void_lord")], [{ task: "skill_void_symbiosis", requirement: 3800, herequirement: 200 }, { task: "job_void_reaver", requirement: 150 }]),
    "job_abyss_god": new TaskRequirement([getQuerySelector("job_abyss_god")], [{ task: "skill_void_embodiment", requirement: 4700, herequirement: 300 }, { task: "job_void_lord", requirement: 750, herequirement: 125 }]),

    // Galactic Council
    "job_eternal_wanderer": new AgeRequirement([getQuerySelector("job_eternal_wanderer")], [{ requirement: 10000 }]),
    "job_nova": new TaskRequirement([getQuerySelector("job_nova")], [{ task: "job_eternal_wanderer", requirement: 15 }, { task: "skill_cosmic_longevity", requirement: 4000, herequirement: 180 }]),
    "job_sigma_proioxis": new TaskRequirement([getQuerySelector("job_sigma_proioxis")], [{ task: "job_nova", requirement: 200 }, { task: "skill_cosmic_recollection", requirement: 4500, herequirement: 350 }]),
    "job_acallaris": new TaskRequirement([getQuerySelector("job_acallaris")], [{ task: "skill_galactic_command", requirement: 5000, herequirement: 250 }, { task: "job_sigma_proioxis", requirement: 1000, herequirement: 480 }]),
    "job_one_above_all": new TaskRequirement([getQuerySelector("job_one_above_all")], [{ task: "skill_meditation", requirement: 6300 }, { task: "job_acallaris", requirement: 1400, herequirement: 500 }]),

    // Metaverse Guards
    "job_snow_crash": new EssenceRequirement([getQuerySelector("job_snow_crash")], [{ requirement: 1e90, herequirement: 1e120 }]),
    "job_player_one": new TaskRequirement([getQuerySelector("job_player_one")], [{ task: "job_snow_crash", requirement: 1000, herequirement: 160000 }]),
    "job_lost_in_the_dark": new TaskRequirement([getQuerySelector("job_lost_in_the_dark")], [{ task: "job_player_one", requirement: 2500, herequirement: 158000 }]),
    "job_omega": new TaskRequirement([getQuerySelector("job_omega")], [{ task: "job_lost_in_the_dark", requirement: 25000, herequirement: 185000 }]),

    // Properties
    "item_homeless": new CoinRequirement([getQuerySelector("item_homeless")], [{ requirement: 0 }]),
    "item_tent": new CoinRequirement([getQuerySelector("item_tent")], [{ requirement: 0 }]),
    "item_wooden_hut": new CoinRequirement([getQuerySelector("item_wooden_hut")], [{ requirement: itemBaseData["item_wooden_hut"].expense.base * 100 }]),
    "item_cottage": new CoinRequirement([getQuerySelector("item_cottage")], [{ requirement: itemBaseData["item_cottage"].expense.base * 100 }]),
    "item_house": new CoinRequirement([getQuerySelector("item_house")], [{ requirement: itemBaseData["item_house"].expense.base * 100 }]),
    "item_large_house": new CoinRequirement([getQuerySelector("item_large_house")], [{ requirement: itemBaseData["item_large_house"].expense.base * 100 }]),
    "item_small_palace": new CoinRequirement([getQuerySelector("item_small_palace")], [{ requirement: itemBaseData["item_small_palace"].expense.base * 100 }]),
    "item_grand_palace": new CoinRequirement([getQuerySelector("item_grand_palace")], [{ requirement: itemBaseData["item_grand_palace"].expense.base * 100 }]),
    "item_town_ruler": new CoinRequirement([getQuerySelector("item_town_ruler")], [{ requirement: itemBaseData["item_town_ruler"].expense.base * 100 }]),
    "item_city_ruler": new CoinRequirement([getQuerySelector("item_city_ruler")], [{ requirement: itemBaseData["item_city_ruler"].expense.base * 100 }]),
    "item_nation_ruler": new CoinRequirement([getQuerySelector("item_nation_ruler")], [{ requirement: itemBaseData["item_nation_ruler"].expense.base * 100 }]),
    "item_pocket_dimension": new CoinRequirement([getQuerySelector("item_pocket_dimension")], [{ requirement: itemBaseData["item_pocket_dimension"].expense.base * 100 }]),
    "item_void_realm": new CoinRequirement([getQuerySelector("item_void_realm")], [{ requirement: itemBaseData["item_void_realm"].expense.base * 100 }]),
    "item_void_universe": new CoinRequirement([getQuerySelector("item_void_universe")], [{ requirement: itemBaseData["item_void_universe"].expense.base * 100 }]),
    "item_astral_realm": new CoinRequirement([getQuerySelector("item_astral_realm")], [{ requirement: itemBaseData["item_astral_realm"].expense.base * 100 }]),
    "item_galactic_throne": new CoinRequirement([getQuerySelector("item_galactic_throne")], [{ requirement: itemBaseData["item_galactic_throne"].expense.base * 100 }]),
    "item_spaceship": new CoinRequirement([getQuerySelector("item_spaceship")], [{ requirement: itemBaseData["item_spaceship"].expense.base * 100 }]),
    "item_planet": new CoinRequirement([getQuerySelector("item_planet")], [{ requirement: itemBaseData["item_planet"].expense.base * 100 }]),
    "item_ringworld": new CoinRequirement([getQuerySelector("item_ringworld")], [{ requirement: itemBaseData["item_ringworld"].expense.base * 100 }]),

    // heroic only Properties
    "item_stellar_neighborhood": new CoinRequirement([getQuerySelector("item_stellar_neighborhood")], [{ requirement: 1e65 }]),
    "item_galaxy": new CoinRequirement([getQuerySelector("item_galaxy")], [{ requirement: 1e72 }]),
    "item_supercluster": new CoinRequirement([getQuerySelector("item_supercluster")], [{ requirement: 1e80 }]),
    "item_galaxy_filament": new CoinRequirement([getQuerySelector("item_galaxy_filament")], [{ requirement: 1e90 }]),
    "item_observable_universe": new CoinRequirement([getQuerySelector("item_observable_universe")], [{ requirement: 1e102 }]),
    "item_multiverse": new CoinRequirement([getQuerySelector("item_multiverse")], [{ requirement: 1e116 }]),
    "item_quantum_world": new CoinRequirement([getQuerySelector("item_quantum_world")], [{ requirement: 1e124 }]),
    "item_bootes_void": new CoinRequirement([getQuerySelector("item_bootes_void")], [{ requirement: 1e152 }]),

    // Misc
    "item_book": new CoinRequirement([getQuerySelector("item_book")], [{ requirement: 0 }]),
    "item_dumbbells": new CoinRequirement([getQuerySelector("item_dumbbells")], [{ requirement: itemBaseData["item_dumbbells"].expense.base * 100 }]),
    "item_personal_squire": new CoinRequirement([getQuerySelector("item_personal_squire")], [{ requirement: itemBaseData["item_personal_squire"].expense.base * 100 }]),
    "item_steel_longsword": new CoinRequirement([getQuerySelector("item_steel_longsword")], [{ requirement: itemBaseData["item_steel_longsword"].expense.base * 100 }]),
    "item_butler": new CoinRequirement([getQuerySelector("item_butler")], [{ requirement: itemBaseData["item_butler"].expense.base * 100 }]),
    "item_sapphire_charm": new CoinRequirement([getQuerySelector("item_sapphire_charm")], [{ requirement: itemBaseData["item_sapphire_charm"].expense.base * 100 }]),
    "item_study_desk": new CoinRequirement([getQuerySelector("item_study_desk")], [{ requirement: itemBaseData["item_study_desk"].expense.base * 100 }]),
    "item_library": new CoinRequirement([getQuerySelector("item_library")], [{ requirement: itemBaseData["item_library"].expense.base * 100 }]),
    "item_observatory": new CoinRequirement([getQuerySelector("item_observatory")], [{ requirement: itemBaseData["item_observatory"].expense.base * 100 }]),
    "item_minds_eye": new CoinRequirement([getQuerySelector("item_minds_eye")], [{ requirement: itemBaseData["item_minds_eye"].expense.base * 100 }]),
    "item_void_necklace": new CoinRequirement([getQuerySelector("item_void_necklace")], [{ requirement: itemBaseData["item_void_necklace"].expense.base * 100 }]),
    "item_void_armor": new CoinRequirement([getQuerySelector("item_void_armor")], [{ requirement: itemBaseData["item_void_armor"].expense.base * 100 }]),
    "item_void_blade": new CoinRequirement([getQuerySelector("item_void_blade")], [{ requirement: itemBaseData["item_void_blade"].expense.base * 100 }]),
    "item_void_orb": new CoinRequirement([getQuerySelector("item_void_orb")], [{ requirement: itemBaseData["item_void_orb"].expense.base * 100 }]),
    "item_void_dust": new CoinRequirement([getQuerySelector("item_void_dust")], [{ requirement: itemBaseData["item_void_dust"].expense.base * 100 }]),
    "item_celestial_robe": new CoinRequirement([getQuerySelector("item_celestial_robe")], [{ requirement: itemBaseData["item_celestial_robe"].expense.base * 100 }]),
    "item_universe_fragment": new CoinRequirement([getQuerySelector("item_universe_fragment")], [{ requirement: itemBaseData["item_universe_fragment"].expense.base * 100 }]),
    "item_multiverse_fragment": new CoinRequirement([getQuerySelector("item_multiverse_fragment")], [{ requirement: itemBaseData["item_multiverse_fragment"].expense.base * 100 }]),
    "item_stairway_to_heaven": new CoinRequirement([getQuerySelector("item_stairway_to_heaven")], [{ requirement: itemBaseData["item_stairway_to_heaven"].expense.base * 100 }]),
    "item_highway_to_hell": new CoinRequirement([getQuerySelector("item_highway_to_hell")], [{ requirement: itemBaseData["item_highway_to_hell"].expense.base * 100 }]),
    "item_tesseract": new CoinRequirement([getQuerySelector("item_tesseract")], [{ requirement: 1e112 }]),    
    "item_desintegration": new CoinRequirement([getQuerySelector("item_desintegration")], [{ requirement: 1e122 }]),
    "item_custom_galaxy": new CoinRequirement([getQuerySelector("item_custom_galaxy")], [{ requirement: 1e134 }]),
    "item_hypersphere": new CoinRequirement([getQuerySelector("item_hypersphere")], [{ requirement: 1e160 }]),
    

    // Milestones
    "Milestones": new EssenceRequirement(["#milestonesTabButton"], [{ requirement: 1 }]),

    // Dark Matter
    "Dark Matter": new DarkMatterRequirement(["#darkMatterTabButton"], [{ requirement: 1 }]),
    "Dark Matter Skills": new EssenceRequirement(["#skillTreeTabTabButton"], [{ requirement: 1e20 }]),
    "Dark Matter Skills2": new EssenceRequirement(["#skillTreePage"], [{ requirement: 1e20 }]),

    // Challenges
    "Challenges": new EvilRequirement(["#challengesTabButton"], [{ requirement: 10000 }]),
    "Challenge_an_unhappy_life": new EvilRequirement(["#anUnhappyLifeChallenge"], [{ requirement: 10000 }]),
    "Challenge_rich_and_the_poor": new EvilRequirement(["#theRichAndThePoorChallenge"], [{ requirement: 1000000 }]),
    "Challenge_time_does_not_fly": new EssenceRequirement(["#timeDoesNotFlyChallenge"], [{ requirement: 10000 }]),
    "Challenge_dance_with_the_devil": new EssenceRequirement(["#danceWithTheDevilChallenge"], [{ requirement: 1e6 }]),
    "Challenge_legends_never_die": new EssenceRequirement(["#legendsNeverDieChallenge"], [{ requirement: 2.5e7 }]),
    "Challenge_the_darkest_time": new EssenceRequirement(["#theDarkestTimeChallenge"], [{ requirement: 1e47 }]),

    // Metaverse Altars
    "Metaverse": new MetaverseRequirement(["#metaverseTabButton"], [{ requirement: 1 }]),
    "Increase Hypercube Gain": new HypercubeRequirement(["#IncreaseHypercubeGainAltar"], [{ requirement: 1 }]),
    "Reduce Boost Cooldown": new HypercubeRequirement(["#ReduceBoostCooldownAltar"], [{ requirement: 500 }]),
    "Increase Boost Duration": new HypercubeRequirement(["#IncreaseBoostDurationAltar"], [{ requirement: 2500 }]),
    "Gain evil at new transcension": new HypercubeRequirement(["#EvilAltar"], [{ requirement: 50000000 }]),
    "Essence gain multiplier": new HypercubeRequirement(["#EssenceAltar"], [{ requirement: 500000000 }]),
    "Challenges are not reset": new HypercubeRequirement(["#ChallengeAltar"], [{ requirement: 1e15 }]),
    "Dark Matter gain multiplier": new HypercubeRequirement(["#DarkMaterAltar"], [{ requirement: 1e17 }]),

    // Metaverse Perks
    "Metaverse Perks": new PerkPointRequirement(["#metaversePage2"], [{ requirement: 1 }]),
    "Metaverse Perks Button": new PerkPointRequirement(["#metaverseTab2TabButton"], [{ requirement: 1 }]),

    "Congratulations": new EssenceRequirement(["#Congratulations"], [{ requirement: 1e300 }]),
}

const headerRowTextColors = {
    "category_common_work": "darkblue",
    "category_military": "purple",
    "category_mage_collegium": "magenta",
    "category_the_void": "white",
    "category_galactic_council": "purple",
    "category_fundamentals": "purple",
    "category_combat": "pink",
    "category_magic": "purple",
    "category_dark_magic": "pink",
    "category_almightiness": "purple",
    "category_darkness": "gold",
    "category_void_manipulation": "white",
    "category_celestial_powers": "purple",
    "Properties_Auto": "purple",
    "Misc_Auto": "purple",
    "Properties": "purple",
    "Misc": "purple",
    "category_properties": "purple",
    "category_misc": "purple",
    "Essence Milestones": "purple",
    "Heroic Milestones": "purple",
    "Dark Milestones": "purple",
    "Metaverse Milestones": "purple",
    "category_metaverse_guards": "purple",
}

function getPreviousTaskInCategory(task) {
    var prev = ""
    for (const category in jobCategories) {
        for (job of Object.keys(jobCategories[category].items)) {
            if (job == task)
                return prev
            prev = job
        }
    }

    prev = ""
    for (const category in skillCategories) {
        for (const skill of Object.keys(skillCategories[category].items)) {
            if (skill == task)
                return prev
            prev = skill
        }
    }
    return prev
}

function getBindedTaskEffect(taskName) {
    const task = gameData.taskData[taskName]
    return task.getEffect.bind(task)
}

function getBindedItemEffect(itemName) {
    const item = gameData.itemData[itemName]
    return item.getEffect.bind(item)
}

function getItemCategoryId(itemId) {
    for (const categoryId in itemCategories)
        if (itemCategories[categoryId].items[itemId] != null)
            return categoryId
    return null
}