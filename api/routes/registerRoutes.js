import express from "express"
import isEmail from "validator/lib/isEmail"
import normalizeEmail from "validator/lib/normalizeEmail"
import isStrongPassword from "validator/lib/isStrongPassword"
import CodedError from "../config/CodedError"
import User from "../classes/usersClass"
import Response from "../classes/responseClass"
import Cookies from "../classes/cookiesClass"
import { noAuthLimiter } from "../middleware/rateLimiters"

const router = express.Router()

router.post("/", noAuthLimiter, async (req, res) => {
  const response = new Response(req, res)
  let { email, password } = req.body

  try {
    const user = new User()

    if (!email || !password) throw new CodedError("Email and password are required", 400, "REG|01")
    if (!isEmail(email)) throw new CodedError("Invalid Email", 400, "REG|02")
    if (!isStrongPassword(password)) throw new CodedError("Invalid Password", 400, "REG|02")
    email = normalizeEmail(email, { gmail_remove_subaddress: false })

    const existingUser = await user.getUser({ email })
    if (existingUser) throw new CodedError("Email already exists", 500, "REG|03")

    const newUser = await user.createUser({ email, password })
    if (!newUser) throw new CodedError("Error creating user", 500, "REG|04")

    const token = await user.createSessionToken(newUser.id)
    if (!token) throw new CodedError("Error creating session token", 500, "REG|05")

    const refreshToken = await user.createRefreshToken(newUser.id)
    if (!refreshToken) throw new CodedError("Error creating refresh token", 500, "REG|06")

    const cookie = new Cookies(req, res)
    const setRefreshCookie = cookie.setRefreshToken(refreshToken)
    if (!setRefreshCookie) throw new CodedError("Error setting refresh token", 500, "REG|07")

    response.setToken(token)
    response.success({ message: "User created", data: newUser })
  } catch (error) {
    response.error(error)
  }
})

const registerRoutes = router
export default registerRoutes
