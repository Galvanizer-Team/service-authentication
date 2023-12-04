import express from "express"
import verifyUser from "../middleware/verifyUser"
import { Role } from "../database/Role"
import { User } from "../database/User"
import CodedError from "../config/CodedError"
import updateCapabilities from "../utils/updateCapabilities"

const router = express.Router()

router.get("/", verifyUser("roles_read"), async (req, res, next) => {
  try {
    const roles = await Role.findAll()
    return res.status(200).json({ success: true, data: roles })
  } catch (error) {
    next(error)
  }
})

router.post("/", verifyUser("roles_create"), async (req, res, next) => {
  let { name, description, capabilities: baseCapabilities, inheritFrom } = req.body

  try {
    if (!name) throw new CodedError("Name is required", 400, "ROL|01")
    baseCapabilities = Array.isArray(baseCapabilities) ? [...baseCapabilities] : []

    const roleExists = await Role.findOne({ where: { name } })
    if (roleExists) throw new CodedError("Role already exists", 400, "ROL|02")

    if (inheritFrom) {
      const parentRole = await Role.findOne({ where: { id: inheritFrom } })
      if (!parentRole) throw new CodedError("Parent role does not exist", 400, "ROL|03")
    }

    const role = await Role.create({ name, description, baseCapabilities, inheritFrom })

    updateCapabilities()

    return res.status(200).json({ success: true, data: role })
  } catch (error) {
    next(error)
  }
})

router.put("/:id", verifyUser("roles_update"), async (req, res, next) => {
  const { id } = req.params
  let { name, description, capabilities: baseCapabilities, inheritFrom } = req.body

  try {
    const role = await Role.findOne({ where: { id } })
    if (!role) throw new CodedError("Role does not exist", 400, "ROL|04")

    const newInheritFrom = inheritFrom || role.dataValues.inheritFrom
    if (inheritFrom) {
      const parentRole = await Role.findOne({ where: { id: newInheritFrom } })
      if (!parentRole) throw new CodedError("Parent role does not exist", 400, "ROL|03")
    }

    await role.update({ name, description, baseCapabilities, inheritFrom })

    updateCapabilities()

    return res.status(200).json({ success: true, data: role })
  } catch (error) {
    next(error)
  }
})

router.delete("/:id", verifyUser("roles_delete"), async (req, res, next) => {
  const { id } = req.params

  try {
    const role = await Role.findOne({ where: { id } })
    if (!role) throw new CodedError("Role does not exist", 400, "ROL|04")

    // remove role from all users
    const users = await User.findAll()
    users.forEach(async (user) => {
      if (user.dataValues.role === id) await user.update({ role: null })
    })

    // remove role from inheritFrom of all roles
    const roles = await Role.findAll()
    roles.forEach(async (role) => {
      if (role.dataValues.inheritFrom === id) await role.update({ inheritFrom: null })
    })

    await role.destroy()

    updateCapabilities()

    return res.status(200).json({ success: true, data: role })
  } catch (error) {
    next(error)
  }
})

router.post("/:id/capabilities", verifyUser("roles_update"), async (req, res, next) => {
  const { id } = req.params
  const { capabilities } = req.body

  try {
    const role = await Role.findOne({ where: { id } })
    if (!role) throw new CodedError("Role does not exist", 400, "ROL|04")

    if (!Array.isArray(capabilities)) throw new CodedError("Capabilities must be an array", 400, "ROL|05")

    const newCapabilities = [...capabilities, ...role.dataValues.baseCapabilities]
    const uniqueCapabilities = [...new Set(newCapabilities)]

    await role.update({ baseCapabilities: uniqueCapabilities })

    updateCapabilities()

    return res.status(200).json({ success: true, data: role })
  } catch (error) {
    next(error)
  }
})

router.delete("/:id/capabilities", verifyUser("roles_update"), async (req, res, next) => {
  const { id } = req.params
  const { capabilities } = req.body

  try {
    const role = await Role.findOne({ where: { id } })
    if (!role) throw new CodedError("Role does not exist", 400, "ROL|04")

    if (!Array.isArray(capabilities)) throw new CodedError("Capabilities must be an array", 400, "ROL|05")

    const newCapabilities = role.dataValues.baseCapabilities.filter((capability) => !capabilities.includes(capability))

    await role.update({ baseCapabilities: newCapabilities })

    updateCapabilities()

    return res.status(200).json({ success: true, data: role })
  } catch (error) {
    next(error)
  }
})

router.post("/update", async (req, res, next) => {
  const { secret } = req.body

  try {
    if (secret !== process.env.UPDATE_SECRET) throw new CodedError("Invalid secret", 400, "ROL|06")

    updateCapabilities()

    return res.status(200).json({ success: true })
  } catch (error) {
    next(error)
  }
})

const roleRoutes = router
export default roleRoutes
