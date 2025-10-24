/* global TrelloPowerUp */
/* global TrelloBoardRegistration */
/// <reference path="../../../types/registered.d.js" />
/// <reference path="../../../types/trello.d.js" />
import Common from "../../common/common";
import { CommonLogger } from "../../common/commonLogger";
import SettingsWrapper, { BadgeMode, BadgeType } from "../../common/settingsWrapper";
import Styles from "../../common/styles";
import TabSheet from "../components/tabSheet";
import BasePage from "./_basePage";
/**
 * Settings Page Class
 */
export default class SettingsPage extends BasePage {
  constructor() {
    super();
  }
  /** @type {String} */
  #selectedColor = "";
  /** @type {String} */
  #disabledListId = "";
  /** @type {Boolean} */
  #autoNewChecked = false;
  /** @type {String} */
  #selectedType = "";
  /** @type {Boolean} */
  #enableLogging = false;
  /** @type {Boolean} */
  #hideFeatures = Common.tbr.hideFeatures;
  /** @type {Boolean} */
  #hideTour = false;
  /** @type {TabSheet} */
  #tabs = {};
  /**
   * Renders the settings form
   * @param {TrelloObject} t 
   */
  render = async (t) => {
    await this._init(t, "settingsPage");
    /** @type {HTMLDivElement} */
    const content = document.getElementById("content");
    content.innerHTML = /*html*/`
      <div id="bodyDiv">
        <div id="tabs"></div>
        <div id="buttonBlock">
          <button class="mod-primary" disabled='disabled' id='saveButton'>Save</button>&nbsp;
          <button class="mod-primary" id='closeButton'>Close</button>
        </div>
      </div>
    `;
    //
    // BUILD TABS
    //
    this.#tabs = new TabSheet(document.getElementById("tabs"));
    this.#tabs.addTab("Main", this.#getMainTab(), true, true);
    this.#tabs.addTab("Automation", this.#getAutomationTab(), this._settings.hideFeatures === false);
    this.#tabs.addTab("About", this.#getAboutTab(), true);
    this.#tabs.addEventHandler("beforechange", async (tabName) => {
      if (tabName === "Automation") {
        if (Common.tbr.isFeatureAllowed === false) {
          Common.tbr.showSubscriptionOverlay(t, false, (v) => {
            this.#hideFeatures = v;
            Common.tbr.hideFeatures = v;
            saveButton.disabled = false;
          }, true, () => this.#tabs.goto("Main"));
        }
      }
    });
    this.#tabs.addEventHandler("change", () => {
      t.sizeTo("#content");
    });
    this.#tabs.render();
    //this.#checkRegistration(t); // do this here to avoid race condition on content html insertion
    Styles.applyCss(content);
    await this._insertSubscriptionSection(t);
    await this._insertRating(t);
    await this._insertAdvertisement();
    if (Common.tbr.isFeatureAllowed === false) {
      window.setInterval(()=> {
        if (Common.tbr.hideFeatures !== this.#hideFeatures) {
          this.#hideFeatures = Common.tbr.hideFeatures;
          saveButton.disabled = false;
        }
      }, 100);
    }
    // add the version number to the settings page
    document.getElementById("version").innerText = Common.version;
    /** @type {HTMLButtonElement} */
    const saveButton = document.getElementById("saveButton");
    saveButton.addEventListener("click", () => this.#save(t));
    const closeButton = document.getElementById("closeButton");
    closeButton.addEventListener("click", () => t.closePopup());
    document.getElementById("userModeRadioButton").addEventListener("change", () => {
      this._settings.mode = BadgeMode.PRIVATE;
      document.getElementById("saveButton").removeAttribute('disabled');
    });
    document.getElementById("teamModeRadioButton").addEventListener("change", () => {
      this._settings.mode = BadgeMode.SHARED;
      document.getElementById("saveButton").removeAttribute('disabled');
    });
    /** @type {HTMLInputElement} */
    const enableLoggingCheckbox = document.getElementById("enableLoggingCheckbox");
    /** @type {HTMLButtonElement} */
    const downloadLogButton = document.getElementById("downloadLogButton");
    enableLoggingCheckbox.checked = this._settings.enableLogging;
    downloadLogButton.hidden = enableLoggingCheckbox.checked ? "" : "hidden";
    enableLoggingCheckbox.addEventListener("change", () => {
      this.#enableLogging = enableLoggingCheckbox.checked;
      downloadLogButton.hidden = enableLoggingCheckbox.checked ? "" : "hidden";
      saveButton.disabled = false;
    })
    downloadLogButton.addEventListener("click", async (e) => {
      CommonLogger.downloadLogFile();
    });
    /** @type {HTMLSelectElement} */
    const listSelect = document.getElementById("listSelect");
    listSelect.addEventListener("change", async (e) => {
      saveButton.disabled = false;
      this.#disabledListId = e.target.value;
    });
    this.#setupListSelect(t, listSelect, this._settings.disabledListId);
    this.#selectedType = this._settings.type;
    /** @type {HTMLSelectElement} */
    const badgeTypeSelect = document.getElementById("badgeTypeSelect");
    badgeTypeSelect.addEventListener("change", (e) => {
      this.#selectedType = e.target.value;
      saveButton.disabled = false;
    });
    for (const o of badgeTypeSelect.selectedOptions) {
      if (o.value === this.#selectedType) o.selected = true;
    }
    this.#selectedColor = this._settings.color;
    // setup selectors
    this.#setupColorSelector();
    // now set the mode for the custom settings
    if (this._settings.mode === BadgeMode.PRIVATE) {
      document.getElementById("userModeRadioButton").checked = true;
    } else {
      document.getElementById("teamModeRadioButton").checked = true;
    }
    /** @type {HTMLInputElement} */
    const autoNewCheckbox = document.getElementById("autoNewCheckbox");
    autoNewCheckbox.checked = this._settings.autoNewCardBadge;
    autoNewCheckbox.addEventListener("change", () => {
      this.#autoNewChecked = autoNewCheckbox.checked;
      saveButton.disabled = false;
    });
    this.#hideTour = this._settings.hideTour;
    /** @type {HTMLInputElement} */
    const hideTourCheckbox = document.getElementById("hideTourCheckbox");
    hideTourCheckbox.checked = this.#hideTour;
    hideTourCheckbox.addEventListener("click", () => {
      this.#hideTour = hideTourCheckbox.checked;
      saveButton.disabled = false;
    });
    this.#hidePremiumFeatureSettings();
    // finally
    t.sizeTo("#content");
  };
  /**
   * Returns the automation tab
   * @returns {String}
   */
  #getAutomationTab = () => {
    /** @type {String} */
    return /*html*/`
      <h3>Automation Options</h3>
      <p>These options will affect your entire team, so be careful setting these.</p>
      <hr/>
      <div id="listAutomation">
        <p>When a card is moved to this list, hide the completeness badge:</p>
        <select id="listSelect"></select>&nbsp;<a title="The priority badge is hidden, but the priority is not reset.">*</a>
      </div>
      <hr/>
      <div id="newCardAutomation">
        <input type="checkbox" id="autoNewCheckbox"/>&nbsp;<span>When a new card is created automatically add a badge.</span>
      </div>
    `;
  }
  /**
   * Returns the about tab
   * @returns {String}
   */
  #getAboutTab = () => {
    /** @type {String} */
    return /*html*/`
      <div id="about">
        <h3>About ${Common.APPNAME}</h3>
        <p>${Common.DESCRIPTION}</p>
        <p><input type="checkbox" id="hideTourCheckbox"/>&nbsp;Hide the tour menu</p>
        <div id="subscriptionSection"></div>
        <br/>
        <div>
          <input type="checkbox" id="enableLoggingCheckbox"/>&nbsp;Enable logging
          <br />
          <button id="downloadLogButton" hidden>Download log...</button>
        </div>
        <br/>
        <div id="more"></div>
        <hr/>
        <div id="ratings"></div>
        <hr/>
        <p>If you have suggestions or feedback on any of our products, please see our Trello board:</p>
        <p><a target="_blank" href="https://trello.com/b/30Ow4zYX/kryl-solutions-power-ups">Kryl Solutions Power-Ups</a></p>
        <p>For all other needs, please contact us: <a href="mailto:info@kryl.com">info@kryl.com</a></p>
        <hr/>
        <sub>version <span id="version"></span>, by <a href="https://kryl.com" target="_blank">Kryl Solutions</a></sub>
      </div>
      <br/>
    `;
  }
  /**
   * Returns the Main tab
   * @returns {String}
   */
  #getMainTab = () => {
    /** @type {String} */
    return /*html*/ `
      <div id="main">
        <h3>⚙️ Badge Color</h3>
        <p>Please select your badge color for this board from the options below: </p>
        <select id="badgeColorSelect"></select><span id="colorSelectedSpan">${`\u25A0`}</span>
        <hr />
        <h3>🏷️ Badge Type</h3>
        <select id="badgeTypeSelect">
          <option value="${BadgeType.BAR}">Bar</option> 
          <option value="${BadgeType.TEXT}">Text</option>
          <option value="${BadgeType.BOTH}">Text and Bar</option>
        </select>
        <hr />
        <h3>👥 Mode</h3>
        <input type="radio" name="teamMode" id="userModeRadioButton" checked/>&nbsp;For you only<br/>
        <input type="radio" name="teamMode" id="teamModeRadioButton"/>&nbsp;Team mode (shared)
      </div>
      <br/>
    `;
  }
  /**
   * Fills in the select with the lists on the board
   * @param {TrelloObject} t
   * @param {HTMLSelectElement} listSelect 
   * @param {String} defaultValue
   */
  #setupListSelect = async (t, listSelect, defaultValue) => {
    /** @type {TrelloList[]} */
    const lists = await t.lists("id", "name");
    /** @type {String} */
    let optionsHtml = /*html*/`<option id="none" value="none"></option>`;
    lists.forEach(l => {
      if (l.id === defaultValue) {
        this.#disabledListId = defaultValue;
        optionsHtml +=/*html*/`<option selected id="${l.id}" value="${l.id}">${Common.sanitizeString(l.name)}</option>`;
      } else {
        optionsHtml +=/*html*/`<option id="${l.id}" value="${l.id}">${Common.sanitizeString(l.name)}</option>`;
      }
    });
    listSelect.innerHTML = optionsHtml;
  }
  /**
   * Save the users settings
   * @param {TrelloObject} t
   */
  #save = async (t) => {
    this._settings.disabledListId = this.#disabledListId;
    this._settings.autoNewCardBadge = this.#autoNewChecked;
    this._settings.color = this.#selectedColor;
    this._settings.type = this.#selectedType;
    this._settings.enableLogging = this.#enableLogging;
    this._settings.hideTour = this.#hideTour;
    // save
    document.getElementById("saveButton").disabled = true;
    await this._settings.save(t);
    this.#hidePremiumFeatureSettings();
  }
  /**
   * Builds the color selectors options
   */
  #setupColorSelector = () => {
    /** @type {HTMLSelectElement} */
    const colorSelector = document.getElementById("badgeColorSelect");
    colorSelector.innerHTML = ""; // clear
    const noneOpt = document.createElement("option");
    noneOpt.value = "";
    noneOpt.textContent = "None";
    colorSelector.appendChild(noneOpt);
    if (!this.#selectedColor) noneOpt.selected = true;
    // color options
    Common.trelloColors.forEach((v) => {
      const opt = document.createElement("option");
      opt.className = "square";
      opt.value = v;
      opt.innerHTML = `${`\u25A0`}&nbsp;${v}`; 
      opt.style.backgroundColor = v;
      opt.style.color = v;
      colorSelector.appendChild(opt);
      if (this.#selectedColor === v) opt.selected = true;
    });
    // set the background color on change and update state
    const colorSelectedSpan = document.getElementById("colorSelectedSpan")
    colorSelector.addEventListener("change", (e) => {
      const val = e.target.value;
      e.target.style["backgroundColor"] = val || "";
      e.target.style["color"] = val || "";
      document.getElementById("saveButton").removeAttribute('disabled');
      this.#selectedColor = val;
      colorSelectedSpan.style.color = val;
    });
    colorSelectedSpan.style.color = this.#selectedColor;
  };
  /**
   * Hides the features
   */
  #hidePremiumFeatureSettings = () => {
    if (this._settings.hideFeatures) {
      this.#tabs.hide("Automation");
    } else {
      this.#tabs.show("Automation");
    }
  }
}
