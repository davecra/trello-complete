/* global TrelloPowerUp */
/* global TrelloBoardRegistration */
/// <reference path="../../../types/registered.d.js" />
/// <reference path="../../../types/trello.d.js" />
import TrelloFrame from "../../common/trelloFrame";
import Common from "../../common/common";
import { CommonLogger } from "../../common/commonLogger";
import SettingsWrapper, { BadgeMode, BadgeType } from "../../common/settingsWrapper";
import Styles from "../../common/styles";
import ColorAndLabelDialog from "../components/colorAndLabelDialog";
import PromptBox from "../components/promptBox";
import TabSheet from "../components/tabSheet";
import BasePage from "./_basePage";
/**
 * Settings Page Class
 */
export default class SettingsPage extends BasePage {
  constructor() {
    super();
  }
  /** @type {HTMLButtonElement} */
  #saveButton = null;
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
  #hideFeatures = false;
  /** @type {Boolean} */
  #hideTour = false;
  /** @type {TabSheet} */
  #tabs = {};
  /** @type {Boolean} */
  #useCustomField = false;
  /** @type {String} */
  #customFieldId = null;
  /** @type {Boolean} */
  #useCustomColors = false;
  /** @type {import("../../common/settingsWrapper").CustomColorAndLabel[]} */
  #customColors = [];
  /** @type {Boolean} */
  #keepOnlyCurrentLabel = false;
  /** @type {BadgeMode} */
  #mode = BadgeMode.PRIVATE;
  /**
   * Renders the settings form
   * @param {TrelloObject} t 
   */
  render = async (t) => {
    await this._init(t, "settingsPage");
    this.#hideFeatures = Common.tbr.hideFeatures;
    Styles.applyCss(document.getElementById("content"));
    /** @type {HTMLDivElement} */
    const content = document.getElementById("content");
    content.innerHTML = /*html*/`
      <img src="./images/settings_banner.png" />
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
    this.#tabs.addTab("Colors and Labels", this.#getLabelsAndColorsTab(), !this._settings.hideFeatures);
    this.#tabs.addTab("Custom Field", this.#getFieldsTab(), !this._settings.hideFeatures);
    this.#tabs.addTab("Automation", this.#getAutomationTab(), !this._settings.hideFeatures);
    this.#tabs.addTab("About", this.#getAboutTab(), true);
    this.#tabs.addEventHandler("beforechange", async (tabName) => {
      if (tabName === "Automation" || tabName === "Fields" || tabName === "Colors") {
        if (Common.tbr.isFeatureAllowed === false) {
          Common.tbr.showSubscriptionOverlay(t, false, (v) => {
            this.#hideFeatures = v;
            Common.tbr.hideFeatures = v;
            this.#saveButton.disabled = false;
          }, true, () => this.#tabs.goto("Main"));
        }
      }
    });
    this.#tabs.addEventHandler("change", () => {
      t.sizeTo("#content");
    });
    this.#tabs.render();
    Styles.applyCss(content);
    await this._insertSubscriptionSection(t);
    await this._insertRating(t);
    await this._insertAdvertisement();
    if (Common.tbr.isFeatureAllowed === false) {
      window.setInterval(()=> {
        if (Common.tbr.hideFeatures !== this.#hideFeatures) {
          this.#hideFeatures = Common.tbr.hideFeatures;
          this.#saveButton.disabled = false;
        }
      }, 100);
    }
    // add the version number to the settings page
    document.getElementById("version").innerText = Common.VERSION;
    this.#saveButton = document.getElementById("saveButton");
    this.#saveButton.addEventListener("click", () => this.#save(t));
    const closeButton = document.getElementById("closeButton");
    closeButton.addEventListener("click", (e) => {
      if (!this.#saveButton.disabled) {
        e.preventDefault();
        const prompt = new PromptBox(
          content,
          "Close Settings",
          "Are you sure you want to close? You have unsaved changes."
        );
        prompt.addEventHandler("onConfirm", () => t.closeModal());
        prompt.render();
      } else {
        t.closeModal();
      }
    });
    document.getElementById("userModeRadioButton").addEventListener("change", () => {
      this.#mode = BadgeMode.PRIVATE;
      this.#saveButton.disabled = false;
    });
    document.getElementById("teamModeRadioButton").addEventListener("change", () => {
      this.#mode = BadgeMode.SHARED;
      this.#saveButton.disabled = false;
    });
    /** @type {HTMLInputElement} */
    const enableLoggingCheckbox = document.getElementById("enableLoggingCheckbox");
    /** @type {HTMLButtonElement} */
    const clearLogButton = document.getElementById("clearLogButton");
    clearLogButton.hidden = enableLoggingCheckbox.checked ? "" : "hidden";
    /** @type {HTMLButtonElement} */
    const downloadLogButton = document.getElementById("downloadLogButton");
    enableLoggingCheckbox.checked = this._settings.enableLogging;
    downloadLogButton.hidden = enableLoggingCheckbox.checked ? "" : "hidden";
    enableLoggingCheckbox.addEventListener("change", () => {
      this.#enableLogging = enableLoggingCheckbox.checked;
      downloadLogButton.hidden = enableLoggingCheckbox.checked ? "" : "hidden";
      clearLogButton.hidden = enableLoggingCheckbox.checked ? "" : "hidden";
      this.#saveButton.disabled = false;
      t.sizeTo("#content");
    });
    downloadLogButton.addEventListener("click", async (e) => {
      CommonLogger.downloadLogFile();
    });
    clearLogButton.addEventListener("click", async (e) => {
      CommonLogger.clear();
      t.alert({
        message: "The log has been cleared.",
        duration: 1,
      });
    });
    /** @type {HTMLSelectElement} */
    const listSelect = document.getElementById("listSelect");
    listSelect.addEventListener("change", async (e) => {
      this.#saveButton.disabled = false;
      this.#disabledListId = e.target.value;
    });
    this.#setupListSelect(t, listSelect, this._settings.disabledListId);
    this.#selectedType = this._settings.type;
    /** @type {HTMLSelectElement} */
    const badgeTypeSelect = document.getElementById("badgeTypeSelect");
    badgeTypeSelect.addEventListener("change", (e) => {
      this.#selectedType = e.target.value;
      this.#saveButton.disabled = false;
    });
    const option = Array.from(badgeTypeSelect.options)?.find((o) => o.value === this.#selectedType);
    if (option) option.selected = true;
    /** @type {HTMLSelectElement} */
    const customFieldSelect = document.getElementById("customFieldSelect");
    this.#customFieldId = this._settings.customFieldId;
    customFieldSelect.addEventListener("change", () => {
      this.#customFieldId = customFieldSelect.selectedOptions?.[0]?.value ?? null;
      this.#saveButton.disabled = false;
    });
    /** @type {HTMLInputElement} */
    const useCustomFieldCheckbox = document.getElementById("useCustomFieldCheckbox");
    this.#useCustomField = this._settings.useCustomField;
    customFieldSelect.disabled = !this.#useCustomField;
    useCustomFieldCheckbox.checked = this._settings.useCustomField;
    useCustomFieldCheckbox.addEventListener("change", ()=> {
      customFieldSelect.disabled = !useCustomFieldCheckbox.checked;
      this.#useCustomField = useCustomFieldCheckbox.checked;
      this.#saveButton.disabled = false;
    });
    this.#selectedColor = this._settings.color;
    // setup selectors
    await this.#setupFieldsSelector(t);
    this.#setupColorSelector("badgeColorSelect", "colorSelectedSpan", this.#selectedColor, (v) => this.#selectedColor = v);
    // now set the mode for the custom settings
    this.#mode = this._settings.mode;
    if (this.#mode === BadgeMode.PRIVATE) {
      document.getElementById("userModeRadioButton").checked = true;
    } else {
      document.getElementById("teamModeRadioButton").checked = true;
    }
    /** @type {HTMLInputElement} */
    const autoNewCheckbox = document.getElementById("autoNewCheckbox");
    autoNewCheckbox.checked = this._settings.autoNewCardBadge;
    autoNewCheckbox.addEventListener("change", () => {
      this.#autoNewChecked = autoNewCheckbox.checked;
      this.#saveButton.disabled = false;
    });
    this.#hideTour = this._settings.hideTour;
    /** @type {HTMLInputElement} */
    const hideTourCheckbox = document.getElementById("hideTourCheckbox");
    hideTourCheckbox.checked = this.#hideTour;
    hideTourCheckbox.addEventListener("click", () => {
      this.#hideTour = hideTourCheckbox.checked;
      this.#saveButton.disabled = false;
    });
    ////////////////////////////////////////////////////////////////////
    // COLORS
    ////////////////////////////////////////////////////////////////////
    // custom color table
    /** @type {TrelloLabel[]} */
    const labels = (await t.board("labels"))?.labels ?? [];
    this.#customColors = this._settings.customColors?.length > 0 
      ? this._settings.customColors
      : this._settings.customDefaults(labels);
    this.#generateTable(t, labels);
    document.getElementById("addColorLabelButton").addEventListener("click", () => {
      const d = new ColorAndLabelDialog(document.getElementById("content"));
      d.addEventHandler("onCancel", () => {});
      d.addEventHandler("onSave", (o) => {
        this.#customColors.push(o);
        this.#generateTable(t, labels);
        this.#saveButton.disabled = false;
      });
      d.render(t);
    });
    const keepOnlyCurrentLabelCheckbox = document.getElementById("keepOnlyCurrentLabelCheckbox");
    keepOnlyCurrentLabelCheckbox.checked = this._settings.keepOnlyCurrentLabel;
    keepOnlyCurrentLabelCheckbox.addEventListener("click", () => {
      this.#keepOnlyCurrentLabel = keepOnlyCurrentLabelCheckbox.checked;
      this.#saveButton.disabled = false;
    });
    document.getElementById("resetToDefaultColorsButton").addEventListener("click", (e) => {
      /** @type {TrelloPopupConfirmOptions} */
      const opts = {
        confirmText: "Yes",
        message: "Are you sure you want to reset this table to default?",
        onConfirm: (tt) => {
          this.#customColors = this._settings.customDefaults(labels);
          this.#saveButton.disabled = false;
          this.#generateTable(t, labels);
          tt.closePopup();
        },
        title: "Reset Defaults",
        type: "confirm",
        cancelText: "No",
        confirmStyle: "danger",
        mouseEvent: e,
        onCancel: (tt) => tt.closePopup(),
      };
      TrelloFrame.openPopup(t, opts);
    });
    // Custom single color
    this.#useCustomColors = this._settings.useCustomColors;
    const singleColorDiv = document.getElementById("singleColorDiv");
    const customColorsDiv = document.getElementById("customColorsDiv");
    document.getElementById("customColorsRadio").checked = this.#useCustomColors;
    if (this.#useCustomColors) {
      customColorsDiv.hidden = false;
      singleColorDiv.hidden = true;
    }
    document.getElementById("singleColorRadio").checked = !this.#useCustomColors;
    document.addEventListener("change", (e) => {
      if (e.target.matches('input[type="radio"][name="customColors"]')) {
        const selected = document.querySelector(
          'input[type="radio"][name="customColors"]:checked'
        );
        if (selected) {
          if (!Common.tbr.isFeatureAllowed) {
            Common.tbr.showSubscriptionOverlay(t, false, (v) => {
              this.#hideFeatures = v;
              Common.tbr.hideFeatures = v;
              this.#saveButton.disabled = false;
            }, true, () => this.#tabs.goto("Main"));
          } else {
            if(selected?.id === "customColorsRadio") {
              singleColorDiv.hidden = true;
              customColorsDiv.hidden = false;
              this.#useCustomColors = true;
            } else {
              singleColorDiv.hidden = false;
              customColorsDiv.hidden = true;
              this.#useCustomColors = false;
            }
            this.#saveButton.disabled = false;
            t.sizeTo("#content");
          }
        }
      }
    });
    this.#hidePremiumFeatureSettings();
    // finally
    window.setTimeout(() => {
      t.sizeTo("#content");
    }, 100);
  };
  /**
   * Puts all available Number fields in the fields selector list
   * @param {TrelloObject} t 
   */
  #setupFieldsSelector = async (t) => {
    if (Common.tbr.isFeatureAllowed || this._settings.hideFeatures === false) {
      /** @type {HTMLSelectElement} */
      const customFieldSelect = document.getElementById("customFieldSelect");
      /** @type {TrelloCustomField[]} */
      const customFields = (await t.board("customFields"))?.customFields;
      if (customFields && customFields.length > 0) {
        useCustomFieldCheckbox.disabled = false;
        customFieldSelect.innerHTML = customFields
          .filter((o) => o.type === "number")
          .map((o) => `<option value="${o.id}" ${o.id === this._settings.customFieldId ? "selected" : ""}>${o.name}</option>`)
          .join("");
        // add a blank first item
        customFieldSelect.innerHTML = `<option> </option>${customFieldSelect.innerHTML}`;
      } else {
        document.getElementById("noCustomFieldsMessage").hidden = false;
      }
    }
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
          <button id="downloadLogButton" hidden>Download log...</button>&nbsp;
          <button id="clearLogButton" hidden>Clear log</button>
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
  };
  /**
   * Returns the Main tab
   * @returns {String}
   */
  #getMainTab = () => {
    /** @type {String} */
    return /*html*/ `
      <div id="main">
        <h3>Completeness Badge Settings</h3>
        <p>
          Use this dialog to make this badge do what you (or your team) need it to do. You can set
          the badge style, colors (and labels to help with sorting cards), specify lists where the 
          badge will not apply, and link the value to a custom field if enabled on your board.
        </p>
        <hr />
        <h3>🏷️ Badge Type</h3>
        <select id="badgeTypeSelect">
          <option value="${BadgeType.BAR}">Bar</option> 
          <option value="${BadgeType.TEXT}">Text</option>
          <option value="${BadgeType.BOTH}">Text and Bar</option>
        </select>
        <hr />
        <h3>👥 Mode</h3>
        <input type="radio" name="teamMode" id="userModeRadioButton"/>&nbsp;For you only<br/>
        <input type="radio" name="teamMode" id="teamModeRadioButton"/>&nbsp;Team mode (shared)
      </div>
      <br/>
    `;
  };
  /**
   * Returns the Fields tab
   * @returns {String}
   */
  #getFieldsTab = () => {
    /** @type {String} */
    return /*html*/ `
      <div id="main">
        <h3>⚙️ Custom Field</h3>
        <p>You can have the completeness badge work from a custom number field.</p>
        <input disabled type="checkbox" name="customField" id="useCustomFieldCheckbox"/>&nbsp;Enable custom fields<br/>
        <select disabled id="customFieldSelect"></select>
        <p hidden id="noCustomFieldsMessage" style="color:red">You do not have any custom fields or your Trello board does not support them.</p>
        <p><b>Note</b>: This setting works for all badges, but you can override individual badges as needed.</p>
      </div>
      <br/>
    `;
  };
  /**
   * Returns a formatted table
   * @param {TrelloObject} t
   * @param {TrelloLabel[]} labels 
   */
  #generateTable = (t, labels) => {
    const table = this.#customColors
      .sort((a, b) => a.value < b.value)
      .map((o, idx) => {
        const value = window.btoa(JSON.stringify(o));
        /** @type {TrelloLabel} */
        const label = labels?.find((lbl) => lbl.id === o.labelId);
        return /*html*/`
          <tr style="row-height: 12px">
            <td>&gt;=&nbsp;${o.value}</td>
            <td style="background-color: ${o.color}">${o.color}</td>
            <td style="background-color: ${Common.trelloColorFix(label?.color ?? null)}">${(label?.name || label?.color) ?? "none"}</td>
            <td>
              <button class="icon-btn" name="editRowButtons" value="${value}" id="editRow${idx}">✏️</button>
              &nbsp;
              <button class="icon-btn" name="deleteRowButtons" value="${value}" id="deleteRow${idx}">🗑️</button>
            </td>
          </tr>
        `;
      })
      .join("");
    // Add HTML
    document.getElementById("colorsAndLabelsTable").innerHTML = table;
    // Hook events
    for(const o of document.getElementsByName("editRowButtons")) {
      o.addEventListener("click", () => {
        /** @type {import("../../common/settingsWrapper").CustomColorAndLabel} */
        const value = JSON.parse(window.atob(o.value));
        const d = new ColorAndLabelDialog(document.getElementById("content"));
        d.addEventHandler("onCancel", () => {});
        d.addEventHandler("onSave", (o) => {
          this.#customColors = this.#customColors.filter((c)=>c.id!==o.id);
          this.#customColors.push(o);
          this.#generateTable(t, labels);
          this.#saveButton.disabled = false;
        });
        d.render(t, value);
      });
    }
    for(const o of document.getElementsByName("deleteRowButtons")) {
      o.addEventListener("click", (e) => {
        /** @type {import("../../common/settingsWrapper").CustomColorAndLabel} */
        const value = JSON.parse(window.atob(o.value));
        /** @type {TrelloPopupConfirmOptions} */
        const opts = {
          confirmText: "Yes",
          message: "Are you sure you want to delete this entry?",
          onConfirm: (tt) => {
            this.#customColors = this.#customColors.filter((c) => c.id !== value.id);
            this.#saveButton.disabled = false;
            this.#generateTable(t, labels);
            tt.closePopup();
          },
          title: "Delete Entry",
          type: "confirm",
          cancelText: "No",
          confirmStyle: "danger",
          mouseEvent: e,
          onCancel: (tt) => tt.closePopup(),
        };
        TrelloFrame.openPopup(t, opts);
      });
    }
  }
  /**
   * Returns the Fields tab
   * @returns {String}
   */
  #getLabelsAndColorsTab = () => {
    /** @type {String} */
    return /*html*/ `
      <div id="colors">
        <h3>🎨 Badge Color</h3>
        <p>Please select your badge color for this board: </p>
        <table style="border=0">
          <tr>
            <td>
              <input ${!Common.tbr.isFeatureAllowed && !this._settings.hideFeatures ? "hidden" : ""} type="radio" name="customColors" id="singleColorRadio"/>&nbsp;Single color<br/>
            </td>
            <td id="singleColorDiv">
              <select id="badgeColorSelect"></select><span id="colorSelectedSpan">${`\u25A0`}</span>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <input ${!Common.tbr.isFeatureAllowed && !this._settings.hideFeatures ? "hidden" : ""} type="radio" name="customColors" id="customColorsRadio"/>&nbsp;Dynamic colors by value
            </td>
          </tr>
        </table>
        <div id="customColorsDiv" hidden>
          <h3>Custom Colors and Labels</h3>
          <p>You can set custom colors/labels to apply based on the value of the badge.</p>
          <p><b>Note</b>: Labels can help with filtering cards on your board.</p>
          <table>
            <thead>
              <th>Value</th><th>Color</th><th>Label</th><th>Change/Remove</th>
            </thead>
            <tbody id="colorsAndLabelsTable"></tbody>
          </table>
          <button id="addColorLabelButton">➕ Add</button>&nbsp;<button id="resetToDefaultColorsButton">🔁 Reset to default</button>
          <input type="checkbox" id="keepOnlyCurrentLabelCheckbox" />&nbsp;Keep only the current label
        </div>
      </div>
      <br/>
    `;
  };
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
    lists.forEach((l) => {
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
    this._settings.mode = this.#mode;
    this._settings.disabledListId = this.#disabledListId;
    this._settings.autoNewCardBadge = this.#autoNewChecked;
    this._settings.color = this.#selectedColor;
    this._settings.type = this.#selectedType;
    this._settings.enableLogging = this.#enableLogging;
    this._settings.hideTour = this.#hideTour;
    this._settings.useCustomField = this.#useCustomField;
    this._settings.customFieldId = this.#customFieldId;
    this._settings.useCustomColors = this.#useCustomColors;
    this._settings.customColors = this.#customColors;
    this._settings.keepOnlyCurrentLabel = this.#keepOnlyCurrentLabel;
    // save
    this.#saveButton.disabled = true;
    await this._settings.save(t);
    this.#hidePremiumFeatureSettings();
  }
  /**
   * Builds the color selectors options
   * @param {String} selectId
   * @param {String} spanId
   * @param {String} selectedColor
   * @param {SelectorCallback} callback
   */
  #setupColorSelector = (selectId, spanId, selectedColor, callback) => {
    /** @type {HTMLSelectElement} */
    const colorSelector = document.getElementById(selectId);
    colorSelector.innerHTML = ""; // clear
    const noneOpt = document.createElement("option");
    noneOpt.value = "";
    noneOpt.textContent = "None";
    colorSelector.appendChild(noneOpt);
    if (!selectedColor) noneOpt.selected = true;
    // color options
    Common.trelloColors.forEach((v) => {
      const opt = document.createElement("option");
      opt.className = "square";
      opt.value = v;
      opt.innerHTML = `${`\u25A0`}&nbsp;${v}`; 
      opt.style.backgroundColor = v;
      opt.style.color = v;
      colorSelector.appendChild(opt);
      if (selectedColor === v) opt.selected = true;
    });
    // set the background color on change and update state
    const colorSelectedSpan = document.getElementById(spanId)
    colorSelector.addEventListener("change", (e) => {
      const val = e.target.value;
      e.target.style["backgroundColor"] = val || "";
      e.target.style["color"] = val || "";
      this.#saveButton.disabled = false;
      colorSelectedSpan.style.color = val;
      callback(val);
    });
    colorSelectedSpan.style.color = selectedColor;
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
/**
 * @callback SelectorCallback
 * @param {String} value
 */
