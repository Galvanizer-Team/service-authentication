/* eslint-disable import/no-extraneous-dependencies */
import * as OTPAuth from "otpauth"
import crypto from "crypto"
import base32 from "hi-base32"
import AuthFactor from "./authFactorClass"
import User from "../../models/User"
import CodedError from "../config/CodedError"

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
      const secret = crypto.randomBytes(32).toString("hex")
      const encodedSecret = base32.encode(secret)
      console.log("HERE's YOUR SECRET", encodedSecret)

      return encodedSecret
    } catch (error) {
      throw new CodedError(error.message, error.status ?? 500, error.location ?? "TOTPc|01")
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
        period: 30,
      })

      const uri = totp.toString()
      return uri
    } catch (error) {
      throw new CodedError(error.message, error.status ?? 500, error.location ?? "TOTPc|02")
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
      const user = await User.findOne({ where: { id: userId } })
      if (!user) throw new CodedError("User not found", 404, "TOTPc|03")

      const userAuthFactors = await user.getAuthFactors()
      const totpAuthFactor = userAuthFactors.find((authFactor) => authFactor.factor === "TOTP")
      if (!totpAuthFactor) throw new CodedError("TOTP auth factor not found", 404, "TOTPc|04")

      const totp = new OTPAuth.TOTP({
        issuer: "Authenticator",
        label: user.email,
        algorithm: "SHA256",
        digits: 6,
        secret: totpAuthFactor.secret,
        period: 30,
      })

      const delta = totp.validate({ token: code, window: 1 })
      const isValid = delta === 0 || delta === 1 || delta === -1

      if (!isValid) throw new CodedError("Invalid code", 400, "TOTPc|051")
      return true
    } catch (error) {
      throw new CodedError(error.message, error.status ?? 500, error.location ?? "TOTPc|05")
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
      const user = await User.findOne({ where: { id: userId } })
      if (!user) throw new CodedError("User not found", 404, "TOTPc|06")

      const userAuthFactors = await user.getAuthFactors()
      const userHasTOTPFactor = userAuthFactors.some((authFactor) => authFactor.factor === "TOTP")
      if (userHasTOTPFactor) throw new CodedError("User already has a TOTP auth factor", 400, "TOTPc|07")

      const secret = this.generateSecret()
      const authFactorMethods = new AuthFactor()
      const authFactor = await authFactorMethods.createRecord(userId, "TOTP", secret)

      return authFactor
    } catch (error) {
      throw new CodedError(error.message, error.status ?? 500, error.location ?? "TOTPc|08")
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
      const secretIsValid = await this.verify(userId, code)
      if (!secretIsValid) throw new CodedError("Invalid code", 400, "TOTPc|09")

      const user = await User.findOne({ where: { id: userId } })
      if (!user) throw new CodedError("User not found", 404, "TOTPc|10")

      const userAuthFactors = await user.getAuthFactors()
      const totpAuthFactor = userAuthFactors.find((authFactor) => authFactor.factor === "TOTP")
      if (!totpAuthFactor) throw new CodedError("TOTP auth factor not found", 404, "TOTPc|11")

      const authFactorMethods = new AuthFactor()
      const updated = await authFactorMethods.activateRecord(totpAuthFactor.id)

      return updated
    } catch (error) {
      throw new CodedError(error.message, error.status ?? 500, error.location ?? "TOTPc|12")
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
      const user = await User.findOne({ where: { id: userId } })
      if (!user) throw new CodedError("User not found", 404, "TOTPc|13")

      const userAuthFactors = await user.getAuthFactors()
      const totpAuthFactor = userAuthFactors.find((authFactor) => authFactor.factor === "TOTP")
      if (!totpAuthFactor) throw new CodedError("TOTP auth factor not found", 404, "TOTPc|14")

      const authFactorMethods = new AuthFactor()
      const deleted = await authFactorMethods.deleteRecord(totpAuthFactor.id)

      return deleted
    } catch (error) {
      throw new CodedError(error.message, error.status ?? 500, error.location ?? "TOTPc|15")
    }
  }
}

export default TOTP
