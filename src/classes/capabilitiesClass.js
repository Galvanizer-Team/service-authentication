import CapabilityModel from "../../models/Capability"
import RoleModel from "../../models/Role"
import CodedError from "../config/CodedError"

class Capability {
  /**
   * Get all capabilities that match the conditions
   * @async
   * @param {*} conditions
   * @returns {Promise<Capability[]>}
   */
  async getCapabilities(conditions = {}) {
    try {
      const capabilities = await CapabilityModel.findAll({ where: conditions })
      return capabilities
    } catch (error) {
      throw new CodedError(error.message, 400, "CAPABILITY|00")
    }
  }

  /**
   * Returns the first capability that matches the conditions
   */
  async getCapability(conditions = {}) {
    try {
      const capability = await CapabilityModel.findOne({ where: conditions })
      return capability
    } catch (error) {
      throw new CodedError(error.message, 400, "CAPABILITY|01")
    }
  }

  /**
   * Create a new capability
   * @async
   * @param {Object} data
   * @param {Object} options
   * -
   * - roles: Array - The names of the roles to assign the capability to
   * @returns {Promise<Capability>}
   */
  async createCapability(data = {}, options = {}) {
    const { name, description } = data
    const { roles } = options

    try {
      const capability = await CapabilityModel.create({ name, description })

      if (roles) {
        await capability.setRoles(roles)
      }

      return capability
    } catch (error) {
      throw new CodedError(error.message, 400, "CAPABILITY|02")
    }
  }

  /**
   * Delete capabilities
   * - Will do nothing if no capabilities are provided
   * - Removes the capability from all roles
   * @async
   * @param {Array} capabilities - The names of the capabilities to delete
   * @returns {Promise<BOOLEAN>} - True if the capabilities were deleted
   */
  async deleteCapabilities(capabilities) {
    try {
      if (!capabilities) throw new CodedError("No capabilities provided", 400, "CAPABILITY|02")
      if (!Array.isArray(capabilities)) throw new CodedError("Capabilities must be an array", 400, "CAPABILITY|03")
      await CapabilityModel.destroy({ where: { name: capabilities } })

      // Remove the capabilities from all roles
      const roles = await RoleModel.findAll({ include: [{ model: CapabilityModel, as: "capabilities" }] })
      roles.forEach(async (role) => {
        const roleCapabilities = role.capabilities.map((capability) => capability.name)
        const updatedCapabilities = roleCapabilities.filter((capability) => !capabilities.includes(capability))
        await role.setCapabilities(updatedCapabilities)
      })

      return true
    } catch (error) {
      throw new CodedError(error.message, 400, "CAPABILITY|03")
    }
  }
}

export default Capability
