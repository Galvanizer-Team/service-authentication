"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _AuthFactor = _interopRequireDefault(require("../models/AuthFactor"));
var _User = _interopRequireDefault(require("../models/User"));
var _CodedError = _interopRequireDefault(require("../config/CodedError"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * @typedef {Object} AuthFactorType
 * Options
 * - TOTP
 * - WEBAUTHN
 * - OAUTH
 */

/**
 * @typedef {Object} AuthFactor
 * @property {string} id - The id of the auth factor (UUID, set by the database)
 * @property {string} userId - The id of the user that owns the auth factor
 * @property {AuthFactorType} factor - The type of auth factor (TOTP, SMS, etc.)
 * @property {string} secret - The secret that is used to generate the TOTP
 */
/**
 * Handles the methods for interacitng with the AuthFactor data
 */
class AuthFactor {
  /**
   * Creates an auth record in the database with a secret
   * - Is inactive when created because the user needs to verify it
   *
   * @async
   * @param {string} userId - The id of the user that owns the auth factor
   * @param {AuthFactorType} factor - The type of auth factor (TOTP, SMS, etc.)
   * @param {string} secret - The secret that is used to generate the TOTP
   * @returns {Promise<string|boolean>} The id of the auth factor record or false if it fails
   */
  async createRecord(userId, factor, secret) {
    try {
      const authFactor = await _AuthFactor.default.create({
        userId,
        factor,
        secret,
        verified: false
      });
      return authFactor.dataValues;
    } catch (error) {
      throw new _CodedError.default(error.message, error.status ?? 500, error.location ?? "AUTHFACTOR|01");
    }
  }

  /**
   * Activates an auth factor record
   * - Sets the verified flag to true
   * - Sets the verifiedAt date to the current date
   *
   * @async
   * @param {string} id - The id of the auth factor record
   * @returns {Promise<boolean>} True if the record was activated, false if it fails
   */
  async activateRecord(id) {
    try {
      const authFactor = await _AuthFactor.default.findOne({
        where: {
          id
        }
      });
      if (!authFactor) throw new _CodedError.default("Auth factor not found", 404, "AUTHFACTOR|02");
      await authFactor.update({
        verified: true,
        verifiedAt: new Date()
      });

      // update user mfa flag
      const user = await _User.default.findOne({
        where: {
          id: authFactor.userId
        }
      });
      if (!user) throw new _CodedError.default("User not found", 404, "AUTHFACTOR|03");
      await user.update({
        mfa: true
      });
      return true;
    } catch (error) {
      throw new _CodedError.default(error.message, error.status ?? 500, error.location ?? "AUTHFACTOR|03");
    }
  }

  /**
   * Deletes an auth factor record
   * - if after deletion the user has no auth factors, the user's mfa flag is set to false
   * @async
   * @param {string} id - The id of the auth factor record
   * @returns {Promise<boolean>} True if the record was deleted, false if it fails
   */
  async deleteRecord(id) {
    try {
      const authFactor = await _AuthFactor.default.findOne({
        where: {
          id
        }
      });
      if (!authFactor) throw new _CodedError.default("Auth factor not found", 404, "AUTHFACTOR|04");
      await authFactor.destroy();
      const user = await _User.default.findOne({
        where: {
          id: authFactor.userId
        }
      });
      if (!user) throw new _CodedError.default("User not found", 404, "AUTHFACTOR|05");
      const userAuthFactors = await user.getAuthFactors();
      if (userAuthFactors.length === 0) {
        await user.update({
          mfa: false
        });
      }
      return true;
    } catch (error) {
      throw new _CodedError.default(error.message, error.status ?? 500, error.location ?? "AUTHFACTOR|05");
    }
  }

  /**
   * Deletes all auth factor records for a user and sets the user's mfa flag to false
   *
   * @async
   * @param {string} userId - The id of the user that owns the auth factor
   * @returns {Promise<boolean>} True if the records were deleted, false if it fails
   */
  async disableMFA(userId) {
    try {
      const user = await _User.default.findOne({
        where: {
          id: userId
        }
      });
      if (!user) throw new _CodedError.default("User not found", 404, "AUTHFACTOR|06");
      await user.update({
        mfa: false
      });
      const authFactors = await _AuthFactor.default.getAll({
        where: {
          userId
        }
      });
      if (!authFactors) throw new _CodedError.default("Auth factors not found", 404, "AUTHFACTOR|07");
      authFactors.forEach(async authFactor => {
        await authFactor.destroy();
      });
      return true;
    } catch (error) {
      throw new _CodedError.default(error.message, error.status ?? 500, error.location ?? "AUTHFACTOR|08");
    }
  }
}
var _default = exports.default = AuthFactor;