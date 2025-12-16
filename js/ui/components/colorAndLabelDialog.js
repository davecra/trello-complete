import Common from "../../common/common";

export default class ColorAndLabelDialog {
  /** @type {HTMLDivElement} */
  #parentContainer = null;
  #events= {
    /** @type {OnSaveHandler} */
    "onSave": () => {},
    /** @type {OnCancelHandler} */
    "onCancel": () => {},
  };
  /**
   * CTOR
   * @param {HTMLDivElement} parentContainer
   */
  constructor(parentContainer) {
    this.#parentContainer = parentContainer;
  }
  /**
   * Adds an event handler to the dialog 
   * @param {"onSave" | "onCancel"} name 
   * @param {OnSaveHandler | OnCancelHandler} fn 
   */
  addEventHandler = (name, fn) => {
    this.#events[name] = fn;
  }
  /**
   * Renders the dialog
   * @param {TrelloObject} t
   * @param {import("../../common/settingsWrapper").CustomColorAndLabel} [item] Optional existing item for edit
   */
  render = async (t, item = null) => {
    this.#setStyles();
    const labelOptions = (await t.board("labels"))?.labels ?? [];
    const colorOptions = Common.trelloColors;
    // Build select options HTML
    const labelOptionsHtml = labelOptions.map(l => `<option value="${l.id}" ${item?.labelId === l.id ? 'selected' : ''}>${l.name || l.color}</option>`).join('');
    const colorOptionsHtml = colorOptions.map(c => `<option value="${c}" ${item?.color === c ? 'selected' : ''}>${c}</option>`).join('');
    const valueField = item?.value ?? '';
    const html = /*html*/`
      <div class="modal-backdrop"></div>
      <div class="modal-dialog">
        <h3>${item ? 'Edit' : 'Add'} Badge Color</h3>
        <p>Select the value, badge color and selected label.</p>
        <div class="modal-row">
          <label>Value greater than or equal:</label>
          <input type="number" id="valueInput" value="${valueField}" max=100 min=0 />
        </div>
        <div class="modal-row">
          <label>Badge Color:</label>
          <select id="colorSelect">
            ${colorOptionsHtml}
          </select>
        </div>
        <div class="modal-row">
          <label>Applied Card Label:</label>
          <select id="labelSelect">
            <option value="">None</option>
            ${labelOptionsHtml}
          </select>
        </div>
        <div class="modal-actions">
          <button id="okButton">Ok</button>
          <button id="cancelButton">Cancel</button>
        </div>
      </div>
    `;
    const dialog = document.createElement("div");
    dialog.classList.add("color-label-dialog-container");
    dialog.innerHTML = html;
    this.#parentContainer.appendChild(dialog);
    document.getElementById("valueInput").addEventListener("input", (e) => {
      const v = Number(e.currentTarget.value);
      e.currentTarget.value = v < -1
        ? -1
        : v > 100
        ? 100
        : v;
    });
    // Event listeners
    dialog.querySelector("#okButton").addEventListener("click", () => {
      /** @type {import("../../common/settingsWrapper").CustomColorAndLabel} */
      const data = {
        id: item?.id ?? Common.generateId(),
        value: parseFloat(dialog.querySelector("#valueInput").value),
        color: dialog.querySelector("#colorSelect").value,
        labelId: dialog.querySelector("#labelSelect").value || null
      };
      this.#parentContainer.removeChild(dialog);
      this.#events["onSave"](data);
    });
    dialog.querySelector("#cancelButton").addEventListener("click", () => {
      this.#parentContainer.removeChild(dialog);
      this.#events["onCancel"]();
    });
  };
  /**
   * Applies the modal CSS
   */
  #setStyles = () => {
    if (document.getElementById("color-label-dialog-styles")) return;

    const css = /*css*/`
      .color-label-dialog-container {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 1000;
        font-family: Arial, sans-serif;
      }

      .color-label-dialog-container .modal-backdrop {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.6); /* darker backdrop */
      }

      .color-label-dialog-container .modal-dialog {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: #f8f8f8; /* slightly off-white */
        padding: 20px;
        border-radius: 10px;
        min-width: 320px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.4); /* stronger shadow */
        z-index: 1010;
        border: 1px solid #ccc; /* subtle border */
        color: #222; /* darker text */
      }

      .color-label-dialog-container .modal-row {
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .color-label-dialog-container .modal-row label {
        margin-right: 10px;
        font-weight: 500; /* makes labels more prominent */
        color: #333; /* darker label */
      }

      .color-label-dialog-container .modal-actions {
        text-align: right;
      }

      .color-label-dialog-container .modal-actions button {
        margin-left: 10px;
        background-color: #0079bf; /* Trello-like blue */
        color: white;
        border: none;
        padding: 6px 14px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }

      .color-label-dialog-container .modal-actions button:hover {
        background-color: #005a8f; /* slightly darker on hover */
      }

    `;
    const style = document.createElement("style");
    style.id = "color-label-dialog-styles";
    style.innerHTML = css;
    document.head.appendChild(style);
  };
}
/**
 * @callback OnSaveHandler
 * @param {import("../../common/settingsWrapper").CustomColorAndLabel} item
 */
/**
 * @callback OnCancelHandler
 */