import isJWT from "validator/lib/isJWT"
import CodedError from "../config/CodedError"
import User from "../classes/usersClass"
import Cookies from "../classes/cookiesClass"
import Response from "../classes/responseClass"

/**
 * Middleware to verify a user's session
 * @param  {...string} capabilities - The capabilities required to access the route
 */

function verifyUser(...capabilities) {
  return async function verifyUserInner(req, res, next) {
    const response = new Response(req, res)

    let token = req.headers?.authorization?.split(" ")?.[1] // Bearer <token>

    try {
      if (!token) throw new CodedError("Session Token is required", 400, "VERIFY|01")
      if (!isJWT(token)) throw new CodedError("Session Token is invalid", 400, "VERIFY|02")

      const userMethods = new User()
      const userTokenIsValid = await userMethods.checkSessionToken(token)

      const tokenContent = JSON.parse(atob(token.split(".")[1]))
      if (tokenContent.sessionState !== "full") throw new CodedError("Session Token is invalid", 400, "VERIFY|021")

      if (!userTokenIsValid) {
        const cookies = new Cookies(req, res)
        const refreshToken = cookies.getRefreshToken()
        const newTokens = await userMethods.refreshSessionToken(refreshToken)

        token = newTokens.sessionToken
        req.token = newTokens.sessionToken
        cookies.setRefreshToken(newTokens.refreshToken)
      }

      req.user = JSON.parse(atob(token.split(".")[1]))

      if (!capabilities.length) return next()

      const userHasCapabilities = await userMethods.hasCapabilities(req.user.id, ...capabilities)
      if (!userHasCapabilities) throw new CodedError("User does not have required capabilities", 403, "VERIFY|03")

      next()
    } catch (error) {
      response.error(error)
    }
  }
}

export default verifyUser
