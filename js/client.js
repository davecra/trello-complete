/* global TrelloPowerUp */
/// <reference path="../types/trello.d.js" />
import Common from './common/common';
import TrelloWrapper from './wrappers/trelloWrapper';
/**
 * ----------------------------------
 * INIT - MAIN ENTRY POINT FOR TRELLO
 * ----------------------------------
 */
(async ()=> {
  await Common.initTbr();
  const w = new TrelloWrapper();
  const tpu = window.TrelloPowerUp;
  tpu.initialize({
    "board-buttons": async (t) => await w.getBoardButton(t),
    "card-badges": async (t) => await w.getCardBadge(t),
    "card-detail-badges": async (t) => await w.getCardDetailBadge(t),
    "show-settings": async (t) => await w.showSettings(t),
    "list-actions": async (t) => await w.getListActions(t),
    "list-sorters": async (t) => await w.getListSorters(t),
    "on-disable": async (t) => await w.onDisable(t),
    "on-enable": async (t) => await w.onEnable(t),
  });
})();
