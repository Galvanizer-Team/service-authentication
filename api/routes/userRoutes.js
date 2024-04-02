import express from "express"
import verifyUser from "../middleware/verifyUser"
import User from "../classes/usersClass"
import Response from "../classes/responseClass"
import CodedError from "../config/CodedError"

const router = express.Router()

router.get("/:id", verifyUser("users_read"), async (req, res) => {
  const response = new Response(req, res)
  const { id } = req.params

  try {
    const userMethods = new User()
    const { user } = req

    const userCanReadAllUsers = await userMethods.hasCapabilities(user.id, "users_read_all")
    const users = await userMethods.getUser({ id })

    if (!userCanReadAllUsers) {
      if (users?.dataValues?.id === user.id) return response.success(users)
      throw new CodedError("You are not allowed to read this user", 403, "USERS|01")
    }

    response.success(users)
  } catch (error) {
    response.error(error)
  }
})

router.get("/", verifyUser("users_read"), async (req, res) => {
  const response = new Response(req, res)

  try {
    const userMethods = new User()
    const { user } = req

    const userCanReadAllUsers = await userMethods.hasCapabilities(user.id, "users_read_all")
    if (!userCanReadAllUsers) {
      const users = await userMethods.getUsers({ id: user.id })
      return response.success(users)
    }

    const users = await userMethods.getUsers()
    response.success(users)
  } catch (error) {
    response.error(error)
  }
})

router.post("/", verifyUser("users_create"), async (req, res) => {
  const response = new Response(req, res)
  const { body } = req

  try {
    const userMethods = new User()
    const { user } = req

    delete body.id
    delete body.password // You can't set the password when creating a user.

    const userCanCreateUsers = await userMethods.hasCapabilities(user.id, "users_create")
    if (!userCanCreateUsers) throw new CodedError("You are not allowed to create users", 403, "USERS|02")

    const newUser = await userMethods.createUser(body)
    response.success(newUser)
  } catch (error) {
    response.error(error)
  }
})

router.put("/:id", verifyUser("users_update"), async (req, res) => {
  const response = new Response(req, res)
  const { body } = req
  const { id } = req.params

  try {
    const userMethods = new User()
    const { user } = req

    delete body.password
    delete body.id

    const userCanUpdateUsers = await userMethods.hasCapabilities(user.id, "users_update")
    if (!userCanUpdateUsers) throw new CodedError("You are not allowed to update users", 403, "USERS|03")

    const updatedUser = await userMethods.updateUser(id, body)
    response.success(updatedUser)
  } catch (error) {
    response.error(error)
  }
})

router.delete("/:id", verifyUser("users_delete"), async (req, res) => {
  const response = new Response(req, res)
  const { id } = req.params

  try {
    const userMethods = new User()
    const { user } = req

    const userCanDeleteUsers = await userMethods.hasCapabilities(user.id, "users_delete")
    if (!userCanDeleteUsers) throw new CodedError("You are not allowed to delete users", 403, "USERS|04")

    await userMethods.deleteUser(id)
    response.success("User deleted")
  } catch (error) {
    response.error(error)
  }
})

const baseRoutes = router
export default baseRoutes
