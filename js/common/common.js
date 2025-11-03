/// <reference path="../../types/registered.d.js" />
import DOMPurify from 'dompurify';

/**
 * Common Static Class
 */
export default class Common {
  static PACKAGE = require('../../package.json');
  /** @type {String} */
  static version = Common.PACKAGE.version;
  /** @type {String} */
  static APPNAME = Common.PACKAGE.appName;
  /** @type {String} */
  static DESCRIPTION = Common.PACKAGE.description;
  /**@type {Boolean} */
  static isDebug = window.location.href.toLowerCase().includes("localhost:");
  /**@type {Boolean} */
  static isBeta = window.location.href.toLowerCase().startsWith("https://beta.kryl.com");
  /** @type {String[]} */
  static trelloColors = ["white", "blue", "green", "orange", "red", "yellow", "purple", "pink", "cyan", "lime", "lightgray"]; // sky = cyan, light-gray = lightgray
  /** @type {String} */
  static ICON_DARK = `data:image/png;base64,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`;
  /** @type {String} */
  static detailsPage = `./details.html?rnd=${Math.round(Math.random() * 999999999)}`;
  /** @type {String} */
  static TITLE = `${Common.APPNAME}` //${Common.isBeta ? " (beta)" : Common.isDebug ? " (debug)": ""}`;
  /**
   * Fixes color with style issues in Trello scheme
   * @param {String} color 
   * @returns {String}
   */
  static trelloColorFix = (color) => {
    return color === "sky" ? "teal" : color === "lime" ? "green" : color === "pink" ? "magenta" : color === "black" ? "gray" : color;
  }
  /**
   * Takes a string and returns a sanitized one
   * @param {String} s 
   * @returns {String}
   */
  static sanitizeString = (s)=> {
    return DOMPurify.sanitize(s);
  }
  /**
   * Returns the Trello Color Mode
   * @returns {"light" | "dark"}
   */
  static getColorMode() { 
    const htmlElement = document.querySelector('html');
    /** @type {String} */
    const colorMode = htmlElement.getAttribute('data-color-mode');
    if(colorMode) return colorMode;
    else "light"; // default
  }
  /**
   * In place waiter
   * @param {Number} ms 
   */
  static wait = async (ms) => {
    await new Promise((resolve) => window.setTimeout(resolve, ms));
  }
  /**
   * Returns the best contract color
   * @param {String} color 
   * @returns 
   */
  static getContrastColor(color) {
    const hexColor = this.namedColorToRGB(color);
    // Convert hex to RGB
    const r = hexColor[0];
    const g = hexColor[1];
    const b = hexColor[2];
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // Choose white or black text based on luminance
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
  /**
   * Converts a name color to RGB
   * @param {String} namedColor 
   * @returns {RGB}
   */
  static namedColorToRGB(namedColor) {
    // Create a temporary element to apply the named color
    const tempElement = document.createElement('div');
    tempElement.style.color = namedColor;
    // Append the element to the body (required for getComputedStyle to work)
    document.body.appendChild(tempElement);
    // Get the computed style
    const computedStyle = window.getComputedStyle(tempElement);
    // Extract the RGB values from the computed style
    const rgbValues = computedStyle.color.match(/\d+/g).map(Number);
    // Remove the temporary element from the DOM
    document.body.removeChild(tempElement);
    return rgbValues;
  }
  /** @type {String} */
  static featuresListHtml = /*html*/`
    <p>With a subscription you get the following features</p>
    <ul>
      <li>📊 <b>Charts</b>: Visualize your board like never before ✨</li>
      <li>🔢 <b>Sort</b>: Sort tasks by completeness (ascending ⬆️ or descending ⬇️)</li>
      <li>✨ <b>Stats</b>: Get fascinating insights into your lists and board 📊</li> 
      <li>🌟 <b>Power Boost</b>: Add a badge to all items in a list quickly ⚡️</li>
      <li>🔒 <b>Hidden Gems</b>: Select a list to magically hide the Completeness Badge 🙈</li>
      <li>⚙️ <b>Auto-Magic</b>: Option for new cards to get a badge automatically 🪄</li>
      <!-- <li>📋 <b>Checklists</b>: Assign completeness based on checklists ✅</li> -->
      <!-- <li>🔗 <b>Linked Cards</b>: Assign completeness based on linked cards 🧩</li> -->
      <!-- <li>🎨 <b>Colors and Style</b>: Customize your badge 🖌️</li> -->
    </ul>
    <p>Get your cards to complete by subscribing today! 🚀🎉</p>
  `;
  /** @type {TrelloBoardRegistration} */
  static tbr = null;
  /**
   * INIT REGISTRATION OBJECT
   * 
   * This is the core call and [initializeRegistrationObject] is exposed in the registration
   * code that is loaded from https://kryl.com/api/?path=tbr. This api returns either a
   * (beta) or (release) __bin path based on the originator. 
   * 
   * Additionally, .htaccess needs to include https://localhost:54104 to be able to allow access
   * for beta or debug build.
   */
  static initTbr = async () => { 
    if(!Common.tbr) {
      try {
        let tbrCode = await Common.#loadCode();
        if (!tbrCode) throw new Error("Could not load registration code.");
        const tbrScript = document.createElement("script");
        tbrScript.type = "text/javascript";
        tbrScript.text = tbrCode;
        document.head.appendChild(tbrScript);
        // loaded - now initialize
        Common.tbr = await initializeRegistrationObject(Common.APPNAME, Common.version, Common.isBeta || Common.isDebug, false);
      } catch (e) {
        console.error(e);
      }
    }
  };
  /**
   * Load out of cache or pull down from the server
   * @returns {Promise<String>}
   */
  static #loadCode = async () => {
    let tbrCode = null;
    const prefix = "tbrCache_";
    const key = `${prefix}${Common.version}`;
    const tbrCache = window.localStorage.getItem(key);
    if (!tbrCache) {
      Common.isBeta || Common.isDebug && console.log("Fetching registration code from server...");
      Common.#cleanLocalStoragePrefix(prefix);
      const tbrJs = await fetch("https://kryl.com/api/?path=tbr", { method: "GET", cache: "no-store" });
      tbrCode = await tbrJs.text();
      window.localStorage.setItem(key, window.btoa(tbrCode));
    } else {
      Common.isBeta || Common.isDebug && console.log("Using cached registration code...");
      tbrCode = window.atob(tbrCache);
    }
    return tbrCode;
  };
  /**
   * Removes older versions
   * @param {String} prefix 
   */
  static #cleanLocalStoragePrefix = (prefix) => {
    Common.isBeta || Common.isDebug && console.log("Cleaning older cached registration code...");
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    }
  };
}