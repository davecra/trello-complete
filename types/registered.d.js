/**
 * VERSION: 1.0.20.20251008
 * DATE: 10/08/2025
 */
/**
 * @function
 * @name initializeRegistrationObject
 * @param {String} appName
 * @param {String} appVersion
 * @param {Boolean} [isBeta]
 * @param {Boolean} [isOfficeOnly]
 * @returns {TrelloBoardRegistration}
 * @description Initializes the v1.09+ Registration Module
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function initializeRegistrationObject(appName, appVersion, isBeta = false, isOfficeOnly = false) {}
/**
 * @description Wrapper for the Kryl Solution website Product Registration functions - encapsulates everything needed
 * @typedef {Object} TrelloBoardRegistration
 * @property {InitFunction}                         init
 * @property {SetupSubscriptionSettingsFunction}    renderSubscriptionStatusSection
 * @property {LockFeatureAndNagFunction}            checkFeatureWithNotification
 * @property {CheckRegistrationFunction}            checkRegistrationWithNotification
 * @property {GetOfficeDialogInfoFunction}          getOfficeDialogInfo
 * @property {Boolean}                              isSubscriptionNeeded
 * @property {Boolean}                              isFeatureAllowed
 * @property {Number}                               maxUserCount
 * @property {TrelloItemsAction}                    nagMenu - ARCHIVED - DO NOT USE
 * @property {TrelloItemsAction}                    trialMenu - ARCHIVED - DO NOT USE
 * @property {ShowTrelloDialogFunction}             showDialog
 * @property {Boolean}                              isTrialUsed
 * @property {GetAdButtonFunction}                  getAdButton
 * @property {ShowRatingFunction}                   showRating - ARCHIVED - DO NOT USE
 * @property {GetOfficeRatingSectionFunction}       getRatingSectionOffice
 * @property {GetRatingSectionFunction}             getRatingSection
 * @property {ShowDisabledFormFunction}             showDisabledForm
 * @property {Boolean}                              hideFeatures
 * @property {ShowFeatureAlertFunction}             showFeatureAlert
 * @property {ShowSubscriptionOverlayFunction}      showSubscriptionOverlay
 * @property {TrelloItemsAction}                    trialConfirmationMenu
 * @property {TrelloItemsAction}                    nagConfirmationMenu
 * @property {TrialConfirmPopupFunction}            trialConfirmPopup
 * @property {NagConfirmPopupFunction}              nagConfirmPopup
 * @property {ShowWelcomeFunction}                  showWelcome
 * @property {Boolean}                              isBusy
 * @property {String}                               instanceId
 * @constructor
 */
/**
 * @callback ShowWelcomeFunction
 * @param {HTMLDivElement} elem
 * @param {OnCloseCallbackHandler} onClose
 */
/**
 * @callback NagConfirmPopupFunction
 * @param {TrelloObject} t 
 * @param {MouseEvent} [e]
 * @param {Boolean} [featureOnly] false is default
 */
/**
 * @callback TrialConfirmPopupFunction
 * @param {TrelloObject} t 
 * @param {MouseEvent} [e]
 */
/**
 * @callback ShowSubscriptionOverlayFunction
 * @param {TrelloObject} t
 * @param {Boolean} [closeModal] - when set the modal/popup is closed
 * @param {(value: Boolean) => void} [hideChecked=() => {}] - Callback
 * @param {Boolean} [isFullPage]
 * @param {() => void} [onClose=() => {}] - Callback
 */
/**
 * @callback ShowFeatureAlertFunction
 * @param {TrelloObject} t
 * @param {String} featureName
 */
/**
 * @callback ShowDisabledFormFunction
 * @param {TrelloObject} t
 */
/**
 * @callback GetRatingSectionFunction
 * @param {String} orgId
 * @param {String} boardId
 * @param {String} memberId
 * @param {HTMLDivElement} ratingsDiv
 */
/**
 * @callback GetOfficeRatingSectionFunction
 * @param {HTMLDivElement} ratingsDiv
 */
/**
 * ARCHIVED -- DO NOT USE
 * This has been replaced with the agnostic getRatingSection
 * @callback ShowRatingFunction
 * @param {TrelloObject} t
 * @param {HTMLDivElement} ratingsDiv
 */
