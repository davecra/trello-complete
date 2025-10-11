/* global TrelloPowerUp */
/* global TrelloBoardRegistration */
/// <reference path="../types/registered.d.js" />
/// <reference path="../types/trello.d.js" />
import Common from "./common/common";
import BoardChart from "./ui/pages/boardChart";
import CustomValuePage from "./ui/pages/customValuePage";
import SettingsPage from "./ui/pages/settingsPage";
import StatsPage from "./ui/pages/statsPage";
import Tour from "./ui/pages/tour";
import WelcomePage from "./ui/pages/welcomePage";
/** @type {TrelloPowerUp} */
const tpu = window.TrelloPowerUp;
/** @type {TrelloObject} */
const t = tpu.iframe();
/**
 * ---------------------------------
 * RENDER -- TRELLO MAIN ENTRY POINT
 * ---------------------------------
 */
t.render(async () => {
  await Common.initTbr();
  /** @type {"settings" | "stats" | "disabled" | "chart" | "custom" | "tour"} */
  const viewType = await t.arg("view");
  switch (viewType) {
    case "tour":
      const tour = new Tour(document.getElementById("content"));
      tour.render(t);
      break;
    case "custom":
      const cv = new CustomValuePage();
      await cv.render(t);
      break;
    case "settings":
      const p = new SettingsPage();
      p.render(t);
      break;
    case "stats":
      /** @type {"board" | "list"} */
      const statsType = await t.arg("stats");
      const s = new StatsPage();
      s.render(t, statsType);
      break;
    case "chart":
      const c = new BoardChart();
      c.render(t);
      break;
    case "welcome":
      const w = new WelcomePage();
      w.render(t);
      break;
    case "disabled":
      if (!Common.tbr) {
        await Common.initTbr();
        await Common.tbr.init({
          boardData: {
            boardName: "UNKNOWN",
            idBoard: "UNKNOWN",
            idMember: "UNKNOWN",
            members: -1,
            idOrg: "UNKNOWN",
          },
        });
      }
      await Common.tbr.showDisabledForm(t);
      break;
  }
});
