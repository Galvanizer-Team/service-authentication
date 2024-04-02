import CodedError from "../config/CodedError"

class Cookies {
  constructor(req, res) {
    this.req = req
    this.res = res
  }

  /**
   * Sets a cookie in the response
   */
  set(name, value, options = {}) {
    try {
      this.res.cookie(name, value, options)
      return true
    } catch (error) {
      throw new CodedError(`Error setting cookie: ${error.message}`, 500, "LOG|05")
    }
  }

  setSessionCookie(value) {
    this.set("session", value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
  }

  /**
   * Gets the refresh token from the request cookies
   * @returns {String} - The refresh token or false if not found
   */
  getRefreshToken() {
    try {
      const token = this.req?.cookies?.refreshToken
      return token
    } catch (error) {
      return false
    }
  }

  /**
   * Adds an httpOnly cookie to the response
   * @param {string} name - The name of the cookie
   * @param {*} value - The value of the cookie
   * @param {*} options - The options of the cookie
   * @returns true if the cookie was added, throws an error otherwise
   */
  setHttpOnly(name, value, options = {}) {
    try {
      this.res.cookie(name, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        ...options,
      })
      return true
    } catch (error) {
      throw new CodedError(`Error setting cookie: ${error.message}`, 500, "LOG|05")
    }
  }

  /**
   * Sets the refresh token in the response cookies
   *
   * @param {*} token - The refresh token
   * @returns true if the cookie was added, throws an error otherwise
   */
  setRefreshToken(token) {
    try {
      this.setHttpOnly("refreshToken", token, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
      return true
    } catch (error) {
      throw new CodedError(`Error setting cookie: ${error.message}`, 500, "LOG|05")
    }
  }
}

export default Cookies
