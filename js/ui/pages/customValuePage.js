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
   * @param {Boolean} override
   */
  render = async (t, override) => {
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
    const okButton = document.getElementById("okButton");
    okButton.addEventListener("click", async () => {
      const v = document.getElementById("customValueInput").value;
      okButton.disabled = true;
      try {
        const values = {
          [CustomBadge._CARD_BADGE_ENABLED_PROP]: true,
          [CustomBadge._CARD_BADGE_COMPLETENESS_PROP]: v,
          [CustomBadge._CARD_BADGE_CHECKLIST_PROP]: null,
        };
        if (override) values[CustomBadge._CARD_BADGE_OVERRIDE_PROP] = true;
        await t.set(card.id, this._settings.mode, values);
        Common.sqid("fulluse1");
        t.closePopup();
      } catch (error) {
        console.error("Unable to save custom badge value.", error);
        okButton.disabled = false;
        t.alert({
          message: "⚠️ Unable to save the badge value. Please try again.",
          duration: 6,
        });
      }
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
