export default class TrelloTokenWrapper {
  static #token = null;
  /**
   * READ-ONLY
   * @returns {String}
   */
  static get token() { return TrelloTokenWrapper.#token; }
  /**
   * Logs in the user and returns the Trello token
   * @param {TrelloObject} t
   * @param {Boolean} silent 
   * @returns {Promise<String>} token 
   */
  static getToken = async(t, silent = false) => {
    if((await t.getRestApi().isAuthorized()) === true) {
      this.#token = await t.getRestApi().getToken();
      return this.#token;
    }
    if(silent) return null;
    // prompt the user
    await t.getRestApi().authorize({ scope: "read,write" })
      .then(function () {
        t.alert({
          message: "You have successfully authorized to Trello.",
          duration: 6
        });
      })
      .catch(TrelloPowerUp.restApiError.AuthDeniedError, function () {
        t.alert({
          message: "⚠️ Authorization to Trello was cancelled!",
          duration: 6
        });
      });
    if ((await t.getRestApi().isAuthorized()) === true) {
      this.#token = await t.getRestApi().getToken();
      return this.#token;
    }
    this.#token = null;
    return null; // failed
  }
}