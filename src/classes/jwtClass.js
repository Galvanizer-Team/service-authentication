import jwt from "jsonwebtoken"
import CodedError from "../config/CodedError"
import Token from "../../models/Token"

/**
 * The Standard payload for a JWT token
 * @typedef {Object} JWTToken
 * @property {String} id - The user id
 * @property {String} email - The user email
 * @property {String} role - The user role
 */

class JWT {
  /**
   * Creates a new JWT instance
   * @param {String} secret - The secret to sign the JWT token (default: process.env.JWT_SECRET)
   * @returns {JWT} - The JWT instance
   */

  constructor(publicKey, privateKey) {
    this.publicKey = publicKey || process.env.JWT_PUBLIC
    this.privateKey = privateKey || process.env.JWT_PRIVATE

    if (!this.publicKey || !this.privateKey) throw new CodedError("Invalid key configuration", 500, "JWT|00")
  }

  /**
   * Returns a signed JWT token
   * @async
   * @param {JWTToken} payload - The payload to be signed: { id: String, email: String, role: String }
   * @param {String} expiresIn - The expiration time of the token (default: "1h")
   * @returns {Promise<String>} - The signed JWT token
   */
  async sign(payload, expiresIn = "1m") {
    const token = jwt.sign(payload, this.privateKey, { expiresIn, algorithm: "RS256" })
    const expiresUnix = jwt.decode(token).exp
    const expires = new Date(expiresUnix * 1000)

    const logToken = await Token.create({
      token,
      expires,
    })
    if (!logToken) throw new CodedError("Error logging token", 500, "JWT|05")

    return token
  }

  /**
   * Returns the payload of a JWT token
   * @async
   * @param {String} token - The JWT token
   * @returns {Promise<JWTToken>} - The payload of the token
   */
  async verify(token) {
    try {
      const tokenExists = await Token.findOne({ where: { token } })
      if (!tokenExists) throw new CodedError("Token not found", 400, "JWT|02")

      if (tokenExists.blacklisted) throw new CodedError("Token is blacklisted", 400, "JWT|03")

      return jwt.verify(token, this.publicKey, { algorithms: ["RS256"] })
    } catch (error) {
      return new CodedError(error.message, 400, "JWT|01")
    }
  }

  /**
   * Blacklists a JWT token
   * @async
   * @param {String} token - The JWT token
   * @returns {Promise<Boolean>} - True if the token was blacklisted
   */
  async blacklist(token) {
    try {
      let tokenExists = await Token.findOne({ where: { token } })
      if (!tokenExists) {
        const decodedToken = jwt.decode(token)
        tokenExists = await Token.create({
          token,
          expires: decodedToken.exp,
        })
      }

      tokenExists.blacklisted = true
      await tokenExists.save()

      return true
    } catch (error) {
      throw new CodedError(error.message, 400, "JWT|04")
    }
  }
}

export default JWT
