export default class TrelloFrame {
  /**
   * Opens a Trello popup while bypassing Trello's broken `args` handling.
   *
   * @param {TrelloObject} t
   * @param {TrelloPopupIFrameOptions} options
   * @returns {Promise<unknown>}
   */
  static openPopup(t, options) {
    return t.popup(this.#normalizeOptions(options));
  }
  /**
   * Opens a Trello modal while bypassing Trello's broken `args` handling.
   *
   * @param {TrelloObject} t
   * @param {TrelloModalOptions} options
   * @returns {Promise<unknown>}
   */
  static openModal(t, options) {
    return t.modal(this.#normalizeOptions(options));
  }
  /**
   * Reads an argument from the current iframe URL.
   *
   * @param {string} name
   * @param {*} [defaultValue]
   * @returns {*}
   */
  static getArg(name, defaultValue = undefined) {
    const params = new URLSearchParams(window.location.search);
    if (!params.has(name)) {
      return defaultValue;
    }
    const values = params.getAll(name);
    if (values.length > 1) {
      return values.map((value) => this.#deserialize(value));
    }
    return this.#deserialize(values[0], defaultValue);
  }
  /**
   * Converts Trello `args` into query-string values.
   *
   * @param {object} options
   * @returns {object}
   */
  static #normalizeOptions(options) {
    const normalized = {
      ...options,
    };
    if (
      normalized.args &&
      typeof normalized.args === "object" &&
      !Array.isArray(normalized.args)
    ) {
      normalized.url = this.#appendArgsToUrl(
        normalized.url,
        normalized.args
      );
      delete normalized.args;
    }
    return normalized;
  }
  /**
   * Adds argument values to the URL query string without disturbing
   * Trello's signed hash/context.
   *
   * @param {string} rawUrl
   * @param {Record<string, unknown>} args
   * @returns {string}
   */
  static #appendArgsToUrl(rawUrl, args) {
    const [urlWithoutHash, existingHash = ""] =
      String(rawUrl).split("#", 2);
    const url = new URL(
      urlWithoutHash,
      window.location.href
    );
    for (const [key, value] of Object.entries(args)) {
      if (value === undefined || value === null) {
        continue;
      }
      url.searchParams.delete(key);
      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(
            key,
            this.#serialize(item)
          );
        }
        continue;
      }
      url.searchParams.set(
        key,
        this.#serialize(value)
      );
    }
    const relativeOrAbsoluteUrl =
      this.#restoreUrlStyle(rawUrl, url);
    return (
      relativeOrAbsoluteUrl +
      (existingHash ? `#${existingHash}` : "")
    );
  }
  /**
   * Serializes an argument for query-string transport.
   *
   * @param {*} value
   * @returns {string}
   */
  static #serialize(value) {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  }
  /**
   * Deserializes an argument from the query string.
   *
   * Objects and arrays are restored from JSON. Primitive strings remain
   * strings unless the supplied default value establishes another type.
   *
   * @param {string} value
   * @param {*} [defaultValue]
   * @returns {*}
   */
  static #deserialize(value, defaultValue = undefined) {
    if (value === null) {
      return defaultValue;
    }
    if (typeof defaultValue === "boolean") {
      if (value === "true") {
        return true;
      }
      if (value === "false") {
        return false;
      }
      return defaultValue;
    }
    if (typeof defaultValue === "number") {
      const parsed = Number(value);
      return Number.isNaN(parsed)
        ? defaultValue
        : parsed;
    }
    const trimmed = value.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        return JSON.parse(trimmed);
      } catch {
        // Preserve the original string.
      }
    }
    return value;
  }
  /**
   * Keeps relative URLs relative and absolute URLs absolute.
   *
   * @param {string} originalUrl
   * @param {URL} parsedUrl
   * @returns {string}
   */
  static #restoreUrlStyle(originalUrl, parsedUrl) {
    const original = String(originalUrl);
    if (/^[a-z][a-z\d+\-.]*:/i.test(original)) {
      return parsedUrl.toString();
    }
    if (original.startsWith("//")) {
      return `//${parsedUrl.host}${parsedUrl.pathname}${parsedUrl.search}`;
    }
    if (original.startsWith("/")) {
      return `${parsedUrl.pathname}${parsedUrl.search}`;
    }
    const originalPath = original.split("?")[0];
    const filename = originalPath.substring(
      originalPath.lastIndexOf("/") + 1
    );
    const prefix = originalPath.substring(
      0,
      originalPath.length - filename.length
    );
    return `${prefix}${filename}${parsedUrl.search}`;
  }
}
