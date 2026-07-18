/* global TrelloPowerUp */
/* global TrelloBoardRegistration */
/// <reference path="../types/registered.d.js" />
/// <reference path="../types/trello.d.js" />
import TrelloFrame from "./common/trelloFrame";
import Common from "./common/common";
import BoardChart from "./ui/pages/boardChart";
import CustomValuePage from "./ui/pages/customValuePage";
import SettingsPage from "./ui/pages/settingsPage";
import StatsPage from "./ui/pages/statsPage";
import Tour from "./ui/pages/tour";
import WelcomePage from "./ui/pages/welcomePage";
/** @type {TrelloPowerUp} */
const tpu = window.TrelloPowerUp;
/**
 * @type {TrelloObject} Trello iframe object
 */
var t = tpu.iframe({
  appKey: Common.APIKEY,
  appName: Common.APPNAME,
});
/**
 * ---------------------------------
 * RENDER -- TRELLO MAIN ENTRY POINT
 * ---------------------------------
 */
t.render(async () => {
  /** @type {"settings" | "stats" | "disabled" | "chart" | "custom" | "tour"} */
  const viewType = await TrelloFrame.getArg("view");
  switch (viewType) {
    case "tour":
      const show = await TrelloFrame.getArg("show");
      const tour = new Tour(document.getElementById("content"));
      tour.render(t, show);
      break;
    case "custom":
      const override = await TrelloFrame.getArg("override");
      const cv = new CustomValuePage();
      await cv.render(t, override);
      break;
    case "settings":
      const p = new SettingsPage();
      p.render(t);
      break;
    case "stats":
      /** @type {"board" | "list"} */
      const statsType = await TrelloFrame.getArg("stats");
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
  }
});
