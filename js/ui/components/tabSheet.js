export default class TabSheet {
	/** @type {HTMLDivElement} */
	#parent = null;
	/** @type {HTMLDivElement[]} */
	#tabs = [];
	/** @type {HTMLButtonElement[]} */
	#tabButtons = [];
	/** @type {HTMLTableCellElement} */
	#tabButtonRow = null;
	/** @type {HTMLTableCellElement} */
	#tabBodyRow = null;
	/**
	 * @type {function[]}
	 */
	#events = {
		/**
		 * @type {TabChangeEventHandler}
		 */
		beforechange: ()=>{},
    /**
     * @type {TabChangeEventHandler}
     */
    change: ()=>{}
	}
	/**
	 * CTOR
	 * @param {HTMLDivElement} content
	 */
  constructor(content) {
		this.#parent = content;
		this.#parent.innerHTML = /*html*/ `
			<table id="tabBody"><tbody>
				<tr><td id="tabButtonRow"></td></tr>
				<tr><td id="tabBodyRow"></td></tr>
			</tbody></table>
		`;
		this.#tabButtonRow = this.#parent.ownerDocument.getElementById("tabButtonRow");
    this.#tabButtonRow.style.height = "auto";
		this.#tabBodyRow = this.#parent.ownerDocument.getElementById("tabBodyRow");
    this.#tabBodyRow.style.height = "auto";
		this.#loadStyles();
	}
	/**
	 * Renders the control
	 */
	render = () => {
		this.#selectDefault();
	};
	/**
	 * Adds a new tab to the sheet
	 * @param {String} name
	 * @param {String} htmlString 
	 * @param {Boolean} visible
	 * @param {Boolean} [defaultTab]
	 */
	addTab = (name, htmlString, visible, defaultTab = false) => {
		const tabBody = this.#parent.ownerDocument.createElement("div");
		tabBody.id=`tab${this.#tabs.length}`;
		tabBody.className = "tab-content";
		tabBody.innerHTML = htmlString;
		tabBody.hidden = visible === true ? "" : "hidden";
    tabBody.style.height = "100%";

		const tabButton = this.#parent.ownerDocument.createElement("div");
		tabButton.innerText = name;
		tabButton.className = "tab-button";
		tabButton.id=`tabButton${this.#tabs.length}`;
		tabButton.hidden = visible === true ? "" : "hidden";
		tabButton.addEventListener("click", (e)=>{
			this.#openTab(tabButton, tabBody);
		});
		// is this a default tab button
		if(defaultTab) {
			const defaultAttrib = this.#parent.ownerDocument.createAttribute("default-tab");
			defaultAttrib.nodeValue="true";
			tabButton.attributes.setNamedItem(defaultAttrib);
		}	
		this.#tabs.push(tabBody);
		this.#tabButtons.push(tabButton);
		// now append them
		this.#tabButtonRow.insertAdjacentElement("beforeend", tabButton);
		this.#tabBodyRow.insertAdjacentElement("beforeend", tabBody);
	}
	/**
	 * Attaches events to the tab behaviors
	 * @param {"beforechange"} event 
	 * @param {TabChangeEventHandler} fn 
	 */
	addEventHandler = (event, fn) => {
		this.#events[event] = fn;
	}
	/**
	 * Hides a specific tab
	 * @param {String} tabName 
	 */
	hide = (tabName) => {
		/** @type {HTMLButtonElement} */
		const buttons = this.#tabButtons.filter(b=>b.innerText === tabName);
		if(buttons.length > 0) {
			buttons[0].hidden = "hidden";
			/** @type {String} */
			const tabId = buttons[0].id.replace("tabButton", "tab");
			this.#tabs.filter(t=>t.id===tabId)[0].hidden = "hidden";
		}
	}
  /**
   * Goes to a tab
   * @param {String} tabName 
   */
  goto = (tabName) => {
    /** @type {HTMLButtonElement[]} */
		const buttons = this.#tabButtons.filter(b=>b.innerText === tabName);
    if (buttons && buttons.length > 0) buttons[0].click();
  }
	/**
	 * Shows a specific tab
	 * @param {String} tabName 
	 */
	show = (tabName) => {
		/** @type {HTMLButtonElement[]} */
		const buttons = this.#tabButtons.filter(b=>b.innerText === tabName);
		if(buttons.length > 0) {
			buttons[0].hidden = "";
			/** @type {String} */
			const tabId = buttons[0].id.replace("tabButton", "tab");
			this.#tabs.filter(t=>t.id===tabId)[0].hidden = "";
		}		
	}
	/**
	 * Selects the default tab
	 */
	#selectDefault = () => {
		this.#tabButtons.forEach(o=>{
			if(o.hasAttribute("default-tab")) o.click();
		});
	};
	/**
	 * Loads the styles for the control
	 */
	#loadStyles = () => {
		// .tab {overflow: hidden;border: 1px solid #ccc;margin-bottom: 1em;}
		var styles = /*css*/ `
		.tab-button {
			float: left;
			border: none;
			outline: none;
			cursor: pointer;padding: 5px 5px;
			transition: 0.3s;
			font-size: 12px;
			margin-right: 5px;
			background-color: var(--ds-surface);
			color: var(--ds-text);
		}
		.tab-button:hover {
			background-color: var(--ds-surface-hovered);
		}
		.tab-button.active {
			background-color: var(--ds-surface-pressed);
		}
		.tab-content {
			display: none;
			padding: 6px 12px;
			border: 1px solid #ccc;
			border-top: none;
			margin-top: -1px;
		}`;
		var styleTag = document.getElementById("tab-styles");
		// If the styles element does not exist, create it and append it to the head
		if (!styleTag) {
			styleTag = document.createElement("style");
			styleTag.id = "tab-styles";
			document.head.appendChild(styleTag);
		}
		// Check if the styles have already been added before adding them again
		if (styleTag.innerHTML.indexOf(styles) === -1) {
			styleTag.innerHTML += styles;
		}
	};
	/**
	 * 
	 * @param {HTMLElement} tabButton 
	 * @param {HTMLElement} tab 
	 */
	#openTab = async (tabButton, tab) => {
		// fire the before change event
		if(this.#events["beforechange"]) {
			const returnValue = await this.#events["beforechange"](tabButton.innerText);
			if(returnValue === false) return; // no change
		}
		// Get all elements with class="tab-content" and hide them
		this.#tabs.forEach(t=>t.style.display = "none");
		// Get all elements with class="tab-buttons" and remove the class "active"
		this.#tabButtons.forEach(t=>t.className = t.className.replace(" active", ""));
		// Show the current tab, and add an "active" class to the button that opened the tab
		tab.style.display = "block";
		tabButton.className += " active";
    if(this.#events["change"]) this.#events["change"](tabButton.innerText);
	};
}
/** 
 * @callback TabChangeEventHandler
 * @param {String} tabName
 * @returns {Boolean} block if true
*/