/**
 * @callback GetAdButtonFunction
 * @param {HTMLDivElement} buttonDiv
 * @param {HTMLDivElement} parentDiv
 * @param {OnAdButtonClickHandler} onClick
 * @param {Boolean} [abbr]
 */
/**
 * @callback OnAdButtonClickHandler
 */
/**
 * @callback OnCloseCallbackHandler
 */
/**
 * @callback GetOfficeDialogInfoFunction
 * @param {String} orgName only for Send to Trello
 * @returns {RegistrationSubmission}
 */
/**
 * @callback ShowTrelloDialogFunction
 * @param {TrelloObject} t
 */
/**
 * @callback InitFunction
 * @param {TrelloBoardInitData | OfficeInitData} cdata
 */
/**
 * @typedef {Object} BoardInitData
 * @property {String} idOrg
 * @property {String} idBoard
 * @property {String} boardName
 * @property {String} idMember
 * @property {Number} members
 */
/**
 * @typedef {Object} TrelloBoardRegistrationEventHooks
 * @property {EventCallbackHandler} errorEvent
 * @property {EventCallbackHandler} completedEvent
 * @property {EventCallbackHandler} statusEvent
 * @property {EventCallbackHandler} changeEvent
 */
/**
 * @typedef {Object} TrelloBoardInitData
 * @property {BoardInitData} boardData
 * @property {String} featuresListHtml
 * @property {TrelloBoardRegistrationEventHooks} eventHooks
 */
/**
 * @typedef {Object} OfficeInitData
 * @property {String} email
 * @property {String} appName
 * @property {String} featuresListHtml
 * @property {TrelloBoardRegistrationEventHooks} eventHooks
 */
/**
 * @callback RegistrationResultOnlyFunction
 * @returns {VerifyResultObject}
 */
/**
 * @typedef {Object} VerifyResultObject
 * @property {String} message
 * @property {Boolean} success
 * @property {Boolean} commercial
 * @property {Boolean} registered
 * @property {Boolean} expired
 * @property {Number} status
 * @property {Date} expirationDate
 * @property {String} type
 * @property {TrialInfoType} trialInfo
 */
/**
 * @typedef {Object} TrialInfoType
 * @property {String} message
 * @property {Boolean} isError
 * @property {Date} expirationDate
 * @property {TrialStatusType} status
 */
/**
 * @typedef { "unknown" | "unused" | "active" | "expired" } TrialStatusType
 */
/**
 * @callback EventCallbackHandler
 * @param {String} status
 * @param {String} error
 * @param {Number} result
 */
/**
 * @description Calls the callback if the board for the locked feature is registered, if not, nag the user if true
 * @callback LockFeatureAndNagFunction
 * @param {TrelloObject} t
 * @param {Boolean} [nag]
 * @param {"alert" | "modal"} [type]
 * @param {String} [featureName]
 * @returns {Boolean}
 */
/**
 * @description Sets the HTML section that will fill in the settings page for product subscription and licensing information...
 * @callback SetupSubscriptionSettingsFunction
 * @param {TrelloObject} t
 * @param {HTMLElement} subscriptionButtonElement
 */
/**
 * @description TRELLO ONLY: Check if we have a commercial account, if it is paid or not and nag if it is not
 * @callback CheckRegistrationFunction
 * @param {TrelloObject} t
 * @param {"trello" | "html" | "htmlShort" | "other" | "none"} style
 * @param {HTMLElement} [parentElement] - optional for html - nag bar type only
 */
/**
 * @callback ResizeReadyCallbackFunction
 */
/**
 * @typedef {Object} RegistrationSubmission
 * @property {String} url
 * @property {"commercial" | "feature" | "office" } type
 * @property {import("../common/productRegistration").RegistrationData} data
 * @property {String} html
 * @property {String} board The Board Name
 * @property {SiteLink} link link
 * @property {Boolean} dark for office only - determines dark mode is set
 */
/**
 * @typedef {Object} SiteLink
 * @property {String} board the board Id
 * @property {String} member the member Id
 * @property {String} app  the app name
 */
