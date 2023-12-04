import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import CodedError from "../config/CodedError"
import { User } from "../database/User"
import { Role } from "../database/Role"

const router = express.Router()

router.post("/", async (req, res, next) => {
  const { email, password } = req.body

  try {
    if (!email || !password) throw new CodedError("Email and password are required", 400, "REG|01")

    const userExists = await User.findOne({ where: { email } })
    if (userExists) throw new CodedError("Email is already in use", 400, "REG|02")

    const encryptedPassword = await bcrypt.hash(password, 10)

    const userRole = await Role.findOne({ where: { name: "User" } })
    if (!userRole) throw new CodedError("Role not found", 400, "REG|03")

    const user = await User.create({ email, password: encryptedPassword, role: userRole.dataValues.name })

    const tokenBody = { id: user.dataValues.id, email: user.dataValues.email, role: user.dataValues.role }
    const token = jwt.sign(tokenBody, process.env.JWT_SECRET, {
      expiresIn: "1h",
    })
    res.setHeader("Authorization", `Bearer ${token}`)
    res.json({ success: true, data: token })
  } catch (error) {
    next(error)
  }
})

const registerRoutes = router
export default registerRoutes
