import Common from "../../common/common";
import SettingsWrapper from "../../common/settingsWrapper";
import Styles from "../../common/styles";

export default class Tour {
  /** @type {HTMLDivElement} */
  #content = null;
  /** @type {Number} */
  #currentPage = 0;
  /** @type {HTMLDivElement[]} */
  #pages = [];
  /** @type {Boolean} */
  #hideTour = false;
  /**
   * CTOR
   */
  constructor(content) {
    this.#content = content;
    this.#applyStyles();
    this.#pages = this.#loadPages();
  }
  /**
   * Renders the tour
   * @type {TrelloObject} t
   * @param {Boolean} [showWelcome]
   */
  render = async (t, showWelcome = false) => {
    Styles.applyCss(document.getElementById("content"));
    const html = /*html*/`
      <div id="headerDiv">
        <img title="icon" width="64px" src="./images/logo.png" style="margin-right: 10px;" /> &nbsp;
        <h1 is="header">${this.#pages[this.#currentPage].title}</h1>
      </div>
      <div id="wizardDiv">
        <div id="wizardPageDiv">
          ${this.#pages[this.#currentPage].html}
        </div>
      </div>
      <div id="footerDiv">
        <div id="statusDiv">
          <p>${this.#currentPage + 1} of ${this.#pages.length} pages</p>
        </div>
        <div id="buttonPaneDiv">
          <button id="closeButton">❌ Close</button>
          <button id="backButton">⬅️ Back</button>
          <button id="nextButton"></button>
        </div>
      </div>
      <br />
    `;
    this.#content.innerHTML = html;
    this.#attachEvents(t, showWelcome);
    this.#attachInteractiveElements(t);
    window.setInterval(() => {
      t.sizeTo("#content");
    }, 100);
  };

