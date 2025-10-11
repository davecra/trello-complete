import Common from "../../common/common";
import SettingsWrapper, { BadgeMode, BadgeType } from "../../common/settingsWrapper.js";

/**
 * Custom Badge Class
 * This is the main badge information container
 */
export default class CustomBadge {
  /** @type {String} */
  static _CARD_BADGE_COMPLETENESS_PROP = "c";
  /** @type {String} */
  static _CARD_BADGE_COLOR_PROP = "cl";
  /** @type {String} */
  static _CARD_BADGE_FIRST_RUN_PROP = "fr";
  /** @type {String} */
  static _CARD_BADGE_ENABLED_PROP = "e";
  /** @type {import("../../common/settingsWrapper.js").BadgeData} */
  #badge = {};
  /** @type {import("../../common/settingsWrapper.js").default} */
  #settings = {};
  #cardSettings = {
    enabled: false,
    completeness: 0,
    custom_color: null,
  };
  /**
   * Creates a badge from existing settings
   * @param {BadgeType} [type]
   * @param {Number} [completeness] 0-100
   * @param {String} [color]
   */
  constructor(type = null, completeness = -1, color = null) {
    if(type === null && completeness === -1 && color === null) return;
    this.#getBadge(type, completeness, color);
  }
  /**
   * Gets the text for the badge
   * @param {BadgeType} type
   * @param {Number} completeness 
   * @param {String} [color]
   * @returns {import("../../common/settingsWrapper.js").BadgeData}
   */
  #getBadge = (type, completeness, color = null) => {
    const bar = `[${"▬".repeat(Math.round(completeness / 10))}${"▭".repeat(Math.round((100 - completeness) / 10))}]`;
    switch(type) {
      case "both":
        return {
          text: completeness + "%" + " " + bar, 
          color: color
        };
      case "bar":
        return {
          text: bar, 
          color: color
        };
      case "text":
        return {
          text: completeness + "%", 
          color: color
        };
    }
  }
  /**
   * Loads the settings for the card
   * @param {TrelloObject} t 
   */
  #loadBadgeSettings = async (t) => {
    const mode = this.#settings.mode ? this.#settings.mode : BadgeMode.PRIVATE;
    this.#cardSettings.enabled =  await t.get('card', mode, CustomBadge._CARD_BADGE_ENABLED_PROP, false);
    this.#cardSettings.completeness =  parseInt(await t.get('card', mode, CustomBadge._CARD_BADGE_COMPLETENESS_PROP, 0));
    this.#cardSettings.custom_color =  await t.get('card', mode, CustomBadge._CARD_BADGE_COLOR_PROP, null);
  }
  /**
   * Saves the settings for the badge
   * @param {TrelloObject} t
   */
  #saveBadgeSettings = async (t) => {
    const mode = this.#settings.mode ? this.#settings.mode : BadgeMode.PRIVATE;
    await t.set("card", mode, CustomBadge._CARD_BADGE_ENABLED_PROP, this.#cardSettings.enabled);
    await t.set("card", mode, CustomBadge._CARD_BADGE_COMPLETENESS_PROP, this.#cardSettings.completeness);
    await t.set("card", mode, CustomBadge._CARD_BADGE_COLOR_PROP, this.#cardSettings.custom_color);
  }
  /**
   * Loads the badge data and sets it up
   * @param {TrelloObject} t 
   * @param {import("../../common/settingsWrapper.js").default} s
   */
  load = async (t, s) => {
    let pos = 0;
    this.#settings = s;
    try {
      await this.#loadBadgeSettings(t);
      /** @type {TrelloCard} */
      const card = await t.card("idList", "id");
      pos = 10;
      this.#badge = { text: null, color: null };
      if(this.#settings.disabledListId !== card.idList) {
        pos = 30;
        if(this.#isThisANewCard(card) === true) {
          if(this.#settings.autoNewCardBadge === true) {
            pos = 40;
            this.#badge = this.#getBadge(s.type, 0, s.color);
            pos = 50;
            this.#cardSettings.enabled = true;
            this.#cardSettings.completeness = 0;
            await this.#saveBadgeSettings(t);
          } 
        } else if (this.#cardSettings.enabled) {
          pos = 90;
          this.#badge = this.#getBadge(s.type, this.#cardSettings.completeness, s.color);
        }
      }
      pos = 100;
      if(!this.#badge) {
        console.error("Unexpected failure. The badge was not set.");
        return;
      }
      this.#badge.icon = Common.ICON_DARK;
    } catch (e) {
      console.error(`(load) Failed at: ${pos}.\n${e}`);
    }
  }
  /**
   * @returns {TrelloCardBadgesOption}
   */
  get badgeFront() {
    if(!this.#badge) return null;
    const returnBadge = {
      icon: this.#badge.text ? this.#badge.icon : null,
      color: this.#fixColors(this.#badge.color), 
      text: this.#badge.text
    };
    return returnBadge;
  }
  /**
   * @returns {TrelloCardBadgesOption[]}
   */
  get badgeBack() {
    /** @type {String} */
    const divider = " _______________________________________________ ";
    if(this.#badge) {
      /** @type {TrelloDetailBadgeOption} */
      const detail = {
        color: this.#fixColors(this.#badge.color),
        title: Common.TITLE,
        text: this.#badge.text ? this.#badge.text : "Not Set",
        callback: async (t) => {
          const cardListId = (await t.card("idList")).idList;
          /** @type {TrelloItemsAction[]} */
          var menuItems = [];
          if (this.#settings.disabledListId && this.#settings.disabledListId === cardListId) {
            menuItems.push({
              text: "⚙️ Disabled by Automation Settings...",
              callback: async(tt) => this.#showSettings(tt),
            });
          } else {
            menuItems.push({
              text: this.#cardSettings.enabled ? "🔴 Disable Badge" : "🟢 Enable Badge",
              callback: async (tt) => {
                this.#cardSettings.enabled = !this.#cardSettings.enabled;
                await this.#saveBadgeSettings(tt);
                tt.closePopup();
              }
            });
            menuItems.push({
              text: "📦 Set Value",
              callback: (tt) => {
                /** @type {TrelloPopupListOptions} */
                const opts = {
                  items: this.#setValueSubmenu(),
                  title: "Set Badge Value",
                }
                tt.popup(opts);
              }
            });
            menuItems.push({
              text: divider,
              callback: null,
            });
            menuItems.push({
              text: "⚙️ Settings...",
              callback: async(tt) => this.#showSettings(tt),
            });
          }
          //
          // COMMERCIAL AND TRIAL NAG
          //
          try {
            if(Common.tbr.trialConfirmationMenu !== null) menuItems.unshift(Common.tbr.trialConfirmationMenu);
            if(Common.tbr.nagConfirmationMenu !== null) menuItems.unshift(Common.tbr.nagConfirmationMenu);
          } catch { }
          // now return the menu
          /** @type {TrelloPopupListOptions} */
          const popupOpts = {
            title: Common.TITLE, 
            items: menuItems
          }
          return t.popup(popupOpts);
        }
      }
      /** @type {TrelloDetailBadgeOption[]} */
      var returnValue = [];
      returnValue.push(detail);
      // return the array
      return returnValue;
    } else {
      // need to return something. If we did not initialize a badge
      // on load, then something failed and we need to inform the user
      return {
        color: "red",
        title: Common.TITLE,
        text: "⚠️ ERROR!",
        callback: (t) => {
          t.alert({
            message: "⚠️ERROR: The card was not initialized properly.",
            duration: 4,
          });
        }
      }
    }
  }
  /**
   * Returns the set value submenu
   * @returns {TrelloItemsAction[]}
   */
  #setValueSubmenu = () => {
    /** @type {TrelloItemsAction[]} */
    const menuItems = [];
    for (let n = 0; n <= 100; n += 10) {
      menuItems.push(
        {
          text: n + "%",
          callback: async (tt) => {
            this.#badge = this.#getBadge(this.#settings.type, n, this.#settings.color);
            this.#cardSettings.completeness = n;
            this.#cardSettings.enabled = true;
            await this.#saveBadgeSettings(tt);
            tt.closePopup(); 
          }
        }
      );
    }
    if (Common.tbr.isFeatureAllowed || Common.tbr.hideFeatures === false) {
      menuItems.push({
        text: "🔧 Custom value...",
        callback: (tt) => {
          /** @type {TrelloPopupIFrameOptions} */
          const opts = {
            args: { view: "custom" },
            height: 1,
            title: "Set custom value",
            url: Common.detailsPage,
          }
          tt.popup(opts);
        },
      });
    }
    return menuItems;
  };
  /**
   * Shows the settings form
   * @param {TrelloObject} t
   */
  #showSettings = (t) => {
    /** @type {TrelloPopupIFrameOptions} */
    const popupOpts = {
      args: { view: "settings" },
      title: Common.TITLE,
      url: Common.detailsPage,
      height: 265,
    };
    return t.popup(popupOpts);
  }
  /** 
   * Returns the Badge Settings as a JSON string
   * @returns {String} 
   */
  toJSON = () => {
    return {
      completeness: this.#badge.index,
      text: this.#badge.text,
      color: this.#badge.color,
    }
  }
  /**
   * This is bull, but oh well - color correction because Trello uses
   * sky, instead of cyan and light-gray instead of lightgray.
   * @param {string} c
   */
  #fixColors = (c) => {
    if(c === "cyan") return "sky";
    if(c === "lightgray") return "light-gray";
    return c; 
  }
  /**
   * Checks to see if the card is new by:
   * - see if it was created in the last 5s
   * @param {TrelloCard} c
   */
  #isThisANewCard = (c) => {
    /** @type {Date} */
    const createDate = new Date(1000 * parseInt(c.id.substring(0, 8), 16));
    /** @type {Boolean} */
    const  withinLast5Seconds = ((new Date()).getTime() - createDate.getTime()) / 1000 <= 5;
    return withinLast5Seconds;
  }
}
