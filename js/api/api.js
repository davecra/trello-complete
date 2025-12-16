// https://github.com/fiatjaf/trello-web#readme
import Trello from 'trello-web';
/**
 * This class is a wrapper object for the Trello API
 */
export default class TrelloAPIWrapper {
  /** @type {Trello} */
  trello = null;
  /** @type {Boolean} */
  initialized = false;
  /** @type {String} */
  instanceID = "";
  /** @type {String} */
  lastError = "";
  /**
   * Constructor
   * @param {String} key 
   * @param {String} token 
   */
  init = (key, token) => {
    this.trello = new Trello(key, token);
    this.initialized = true;
    this.instanceID = this.uuid();
  }
  /**
   * @returns {Boolean}
   */
  get isInitialized () {
    return this.initialized;
  }
  /**
   * Generate a GUID
   * @returns {String}
   */
  uuid = () => {
    const ff = (s) => {
      var pt = (Math.random().toString(16) + "000000000").substring(2, 8);
      return s ? "-" + pt.substring(0, 4) + "-" + pt.substring(4, 4) : pt;
    }
    return ff() + ff(true) + ff(true) + ff();
  }
  /**
   * Gets a list of custom fields for the card
   * @param {String} cardId 
   * @returns {TrelloCardOptions}
   */
  getCardField = async (cardId) => {
    // GET /1/cards/{id}/customFieldItems
    const uri = `/1/cards/${cardId}/customFieldItems`;
    const trelloCard = await this.makeApiCall("get", uri);
    if (trelloCard !== undefined && trelloCard !== null && trelloCard !== "") {
      return trelloCard;
    } else {
      return null;
    }
  }
  /**
   * Returns the latest date the card was marked completed
   * @param {String} cardId 
   * @returns {Date | null}
   */
  getCompletedDate = async (cardId) => {
    try {
      /** @type {TrelloAction[]} */
      const trelloActions = await (await fetch(`https://api.trello.com/1/cards/${cardId}/actions?key=${this.trello.key}&token=${this.trello.token}&pages=19&filter=updateCard`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })).json();
      const result = trelloActions.filter(o => o.data.card.dueComplete === true && o.data.old.dueComplete === false);
      if (result && result.length > 0) return new Date(result[0].date);
    } catch { } // failed to get a date - messy, but swallow it here
    return null;
  }
  /**
   * Gets the plugin data for a specific card
   * @param {String} cardId 
   * @returns {Promise<TrelloPluginData[]>}
   */
  getCardPluginData = async (cardId) => {
    const uri = `/1/cards/${cardId}/pluginData`;
    const trelloData = await this.makeApiCall("get", uri);
    if (trelloData !== undefined && trelloData !== null && trelloData !== "") {
      return trelloData;
    } else {
      return null;
    }
  }
  /**
   * 
   * @param {String} plugInId 
   * @param {String} cardId 
   * @param {'shared' | 'private'} access 
   * @param {String} key 
   * @param {String} defaultValue 
   * @returns {Promise<String>}
   */
  getPlugInValue = async (plugInId, cardId, access, key, defaultValue = null) => {
    const data = await this.getCardPluginData(cardId);
    if (data === undefined && data === null && data === "") return defaultValue;
    var returnValue = defaultValue;
    data.forEach(p => {
      if (p.idPlugin === plugInId && p.access === access) {
        const cardValues = JSON.parse(p.value);
        if (cardValues !== undefined && cardValues !== null && cardValues !== "") {
          returnValue = cardValues[key];
        }
      }
    });
    return returnValue;
  }
  /**
   * Gets the specified card via Trello API
   * https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-get
   * @param {String} cardId 
   * @returns {Promise<TrelloCardOptions>}
   */
  getCard = async (cardId) => {
    const uri = `/1/cards/${cardId}`;
    const trelloCard = await this.makeApiCall("get", uri);
    if (trelloCard !== undefined && trelloCard !== null && trelloCard !== "") {
      return trelloCard;
    } else {
      return null;
    }
  }

  /**
   * Gets all the open cards on the board
   * @param {String} boardId 
   * @returns {TrelloCardOptions[]}
   */
  getCards = async (boardId) => {
    const uri = `/1/boards/${boardId}/cards`;
    const trelloCards = await this.makeApiCall("get", uri);
    if (trelloCards !== undefined && trelloCards !== null && trelloCards !== "") {
      return trelloCards;
    } else {
      return null;
    }
  }
  /**
   * Creates a new card with the Trello API
   * https://developer.atlassian.com/cloud/trello/rest/api-group-cards/
   * @param {TrelloCardOptions} opts 
   * @return {Promise<TrelloCardOptions>}
   */
  createCard = async (opts) => {
    //const params = new URLSearchParams(opts);
    const uri = `/1/cards`;
    const trelloCard = await this.makeApiCall("post", uri, opts);
    if (trelloCard !== undefined && trelloCard !== null && trelloCard !== "") {
      return trelloCard;
    } else {
      return null;
    }
  }
  /**
   * Updates the existing card
   * @param {String} cardId 
   * @param {TrelloCardOptions} data 
   * @returns {Promise<Boolean>}
   */
  updateCard = async (cardId, data) => {
    const uri = `/1/cards/${cardId}`;
    const  response = await this.makeApiCall("put", uri, data);
    if (response !== undefined && response !== null && response !== "") {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Adds a comment to the card
   * @param {String} idCard 
   * @param {String} text
   * @returns {Promise<TrelloCommentOptions>}
   */
  addComment = async (idCard, text) => {
    const uri = `/1/cards/${idCard}/actions/comments`;
    const data = {
      text: text,
    };
    const trelloComment = await this.makeApiCall("post", uri, data);
    if (trelloComment !== undefined && trelloComment !== null && trelloComment !== "") {
      return trelloComment;
    } else {
      return null;
    }
  }
  /**
   * Updates the specified comment
   * @param {String} idComment 
   * @param {String} value 
   * @returns {Promise<Boolean>}
   */
  updateComment = async (idComment, value) => {
    const uri = `/1/actions/${idComment}/text`;
    const comment = await this.makeApiCall("put", uri, { value: value });
    return comment;
  }
  /**
   * Deletes the specified comment
   * @param {String} idComment 
   * @returns {Boolean}
   */
  deleteComment = async (idComment) => {
    const uri = `/1/actions/${idComment}`;
    await this.makeApiCall("delete", uri);
    return true;
  }
  /**
   * Loads the specified comment
   * @param {String} idComment 
   * @returns {TrelloCommentOptions}
   */
  getComment = async (idComment) => {
    const uri = `/1/actions/${idComment}`;
    const trelloComment = await this.makeApiCall("get", uri);
    if (trelloComment !== undefined && trelloComment !== null && trelloComment !== "") {
      return trelloComment;
    } else {
      return null;
    }
  }
  /**
   * Loads the specified attachment
   * @param {String} idCard 
   * @param {String} idAttachment 
   * @returns {TrelloAttachmentDataType}
   */
  getAttachment = async (idCard, idAttachment) => {
    const uri = `/1/cards/${idCard}/attachments/${idAttachment}`;
    /** @type {TrelloAttachmentDataType} */
    const trelloAttachment = await this.makeApiCall("get", uri);
    if (trelloAttachment) {
      return trelloAttachment;
    } else {
      return null;
    }
  }
  /**
   * Loads the specified attachment
   * @param {String} idCard 
   * @returns {TrelloAttachmentDataType[]}
   */
  getAttachments = async (idCard) => {
    const uri = `/1/cards/${idCard}/attachments`;
    /** @type {TrelloAttachmentDataType[]} */
    const trelloAttachments = await this.makeApiCall("get", uri);
    if (trelloAttachments) {
      return trelloAttachments;
    } else {
      return null;
    }
  }
  /**
   * Creates an attachment on the card
   * NOTE: WE handle the full process here due to limitation in Trello-Web
   * @param {String} idCard 
   * @param {String} fileName 
   * @param {String} base64String 
   * @returns {TrelloAttachmentDataType}
   */
  createAttachment = async (idCard, fileName, base64String) => {
    const file = this.#base64ToFile(base64String, fileName);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', fileName);
    formData.append('setCover', 'false');
    formData.append('key', this.trello.key); // Add Trello key
    formData.append('token', this.trello.token); // Add Trello token
    const uri = `https://api.trello.com/1/cards/${idCard}/attachments`;
    try {
      const response = await fetch(uri, {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(`Error uploading attachment: ${result.message}`);
      }
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }  
  /**
   * Convert base64 data to a Blob
   * @param {String} base64String - The base64 string
   * @param {String} fileName - The name of the file to be attached
   * @returns {File} - A File object to be sent as an attachment
   */
  #base64ToFile = (base64String, fileName) => {
    const contentType = this.detectMimeType(base64String, fileName);
    const byteCharacters = window.atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    return new File([blob], fileName, { type: contentType });
  }

  /**
   * Adds a URL to the card
   * @param {String} idCard 
   * @param {String} url 
   */
  createUrl = async (idCard, name, url) => {
    const uri = `/1/cards/${idCard}/attachments`;
    const data = {
      name: name,
      url: url,
    }
    const trelloUrl = await this.makeApiCall("post", uri, data);
    return trelloUrl;
  }
  /**
   * Loads all the comments on a given card - and it does this in batches
   * of 50 cards at a time until all are loaded for the specified card
   * @param {String} idCard 
   * @returns {Promise<TrelloCommentOptions[]>}
   */
  getAllComments = async (idCard) => {
    /** @type {TrelloCommentOptions[]} */
    let allComments = [];
    /** @type {String} */
    let before = null;
    /** @type {Number} */
    const limit = 50;
    while (true) {
      /** @type {Object} */
      const params = new URLSearchParams({
        filter: "commentCard",
        limit: limit.toString(),
        ...(before ? { before } : {}),
      });
      /** @type {String} */
      const uri = `/1/cards/${idCard}/actions`;
      /** @type {TrelloCommentOptions[]} */
      const batch = await this.makeApiCall("get", uri, params);
      if (!batch || batch.length === 0) break;
      allComments.push(...batch);
      before = batch[batch.length - 1].id;
      if (batch.length < limit) break;
    }
    if (allComments !== undefined && allComments !== null && allComments.length >= 0) {
      return allComments;
    } else {
      return null;
    }
  }
  /**
   * Returns a list of Trello Cards that are archived
   * @param {String} idBoard 
   * @returns {Promise<TrelloCardOptions[]>}
   */
  getArchivedCards = async (idBoard) => {
    const uri = `/1/board/${idBoard}/cards/closed`;
    const trelloCards = await this.makeApiCall("get", uri);
    if (trelloCards !== undefined && trelloCards !== null && trelloCards !== "") {
      return trelloCards;
    } else {
      return null;
    }
  }
  /**
   * Checks to see if the comment is LOCKED by another user
   * @param {String} idComment 
   * @returns {Promise<Boolean>}
   */
  hasLock = async (idComment) => {
    const uri = `/1/actions/${idComment}/reactions`; // get
    const trelloReaction = await this.makeApiCall("get", uri);
    if (trelloReaction !== undefined && trelloReaction !== null && trelloReaction !== "") {
      return trelloReaction.length > 0;
    } else {
      return false;
    }
  }
  /**
   * Places a reaction on the comment and then returns the reaction id
   * @param {String} idComment 
   * @return {String}
   */
  addLock = async (idComment) => {
    const uri = `/1/actions/${idComment}/reactions`; // post
    const trelloReaction = await this.makeApiCall("post", uri, { shortName: "+1" });
    if (trelloReaction !== undefined && trelloReaction !== null && trelloReaction !== "") {
      return trelloReaction.id;
    } else {
      return null;
    }
  }
  /**
   * Deletes the reaction thus UNLOCKING the comment
   * @param {String} idComment 
   * @param {String} idLock 
   * @returns {Boolean}
   */
  deleteLock = async (idComment, idLock) => {
    const uri = `/1/actions/${idComment}/reactions/${idLock}`; // delete
    await this.makeApiCall("delete", uri);
    return true;
  }
  /**
   * Returns the list on a given board
   * @param {String} idBoard 
   * @returns {TrelloListOptions[]} 
   */
  getBoardCheckLists = async (idBoard) => {
    const uri = `/1/boards/${idBoard}/checklists`; // get
    const trelloLists = await this.makeApiCall("get", uri);
    if (trelloLists !== undefined && trelloLists !== null && trelloLists !== "") {
      return trelloLists;
    } else {
      return null;
    }
  }
  /**
   * Returns the list on a given board
   * @param {String} idCard 
   * @returns {TrelloListOptions[]} 
   */
  getCardCheckLists = async (idCard) => {
    const uri = `/1/cards/${idCard}/checklists`; // get
    const trelloLists = await this.makeApiCall("get", uri);
    if (trelloLists !== undefined && trelloLists !== null && trelloLists !== "") {
      return trelloLists;
    } else {
      return null;
    }
  }
  /**
   * Creates a new item on the specified checklist
   * @param {String} idCheckList 
   * @param {String} value 
   * @returns {TrelloCheckItem}
   */
  addItemToCheckList = async (idCheckList, value, checked) => {
    const uri = `/1/checklists/${idCheckList}/checkItems`; // POST
    const trelloCheck = await this.makeApiCall("post", uri, { name: value, checked: checked !== undefined ? checked : false });
    if (trelloCheck !== undefined && trelloCheck !== null && trelloCheck !== "") {
      return trelloCheck;
    } else {
      return null;
    }
  }
  /**
   * Creates the name
   * @param {String} idCard 
   * @param {String} name 
   * @returns {TrelloCheckList}
   */
  addCheckList = async (idCard, name) => {
    const uri = `/1/checklists?idCard=${idCard}&name=${name}`;
    const trelloCheckList = await this.makeApiCall("post", uri);
    if (trelloCheckList !== undefined && trelloCheckList !== null && trelloCheckList !== "") {
      return trelloCheckList;
    } else {
      return trelloCheckList;
    }
  }
  /**
   * Permanently deletes a Trello card
   * @param {String} idCard - The ID of the card to delete
   * @returns {Promise<Object>} The API response from Trello
   */
  deleteCard = async (idCard) => {
    const uri = `/1/cards/${idCard}`;
    const response = await this.makeApiCall("delete", uri);
    // Return the response regardless of content
    return response;
  };
  /**
   * 
   * @param {'get' | 'put' | 'post' | 'delete' | 'post-url'} type 
   * @param {String} uri 
   * @param {Object} data
   * @returns {Promise<TrelloCardOptions>}
   */
  makeApiCall = async (type, uri, data) => {
    try {
      if (!this.trello) throw "Trello API is not initialized!";
      const baseParams = new URLSearchParams({
        key: this.trello.key,
        token: this.trello.token,
      });
      if (data && data instanceof URLSearchParams) {
        const extraParams = new URLSearchParams(data);
        for (const [k, v] of extraParams.entries()) {
          baseParams.append(k, v);
        }
      }
      switch (type) {
        case "get":
          const fullUri = `https://api.trello.com${uri}?${baseParams.toString()}`;
          const getResponse = await fetch(fullUri);
          if (getResponse && getResponse.status === 200) {
            return getResponse.json();
          } else {
            return null;
          }
        case "delete":
          // the trello-web library does not have a DELETE, therefore we cannot
          // perform a --> return await trello.delete(uri);
          const deleteUri = `https://api.trello.com${uri}?key=${this.trello.key}&token=${this.trello.token}`;
          const deleteResponse = await fetch(deleteUri, { method: 'delete' });
          return deleteResponse.status === 200;
        case "post":
          return await this.trello.post(uri, data !== undefined ? data : null);
        case "post-url":
          var url = `https://api.trello.com${uri}&key=${this.trello.key}&token=${this.trello.token}`;
          const postUrlResponse = await fetch(url, { method: 'post' });
          return postUrlResponse;
        case "put":
          const putResponse = await this.trello.put(uri, (data !== undefined && data !== null) ? data : null);
          return putResponse.status === 200;
      }
    } catch (e) {
      if (e && typeof e === "string" && e?.toLowerCase()?.indexOf("invalid token") > 0) {
        console.error("Invalid token detected.");
      }
      console.error(e);
      this.lastError = e;
      return null;
    }
  }
  /**
   * Returns the data type based on the base64 string
   * @param {String} base64String
   * @param {String} fileName
   * @returns {String}
   */
  detectMimeType = (base64String, fileName) => {
    var ext = fileName.substring(fileName.lastIndexOf(".") + 1);
    if (ext === undefined || ext === null || ext === "") ext = "bin";
    ext = ext.toLowerCase();
    const signatures = {
      JVBERi0: "application/pdf",
      R0lGODdh: "image/gif",
      R0lGODlh: "image/gif",
      iVBORw0KGgo: "image/png",
      TU0AK: "image/tiff",
      "/9j/": "image/jpg",
      UEs: "application/vnd.openxmlformats-officedocument.",
      PK: "application/zip",
    };
    for (var s in signatures) {
      if (base64String.indexOf(s) === 0) {
        var x = signatures[s];
        // if an office file format
        if (ext.length > 3 && ext.substring(0, 3) === "ppt") {
          x += "presentationml.presentation";
        } else if (ext.length > 3 && ext.substring(0, 3) === "xls") {
          x += "spreadsheetml.sheet";
        } else if (ext.length > 3 && ext.substring(0, 3) === "doc") {
          x += "wordprocessingml.document";
        }
        // return
        return x;
      }
    }
    // if we are here we can only go off the extensions
    const extensions = {
      xls: "application/vnd.ms-excel",
      ppt: "application/vnd.ms-powerpoint",
      doc: "application/msword",
      xml: "text/xml",
      mpeg: "audio/mpeg",
      mpg: "audio/mpeg",
      txt: "text/plain",
      eml: "message/rfc822",
      msg: "application/vnd.ms-outlook",
    };
    for (var e in extensions) {
      if (ext.indexOf(e) === 0) {
        var xx = extensions[e];
        return xx;
      }
    }
    // if we are here - not sure what type this is
    return "unknown";
  }
  /**
   * Try until we get a valid result from the Trello API
   * @param {String} id 
   * @returns 
   */
  waitTrelloApiCardCreateCompleted = (id) => {
    let count = 5; // 1.5 seconds total wait
    return new Promise((resolve) => {
      const intervalId = window.setInterval(async ()=>{
        const card = await this.getCard(id);
        if (card && card.id === id) {
          window.clearInterval(intervalId);
          resolve(true);
        }
        count--;
        if(count <= 0) {
          window.clearInterval(intervalId);
          resolve(false);
        }
      }, 300);
    });
  }
}
/** 
 * @typedef {Object} TrelloCardOptions 
 * @property {String} idList
 * @property {String} id
 * @property {String} name
 * @property {String} desc
 * @property {Boolean} closed
 * @property {Boolean} attachments 
 * @property {String[]} attachment_fields
 * @property {String} dateLastActivity
 * @property {String} shortUrl
 * @property {Date} due
 * @property {Boolean} dueComplete
 * @property {Number} dueReminder
 * @property {"top" | Number} pos
 * @property {String[]} idLabels
*/
/**
 * @typedef TrelloCommentOptions
 * @property {String} id
 * @property {TrelloMemberObject} memberCreator
 * @property {String} idMemberCreator
 * @property {TrelloCommentData} data;
 */
/**
 * @typedef TrelloCommentData
 * @property {String} text
 */
/**
 * @typedef TrelloListOptions
 * @property {String} id
 * @property {String} name
 * @property {TrelloCheckOption[]} checkItems
 */
/**
 * @typedef TrelloCheckOption
 * @property {String} id
 * @property {String} name
 * @property {"complete" | "incomplete"} state
 */
/**
 * @typedef {Object} TrelloAttachmentOptions
 * @property {String} id
 * @property {String} bytes
 * @property {String} name
 * @property {String} url
 * @property {Boolean} isUpload
 */
/**
 * @typedef {Object} TrelloCheckItem
 * @property {String} id
 * @property {String} name
 * @property {Boolean} checked
 */
/**
 * @typedef {Object} TrelloCheckList
 * @property {String} id
 * @property {String} name
 */
/**
 * @typedef {Object} TrelloPluginData
 * @property {'shared' | 'private'} access
 * @property {String} idPlugin
 * @property {'card'} scope
 * @property {Object.<String, String>} value
 */
/**
 * @typedef {Object} TrelloAction
 * @property {String} id
 * @property {String} idMemberCreator
 * @property {TrelloActionData} data
 * @property {'updateCard' | 'createCard'} type
 * @property {String} date
 * @property {Object} limits 
 * @property {Object} display
 * @property {Object} memberCreator
 */
/**
 * @typedef {Object} TrelloActionData
 * @property {String} text
 * @property {TrelloCard} card
 * @property {TrelloCard} old
 * @property {TrelloList} list
 * @property {TrelloBoard} board
 */