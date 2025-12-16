import TrelloTokenWrapper from "../../api/trelloTokenWrapper";
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
      <div style="padding: 10px">
        <h2>🎉 Thank you for installing ${Common.APPNAME}</h2>
        <p>We at Kryl Solutions, LLC appreciate having you on board.</p>
        <div id="div1">
          <p>To get started, you will need to authorize this Power-Up for use with the <b>Trello API</b>:</p>
          <p><button type="button" class="welcomeButtonStyle" id="authButton">🔐 Authorize Trello...</button></p>
          <p><b>Note</b>: Some browsers might block the Authentication prompt.</p>
          <p><img title="blocked popup" width="180px" src="./images/blocked.png" /></p>
          <br />
          <p>Once you completed authorization, click Next:</p>
          <button type="button" id="nextButton" disabled>Next ></button>
          <hr />
          <p>version ${Common.version}</p>
        </div>
        <div id="div2" hidden>
          <p>Thank you for authorizing. You can get started by customizing your badge style: <button id="settingsButton">⚙️</button></p>
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
        <div>
      </div>
    `;
    const content = document.getElementById("content");
    content.innerHTML = html;
    content.style.padding = "5px";
    document.getElementById("closeButton").addEventListener("click", ()=> {
      t.closeModal();
    });
    const authButton = document.getElementById('authButton');
    authButton.addEventListener('click', async () => { 
      const token = await TrelloTokenWrapper.getToken(t, false); 
      if (token) {
        nextButton.disabled = false;
        authButton.disabled = true;
      }
    });
    const nextButton = document.getElementById("nextButton");
    nextButton.addEventListener("click", () => {
      document.getElementById("div1").hidden = true;
      document.getElementById("div2").hidden = false;
      t.sizeTo("#content");
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
        url: Common.detailsPage,
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
        url: Common.detailsPage,
        height: 265,
        mouseEvent: e,
      };
      return t.popup(popupOpts);
    });
    window.setTimeout(()=>t.sizeTo("#content"), 100);
  }
}