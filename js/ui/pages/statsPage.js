import Common from "../../common/common";
import CustomBadge from "../components/customBadge";
import Styles from "../../common/styles";
import BasePage from "./_basePage";

export default class StatsPage extends BasePage{
  constructor() {
    super();
  }
  /**
   * Render the page
   * @param {TrelloObject} t 
   * @param {"list" | "board"} type
   */
  render = async (t, type)=>{
    await this._init(t, "statsPage");
    /** @type {String} */
    const html = /*html*/`
      <div id="result"></div>
      <button id="closeButton">Close</button>
    `;
    /** @type {HTMLDivElement} */
    const content = document.getElementById("content");
    content.innerHTML = html;
    Styles.applyCss(content);
    document.getElementById("closeButton").addEventListener("click", ()=>{
      t.closePopup();
    });
    const resultHtml = type === "list" ? await this.#getListResult(t) : await this.#getBoardResult(t);
    document.getElementById("result").innerHTML = resultHtml;
    t.sizeTo("#content");
    Common.tbr.checkRegistrationWithNotification(t, "htmlShort", content);
    if(Common.tbr.isFeatureAllowed === false) {
      window.setTimeout(() => {
        document.getElementById("closeButton").hidden = true;
        document.getElementById("result").innerHTML = "";
      }, 500);
      Common.tbr.showSubscriptionOverlay(t, true, async (v)=> {
        this._settings.hideFeatures = v;
        await this._settings.save(t);
      }, true);
      return;
    }
  };
  /**
   * Determines if a card should be included in the report
   * @param {TrelloObject} t 
   * @param {TrelloCard} c 
   * @returns {Promise<Boolean>}
   */
  #includeCard = async(t, cardId, listId) => {
    const enabled = await t.get(cardId, this._settings.mode, CustomBadge._CARD_BADGE_ENABLED_PROP, false);
    if (!enabled) return false;
    if (this._settings.disabledListId === listId) return false;
    return true;
  }
  /**
   * Returns the CURRENT lists stats
   * @param {TrelloObject} t 
   */
  #getListResult = async (t) => {
    /** @type {TrelloList} */
    const list = await t.list("all");
    /** @type {Number} */
    let totalP = 0;
    /** @type {Number} */
    let totalCards = 0;
    /** @type {{p: Number, c: String}}*/
    const lowestCard = {
      c: "",
      p: 999,
    };
    /** @type {{p: Number, c: String}} */
    const highestCard = {
      c: "",
      p: -1,
    };
    for(let i=0;i<list.cards.length;i++) {
      /** @type {TrelloCard} */
      const c = list.cards[i];
      const include = await this.#includeCard(t, c.id, c.idList);
      if (!include) continue;
      /** @type {Number} */
      const p = parseInt(await t.get(c.id, this._settings.mode, CustomBadge._CARD_BADGE_COMPLETENESS_PROP, 0));
      if(p < lowestCard.p) {
        lowestCard.p = p;
        lowestCard.c = c.name;
      }
      if(p > highestCard.p) {
        highestCard.p = p;
        highestCard.c = c.name;
      }
      totalP+=p;
      totalCards++;
    }
    /** @type {Number} */
    const averageP = totalP / totalCards;
    /** @type {String} */
    const resultHtml = /*html*/`
      <p><b>Total Cards</b>:&nbsp;${list.cards.length}</p>
      <p><b>Count with Badge</b>:&nbsp;${totalCards}</p>
      <p><b>Average Completeness</b>:&nbsp;${averageP.toFixed(2)}</p>
      <p><b>Most Complete Card:</b></p>
      <blockquote>
        <p>${Common.sanitizeString(highestCard.c)}</p>
        <p><b>Completeness</b>: ${highestCard.p}</p>
      </blockquote>
      <p><b>Least Complete Card:</b></p>
      <blockquote>
        <p>${Common.sanitizeString(lowestCard.c)}</p>
        <p><b>Completeness</b>: ${lowestCard.p}</p>
      </blockquote>
    `;
    return resultHtml;
  };
  /**
   * Returns the boards results
   * @param {TrelloObject} t 
   */
  #getBoardResult = async (t) => {
    /** @type {TrelloCard[]} */
    const cards = await t.cards("all");
    /** @type {Number} */
    let totalP = 0;
    /** @type {Number} */
    let totalCards = 0;
    /** @type {{p: Number, c: String}}*/
    const lowestCard = {
      c: "",
      p: 999,
    };
    /** @type {{p: Number, c: String}} */
    const highestCard = {
      c: "",
      p: -1,
    };
    for(let i=0;i<cards.length;i++) {
      /** @type {TrelloCard} */
      const c = cards[i];
      const include = await this.#includeCard(t, c.id, c.idList);
      if (!include) continue;
      /** @type {Number} */
      const p = parseInt(await t.get(c.id,"shared",CustomBadge._CARD_BADGE_COMPLETENESS_PROP, 0));
      if(p < lowestCard.p) {
        lowestCard.p = p;
        lowestCard.c = c.name;
      }
      if(p > highestCard.p) {
        highestCard.p = p;
        highestCard.c = c.name;
      }
      totalP+=p;
      totalCards++;
    }
    /** @type {Number} */
    const averageP = totalP / totalCards;
    /** @type {String} */
    const resultHtml = /*html*/`
      <p><b>Total Cards</b>:&nbsp;${cards.length}</p>
      <p><b>Count with Badge</b>:&nbsp;${totalCards}</p>
      <p><b>Average Completeness</b>:&nbsp;${averageP.toFixed(2)}</p>
      <p><b>Most Complete Card:</b></p>
      <blockquote>
        <p>${Common.sanitizeString(highestCard.c)}</p>
        <p><b>Completeness</b>: ${highestCard.p}</p>
      </blockquote>
      <p><b>Least Complete Card:</b></p>
      <blockquote>
        <p>${Common.sanitizeString(lowestCard.c)}</p>
        <p><b>Completeness</b>: ${lowestCard.p}</p>
      </blockquote>
    `;
    return resultHtml;
  }
}