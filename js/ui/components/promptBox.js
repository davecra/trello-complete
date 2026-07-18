import Common from "../../common/common";

export default class PromptBox {
  /** @type {HTMLElement} */
  #parentElement = null;
  /** @type {String} */
  #title = "";
  /** @type {String} */
  #message = "";
  #events = {
    onConfirm: () => {},
    onCancel: () => {},
  };

  /**
   * @param {HTMLElement} parentElement
   * @param {String} title
   * @param {String} message
   */
  constructor(parentElement, title, message) {
    this.#parentElement = parentElement;
    this.#title = title;
    this.#message = message;
  }

  /**
   * @param {"onConfirm" | "onCancel"} name
   * @param {Function} handler
   */
  addEventHandler = (name, handler) => {
    this.#events[name] = handler;
  };

  render = () => {
    const existingPrompt = document.getElementById("promptPage");
    if (existingPrompt) existingPrompt.remove();

    const darkMode = Common.getColorMode() === "dark";
    const prompt = document.createElement("div");
    prompt.id = "promptPage";
    prompt.className = darkMode ? "prompt-page dark" : "prompt-page";
    prompt.setAttribute("role", "dialog");
    prompt.setAttribute("aria-modal", "true");
    prompt.setAttribute("aria-labelledby", "promptTitle");
    prompt.innerHTML = /*html*/`
      <div class="prompt-box">
        <div class="prompt-icon" aria-hidden="true">!</div>
        <h2 id="promptTitle"></h2>
        <p id="promptMessage"></p>
        <div class="prompt-actions">
          <button type="button" class="mod-primary" id="promptYesButton">Yes</button>
          <button type="button" id="promptNoButton">No</button>
          <button type="button" id="promptCancelButton">Cancel</button>
        </div>
      </div>
    `;
    prompt.querySelector("#promptTitle").textContent = this.#title;
    prompt.querySelector("#promptMessage").textContent = this.#message;

    const dismiss = () => {
      prompt.remove();
      this.#events.onCancel();
    };
    prompt.querySelector("#promptYesButton").addEventListener("click", () => {
      prompt.remove();
      this.#events.onConfirm();
    });
    prompt.querySelector("#promptNoButton").addEventListener("click", dismiss);
    prompt.querySelector("#promptCancelButton").addEventListener("click", dismiss);
    prompt.addEventListener("keydown", (e) => {
      if (e.key === "Escape") dismiss();
    });

    this.#setStyles();
    this.#parentElement.appendChild(prompt);
    prompt.querySelector("#promptYesButton").focus();
  };

  #setStyles = () => {
    if (document.getElementById("prompt-box-styles")) return;
    const style = document.createElement("style");
    style.id = "prompt-box-styles";
    style.textContent = /*css*/`
      .prompt-page {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(9, 30, 66, 0.58);
        backdrop-filter: blur(2px);
      }
      .prompt-box {
        box-sizing: border-box;
        width: min(420px, 100%);
        padding: 24px;
        color: #172b4d;
        text-align: center;
        background: #ffffff;
        border: 1px solid rgba(9, 30, 66, 0.16);
        border-radius: 12px;
        box-shadow: 0 18px 48px rgba(9, 30, 66, 0.34);
      }
      .prompt-page.dark .prompt-box {
        color: #f4f5f7;
        background: #22272b;
        border-color: #738496;
      }
      .prompt-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        margin-bottom: 10px;
        color: #7a4f01;
        font-size: 24px;
        font-weight: 700;
        background: #fff0b3;
        border-radius: 50%;
      }
      .prompt-box h2 {
        margin: 0 0 10px;
        font-size: 20px;
      }
      .prompt-box p {
        margin: 0 0 22px;
        font-size: 14px;
        line-height: 1.5;
      }
      .prompt-actions {
        display: flex;
        justify-content: center;
        gap: 10px;
      }
      .prompt-actions button {
        min-width: 78px;
        padding: 8px 14px;
        border-radius: 6px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  };
}
