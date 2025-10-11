/**
 * Settings Wrapper Class
 * This holds all the properties for the Power-Up
 */
export default class SettingsWrapper {
  /** @type {String} */
  static _BOARD_BADGE_TYPE_PROP = "b";
  /** @type {String} */
  static _BOARD_CUSTOM_BADGE_PROP = "cx";
  /** @type {String} */
  static _BOARD_CUSTOM_TEAM_BADGE_PROP = "tx";
  /** @type {String} */
  static _BOARD_HIDE_FEATURES = "hf";
  /** @type {String} */
  static _BOARD_DISABLED_LIST = "dl";
  /** @type {String} */
  static _BOARD_AUTO_NEW = "an";
  /** @type {String} */
  static _BOARD_CUSTOM_MODE = "m";
  /** @type {String} */
  static _BOARD_BADGE_COLOR_PROP = "c";
  /** @type {Boolean} */
  static _BOARD_LOGGING = "l";
  /** @type {Boolean} */
  static _BOARD_HIDE_TOUR_PROP = "ht";
  /** @type {Boolean} */
  #loaded = false;
  /** @type {BadgeType} */
  #type = BadgeType.BAR;
  /** @type {Boolean} */
  #hideFeatures = false;
  /** @type {String} */
  #disabledListId = "";
  /** @type {Boolean} */
  #autoNewCardBadge = false;
  /** @type {BadgeMode} */
  #mode = BadgeMode.CUSTOM;
  /** @type {String} */
  #color = null;
  /** @type {Boolean} */
  #enableLogging = false;
  /** @type {Boolean} */
  #hideTour = false;
  /**
   * CTOR
   */
  constructor() { }
  /**
   * Loads the Trello settings for this board
   * @param {TrelloObject} t 
   * @param {Boolean} [force]
   */
  load = async (t, force = false) => {
    if (this.#loaded === true && force === false) return;
    let pos = 0;
    try {
      pos = 10;
      this.#mode = await t.get("board", "shared", SettingsWrapper._BOARD_CUSTOM_MODE, BadgeMode.PRIVATE);
      pos = 20;
      this.#type = await t.get("board", this.#mode, SettingsWrapper._BOARD_BADGE_TYPE_PROP, BadgeType.BAR);
      pos = 30;
      this.#hideFeatures = await t.get("board", "private", SettingsWrapper._BOARD_HIDE_FEATURES, false);
      pos = 40;
      this.#disabledListId = await t.get("board", this.#mode, SettingsWrapper._BOARD_DISABLED_LIST, null);
      pos = 50;
      this.#autoNewCardBadge = Boolean(await t.get("board", this.#mode, SettingsWrapper._BOARD_AUTO_NEW, false));
      pos = 60;
      this.#color = await t.get("board", this.#mode, SettingsWrapper._BOARD_BADGE_COLOR_PROP, null);
      pos = 70;
      this.#enableLogging = await t.get("board", "private", SettingsWrapper._BOARD_LOGGING, false);
      pos = 80;
      this.#hideTour = await t.get("board", "private", SettingsWrapper._BOARD_HIDE_TOUR_PROP, false);
      pos = 90;
      this.#loaded = true;
    } catch (e) {
      console.error(`Failed at ${pos} loading settings: \n${e}`);
    }
  }
  /**
   * Saves the settings
   * @param {TrelloObject} t
   */
  save = async (t) => {
    /** @type {Object} */
    const modeValues = {};
    modeValues[SettingsWrapper._BOARD_DISABLED_LIST] = this.#disabledListId;
    modeValues[SettingsWrapper._BOARD_AUTO_NEW] = this.#autoNewCardBadge;
    modeValues[SettingsWrapper._BOARD_BADGE_TYPE_PROP] = this.#type;
    modeValues[SettingsWrapper._BOARD_BADGE_COLOR_PROP] = this.#color;
    /** @type {Object} */
    const privateValues = {};
    privateValues[SettingsWrapper._BOARD_CUSTOM_MODE] = this.#mode;
    privateValues[SettingsWrapper._BOARD_HIDE_FEATURES] = this.#hideFeatures;
    privateValues[SettingsWrapper._BOARD_HIDE_TOUR_PROP] = this.#hideTour;
    privateValues[SettingsWrapper._BOARD_LOGGING] = this.#enableLogging;
    // save
    await t.set("board", "private", privateValues);
    await t.set("board", this.#mode, modeValues);
  }
  /**
   * @param {Boolean} v
   */
  set enableLogging(v) {
    this.#enableLogging = v;
  }
  /**
   * @returns {Boolean}
   */
  get enableLogging() {
    return this.#enableLogging;
  }
  /**
   * @returns {Boolean}
   */
  get autoNewCardBadge() {
    return this.#autoNewCardBadge;
  }
  /**
   * @param {Boolean} a
   */
  set autoNewCardBadge(a) {
    this.#autoNewCardBadge = a;
  }
  /**
   * @returns {String}
   */
  get disabledListId() {
    return this.#disabledListId;
  }
  /**
   * @param {String} id
   */
  set disabledListId(id) {
    this.#disabledListId = id;
  }
  /**
   * Sets the test for the badge
   * @param {String} t
   */
  set type(t) {
    this.#type = t;
  }
  /** @returns {String} */
  get type() { return this.#type; }
  /**
   * Sets the mode for the custom badge
   * @param {BadgeMode} m
   */
  set mode(m) {
    this.#mode = m;
  }
  /**
   * Gets the mode for the custom badge
   * @returns {BadgeMode}
   */
  get mode() {
    return this.#mode;
  }
  /**
   * Gets the color for the badges
   * @returns {String}
   */
  get color () {
    return this.#color;
  }
  /**
   * @param {String} c
   */
  set color (v) {
    this.#color = v;
  }
  /**
   * Gets the color for the badges
   * @returns {Boolean}
   */
  get hideTour () {
    return this.#hideTour;
  }
  /**
   * @param {Boolean} c
   */
  set hideTour (v) {
    this.#hideTour = v;
  }
  /** @param {Boolean} v */
  set hideFeatures(v) { this.#hideFeatures = v; }
  /** @returns {Boolean} */
  get hideFeatures() { return this.#hideFeatures; }
}
/**
 * @typedef {Object} BadgeStyleType
 * @property {String} name
 * @property {String} text
 * @property {BadgeData[]} styles
 */
/**
 * @typedef {Object} BadgeData
 * @property {Number} index
 * @property {String} text
 * @property {String} color
 * @property {String} icon
 */
/**
 * @typedef {'shared' | 'private'} BadgeMode
 */
export const BadgeMode = {
  SHARED: "shared",
  PRIVATE: "private"
};
/**
 * @typedef {'text' | 'bar' | 'both'} BadgeType
 */
export const BadgeType = {
  TEXT: 'text',
  BAR: 'bar',
  BOTH: 'both'
};
