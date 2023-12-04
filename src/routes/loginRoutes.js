import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import CodedError from "../config/CodedError"
import { User } from "../database/User"

const router = express.Router()

router.post("/", async (req, res, next) => {
  const { email, password } = req.body

  try {
    if (!email) throw new CodedError("Email is required", 400, "LOG|01")
    if (!password) throw new CodedError("Password is required", 400, "LOG|02")

    const user = await User.findOne({ where: { email } })
    if (!user) throw new CodedError("User not found", 400, "LOG|03")

    if (!user.dataValues.password) throw new CodedError("Invalid password", 400, "LOG|03")
    const passwordMatch = await bcrypt.compare(password, user.dataValues.password)
    if (!passwordMatch) throw new CodedError("Invalid password", 400, "LOG|04")

    const tokenBody = { id: user.dataValues.id, email: user.dataValues.email, role: user.dataValues.role }
    const token = jwt.sign(tokenBody, process.env.JWT_SECRET, {
      expiresIn: "1h",
    })

    res.status(200).json({ success: true, data: { token, user: tokenBody } })
  } catch (error) {
    next(error)
  }
})

const loginRoutes = router
export default loginRoutes
