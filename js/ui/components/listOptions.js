/* global TrelloPowerUp */
/* global TrelloBoardRegistration */
/// <reference path="../../../types/registered.d.js" />
/// <reference path="../../../types/trello.d.js" />
import Common from "../../common/common";
import CustomBadge from "./customBadge";
import SettingsWrapper from "../../common/settingsWrapper";

export default class ListOptions {
  constructor() {}
  /**
   * Sorts the list
   * @param {TrelloObject} t
   * @param {SettingsWrapper} s
   */
  getSortMenu(t, s) {
    if(Common.tbr.isFeatureAllowed === false && s.hideFeatures === true) return {};
    /** @type {TrelloListActionsOption[]} */
    const listSortActions = [];
    listSortActions.push({
      callback: (tt, opts) => {
        if (Common.tbr.isFeatureAllowed) return this.#sort(tt, s, opts, false);
        window.setTimeout(()=> Common.tbr.checkFeatureWithNotification(tt, true, "alert", "Sort card descending by completeness."), 100);
        return { sortedIds: opts.cards.map(function (c) { return c.id; })};
      },
      text: "Sort by completeness descending..."
    });
    listSortActions.push({
        callback: (tt, opts) => {
          if (Common.tbr.isFeatureAllowed) return this.#sort(tt, s, opts, true);
          window.setTimeout(()=> Common.tbr.checkFeatureWithNotification(tt, true, "alert", "Sort card ascending by completeness."), 100);
          return { sortedIds: opts.cards.map(function (c) { return c.id; })};
        },
        text: "Sort by completeness ascending..."
    });
    return listSortActions;
  }
  /**
   * Sorts the items in the list
   * @param {TrelloObject} t 
   * @param {SettingsWrapper} s 
   * @param {TrelloCallbackOptions} opts 
   * @param {Boolean} sortAscending 
   */
  #sort = async (t, s, opts, sortAscending) => {
    if (Common.tbr.checkFeatureWithNotification(t, true, "alert", "sorting") === true) {
      // get a list of promises to get the cards
      /** @type {Promise<TrelloCard>[]} */
      let promiseCards = await opts.cards.map(async c => {
        const enabled = await t.get(c.id, s.mode, CustomBadge._CARD_BADGE_ENABLED_PROP, false);
        if (!enabled) {
          c.completeness = -1;
        } else {
          c.completeness = parseInt(await t.get(c.id, s.mode, CustomBadge._CARD_BADGE_COMPLETENESS_PROP, 0));
        }
        return c;
      });
      // wait for the promises to resolve and then sort the cards
      /** @type {TrelloCard[]} */
      let sortedCards = await Promise.all(promiseCards).then(cards => {
        return cards.sort((a, b) => {
          if(sortAscending == true) {
            if (a.completeness > b.completeness) return 1;
            else if (a.completeness < b.completeness) return -1;
            else return 0;
          } else {
            if (a.completeness < b.completeness) return 1;
            else if (a.completeness > b.completeness) return -1;
            else return 0;
          }
        });
      });
      /** @type {String[]} */
      const result = sortedCards.map(function (c) { return c.id; });
      // return
      return { sortedIds: result };
    } else {
      // DO NOT SORT - NOT A PAID SUBSCRIPTION
      /** @type {String[]} */
      const result = opts.cards.map(function (c) { return c.id; });
      // return
      return { sortedIds: result };
    }
  }
  /**
   * Returns the menu for the list
   * @param {TrelloObject} t
   * @param {SettingsWrapper} s
   * @returns {TrelloListActionsOption} 
   */
  getMenu = async (t, s) => {
    if(Common.tbr.isFeatureAllowed === false && s.hideFeatures === true) return {};
    /** @type {TrelloItemsAction[]} */
    const subMenu = [
    {
      text: "📊 Get Stats...",
      callback: /** @param {TrelloObject} tt */ async (tt) => {
        tt.popup({
          args: {view: "stats", stats: "list"},
          title: "List Completeness Stats",
          url: Common.detailsPage + `?rnd=${Math.round(Math.random() * 999999999)}`,
        });
      }
    },{
      text: "🖌️ Enable badge on all cards in list...",
      callback: async (tt)=> {
        if(Common.tbr.checkFeatureWithNotification(t, true, "alert", "bulk list action") === true) {
          tt.popup(this.#getListEnableDisableAction(tt, true));
        } else {
          tt.closePopup();
        }
      },
    },{
      text: "🖌️ Disable badge on all cards in list...",
      callback: async (tt)=> {
        if(Common.tbr.checkFeatureWithNotification(t, true, "alert", "bulk list action") === true) {
          tt.popup(this.#getListEnableDisableAction(tt, false));
        } else {
          tt.closePopup();
        }
      },
    }];
    // main menu item to return
    /** @type {TrelloItemsAction[]} */
    const returnMenu = [{
        text: `${Common.APPNAME} List Actions...`,
        callback: /** @param {TrelloObject} tt */ async (tt) => {
            // now add the nag menu if needed:
            if(Common.tbr.trialConfirmationMenu !== null) subMenu.unshift(Common.tbr.trialConfirmationMenu);
            if(Common.tbr.nagConfirmationMenu !== null) subMenu.unshift(Common.tbr.nagConfirmationMenu);
            // return the menu
            /** @type {TrelloPopupListOptions} */
            const mnuAging = {
                title: `${Common.APPNAME} List Actions`,
                items: subMenu,
            };
            tt.popup(mnuAging);
        },
    }];
    // return
    return returnMenu;
  };
  /**
   * Gets the confirmation from the user and then performs the action
   * @param {TrelloObject} t 
   * @param {Boolean} enabled
   * @returns {TrelloPopupConfirmOptions}
   */
  #getListEnableDisableAction = (t, enabled) => {
    const q = enabled 
      ? `Are you sure you want to enable the Completeness Badge for all cards in this list?`
      : `Are you sure you want to disable the Completeness Badge for all cards in this list?`
      /** @type {TrelloPopupConfirmOptions} */
    const opts= {
      confirmText: "Yes",
      message: q,
      onConfirm: async (tt) => {
        tt.closePopup();
        const s = new SettingsWrapper();
        await s.load(tt);
        const list = await tt.list("all");
        for (const c of list.cards) {
          await t.set(c.id, s.mode, CustomBadge._CARD_BADGE_ENABLED_PROP, enabled);
        }
      },
      title: Common.APPNAME  + " List Action",
      type: "confirm",
      cancelText: "No",
      confirmStyle: "primary",
      onCancel: (tt) => tt.closePopup(),
    };
    return opts;
  }
}