  /**
   * Load placeholder pages
   */
  #loadPages = () => {
    const showTrial = !Common.tbr.isTrialUsed || !Common.tbr.isFeatureAllowed;
    return [
      {
        title: `👋 Welcome to The Completeness Badge`,
        html: /*html*/`<div class="wizardPage">
          <p>
            <span>Get your cards to complete!</span>
            <span ${showTrial ? "hidden" : ""}>To get the full features, <a href="#" id="startTrialButton">start your 14-day free trial now</a>.</span>
          </p>
          <br />
          <ul>
            <li>&nbsp;🎯 To start, open a card and, from the back, enable the badge or set a value.</li>
            <li>&nbsp;✨ Link it to a custom field on your card.</li>
            <li>&nbsp;📊 Choose a quick preset value (10%–100%).</li>
            <li>&nbsp;✏️ Enter a custom value.</li>
            <li>&nbsp;☑️ Or, track completion from a checklist.</li>
          </ul>
          <br />
          <div class="video-container">
            <iframe
              width="100%"
              height="450"
              original="https://youtu.be/8_-Oifr1ca0"
              src="https://www.youtube-nocookie.com/embed/8_-Oifr1ca0"
              title="Setting values"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>
        </div>`,
      },
      {
        title: `Modify your Settings`,
        html: /*html*/`<div class="wizardPage">
          <ul>
            <li>&nbsp;🎨 Change the badge color and text to fit your needs.</li>
            <li>&nbsp;⚡ Conditionally set the badge color based on the value.</li>
            <li>&nbsp;🏷️ Apply labels based on conditional values.</li>
            <li>&nbsp;🤝 Have a team and want consistency? Switch to team mode.</li>
          </ul>
          <br />
          <div class="video-container">
            <iframe
              width="100%"
              height="450"
              original="https://youtu.be/2kmxQaHzdZQ"
              src="https://www.youtube-nocookie.com/embed/2kmxQaHzdZQ"
              title="Changing settings"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>
        </div>`,
      },
      {
        title: `Time Saving Automation`,
        html: /*html*/`<div class="wizardPage">
          <ul>
            <li>🚫 Set a list where badges are disabled.</li>
            <li>⚡ Automatically add badges to cards as soon as they’re created.</li>
          </ul>
          <br />
          <div class="video-container">
            <iframe
              width="100%"
              height="450"
              original="https://youtu.be/lFoj83e6lJc"
              src="https://www.youtube-nocookie.com/embed/lFoj83e6lJc"
              title="Changing settings"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>
        </div>`,
      },
      {
        title: `Reports and Stats`,
        html: /*html*/`<div class="wizardPage">
          <ul>
            <li>📊 Get quick stats on your board.</li>
            <li>📋 Run a report to see where things stand.</li>
          </ul>
          <br />
          <div class="video-container">
            <iframe
              width="100%"
              height="450"
              original="https://youtu.be/IqfvbFUOpW4"
              src="https://www.youtube-nocookie.com/embed/IqfvbFUOpW4"
              title="Changing settings"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>
        </div>`,
      },
      {
        title: `List Automation and Sorting`,
        html: /*html*/`<div class="wizardPage">
          <ul>
            <li>🧭 Quickly enable or disable badges for all cards in a list.</li>
            <li>🗂️ Sort your cards by completeness (ascending or descending).</li>
            <li>📊 Get timely stats on the lists.</li>
          </ul>
          <br />
          <div class="video-container">
            <iframe
              width="100%"
              height="450"
              original="https://youtu.be/NHBIRZj5VZQ"
              src="https://www.youtube-nocookie.com/embed/NHBIRZj5VZQ"
              title="Changing settings"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>
        </div>`,
      },
      {
        title: `Finished`,
        html: /*html*/`<div class="wizardPage">
          <p>You have finished the Welcome Wizard. Thank you again for installing.</p>
          <p>If you have any question or suggestions, please contact us:</p>
          <button id="contactButton">Contact Us...</button>
          <hr/>
          <div ${showTrial ? "hidden" : ""}>
            <p>And do not forget you can start a free 14-day no obligation trial...</p>
            <button id="startTrialButton">Start your Trial!</button>
            <hr />
          </div>
          <input type="checkbox" id="hideTourCheckbox">&nbsp;Hide this tour from the menu
        </div>`,
      },
    ];

  };

  /**
   * Each time a page in the wizard loads, we work to attach to
   * one of these buttons
   * @param {TrelloObject} t
   */
  #attachInteractiveElements = (t) => {
    let startBtn = document.getElementById("startTrialButton");
    let contactBtn = document.getElementById("contactButton");
    let hideChk = document.getElementById("hideTourCheckbox");

    if (startBtn) {
      startBtn.replaceWith(startBtn.cloneNode(true)); // removes old listeners
      startBtn = document.getElementById("startTrialButton");
      startBtn.addEventListener("click", (e) => Common.tbr.trialConfirmPopup(t, e));
    }

    if (contactBtn) {
      contactBtn.replaceWith(contactBtn.cloneNode(true));
      contactBtn = document.getElementById("contactButton");
      contactBtn.addEventListener("click", () => window.open("https://kryl.com/?page=contact", "_blank"));
    }

    if (hideChk) {
      hideChk.replaceWith(hideChk.cloneNode(true));
      hideChk = document.getElementById("hideTourCheckbox");
      hideChk.addEventListener("change", async (e) => {
        this.#hideTour = e.target.value;
      });
    }
  };


  /**
   * Attach event handlers
   * @param {TrelloObject} t
   * @param {Boolean} [showWelcome]
   */
  #attachEvents = (t, showWelcome = false) => {
    const closeBtn = this.#content.querySelector("#closeButton");
    const backBtn = this.#content.querySelector("#backButton");
    const nextBtn = this.#content.querySelector("#nextButton");

    const showWelcomePage = (e) => {
      /** @type {TrelloModalOptions} */
      const modalDlg = {
        fullscreen: false,
        height: 200,
        url: Common.detailsPage,
        args: { view: "welcome" },
        title: `Thank you for Installing ${Common.APPNAME}`,
      };
      t.modal(modalDlg);
    };

    const saveTourState = async (t) => {
      const s = new SettingsWrapper();
      await s.load(t);
      s.hideTour = this.#hideTour;
      await s.save(t);
    }

    backBtn.disabled = this.#currentPage === 0;
    if (this.#currentPage > this.#pages.length - 2) {
      nextBtn.innerText = "✅ Finish";
    } else {
      nextBtn.innerText = "Next ➡️";
    }

    closeBtn?.addEventListener("click", async (e) => {
      await saveTourState(t);
      if (showWelcome) {
        showWelcomePage(e);
      } else {
        t.closeModal();
      }
    });

    backBtn?.addEventListener("click", () => {
      this.#currentPage--;
      if (this.#currentPage === 0) {
        backBtn.disabled = true;
      }
      nextBtn.innerText = "Next";
      this.render(t, showWelcome);
    });

    nextBtn?.addEventListener("click", async (e) => {
      this.#currentPage++;
      if (this.#currentPage > this.#pages.length - 1 && !showWelcome) {
        await closeBtn.click();
        return;
      } else if(this.#currentPage > this.#pages.length - 1 && showWelcome) {
        await saveTourState(t);
        showWelcomePage(e);
      }
      this.render(t, showWelcome);
    });
  };

  /**
   * Apply base styles (expand later)
   */
  #applyStyles = () => {
    const style = document.createElement("style");
    style.textContent = /*css*/`
      #headerDiv {
        background-image: url('./images/tour.png'); 
        background-size: cover;
        background-repeat: no-repeat; 
        height: 80px; 
        display: flex; 
        align-items: center; 
        padding: 0 10px; 
        margin-bottom: 10px;
      }
      #wizardDiv {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin: 20px;
      }
      #wizardPageDiv {
        min-height: 245px;
      }
      .wizardPage {
        display: none;
      }
      .wizardPage:first-child {
        display: block;
      }

      #footerDiv {
        margin: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;  
      }
      #statusDiv {
        margin:5px;
        padding-top: 15px;
      }
      #buttonPaneDiv {
        display: flex;
        gap: 0.5rem;
      }
    `;
    document.head.appendChild(style);
  };
}
