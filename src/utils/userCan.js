import { User } from "../database/User"
import { Role } from "../database/Role"

export default async function userCan(req, ...capabilities) {
  const { id } = req.user
  let { capabilities: userCapabilities } = req
  const user = await User.findByPk(id)
  if (!user) return false

  if (!userCapabilities) {
    const userRole = await Role.findOne({ where: { name: user.role } })
    if (!userRole) return false

    userCapabilities = userRole.capabilities
    req.capabilities = userRole.capabilities
  }

  return capabilities.every((capability) => userCapabilities.includes(capability))
}
