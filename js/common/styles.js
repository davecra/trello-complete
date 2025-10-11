import Common from "./common";

export default class Styles {
  /**
   * Loads the CSS for the form
   * @param {HTMLDivElement} elem
   * @returns {String}
   */
  static applyCss = (elem) => {
    const darkMode = Common.getColorMode() === "dark";
    /** @type {String} */
    const css = /*css*/ `
      :root {
        --background-color: ${darkMode ? "black" : "white"};
        --foreground-color: ${darkMode ? "white" : "black"};
      }
      .matrix {
        height: calc(100vh - 30px) !important;
        width: 100%;
      }
      .square {
        height:calc(50vh - 53px) !important;
        width:calc(50vw - 120px) !important;
      }
      .card {
          border-radius:6px;
          width: 200px;
          color: var(--foreground-color);
          border-color: white;
          border-width: 1px;
          border-style: solid;
          border-top: 20px solid white;
          background-color: var(--background-color);
          -webkit-user-select: none;
          user-select: none;
          cursor: grab;
          margin: 0px;
          padding: 0px;
          padding-bottom: 5px;
          margin-top:8px;
          margin-bottom: 8px;
          margin-left:5px;
          margin-right: 5px;
          padding-left:10px;
          padding-top:10px;
          box-shadow: 1px 1px 1px 1px darkgray;
          border-top-left-radius: 6px;
          border-bottom-left-radius: 6px;
          border-top-right-radius: 6px;
          border-bottom-right-radius: 6px;
      }
      .closeButton {
        position:absolute;
        right:5px;
        top: 5px;
      }
      .settingsButton {
        position:absolute;
        right:70px;
        top: 5px;
      }
      /* .card:hover {
        border: 2px white solid;
      } */
      .pHead {
        width: 135px;
        /* height: 20px; */
      }
      .item-container {
        display: flex;
      }
      .date-container {
        height: 20px;
        display: flex;
        border: 1px solid black;
        border-radius: 6px; 
        font-size: 8pt;
        background-color: lightgreen;
        color: black;
        padding: 0px;
        margin: 0px;
      }
      .member {
        border: 1px inset black;
        width: 15px; /* Set the desired width */
        height: 20px; /* Set the desired height */
        background-color: #3498db; /* Set the background color */
        border-radius: 50%; /* Make it a circle */
        font-size: 8pt;
        margin-left: -10px;
        padding-left: 5px;
        cursor: pointer;
      }
      .label {
        width: 30px;
        height: 10px;
        margin-left: -10px;
        border-radius: 6px; 
        cursor: pointer;
      }
      .scrollCards {
        scroll-behavior: smooth;
        overflow-y: scroll;
        height: calc(100% - 20px);
        margin:0px;
        margin-top:0px;
        padding:0px;
        vertical-align: top;
        text-align: left;
      }
      .scrollCards::-webkit-scrollbar {
          display: none;
      }
      .prioritySquare {
        position:relative;
        left:150px;
        top:-25px
      }
      .taskPane {
        position: relative;
        height:calc(100vh - 110px);
        vertical-align: text-top;
        width: 240px;
      }
      .shrinkInput{
          margin:0;
          padding:0;
          border:0;
          width: 40px;
          height: 20px;
      }
      .square {
          width:20px;
          height:20px;
      }
      .preview {
          height: 20px;
          padding: 2px;
          border: 1px black solid;
      }
      .smallCell {
          width: 16px;
      }
      input[type="text"], select {
          display: inline-block;
      }
      .flexTd {
         display:flex;
      }
      #p1Name, #p2Name, #p3Name, #p4Name {
          font-size: 10pt;
          height: 16pt;
      }
      #p1Color, #p2Color, #p3Color, #p4Color {
          font-size: 10pt;
          height: 16pt;
      }
      #note, #showPreview, #r0, #r1, #r2, #r3, #r4 {
          height: 12px;
          font-size: 10pt;
      }
      #settingsTable {
          border-left: 0;
          border-right: 0;
          border-top: 0;
          border-bottom: 0;
      }
      #saveBlock {
          display: inline-block;
      }
      #overlay {
        color: black;
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1;
      }
      .automationWarning {
        color: black;
        background-color: yellow;
        border: 1px dotted black;
      }
      #dialog {
        color: black;
        display: none;
        position: fixed;
        top: 35%;
        left: 50%;
        transform: translate(-50%, -35%);
        background: #fff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        z-index: 2;
      }
      #dialog button {
        color: black;
      }
    `;
    // -- NOW APPLY --
    /** @type {HTMLStyleElement} */
    const styleElement = document.createElement('style');
    styleElement.textContent = css;
    elem.appendChild(styleElement)
  }
}