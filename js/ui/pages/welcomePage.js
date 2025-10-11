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
      <img src="./images/welcome.png" width="600px" height="319px" title="getting started" alt="getting started" />
      <p>You can get started by customizing your badge style: <button id="settingsButton">⚙️</button>
      <hr/>
      <div id="trialSection" hidden>
        <p>🚀 Dive into the full experience of this Power-Up! Click below to kick off your free 14-day trial—no strings attached, no credit card required, and no gimmicks involved. Let's get started!</p>
        <button id="trialButton">Start Your Trial...</button>
        <hr/>
      </div>
      <p>Please visit our site for more information: <a href="https://kryl.com" target="_blank">https://kryl.com</a>.
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
    document.getElementById("settingsButton").addEventListener("click", (e)=> {
      /** @type {TrelloPopupIFrameOptions} */
      const popupOpts = {
        args: { view: "settings" },
        title: Common.TITLE,
        url: Common.detailsPage,
        height: 265,
        mouseEvent: e,
      };
      return t.popup(popupOpts);
    });
    t.sizeTo("#content");
  }
}