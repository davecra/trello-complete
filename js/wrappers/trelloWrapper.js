/* global TrelloPowerUp */
/* global TrelloBoardRegistration */
/// <reference path="../../types/registered.d.js" />
/// <reference path="../../types/trello.d.js" />
import TrelloFrame from "../common/trelloFrame";
import TrelloTokenWrapper from "../api/trelloTokenWrapper";
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
    const s = new SettingsWrapper();
    await s.load(t, true);
    CommonLogger.enabled = s.enableLogging;
    CommonLogger.log(`(getBoardButton) Loading Board button.`);
    /** @type {TrelloBoardButtonOption[]} */
    const boardButtons = [{
      text: Common.TITLE,
      condition: "always",
      icon: Common.ICON_DARK,
      callback: async (tt) => {
        if (!(await TrelloTokenWrapper.getToken(tt, true))) {
          await this.onEnable(tt);
          return;
        }
        CommonLogger.log("(getBoardButton) Loading board button.");
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
        TrelloFrame.openPopup(tt, boardMenuPopup);
      }
    }];
    CommonLogger.log(`(getBoardButton) Completed.`);
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
    return TrelloFrame.openModal(t, popupOpts);    
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
    const card = await t.card("name");
    CommonLogger.log(`Loading badge back for: ${card.name}`);
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
    return l.getMenu(t, this._settings);
  }
  /**
   * Returns the list sorter menu
   * @param {TrelloObject} t 
   */
  getListSorters = async (t) => {
    await this._init(t, "getListSorters");
    const l = new ListOptions();
    return l.getSortMenu(t, this._settings);
  }
  /**
   * Shows the disable form to the user
   * @param {TrelloObject} t 
   */
  onDisable = (t) => {
    Common.tbr.showDisabledFeedback();
  }
  /**
   * Returns if the user is authenticated
   */
  isAuthOk = async (t) => {
    const trelloToken = await TrelloTokenWrapper.getToken(t, true);
    return trelloToken ? true : false;
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
    TrelloFrame.openModal(t, modalDlg);
  }
  /**
   * Shows the board stats to the user
   * @param {TrelloObject} t 
   */
  #showBoardStats = async (t) => {
    TrelloFrame.openPopup(t, {
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
    TrelloFrame.openModal(t, {
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
    return TrelloFrame.openModal(t, popupOpts);
  }
}
