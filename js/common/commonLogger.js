import Common from "./common";

export class CommonLogger {
  /** @type {String} */
  static LOG_NAME = "CompletenessBadge_Log";
  /** @type {Boolean} */
  static #enabled = true; // on by default unless turned off
  /**
   * @returns {Boolean}
   */
  static get enabled() { return this.#enabled; }
  /**
   * @param {Boolean} v
   */
  static set enabled(v) { 
    if (v === false) CommonLogger.clear();
    this.#enabled = v; 
  }
  /**
   * Clear the log in session storage
   */
  static clear = () => {
    window.sessionStorage.removeItem(CommonLogger.LOG_NAME);
  }
  /**
   * Logs the message
   * @param {String} msg 
   */
  static log = (msg) => {
    if (Common.isBeta || Common.isDebug) console.log(msg);
    if (!this.#enabled) return;
    let log = window.sessionStorage.getItem(CommonLogger.LOG_NAME);
    if (!log) log = "";
    const time = new Date().toISOString();
    const entry = `\n${time} - ${msg}`;
    log += entry;
    window.sessionStorage.setItem(CommonLogger.LOG_NAME, log);
  }
  /**
   * Downloads the log file
   * @param {String} [filename]
   */
  static downloadLogFile(filename = 'log.txt') {
    let logString = window.sessionStorage.getItem(CommonLogger.LOG_NAME);
    // Create a Blob from the log content
    const blob = new Blob([logString], { type: 'text/plain' });
    // Create a link element
    const link = document.createElement('a');
    // Create a URL for the Blob and set it as the href of the link
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    // Append the link to the document body (required for Firefox)
    document.body.appendChild(link);
    // Programmatically click the link to trigger the download
    link.click();
    // Remove the link from the document
    document.body.removeChild(link);
  }
}