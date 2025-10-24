import Common from "../../common/common";
import BasePage from "./_basePage";

export default class WelcomePage extends BasePage {
  constructor() {
    super();
  }
  /**
   * Shows the welcome form
   * @param {TrelloObject} t 
   */
  render = async (t) => {
    await this._init(t, "welcomePage");
    /** @type {String} */
    const html = /*html*/`
      <h2>🎉 Thank you for installing ${Common.APPNAME}</h2>
      <p>We at Kryl Solutions, LLC appreciate having you on board.</p>
      <hr/>
      <p>To get started, open a card, and from the back - change the completeness of your cards:</p>
      <div style="width:100%; display:flex; justify-content:center;">
        <img style="border:solid;black;1px;" height="200px" src="./images/1.gif" />
      </div>
      <p>You can get started by customizing your badge style: <button id="settingsButton">⚙️</button></p>
      <p>Take the tour: <button id="tourButton">Take the welcome tour...</button></p>
      <hr/>
      <div id="trialSection" hidden>
        <p>🚀 Dive into the full experience of this Power-Up! Click below to kick off your free 14-day trial—no strings attached, no credit card required, and no gimmicks involved. Let's get started!</p>
        <button id="trialButton">Start Your Trial...</button>
        <hr/>
      </div>
      <p>Please visit our site for more information: <a href="https://kryl.com" target="_blank">https://kryl.com</a>.</p>
      <p>If you have any issue or questions, please <a href="https://kryl.com/?page=contact" target="_blank">contact us</a>.</p>
      <button id="closeButton">Close</button>
      <hr/>
      <p>version ${Common.version}</p>
    `;
    const content = document.getElementById("content");
    content.innerHTML = html;
    content.style.padding = "5px";
    document.getElementById("closeButton").addEventListener("click", ()=> {
      t.closeModal();
    });
    const trialSection = document.getElementById("trialSection");
    if(Common.tbr.isTrialUsed === false) trialSection.hidden = "";
    document.getElementById("trialButton").addEventListener("click", ()=> {
      Common.tbr.showDialog(t);
    });
    document.getElementById("tourButton").addEventListener("click", (e)=> {
      /** @type {TrelloPopupIFrameOptions} */
      const popupOpts = {
        args: { view: "tour", show: true },
        title: Common.TITLE + " Welcome Tour",
        url: Common.detailsPage + `?rnd=${Math.round(Math.random() * 999999999)}`,
        height: 265,
        mouseEvent: e,
      };
      return t.modal(popupOpts);
    });
    document.getElementById("settingsButton").addEventListener("click", (e)=> {
      /** @type {TrelloPopupIFrameOptions} */
      const popupOpts = {
        args: { view: "settings" },
        title: Common.TITLE,
        url: Common.detailsPage + `?rnd=${Math.round(Math.random() * 999999999)}`,
        height: 265,
        mouseEvent: e,
      };
      return t.popup(popupOpts);
    });
    window.setTimeout(()=>t.sizeTo("#content"), 100);
  }
}