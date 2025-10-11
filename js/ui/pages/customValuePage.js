import Common from "../../common/common";
import SettingsWrapper from "../../common/settingsWrapper";
import CustomBadge from "../components/customBadge";
import BasePage from "./_basePage";

export default class CustomValuePage extends BasePage {
  constructor() {
    super();
  }
  /**
   * Renders the form
   * @param {TrelloObject} t 
   */
  render = async (t) => {
    await this._init(t, "CustomValuePage", false, false);
    const card = await t.card("id");
    const value = await t.get(card.id, this._settings.mode, CustomBadge._CARD_BADGE_COMPLETENESS_PROP, 0);
    const html = /*html*/`
      <div>
        <label for="customValueInput">Enter your custom completeness value:</label>
        <input id="customValueInput" name="customValueInput" type="number" min=0 max=100 value=${value} />
        <br/>
        <button id="okButton">Ok</button>&nbsp;<button id="cancelButton">Cancel</button>
      </div>
    `;
    document.getElementById("content").innerHTML = html;
    document.getElementById("okButton").addEventListener("click", async () => {
      const v = document.getElementById("customValueInput").value;
      await t.set(card.id, this._settings.mode, CustomBadge._CARD_BADGE_ENABLED_PROP, true);
      await t.set(card.id, this._settings.mode, CustomBadge._CARD_BADGE_COMPLETENESS_PROP, v);
      t.closePopup();
    });
    document.getElementById("cancelButton").addEventListener("click", () => {
      t.closePopup();
    });
    if (Common.tbr.isFeatureAllowed === false) {
      Common.tbr.showSubscriptionOverlay(t, true, false, true);
    }
    t.sizeTo("#content");
  }
}