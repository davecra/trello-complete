import { Chart } from "chart.js/auto"; // https://www.chartjs.org/docs/latest/
import SettingsWrapper, {BadgeData} from "../../common/settingsWrapper";
import CustomBadge from "../components/customBadge";
import BasePage from "./_basePage";
import Common from "../../common/common";
import Styles from "../../common/styles";

export default class BoardChart extends BasePage {
  /** @type {Chart} */
  #chart = null;
  #colors = [
    { name: "", color: "none" },
    { name: "light-gray", color: "gray" },
    { name: "white", color: "white" },
    { name: "red", color: "red" },
    { name: "pink", color: "pink" },
    { name: "orange", color: "orange" },
    { name: "yellow", color: "yellow" },
    { name: "sky", color: "cyan" },
    { name: "blue", color: "blue" },
    { name: "lime", color: "lime" },
    { name: "green", color: "green" },
  ];
  constructor() {
    super();
  }
  /**
   * Renders the chart
   * @param {TrelloObject} t 
   */
  render = async (t) => {
    await this._init(t, "boardChart");
    Styles.applyCss(document.body);
    /** @type {String} */
    const html = /*html*/ `
      <div style="padding: 5px;">
        <table>
          <tr>
            <td>
              <label for="listSelect">Filter by list:</label>
              <select id="listSelect">
                <option value="all">All</option>
              </select>
            </td>
          </tr>
        </table>
      </div>
      <hr/>
      <div id="chart" style="padding: 5px;">
        <canvas id="barChart"></canvas>
      </div>
      <br/><br/>
    `;
    document.getElementById("content").innerHTML = html;
    /** @type {HTMLSelectElement} */
    const listSelect = document.getElementById("listSelect");
    /** @type {TrelloList[]} */
    const lists = await t.lists("all");
    for (const list of lists) {
      const opt = new Option(list.name, list.id);
      listSelect.appendChild(opt);
    }
    listSelect.addEventListener("change", async ()=> {
      await this.#renderChart(t, listSelect.selectedOptions[0].text);
      t.sizeTo("#content");
    });
    await this.#renderChart(t);
    t.sizeTo("#content");
    Common.tbr.checkRegistrationWithNotification(t, "html", content);
    if(Common.tbr.isFeatureAllowed === false) {
      window.setTimeout(()=>{
        document.getElementById("chart").innerHTML = "";
      }, 500);
      Common.tbr.showSubscriptionOverlay(t, true, async (v) => {
        this._settings.hideFeatures = v;
        await this._settings.save(t);
      });
      return;
    }
  }
  /**
   * Renders the chart
   * @param {TrelloObject} t
   * @param {String} [list]
   */
  #renderChart = async (t, list = "All") => {
    if (this.#chart) this.#chart.destroy();
    let data = await this.#getBoardChartData(t);
    if (list && list !== "All") data = data.filter(o=>o.list === list);
    let chartData = {};
    let title = "Chart";
    // Create an array of backgroundColor based on the ages
    const priValues = data.map(item => item.completeness);
    const backgroundColors = priValues.map(p => this.#getColorByCompleteness(p));
    chartData = {
      labels: data.map(o => o.name),
      datasets: [
        {
          label: 'Card Completeness',
          data: data.map(o => o.completeness),
          backgroundColor: backgroundColors,
        },
      ],
    };
    title = `${list} Cards`;
    // Create the bar chart
    this.#chart = new Chart(
      document.getElementById("barChart"),
      {
        type: "bar",
        options: {
          animation: true,
          plugins: {
            title: {
              text: title,
              display: true,
              position: "top",
            },
            legend: {
              display: false
            },
            tooltip: {
              enabled: true
            }
          },
          onClick: (e) => { }
        },
        data: chartData,
      }
    );
  }
  /**
   * Given an age, return a color
   * @param {Number} completeness 
   * @returns {String}
   */
  #getColorByCompleteness = (completeness) => {
    /** @type {String} */
    const color = this.#colors[Math.round(completeness / 10)].color;
    if(color) return color;
    return "light-gray";
  };
  /**
   * Gets the data for the graph
   * @param {TrelloObject} t
   * @returns {BasicCardChartData[]}
   */
  #getBoardChartData = async (t) => {
    /** @type {BasicCardChartData[]} */
    let returnValue = [];
    /** @type {TrelloCard[]} */
    const cards = await t.cards("all");
    /** @type {TrelloList[]} */
    const lists = await t.lists("all");
    returnValue.totalCards = cards.length;
    for (let i = 0; i < cards.length; i++) {
      /** @type {TrelloCard} */
      const c = cards[i];
      const enabled = await t.get(c.id,this._settings.mode,CustomBadge._CARD_BADGE_ENABLED_PROP, false);
      if (!enabled) continue;
      if (c.idList === this._settings.disabledListId) continue;
      /** @type {String | Number} */
      const val = await t.get(c.id, this._settings.mode ,CustomBadge._CARD_BADGE_COMPLETENESS_PROP, 0);
      /** @type {Number} */
      const p = Number.parseInt(val);
      returnValue.push({
        name: c.name,
        completeness: p,
        list: lists.find(l=>l.id===c.idList).name
      });
    }
    // sort by age
    returnValue.sort((a, b) => a.completeness - b.completeness);
    // return the stats
    return returnValue;
  }
}
/**
 * @typedef {Object} BasicCardChartData
 * @property {String} name
 * @property {String} list
 * @property {Number} completeness
 */
