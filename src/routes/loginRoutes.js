import express from "express"
import isEmail from "validator/lib/isEmail"
import normalizeEmail from "validator/lib/normalizeEmail"
import CodedError from "../config/CodedError"
import User from "../classes/usersClass"
import { noAuthLimiter } from "../middleware/rateLimiters"
import Response from "../classes/responseClass"
import Cookies from "../classes/cookiesClass"

const router = express.Router()

router.post("/", noAuthLimiter, async (req, res) => {
  let { email, password } = req.body

  const response = new Response(req, res)

  try {
    if (!password) throw new CodedError("Invalid Password", 400, "LOG|02")
    if (!email || !isEmail(email)) throw new CodedError("Invalid Email", 400, "LOG|01")
    email = normalizeEmail(email, { gmail_remove_subaddress: false })

    const userMethods = new User()
    const user = await userMethods.getUser({ email })
    if (!user) throw new CodedError("User not found", 400, "LOG|03")

    const userId = user.id
    const isPasswordValid = await userMethods.checkPassword(userId, password)
    if (!isPasswordValid) throw new CodedError("Password is incorrect", 400, "LOG|04")

    let token

    if (user?.dataValues?.mfa) {
      token = await userMethods.createHalfSessionToken(userId)
    } else {
      const cookies = new Cookies(req, res)
      token = await userMethods.createSessionToken(userId)
      cookies.setSessionCookie(token)

      const refreshToken = await userMethods.createRefreshToken(userId)
      if (!refreshToken) throw new CodedError("Error creating refresh token", 500, "REG|06")
      cookies.setRefreshToken(refreshToken)
    }
    const tokenBody = JSON.parse(atob(token.split(".")[1]))

    response.setToken(token)
    response.success({ message: "Login successful", data: tokenBody })
  } catch (error) {
    response.error(error)
  }
})

const loginRoutes = router
export default loginRoutes
