import { Role } from "../database/Role"

export default async function updateCapabilities() {
  const allRoles = await Role.findAll()

  if (!allRoles || !Array.isArray(allRoles)) return console.log("No roles found")

  async function getParentRoles(role, depth = 0) {
    if (depth > 100) return console.warn("Max depth reached")
    depth++

    if (!role?.dataValues?.inheritFrom) return []
    const parentRole = await Role.findOne({ where: { id: role.dataValues.inheritFrom } })
    const parentRoles = await getParentRoles(parentRole, depth) // Await the recursive call
    return [parentRole, ...parentRoles]
  }

  allRoles.forEach(async (role) => {
    const parentRoles = await getParentRoles(role)
    const allRoles = Array.isArray(role?.dataValues?.baseCapabilities) ? [role, ...parentRoles] : [...parentRoles]

    const allCapabilities = allRoles.reduce((acc, role) => {
      return [...acc, ...role.dataValues.baseCapabilities]
    }, [])
    const uniqueCapabilities = [...new Set(allCapabilities)]
    await role.update({ capabilities: uniqueCapabilities })
  })
}
