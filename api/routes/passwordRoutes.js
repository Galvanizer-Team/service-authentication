import express from "express"
import isEmail from "validator/lib/isEmail"
import isJWT from "validator/lib/isJWT"
import normalizeEmail from "validator/lib/normalizeEmail"
import CodedError from "../config/CodedError"
import Response from "../classes/responseClass"
import JWT from "../classes/jwtClass"
import User from "../classes/usersClass"
import sendEmail from "../utils/sendEmail"
import { noAuthLimiter } from "../middleware/rateLimiters"

const router = express.Router()

router.post("/forgot", noAuthLimiter, async (req, res) => {
  const response = new Response(req, res)
  let { email } = req.body

  try {
    if (!email) throw new CodedError("Email is required", 400, "PAS|01")
    if (!isEmail(email)) throw new CodedError("Invalid Email", 400, "PAS|02")
    email = normalizeEmail(email, { gmail_remove_subaddress: false })

    const userMethods = new User()
    const user = await userMethods.getUser({ email })
    if (!user) throw new CodedError("User not found", 400, "PAS|02")

    const token = await userMethods.createPasswordResetToken(email)

    const emailSent = await sendEmail({
      to: email,
      subject: "Password Reset",
      text: `Click here to reset your password: ${process.env.PASSWORD_RESET_URL}/${token}`,
    })
    if (!emailSent) throw new CodedError("Email failed to send", 500, "PAS|03")

    response.success({ message: "Email sent" })
  } catch (error) {
    response.error(error)
  }
})

router.get("/reset/:token", noAuthLimiter, async (req, res) => {
  const response = new Response(req, res)
  const { token } = req.params

  try {
    if (!token) throw new CodedError("Token is required", 400, "PAS|04")
    if (!isJWT(token)) throw new CodedError("Invalid Token", 400, "PAS|05")

    const jwt = new JWT(process.env.PASSWORD_JWT_PUBLIC, process.env.PASSWORD_JWT_PRIVATE)

    let decoded
    try {
      decoded = await jwt.verify(token)
    } catch (error) {
      throw new CodedError("Verification Failed", 400, "PAS|05")
    }

    const userMethods = new User()
    const user = await userMethods.getUser({ email: decoded.email })
    if (!user) throw new CodedError("User not found", 400, "PAS|06")

    response.success({ message: "Token is valid" })
  } catch (error) {
    response.error(error)
  }
})

router.post("/reset/:token", noAuthLimiter, async (req, res) => {
  const response = new Response(req, res)
  const { token } = req.params
  const { password } = req.body

  try {
    if (!token) throw new CodedError("Token is required", 400, "PAS|07")
    if (!isJWT(token)) throw new CodedError("Invalid Token", 400, "PAS|07")
    if (!password) throw new CodedError("Password is required", 400, "PAS|08")

    const userMethods = new User()

    const resetPassword = await userMethods.resetPassword(token, password)
    if (!resetPassword) throw new CodedError("Password reset failed", 500, "PAS|09")

    response.success({ message: "Password reset successful" })
  } catch (error) {
    response.error(error)
  }
})

const passwordRoutes = router
export default passwordRoutes
