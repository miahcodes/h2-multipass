export {};

/**
 * @typedef {{
 *   redirect: boolean;
 *   return_to: string;
 * }} MultipassOptions
 */
/** @typedef {MultipassOptions} MultipassRequestBody */
/**
 * @typedef {Object} MultipassResponse
 * @property {string|null} url
 * @property {string|null} token
 * @property {string|null} [error]
 */
/**
 * @typedef {Object} MultipassCustomer
 * @property {string} email
 * @property {string} return_to
 */
/**
 * @typedef {Object} MultipassCustomerData
 * @property {MultipassCustomer} [customer]
 */
/**
 * @typedef {Object} NotAuthResponseType
 * @property {string|null} url
 * @property {string|null} error
 */
/**
 * @typedef {Object} QueryError
 * @property {string} message
 * @property {string} code
 * @property {string} field
 */
/**
 * @typedef {Object} CustomerInfoType
 * @property {string} email
 * @property {string} return_to
 */
/**
 * @typedef {Object} CustomerDataResponseType
 * @property {MultipassRequestBody} data
 * @property {string|null} errors
 */
/**
 * @typedef {Object} NotLoggedInResponseType
 * @property {string|null} url
 * @property {string|null} error
 */
/**
 * @typedef {Object} MultipassTokenResponseType
 * @property {Object} data
 * @property {string} data.url
 * @property {string} data.token
 * @property {string|null} error
 */
