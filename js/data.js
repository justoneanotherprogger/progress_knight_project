import { jobCategories } from "../dist/js/jobs_data.js";
import { skillCategories } from "../dist/js/skills_data.js";

export var gameData = {
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
		more_perk_points: 0,
	},

	paused: false,

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

	// Ошибка в коде останавливает симуляцию, но не выглядит смертью игрока:
	// время встаёт на битом состоянии, отсюда и без перезагрузки не уйти.
	hasError: false,

	settings: {
		stickySidebar: true,
		theme: 1,
		currencyNotation: 3,
		numberNotation: 1,
		layout: 1,
		fontSize: 3,
		selectedTab: "jobs",
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
};

export const updateSpeed = 20;
export const renderSpeed = 20;
export const baseLifespan = 365 * 65;
export const baseGameSpeed = 30;
export const heroIncomeMult = 2.5e18;

// --- Hero XP ---
export const HERO_XP_BASE_JOB = 50000;

// --- Task XP cost ---
export const TASK_XP_GROWTH = 1.01;
export const TASK_HERO_XP_GROWTH = 1.08;

// --- Lifespan ---
export const COINPILE_LOG_BASE = 10;
export const COINPILE_MULTIPLIER = 20;
export const LIFESPAN_CHALLENGE_EXPONENT = 0.72;
export const LIFESPAN_CHALLENGE_FLAT = 365 * 25;
export const DEFAULT_STARTING_AGE = 365 * 16;

// --- Income ---
export const CHALLENGE_RICH_INCOME_EXPONENT = 0.35;

// --- Game speed ---
export const CHALLENGE_TIME_WARP_EXPONENT = 0.7;
export const CHALLENGE_LEGENDS_WARP_EXPONENT = 0.75;
export const SPEED_SPEED_SPEED_MULTIPLIER = 1000;
export const TIME_IS_A_FLAT_CIRCLE_MULTIPLIER = 1000;

// --- Happiness ---
export const CHALLENGE_DANCE_HAPPINESS_EXPONENT = 0.075;
export const CHALLENGE_UNHAPPY_HAPPINESS_EXPONENT = 0.5;

// --- Evil / Essence gain ---
export const EVIL_EFFECT_DIVISOR = 1e3;
export const EVIL_EFFECT_EXPONENT = 0.35;
export const ESSENCE_EFFECT_DIVISOR = 1e2;
export const ESSENCE_EFFECT_EXPONENT = 0.35;
export const ESSENCE_EFFECT_MIN_THRESHOLD = 0.01;

// --- Evil Gain multipliers ---
// Инферно: (1 + essence)^exp — ×3.3 на пороге 170k, ×5 к ~1e7, дальше ползёт
export const INFERNO_ESSENCE_EXPONENT = 0.1;
export const EVIL_BOOSTER_MULTIPLIER = 1e50;

// --- Dark Matter Gain ---
// Рост от тёмных сфер: ×5 при нуле, ×10 к 1e30, ×12.6 к 1e40
export const DARK_MATTER_HARVESTER_BASE = 5;
export const DARK_MATTER_HARVESTER_EXPONENT = 0.01;
export const DARK_MATTER_MINING_MULTIPLIER = 3;

// --- Lifespan ---
export const LIFE_IS_VALUABLE_MULTIPLIER = 1e5;
export const SPEED_SPEED_SPEED_LIFESPAN = 1000;

// --- Inspiration / Greed ---
export const INSPIRATION_LOG_BASE = 10;
export const INSPIRATION_FLAT_BONUS = 0.7;
export const INSPIRATION_INFINITY_FALLBACK = 1e300;
export const GREED_ADULT_AGE = 20 * 365;

// --- Dark Matter XP ---

// --- Transcendent Master ---
// effect = 1 + base * (log10(essence))^exponent
// x1.5 на пороге 5e4, x10 к 1e20 — подгонка по двум точкам
export const TRANSCENDENT_MASTER_BASE = 0.0225;
export const TRANSCENDENT_MASTER_EXPONENT = 2;

// --- Faint Hope ---
export const FAINT_HOPE_INFINITY = 1e308;
export const FAINT_HOPE_A_NEW_HOPE_SOFTCAP = 10000000;
export const FAINT_HOPE_A_NEW_HOPE_DECAY = 0.01;
export const FAINT_HOPE_SPEED_COEFFICIENT = 7.5275;
export const FAINT_HOPE_SPEED_EXPONENT = 0.0053;
export const FAINT_HOPE_KICKIN_MIN = 0.15;
export const FAINT_HOPE_KICKIN_LOG_COEFFICIENT = 0.082;
export const FAINT_HOPE_KICKIN_BASE = 1.1754;
export const FAINT_HOPE_REBIRTH_DIVISOR = 1000;
export const FAINT_HOPE_SOFTCAP = 1000;
export const FAINT_HOPE_SPEED_SOFTCAP = 10000000;

// --- Rise of Great Heroes ---
export const RISE_HEROES_NUMERATOR = 3;
export const RISE_HEROES_DENOMINATOR = 7;

// --- Milestone / passive growth ---
export const EVIL_GROWTH_EXPONENT_DEAL = 1.001;
export const EVIL_GROWTH_EXPONENT_HELL = 1.01;
export const EVIL_GROWTH_EXPONENT_MIND_CONTROL = 1.07;
export const ESSENCE_GROWTH_EXPONENT = 1.002;

// --- Heroes unlock ---
export const HERO_LEVEL_UNLOCK_THRESHOLD = 2000;
export const HERO_PREV_LEVEL_MIN = 20;

// --- Rebirth max level cap ---
export const REBIRTH_THREE_ESSENCE_CAP = 1e308;

// --- Perks thresholds ---
export const PERK_AUTO_DARK_ORB_MIRACLE_COST = 100;
export const PERK_AUTO_DARK_SHOP_ORBS_THRESHOLD = 1000;
export const PERK_AUTO_SACRIFICE_HYPERCUBES_THRESHOLD = 1000;
export const PERK_AUTO_SACRIFICE_COST_MULTIPLIER = 100;
export const PERK_INSTANT_GAIN_MULTIPLIER = 10;

// --- Metaverse ---
export const METAVERSE_BOOST_WARP_DEFAULT = 100;

// --- Save ---
export const EXPORT_TOOLTIP_TIMEOUT = 15 * 1000;

// --- Skill effect ---
export const SKILL_HERO_LEVEL_MULTIPLIER = 1000;
export const SKILL_HERO_FLAT_BONUS = 8000;
export const SKILL_LEVEL_EXPONENT_BASE = 1.01;

// --- Job income hero ---
export const JOB_INCOME_HERO_BASE_MULTIPLIER = 4;

export function getPreviousTaskInCategory(task) {
	var prev = "";
	for (const category in jobCategories) {
		for (const job of Object.keys(jobCategories[category].items)) {
			if (job === task) return prev;
			prev = job;
		}
	}

	prev = "";
	for (const category in skillCategories) {
		for (const skill of Object.keys(skillCategories[category].items)) {
			if (skill === task) return prev;
			prev = skill;
		}
	}
	return prev;
}

export function getBindedTaskEffect(taskName) {
	const task = gameData.taskData[taskName];
	return task.getEffect.bind(task);
}

export function getBindedItemEffect(itemName) {
	const item = gameData.itemData[itemName];
	return item.getEffect.bind(item);
}
