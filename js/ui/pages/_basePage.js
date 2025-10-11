import Common from "../../common/common";
import { CommonLogger } from "../../common/commonLogger";
import SettingsWrapper from "../../common/settingsWrapper";

export default class BasePage {
  /** @type {Boolean} */
  _isInitialized = false;
  /** @type {SettingsWrapper} */
  _settings = null;
  /** @type {String} */
  _sessionLockKey = "tc_tbr_lock";
  /** @type {String} */
  _sessionLockTime = "tc_tbr_lock_time";
  _onHideFeatures = () => { };
  /**
   * Makes sure not all the badges hit at the same time
   */
  _waitForLock = async (caller) => {
    const last = window.sessionStorage.getItem(this._sessionLockTime);
    if (last && Date.now() - last > 5000) {
      CommonLogger.log(`${last} was too long ago. Resetting... ${caller}`);
      // remove the lock if it has been greater than 5 seconds since it was put
      // there. This is needed to make sure the user did not force a refresh 
      // before the last update
      window.sessionStorage.removeItem(this._sessionLockKey);
      window.sessionStorage.removeItem(this._sessionLockTime);
    }
    let sessionLock = true;
    let setLockOnExit = true;
    let count = 0;
    while (sessionLock) {
      sessionLock = window.sessionStorage.getItem(this._sessionLockKey);
      if (sessionLock) {
        setLockOnExit = false;
        await Common.wait(1);
        count++;
        if (count > 300) {
          CommonLogger.log(`Wait: BREAK BREAK! ${caller}`);
          sessionLock = false;
          break;
        }
      } else {
        if (setLockOnExit) {
          CommonLogger.log(`SESSION WILL CAUSE LOCK - ${caller}`);
        } else {
          CommonLogger.log(`SESSION UNLOCKED - ${caller}`);
        }
      }
    }
    if (setLockOnExit) {
      CommonLogger.log(`LOCK SET BY - ${caller}`);
      window.sessionStorage.setItem(this._sessionLockKey, true);
      window.sessionStorage.setItem(this._sessionLockTime, Date.now());
    }
    window.setTimeout(() => {
      // remove automatically after 5 seconds
      CommonLogger.log(`TIMEOUT CLEAR - ${caller}`);
      window.sessionStorage.removeItem(this._sessionLockKey);
    }, 5000);
  }
  /**
   * Removes the lock
   */
  _removeLock = () => {
    window.sessionStorage.removeItem(this._sessionLockKey);
  }
  /**
   * Puts the registration component on the page
   * @param {TrelloObject} t
   * @param {String} caller
   * @param {Boolean} [withLock] for badges
   * @param {Boolean} [force] for badges to load settings
   * @returns {Promise<void>}
   */
  _init = async (t, caller, withLock = false, force = false) => {
    this._settings = new SettingsWrapper();
    await this._settings.load(t, force);
    CommonLogger.enabled = this._settings.enableLogging;
    CommonLogger.log(`Init: ${caller}`);
    if (this._isInitialized) {
      CommonLogger.log(`Already init [1]: ${caller}`);
      return;
    }
    if (withLock) {
      CommonLogger.log(`Going into lock: ${caller}`);
      await this._waitForLock(caller);
      CommonLogger.log(`Return from lock: ${caller}`);
    }
    if (this._isInitialized) {
      CommonLogger.log(`Already init [2]: ${caller}`);
      return;
    }
    try {
      /** @type {TrelloBoard} */
      const board = await t.board("id", "members", "name", "idOrganization");
      /** @type {TrelloMemberObject} */
      const member = await t.member("id");
      // wait here until init is completed
      await new Promise(async (resolve) => await Common.tbr.init({
        eventHooks: {
          "errorEvent": async () => {
            console.error("Subscription validation failed.");
            resolve();
          },
          "completedEvent": async (status) => {
            CommonLogger.log(`COMPLETE SUB CHECK - ${caller}`);
            const statusObj = status ? (JSON.parse(status) || {}) : {};
            if (statusObj && "hide" in statusObj) {
              this._settings.hideFeatures = statusObj.hide;
              this._onHideFeatures();
              resolve();
            }
          },
          "changeEvent": async (status) => {
            CommonLogger.log(`CHANGE SUB CHECK - ${caller}`);
            const statusObj = status ? (JSON.parse(status) || {}) : {};
            if (statusObj && "hide" in statusObj) {
              this._settings.hideFeatures = statusObj.hide;
              this._settings.save(t);
              this._onHideFeatures();
              resolve();
            }
          },
        },
        featuresListHtml: Common.featuresListHtml,
        boardData: {
          boardName: board.name,
          idBoard: board.id,
          idMember: member.id,
          members: board.members.length,
          idOrg: board.idOrganization,
        }
      })
      );
    } catch { }
    CommonLogger.log((Common.tbr.isFeatureAllowed ? "SUBSCRIBED" : "NOT SUBSCRIBED") + " in " + caller);
    this._removeLock();
    this._isInitialized = true;
  }
  /**
   * Inserts the subscription section
   * @param {TrelloObject} t 
   */
  _insertSubscriptionSection = async (t) => {
    /** @type {HTMLDivElement} */
    const section = document.getElementById("subscriptionSection");
    await Common.tbr.renderSubscriptionStatusSection(t, section);
  }
  /**
   * Pops the registration notification in the form
   * @param {TrelloObject} t 
   */
  _checkRegistration = (t) => {
    /** @type {HTMLDivElement} */
    const content = document.getElementById("content");
    Common.tbr.checkRegistrationWithNotification(t, "htmlShort", content);
    t.sizeTo("#content");
  }
  /**
   * Inserts the ratings div
   * @param {TrelloObject} t 
   */
  _insertRating = async (t) => {
    /* START RATINGS */
    try {
      await Common.tbr.showRating(t, document.getElementById("ratings"));
    } catch { }
    /* END RATINGS */
  }
  /**
   * Inserts Advertisement on about page
   */
  _insertAdvertisement = async () => {
    /* START ADVERTISEMENT */
    try {
      await Common.tbr.getAdButton(
        document.getElementById("more"),
        document.getElementById("content"),
        () => { t.sizeTo("#content"); },
        true);
    } catch { }
    /* END ADVERTISEMENT */
  }
}