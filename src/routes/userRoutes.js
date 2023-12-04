import express from "express"
import verifyUser from "../middleware/verifyUser"
import { User } from "../database/User"
import userCan from "../utils/userCan"
import CodedError from "../config/CodedError"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const router = express.Router()

router.get("/:userId", verifyUser("users_read"), async (req, res, next) => {
  const { userId } = req.params
  const { user } = req

  try {
    if (userId !== user.id && !userCan(req, "users_read_all")) throw new CodedError("Unauthorized", 401, "USR|01")

    const returnUser = await User.findByPk(userId)

    //delete sensitive data
    delete returnUser.dataValues.password

    return res.status(200).json({ success: true, data: returnUser })
  } catch (error) {
    next(error)
  }
})

router.get("/", verifyUser("users_read"), async (req, res, next) => {
  const { user } = req

  try {
    let users
    const userCanReadAll = await userCan(req, "users_read_all")
    if (userCanReadAll) {
      users = await User.findAll()
    } else {
      users = await User.findAll({ where: { id: user.id } })
    }

    //delete sensitive data
    users.forEach((user) => {
      delete user.dataValues.password
    })

    return res.status(200).json({ success: true, data: users })
  } catch (error) {
    next(error)
  }
})

router.post("/", verifyUser("users_create"), async (req, res, next) => {
  let { email, password, role } = req.body

  try {
    if (!email) throw new CodedError("Email is required", 400, "USR|02")
    if (!role || typeof role !== "string") role = "User" // default to 'user' role

    const userExists = await User.findOne({ where: { email } })
    if (userExists) throw new CodedError("User already exists", 400, "USR|03")

    // make sure user has permission to create this role
    const userCanCreateRole = await userCan(req, `roles_assign_${role.toLowerCase()}`)
    console.log(`roles_assign_${role.toLowerCase()}`)

    if (!userCanCreateRole) throw new CodedError("Cannot create a user with this role", 401, "USR|04")

    const newUser = await User.create({ email, password, role })

    //delete sensitive data
    delete newUser.dataValues.password

    return res.status(201).json({ success: true, data: newUser })
  } catch (error) {
    next(error)
  }
})

router.put("/:userId", verifyUser("users_update"), async (req, res, next) => {
  const { userId } = req.params
  const { user } = req
  let { email, password, role } = req.body

  try {
    if (userId != user.id && !userCan(req, "users_update_all")) throw new CodedError("Unauthorized", 401, "USR|05")

    const userExists = await User.findByPk(userId)
    if (!userExists) throw new CodedError("User not found", 400, "USR|06")

    if (email) {
      const userExists = await User.findOne({ where: { email } })
      if (userExists) throw new CodedError("Email already in use", 400, "USR|03")
    }

    if (password) {
      password = await bcrypt.hash(password, 10)
    }

    if (role) {
      const userCanCreateRole = await userCan(req, `roles_assign_${role.toLowerCase()}`)
      if (!userCanCreateRole) throw new CodedError("Cannot create a user with this role", 401, "USR|07")
    }

    await userExists.update({ email, password, role })

    let token
    console.log(userId, user.id)
    if (userId == user.id) {
      //send new token
      const tokenBody = {
        id: userExists.dataValues.id,
        email: userExists.dataValues.email,
        role: userExists.dataValues.role,
      }
      token = jwt.sign(tokenBody, process.env.JWT_SECRET, {
        expiresIn: "1h",
      })
    }

    //delete sensitive data
    delete userExists.dataValues.password

    return res.status(200).json({ success: true, data: { user: userExists, token } })
  } catch (error) {
    next(error)
  }
})

router.delete("/:userId", verifyUser("users_delete_all"), async (req, res, next) => {
  const { userId } = req.params
  const { user } = req

  try {
    if (userId == user.id) throw new CodedError("Unauthorized", 401, "USR|08")

    const userExists = await User.findByPk(userId)
    if (!userExists) throw new CodedError("User not found", 400, "USR|06")

    await userExists.destroy()

    return res.status(200).json({ success: true, message: "User deleted" })
  } catch (error) {
    next(error)
  }
})

const userRoutes = router
export default userRoutes
