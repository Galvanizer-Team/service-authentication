import express from "express"
import jwt from "jsonwebtoken"
import { User } from "../database/User"
import sendEmail from "../utils/sendEmail"
import CodedError from "../config/CodedError"
import bcrypt from "bcryptjs"

const router = express.Router()

router.post("/forgot", async (req, res, next) => {
  const { email } = req.body

  try {
    if (!email) throw new CodedError("Email is required", 400, "PAS|01")

    const user = await User.findOne({ where: { email } })
    if (!user) throw new CodedError("User not found", 400, "PAS|02")

    const tokenBody = { id: user.dataValues.id, email: user.dataValues.email }
    const token = jwt.sign(tokenBody, process.env.PWD_SECRET, {
      expiresIn: "1h",
    })

    const emailSent = await sendEmail({
      to: user.dataValues.email,
      subject: "Password Reset",
      text: `Click here to reset your password: ${process.env.PASSWORD_RESET_URL}/${token}`,
    })
    if (!emailSent) throw new CodedError("Email failed to send", 500, "PAS|03")

    res.status(200).json({ sucess: true, email })
  } catch (error) {
    next(error)
  }
})

router.get("/reset/:token", async (req, res, next) => {
  const { token } = req.params

  try {
    if (!token) throw new CodedError("Token is required", 400, "PAS|04")

    let decoded
    try {
      decoded = jwt.verify(token, process.env.PWD_SECRET)
    } catch (error) {
      throw new CodedError("Verification Failed", 400, "PAS|05")
    }

    const user = await User.findOne({ where: { email: decoded.email } })
    if (!user) throw new CodedError("User not found", 400, "PAS|06")

    res.status(200).json({ success: true, message: "Token is valid" })
  } catch (error) {
    next(error)
  }
})

router.post("/reset/:token", async (req, res, next) => {
  const { token } = req.params
  const { password } = req.body

  try {
    if (!token) throw new CodedError("Token is required", 400, "PAS|07")
    if (!password) throw new CodedError("Password is required", 400, "PAS|08")

    let decoded
    try {
      decoded = jwt.verify(token, process.env.PWD_SECRET)
    } catch (error) {
      throw new CodedError("Verification Failed", 400, "PAS|09")
    }

    const user = await User.findOne({ where: { email: decoded.email } })
    if (!user) throw new CodedError("User not found", 400, "PAS|10")

    const encryptedPassword = await bcrypt.hash(password, 10)

    await User.update({ password: encryptedPassword }, { where: { id: user.dataValues.id } })

    const loginTokenBody = { id: user.dataValues.id, email: user.dataValues.email, role: user.dataValues.role }
    const loginToken = jwt.sign(loginTokenBody, process.env.JWT_SECRET, {
      expiresIn: "1h",
    })

    res.status(200).json({ success: true, data: { user: loginTokenBody, token: loginToken } })
  } catch (error) {
    next(error)
  }
})

const passwordRoutes = router
export default passwordRoutes
