/* global TrelloPowerUp */
/* global TrelloBoardRegistration */
/// <reference path="../../types/registered.d.js" />
/// <reference path="../../types/trello.d.js" />
import Common from "../common/common";
import { CommonLogger } from "../common/commonLogger";
import SettingsWrapper from "../common/settingsWrapper";
import CustomBadge from "../ui/components/customBadge";
import ListOptions from "../ui/components/listOptions";
import BasePage from "../ui/pages/_basePage";

export default class TrelloWrapper extends BasePage {
  constructor() {
    super();
  }
  /**
   * Returns the board button / menu
   * @param {TrelloObject} t 
   * @returns {Promise<TrelloBoardButtonOption[]>}
   */
  getBoardButton = async(t) => {
    /** @type {TrelloBoardButtonOption[]} */
    const boardButtons = [{
      text: Common.TITLE,
      condition: "always",
      icon: Common.ICON_DARK,
      callback: async (tt) => {
        await this._init(t, "getBoardButton", false, false);
        /** @type {TrelloPopupListOptions} */
        const boardMenuPopup = {
          title: Common.TITLE,
          items: [],
        };
        if(Common.tbr.nagConfirmationMenu) boardMenuPopup.items.push(Common.tbr.nagConfirmationMenu);
        if(Common.tbr.trialConfirmationMenu) boardMenuPopup.items.push(Common.tbr.trialConfirmationMenu);
        if (!this._settings.hideTour) {
          boardMenuPopup.items.push({
            text: "🌟 Take the Welcome Tour...",
            callback: (ttt) => this.#onTour(ttt),
          });
        }
        if(Common.tbr.isFeatureAllowed === true || this._settings.hideFeatures === false) {
          boardMenuPopup.items.push({
            text: "📊 Board Stats...",
            callback: (ttt)=> this.#showBoardStats(ttt),
          });
          boardMenuPopup.items.push({
            text: "📈 Board Chart...",
            callback: (ttt)=> this.#showBoardChart(ttt),
          });
        }
        boardMenuPopup.items.push({
          text: "⚙️ Settings...",
          callback: (ttt) => this.#showSettings(ttt),
        });
        tt.popup(boardMenuPopup);
      }
    }];
    return boardButtons;
  }
  /**
   * Launches the Tour
   * @param {TrelloObject} t 
   * @returns 
   */
  #onTour = (t) => {
    /** @type {TrelloPopupIFrameOptions} */
    const popupOpts = {
      args: { view: "tour" },
      title: Common.TITLE + " Welcome Tour",
      url: Common.detailsPage,
      height: 265,
    };
    return t.modal(popupOpts);    
  }
  /**
   * Returns the front card badge
   * @param {TrelloObject} t 
   * @returns {Promise<TrelloCardBadgesOption[]>}
   */
  getCardBadge = async (t) => {
    const s = new SettingsWrapper();
    await s.load(t, true);
    const b = new CustomBadge();
    const card = await t.card("name");
    CommonLogger.enabled = s.enableLogging;
    CommonLogger.log(`Loading badge for: ${card.name}`);
    await b.load(t, s);
    CommonLogger.log(`${card.name} = ${b.badgeFront.text}`);
    return b.badgeFront;
  }
  /**
   * Returns the back card badge
   * @param {TrelloObject} t 
   */
  getCardDetailBadge = async (t)=> {
    await this._init(t, "getCardDetails");
    const b = new CustomBadge();
    await b.load(t, this._settings, true);
    return b.badgeBack;
  }
  /**
   * Shows the settings form
   * @param {TrelloObject} t 
   */
  showSettings = async(t) => this.#showSettings(t);
  /**
   * Returns the menu items for the list
   * @param {TrelloObject} t 
   */
  getListActions = async (t) => {
    await this._init(t, "getListActions");
    const l = new ListOptions();
    return await l.getMenu(t, this._settings);
  }
  /**
   * Returns the list sorter menu
   * @param {TrelloObject} t 
   */
  getListSorters = async (t) => {
    await this._init(t, "getListSorters");
    const l = new ListOptions();
    return await l.getSortMenu(t, this._settings);
  }
  /**
   * Shows the disable form to the user
   * @param {TrelloObject} t 
   */
  onDisable = async(t) => {
    /** @type {TrelloModalOptions} */
    const modalDlg = {
      fullscreen: false,
      height: 495,
      url: Common.detailsPage,
      args: { view: "disabled" },
      title: `Disabling ${Common.APPNAME}`,
    };
    t.modal(modalDlg);
  }
  /**
   * Shows the welcome page to the user
   * @param {TrelloObject} t 
   */
  onEnable = async(t) => {
    /** @type {TrelloModalOptions} */
    const modalDlg = {
      fullscreen: false,
      height: 200,
      url: Common.detailsPage,
      args: { view: "welcome" },
      title: `Thank you for Installing ${Common.APPNAME}`,
    };
    t.modal(modalDlg);
  }
  /**
   * Shows the board stats to the user
   * @param {TrelloObject} t 
   */
  #showBoardStats = async (t) => {
    t.popup({
      args: {view: "stats", stats: "board"},
      title: "Board Completeness Stats",
      url: Common.detailsPage,
    });
  };
  /**
   * Shows the user a chart
   * @param {TrelloObject} t 
   */
  #showBoardChart = async (t) => {
    t.modal({
      fullscreen: false,
      args: {view: "chart"},
      title: "Board Completeness Chart",
      url: Common.detailsPage,
    });
  }
  /**
   * Displays the settings form
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
}