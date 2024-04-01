"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var OTPAuth = _interopRequireWildcard(require("otpauth"));
var _crypto = _interopRequireDefault(require("crypto"));
var _hiBase = _interopRequireDefault(require("hi-base32"));
var _authFactorClass = _interopRequireDefault(require("./authFactorClass"));
var _User = _interopRequireDefault(require("../models/User"));
var _CodedError = _interopRequireDefault(require("../config/CodedError"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/* eslint-disable import/no-extraneous-dependencies */

/**
 * Methods for handling TOTP authentication
 */
class TOTP {
  /**
   * Generates a secret that is used to generate the TOTP
   * - The secret will be stored in the AuthFactor table and associated with a user
   *
   * @returns {string} The secret
   */
  generateSecret() {
    try {
      const secret = _crypto.default.randomBytes(32).toString("hex");
      const encodedSecret = _hiBase.default.encode(secret);
      console.log("HERE's YOUR SECRET", encodedSecret);
      return encodedSecret;
    } catch (error) {
      throw new _CodedError.default(error.message, error.status ?? 500, error.location ?? "TOTPc|01");
    }
  }

  /**
   * Generates a URI that is used to generate the QR code
   * - does not include the secret
   *
   * @param {string} label - The label that will be displayed on the authenticator app
   * @param {string} issuer - The issuer that will be displayed on the authenticator app
   * @returns {string} The URI
   */
  getURI(label, issuer, secret) {
    try {
      const totp = new OTPAuth.TOTP({
        issuer,
        label,
        algorithm: "SHA256",
        secret,
        digits: 6,
        period: 30
      });
      const uri = totp.toString();
      return uri;
    } catch (error) {
      throw new _CodedError.default(error.message, error.status ?? 500, error.location ?? "TOTPc|02");
    }
  }
  generateRecoveryCodes() {}

  /**
   * Verifies a TOTP code
   * - Checks if the code is valid
   *
   * @async
   * @param {string} userId - The id of the user that owns the auth factor
   * @param {string} code - The code that will be verified
   * @returns {Promise<boolean>} True if the code is valid, false if it is not
   */
  async verify(userId, code) {
    try {
      const user = await _User.default.findOne({
        where: {
          id: userId
        }
      });
      if (!user) throw new _CodedError.default("User not found", 404, "TOTPc|03");
      const userAuthFactors = await user.getAuthFactors();
      const totpAuthFactor = userAuthFactors.find(authFactor => authFactor.factor === "TOTP");
      if (!totpAuthFactor) throw new _CodedError.default("TOTP auth factor not found", 404, "TOTPc|04");
      const totp = new OTPAuth.TOTP({
        issuer: "Authenticator",
        label: user.email,
        algorithm: "SHA256",
        digits: 6,
        secret: totpAuthFactor.secret,
        period: 30
      });
      const delta = totp.validate({
        token: code,
        window: 1
      });
      const isValid = delta === 0 || delta === 1 || delta === -1;
      if (!isValid) throw new _CodedError.default("Invalid code", 400, "TOTPc|051");
      return true;
    } catch (error) {
      throw new _CodedError.default(error.message, error.status ?? 500, error.location ?? "TOTPc|05");
    }
  }
  verifyRecoveryCode() {}

  /**
   * Creates a TOTP auth factor record for a user
   * - Is inactive when created because the user needs to verify it
   * - Verifies the user exists, and does not already have a TOTP auth factor
   *
   * @async
   * @param {*} userId
   * @returns {Promise<string|boolean>} The id of the auth factor record or false if it fails
   */
  async createRecord(userId) {
    try {
      const user = await _User.default.findOne({
        where: {
          id: userId
        }
      });
      if (!user) throw new _CodedError.default("User not found", 404, "TOTPc|06");
      const userAuthFactors = await user.getAuthFactors();
      const userHasTOTPFactor = userAuthFactors.some(authFactor => authFactor.factor === "TOTP");
      if (userHasTOTPFactor) throw new _CodedError.default("User already has a TOTP auth factor", 400, "TOTPc|07");
      const secret = this.generateSecret();
      const authFactorMethods = new _authFactorClass.default();
      const authFactor = await authFactorMethods.createRecord(userId, "TOTP", secret);
      return authFactor;
    } catch (error) {
      throw new _CodedError.default(error.message, error.status ?? 500, error.location ?? "TOTPc|08");
    }
  }

  /**
   * User must verify the TOTP auth factor before it can be used
   * - Sets the verified flag to true
   *
   * @async
   * @param {string} userId - The id of the user that owns the auth factor
   * @param {string} code - The code that will be verified
   * @returns {Promise<boolean>} True if the record was activated, false if it fails
   */
  async activateRecord(userId, code) {
    try {
      const secretIsValid = await this.verify(userId, code);
      if (!secretIsValid) throw new _CodedError.default("Invalid code", 400, "TOTPc|09");
      const user = await _User.default.findOne({
        where: {
          id: userId
        }
      });
      if (!user) throw new _CodedError.default("User not found", 404, "TOTPc|10");
      const userAuthFactors = await user.getAuthFactors();
      const totpAuthFactor = userAuthFactors.find(authFactor => authFactor.factor === "TOTP");
      if (!totpAuthFactor) throw new _CodedError.default("TOTP auth factor not found", 404, "TOTPc|11");
      const authFactorMethods = new _authFactorClass.default();
      const updated = await authFactorMethods.activateRecord(totpAuthFactor.id);
      return updated;
    } catch (error) {
      throw new _CodedError.default(error.message, error.status ?? 500, error.location ?? "TOTPc|12");
    }
  }

  /**
   * Deletes a TOTP auth factor record for a user
   *
   * @async
   * @param {*} userId
   * @returns {Promise<boolean>} True if the record was deleted, false if it fails
   */
  async deleteRecord(userId) {
    try {
      const user = await _User.default.findOne({
        where: {
          id: userId
        }
      });
      if (!user) throw new _CodedError.default("User not found", 404, "TOTPc|13");
      const userAuthFactors = await user.getAuthFactors();
      const totpAuthFactor = userAuthFactors.find(authFactor => authFactor.factor === "TOTP");
      if (!totpAuthFactor) throw new _CodedError.default("TOTP auth factor not found", 404, "TOTPc|14");
      const authFactorMethods = new _authFactorClass.default();
      const deleted = await authFactorMethods.deleteRecord(totpAuthFactor.id);
      return deleted;
    } catch (error) {
      throw new _CodedError.default(error.message, error.status ?? 500, error.location ?? "TOTPc|15");
    }
  }
}
var _default = exports.default = TOTP;