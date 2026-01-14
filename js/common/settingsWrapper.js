import Common from "./common";

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
  /** @type {String} */
  static _BOARD_LOGGING = "l";
  /** @type {String} */
  static _BOARD_HIDE_TOUR_PROP = "ht";
  /** @type {String} */
  static _BOARD_USE_CUSTOM = "uc";
  /** @type {String} */
  static _BOARD_CUSTOM_FIELD = "cf";
  /** @type {String} */
  static _BOARD_USE_CUSTOM_COLORS = "cc";
  /** @type {String} */
  static _BOARD_CUSTOM_COLOR_LIST = "cl";
  /** @type {String} */
  static _BOARD_KEEP_CURRENT_LABEL = "k";
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
  #mode = BadgeMode.PRIVATE;
  /** @type {String} */
  #color = null;
  /** @type {Boolean} */
  #enableLogging = false;
  /** @type {Boolean} */
  #hideTour = false;
  /** @type {Boolean} */
  #useCustomField = false;
  /** @type {String} */
  #customFieldId = null;
  /** @type {Boolean} */
  #useCustomColors = false;
  /** @type {CustomColorAndLabel[]} */
  #customColors = [];
  /** @type {Boolean} */
  #keepOnlyCurrentLabel = false;
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
      this.#mode = await t.get("board", "private", SettingsWrapper._BOARD_CUSTOM_MODE, BadgeMode.PRIVATE);
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
      this.#useCustomField = await t.get("board", this.#mode, SettingsWrapper._BOARD_USE_CUSTOM, false);
      pos = 100;
      this.#customFieldId = await t.get("board", this.#mode, SettingsWrapper._BOARD_CUSTOM_FIELD, null);
      pos = 110;
      this.#useCustomColors = await t.get("board", this.#mode, SettingsWrapper._BOARD_USE_CUSTOM_COLORS, false);
      pos = 120;
      this.#customColors = JSON.parse(await t.get("board", this.#mode, SettingsWrapper._BOARD_CUSTOM_COLOR_LIST, "[]"));
      pos = 130;
      this.#keepOnlyCurrentLabel = await t.get("board", this.#mode, SettingsWrapper._BOARD_KEEP_CURRENT_LABEL, false);
      pos = 140;
      this.#loaded = true;
    } catch (e) {
      console.error(`Failed at ${pos} loading settings: \n${e}`);
    }
  }
  /**
   * Saves the settings
   * @param {TrelloObject} t
   * @param {BadgeMode} [mode]
   */
  save = async (t) => {
    /** @type {Object} */
    const modeValues = {};
    modeValues[SettingsWrapper._BOARD_DISABLED_LIST] = this.#disabledListId;
    modeValues[SettingsWrapper._BOARD_AUTO_NEW] = this.#autoNewCardBadge;
    modeValues[SettingsWrapper._BOARD_BADGE_TYPE_PROP] = this.#type;
    modeValues[SettingsWrapper._BOARD_BADGE_COLOR_PROP] = this.#color;
    modeValues[SettingsWrapper._BOARD_USE_CUSTOM] = this.#useCustomField;
    modeValues[SettingsWrapper._BOARD_CUSTOM_FIELD] = this.#customFieldId;
    modeValues[SettingsWrapper._BOARD_USE_CUSTOM_COLORS] = this.#useCustomColors;
    modeValues[SettingsWrapper._BOARD_CUSTOM_COLOR_LIST] = JSON.stringify(this.#customColors);
    modeValues[SettingsWrapper._BOARD_KEEP_CURRENT_LABEL] = this.#keepOnlyCurrentLabel;
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
   * @param {String} v
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
   * @param {Boolean} v
   */
  set hideTour (v) {
    this.#hideTour = v;
  }
  /**
   * Gets if the user wants a custom field for the badges
   * @returns {Boolean}
   */
  get useCustomField () {
    return this.#useCustomField;
  }
  /**
   * @param {Boolean} v
   */
  set useCustomField (v) {
    this.#useCustomField = v;
  }
  /**
   * Gets if the user wants a custom field for the badges
   * @returns {String}
   */
  get customFieldId () {
    return this.#customFieldId;
  }
  /**
   * @param {String} v
   */
  set customFieldId (v) {
    this.#customFieldId = v;
  }
  /**
   * Gets if the user wants custom colors
   * @returns {Boolean}
   */
  get useCustomColors () {
    return this.#useCustomColors;
  }
  /**
   * @param {Boolean} v
   */
  set useCustomColors (v) {
    this.#useCustomColors = v;
  }
  /**
   * Gets the custom colors array for the badges
   * @returns {CustomColorAndLabel[]}
   */
  get customColors () {
    return this.#customColors;
  }
  /**
   * @param {CustomColorAndLabel[]} v
   */
  set customColors (v) {
    this.#customColors = v;
  }
  /**
   * Gets if the user wants to keep only the current label
   * @returns {Boolean}
   */
  get keepOnlyCurrentLabel () {
    return this.#keepOnlyCurrentLabel;
  }
  /**
   * @param {Boolean} v
   */
  set keepOnlyCurrentLabel (v) {
    this.#keepOnlyCurrentLabel = v;
  }
  /** @param {Boolean} v */
  set hideFeatures(v) { this.#hideFeatures = v; }
  /** @returns {Boolean} */
  get hideFeatures() { return this.#hideFeatures; }
  /**
   * Returns the custom defaults
   * @param {TrelloLabel[]} labels
   * @returns {CustomColorAndLabel[]}
   */
  customDefaults = (labels) => {
    const colors = ["blue", "green", "purple", "yellow", "orange", "red"];
    const values = [100, 80, 60, 40, 20, 0];
    /** @type {CustomColorAndLabel[]} */
    const defaults = [];
    for (let i = 0; i < 6; i++) {
      defaults.push({
        id: Common.generateId(),
        color: colors[i],
        value: values[i],
        labelId: labels?.find((o) => o.color === colors[i])?.id,
      });
    }
    return defaults;
  };
}
/**
 * @typedef {Object} CustomColorAndLabel
 * @property {String} id
 * @property {Number} value
 * @property {String} color
 * @property {String} labelId
 */
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
