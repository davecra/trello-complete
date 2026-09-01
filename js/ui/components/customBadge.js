/* global TrelloPowerUp */
/* global TrelloBoardRegistration */
import TrelloFrame from "../../common/trelloFrame";
import TrelloAPIWrapper from "../../api/api.js";
import TrelloTokenWrapper from "../../api/trelloTokenWrapper.js";
import Common from "../../common/common";
import { CommonLogger } from "../../common/commonLogger.js";
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
  /** @type {String} */
  static _CARD_BADGE_CHECKLIST_PROP = "cid";
  /** @type {String} */
  static _CARD_BADGE_OVERRIDE_PROP = "o";
  /** @type {import("../../common/settingsWrapper.js").BadgeData} */
  #badge = {};
  /** @type {import("../../common/settingsWrapper.js").default} */
  #settings = {};
  #cardSettings = {
    enabled: false,
    completeness: 0,
    custom_color: null,
    checklistId: null,
    override: false,
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
   * Gets the check lists
   * @param {TrelloObject} t
   * @param {String} cardId
   */
  #getChecklists = async (t, cardId) => {
    const token = await TrelloTokenWrapper.getToken(t, true);
    const api = new TrelloAPIWrapper();
    api.init(Common.APIKEY, token);
    return await api.getCardCheckLists(cardId);
  }
  /**
   * Returns the custom field value
   * @param {TrelloObject} t 
   * @returns {Promise<Number>}
   */
  #getCustomFieldValue = async (t) => {
    /** @type {TrelloCustomCardField[]} */
    const fields = (await t.card("customFieldItems"))?.customFieldItems;
    if (fields) {
      const selectedField = fields.find((o) => o.idCustomField === this.#settings.customFieldId);
      if (selectedField?.value?.number) {
        const value = selectedField.value.number;
        return value < 0 ? 0 : value > 100 ? 100 : value;
      }
    }
    return 0;
  }
  /**
   * Returns the checklist completeness
   * @param {TrelloObject} t 
   * @returns {Promise<Number>}
   */
  #getChecklistValue = async (t, checklistId = this.#cardSettings.checklistId) => {
    /** @type {TrelloCheckList} */
    const checklist = (await this.#getChecklists(t, (await t.card("id")).id))?.find((o) => o.id === checklistId);
    return this.#calculateChecklistValue(checklist) ?? 0;
  }
  /**
   * Calculates checklist completeness from checklist data already loaded by Trello.
   * @param {TrelloCheckList} checklist
   * @returns {Number | null}
   */
  #calculateChecklistValue = (checklist) => {
    if (!Array.isArray(checklist?.checkItems)) return null;
    const totalItems = checklist.checkItems.length;
    if (totalItems === 0) return 0;
    const selectedItems = checklist.checkItems.filter((o) => o.state === "complete").length;
    return (selectedItems / totalItems) * 100;
  }
  /**
   * Loads the settings for the card
   * @param {TrelloObject} t 
   */
  #loadBadgeSettings = async (t) => {
    const mode = this.#settings.mode ? this.#settings.mode : BadgeMode.PRIVATE;
    this.#cardSettings.enabled =  await t.get('card', mode, CustomBadge._CARD_BADGE_ENABLED_PROP, false);
    this.#cardSettings.checklistId = await t.get('card', mode, CustomBadge._CARD_BADGE_CHECKLIST_PROP, null);
    this.#cardSettings.override = await t.get('card', mode, CustomBadge._CARD_BADGE_OVERRIDE_PROP, false);
    /** @type {Number} */
    let completeness = parseInt(await t.get('card', mode, CustomBadge._CARD_BADGE_COMPLETENESS_PROP, 0));
    if (this.#settings.useCustomField && this.#settings.customFieldId && !this.#cardSettings.override) {
      completeness = await this.#getCustomFieldValue(t);
    } else if (this.#cardSettings.checklistId) {
      completeness = await this.#getChecklistValue(t);
    }
    this.#cardSettings.completeness = completeness;
    this.#cardSettings.custom_color = await t.get('card', mode, CustomBadge._CARD_BADGE_COLOR_PROP, null) ?? this.#settings.color;
    if (this.#settings.useCustomColors && this.#settings.customColors.length > 0 && this.#cardSettings.enabled) {
      /** @type {import("../../common/settingsWrapper.js").CustomColorAndLabel} */
      let highestMatch = null;
      for (const o of this.#settings.customColors) {
        if (completeness >= o.value) {
          if (!highestMatch || o.value > highestMatch.value) {
            highestMatch = o;
          }
        }
      }
      if (highestMatch) {
        this.#cardSettings.custom_color = highestMatch.color;
        if (highestMatch.labelId) {
          const api = new TrelloAPIWrapper();
          api.init(Common.APIKEY, await TrelloTokenWrapper.getToken(t, true));
          const card = await api.getCard((await t.card("id"))?.id ?? null);
          if (!card.idLabels.find((o) => o === highestMatch.labelId)) {
            // first remove any of our existing labels
            if (this.#settings.keepOnlyCurrentLabel) {
              card.idLabels = card.idLabels.filter((o) => {
                return !this.#settings.customColors.find((x) => x.labelId === o)
              });
            }
            // add and then update
            card.idLabels.push(highestMatch.labelId);
            await api.updateCard((await t.card("id"))?.id ?? null, { idLabels: card.idLabels });
          }
        }
      }
    } 
  }
  /**
   * Saves the settings for the badge
   * @param {TrelloObject} t
   */
  #saveBadgeSettings = async (t) => {
    const mode = this.#settings.mode ? this.#settings.mode : BadgeMode.PRIVATE;
    try {
      await t.set("card", mode, {
        [CustomBadge._CARD_BADGE_ENABLED_PROP]: this.#cardSettings.enabled,
        [CustomBadge._CARD_BADGE_COMPLETENESS_PROP]: this.#cardSettings.completeness,
        [CustomBadge._CARD_BADGE_COLOR_PROP]: this.#cardSettings.custom_color,
        [CustomBadge._CARD_BADGE_CHECKLIST_PROP]: this.#cardSettings.checklistId,
        [CustomBadge._CARD_BADGE_OVERRIDE_PROP]: this.#cardSettings.override,
      });
    } catch (error) {
      console.error("Unable to save badge settings.", error);
      t.alert({
        message: "⚠️ Unable to save the badge settings. Please try again.",
        duration: 6,
      });
      throw error;
    }
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
      CommonLogger.log(`(load) Loading badge settings...`);
      await this.#loadBadgeSettings(t);
      /** @type {TrelloCard} */
      const card = await t.card("idList", "id");
      pos = 10;
      this.#badge = { text: null, color: null };
      // if we are not in a disabled list
      if(this.#settings.disabledListId !== card.idList) {
        CommonLogger.log(`(load) Card is not in disabled list: ${card.idList}`);
        pos = 30;
        // is this a new card?
        if(this.#isThisANewCard(card) === true) {
          if(this.#settings.autoNewCardBadge === true) {
            pos = 40;
            this.#badge = this.#getBadge(s.type, 0, this.#cardSettings.custom_color);
            pos = 50;
            this.#cardSettings.enabled = true;
            this.#cardSettings.completeness = 0;
            CommonLogger.log("(load) New card detected.");
            await this.#saveBadgeSettings(t);
          } 
        } else if (this.#cardSettings.enabled) {
          pos = 90;
          CommonLogger.log(`(load) Get badge for ${card.id}.`);
          this.#badge = this.#getBadge(s.type, this.#cardSettings.completeness, this.#cardSettings.custom_color);
        }
      } else {
        CommonLogger.log(`(load) Card is on a disabled list: ${card.idList}`);
      }
      pos = 100;
      if(!this.#badge) throw "Unexpected failure. The badge was not set.";
      CommonLogger.log(`(load) Completed: ${JSON.stringify(this.#badge)}`); // do this before icon (log pollution)
      this.#badge.icon = Common.ICON_DARK;
    } catch (e) {
      const $msg = `(load) Failed at: ${pos}.\n${e}`;
      console.error($msg);
      CommonLogger.log($msg);
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
                Common.sqid("fulluse1");
                tt.closePopup();
              }
            });
            if (this.#cardSettings.override) {
              menuItems.push({
                text: "⚡ Reset override",
                callback: async (tt) => {
                  this.#cardSettings.override = false;
                  await this.#saveBadgeSettings(tt);
                  Common.sqid("fulluse1");
                  tt.closePopup();
                }
              });              
            }
            const needsOverride = this.#settings.useCustomField && this.#settings.customFieldId;
            const isOverride = this.#cardSettings.override;
            /** @type {TrelloCheckList} */
            let checkList = this.#cardSettings.checklistId && (!needsOverride || isOverride)
              ? (await t.card("checklists"))?.checklists?.find((o)=>o.id === this.#cardSettings.checklistId)
              : null;
            /** @type {TrelloCustomField} */
            let customField = needsOverride && !isOverride
              ? (await t.board("customFields"))?.customFields?.find((o)=>o.id === this.#settings.customFieldId)
              : null;
            const howSet = checkList 
              ? ` (✅ ${checkList.name})` 
              : customField 
              ? ` (🏷️ ${customField.name})`
              : this.#cardSettings.override 
              ? " (⚡ override)" 
              : "";
            const whatSet = checkList 
              ? ` ${await this.#getChecklistValue(t)}%` 
              : customField 
              ? ` ${await this.#getCustomFieldValue(t)}%`
              : ` ${this.#cardSettings.completeness}%`;
            menuItems.push({
              text: `📦 Set ${howSet}${whatSet}`,
              callback: async (tt) => {
                /** @type {TrelloPopupListOptions} */
                const opts = {
                  items: await this.#setValueSubmenu(tt),
                  title: "Set Badge Value",
                }
                return TrelloFrame.openPopup(tt, opts);
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
          return TrelloFrame.openPopup(t, popupOpts);
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
   * Sets to a custom value n
   * @param {TrelloObject} t
   * @param {Number} n
   * @param {Boolean} [override]
   */
  #setCustomValue = async (t, n, override = false) => {
    this.#badge = this.#getBadge(this.#settings.type, n, this.#settings.color);
    this.#cardSettings.completeness = n;
    this.#cardSettings.enabled = true;
    this.#cardSettings.checklistId = null;
    this.#cardSettings.override = override;
    await this.#saveBadgeSettings(t);
    Common.sqid("fulluse1");
    t.closePopup();
  };
  /**
   * Prompts the user to override the board setting
   * @param {TrelloObject} t
   * @param {"value" | "custom" | "checklist"} type
   * @param {Number | TrelloCheckList} [value]
   */
  #promptUserOverride = async (t, type = "value", value = null) => {
    /** @type {TrelloPopupConfirmOptions} */
    const opts = {
      confirmText: "Yes",
      message: "This card is set to track a custom field set at the board level. Are you sure you want to override that?",
      onConfirm: async (tt) => type === "value" && value 
        ? await this.#setCustomValue(tt, value, true) 
        : type === "custom" 
        ? this.#promptCustomValue(tt, true)
        : type === "checklist" && value
        ? this.#setChecklist(t, value, true)
        : tt.closePopup(), // what?
      title: "Override Custom Field",
      type: "confirm",
      cancelText: "No",
      confirmStyle: "primary",
      onCancel: (tt) => tt.closePopup(),
    }
    return TrelloFrame.openPopup(t, opts);
  };
  /**
   * Prompts the user to set a custom value
   * @param {TrelloObject} t
   * @param {Boolean} [override]
   */
  #promptCustomValue = (t, override = false) => {
    /** @type {TrelloPopupIFrameOptions} */
    const opts = {
      args: { view: "custom", override: override },
      height: 1,
      title: "Set custom value",
      url: Common.detailsPage,
    }
    return TrelloFrame.openPopup(t, opts);
  }
  /**
   * Sets the checklist value
   * @param {TrelloObject} t
   * @param {TrelloCheckList} checklist
   * @param {Boolean} override 
   */
  #setChecklist = async (t, checklist, override = false) => {
    try {
      const id = checklist?.id;
      if (!id) return;
      if (id === this.#cardSettings.checklistId && this.#cardSettings.enabled) {
        this.#cardSettings.checklistId = null;
        this.#cardSettings.override = false;
      } else {
        const token = await TrelloTokenWrapper.getToken(t, false);
        if (!token) {
          t.alert({
            message: `⚠️ Please authorize the ${Common.APPNAME} Power-Up.`,
            duration: 5
          });
          return;
        }
        const loadedValue = this.#calculateChecklistValue(checklist);
        const completeness = loadedValue ?? await this.#getChecklistValue(t, id);
        this.#badge = this.#getBadge(this.#settings.type, completeness, this.#settings.color);
        this.#cardSettings.completeness = completeness;
        this.#cardSettings.enabled = true;
        this.#cardSettings.checklistId = id;
        this.#cardSettings.override = override;
      }
      await this.#saveBadgeSettings(t);
      Common.sqid("fulluse1");
      t.alert({
        message: `✅ Badge is now tracking checklist: ${checklist.name} (${this.#cardSettings.completeness}%)`,
        duration: 1,
      });
      t.closePopup();
    } catch (e) {
      console.error(e);
      t.alert({
        message: "⚠️ Unable to set the checklist. Please try again.",
        duration: 5
      });
    }
  }
  /**
   * Returns the set value submenu
   * @param {TrelloObject} t
   * @returns {Promise<TrelloItemsAction[]>}
   */
  #setValueSubmenu = async (t) => {
    /** @type {Boolean} */
    const needsOverride = this.#settings.useCustomField && this.#settings.customFieldId;
    /** @type {TrelloCheckList[]} */
    const checkLists = (await t.card("checklists"))?.checklists;
    /** @type {TrelloItemsAction[]} */
    const menuItems = [];
    for (let n = 0; n <= 100; n += 10) {
      menuItems.push(
        {
          text: n + "%",
          callback: async (tt) => {
            if (needsOverride) {
              return this.#promptUserOverride(tt, "value", n);
            } else {
              return this.#setCustomValue(tt, n);
            }
          }
        }
      );
    }
    if (Common.tbr.isFeatureAllowed || Common.tbr.hideFeatures === false) {
      menuItems.push({
        text: "🔧 Custom value...",
        callback: (tt) => {
          if (needsOverride) {
            return this.#promptUserOverride(tt, "custom");
          } else {
            return this.#promptCustomValue(tt);
          }
        }
      });
      if (checkLists && checkLists.length > 0) {
        menuItems.push({
          text: "✅ Track a checklist...",
          callback: (tt) => {
            const isOverride = this.#cardSettings.checklistId && this.#cardSettings.override;
            /** @type {TrelloItemsAction[]} */
            const checkListSelectItems = checkLists.map((o) => {
              const checkbox = ((!needsOverride || isOverride)  && o.id === this.#cardSettings.checklistId) ? "☑️" : "⬜"
              return {
                text: `${checkbox} ${o?.name} [${o?.checkItems?.length ?? 0}]`,
                callback: async () => {
                  if (needsOverride) {
                    return this.#promptUserOverride(tt, "checklist", o);
                  } else {
                    return this.#setChecklist(tt, o);
                  }
                }
              }
            });
            /** @type {TrelloPopupListOptions} */
            const opts = {
              items: checkListSelectItems,
              title: "Select a Checklist",
            }
            return TrelloFrame.openPopup(tt, opts);
          },
        });        
      }
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
    return TrelloFrame.openModal(t, popupOpts);
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
