import express from "express"
import TOTP from "../classes/totpClass"
import Response from "../classes/responseClass"
import CodedError from "../config/CodedError"
import verifyUser from "../middleware/verifyUser"
import User from "../classes/usersClass"
import Cookies from "../classes/cookiesClass"

const router = express.Router()

/**
 * Create TOTP auth factor for user and return URI for QR code
 */
router.post("/create", verifyUser(), async (req, res) => {
  const response = new Response(req, res)

  try {
    const { user } = req
    const totp = new TOTP()
    const totpRecord = await totp.createRecord(user.id)
    const totpURI = totp.getURI(user.email, "Authenticator", totpRecord?.secret)

    response.success({ message: "TOTP created", data: totpURI })
  } catch (error) {
    response.error(error)
  }
})

/**
 * Activate TOTP auth factor for user
 */
router.post("/activate", verifyUser(), async (req, res) => {
  const response = new Response(req, res)
  const { code } = req.body

  try {
    const { user } = req
    const totp = new TOTP()

    const activated = await totp.activateRecord(user.id, code)
    if (!activated) throw new CodedError("Error activating TOTP", 500, "TOTP|07")

    // give user new session token with mfa flag
    const userMethods = new User()
    const sessionToken = await userMethods.createSessionToken(user.id)

    response.setToken(sessionToken)
    response.success({ message: "TOTP activated" })
  } catch (error) {
    response.error(error)
  }
})

/**
 * Verify TOTP auth factor for user, and authenticate the user
 * - User must have a valid session token with "sessionState": "half"
 */
router.post("/verify", async (req, res) => {
  const response = new Response(req, res)
  const { code } = req.body

  try {
    const sessionToken = req.headers.authorization.split(" ")[1]
    const userMethods = new User()

    const halfSessionTokenIsValid = await userMethods.checkHalfSessionToken(sessionToken)
    if (!halfSessionTokenIsValid) throw new CodedError("Invalid session token", 400, "TOTP|05")

    const userId = JSON.parse(atob(sessionToken.split(".")[1])).id

    const totp = new TOTP()
    const isValid = await totp.verify(userId, code)
    if (!isValid) throw new CodedError("Invalid code", 400, "TOTP|08")

    const cookies = new Cookies(req, res)

    const fullSessionToken = await userMethods.createSessionToken(userId)
    if (!sessionToken) throw new CodedError("Error creating session token", 500, "TOTP|09")
    cookies.setSessionCookie(fullSessionToken)

    const refreshToken = await userMethods.createRefreshToken(userId)
    if (!refreshToken) throw new CodedError("Error creating refresh token", 500, "TOTP|10")

    const setRefreshCookie = cookies.setRefreshToken(refreshToken)
    if (!setRefreshCookie) throw new CodedError("Error setting refresh token", 500, "TOTP|11")

    response.setToken(fullSessionToken)
    response.success({ message: "User Session verified" })
  } catch (error) {
    response.error(error)
  }
})

/**
 * Deactivate TOTP auth factor for user
 */
router.post("/disable", verifyUser(), async (req, res) => {
  const response = new Response(req, res)

  try {
    const { user } = req
    const totp = new TOTP()
    const deactivated = await totp.deleteRecord(user.id)
    if (!deactivated) throw new CodedError("Error deactivating TOTP", 500, "TOTP|12")

    response.success({ message: "TOTP deactivated" })
  } catch (error) {
    response.error(error)
  }
})

const totpRoutes = router
export default totpRoutes
