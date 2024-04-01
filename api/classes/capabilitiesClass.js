"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Capability = _interopRequireDefault(require("../models/Capability"));
var _Role = _interopRequireDefault(require("../models/Role"));
var _CodedError = _interopRequireDefault(require("../config/CodedError"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class Capability {
  /**
   * Get all capabilities that match the conditions
   * @async
   * @param {*} conditions
   * @returns {Promise<Capability[]>}
   */
  async getCapabilities(conditions = {}) {
    try {
      const capabilities = await _Capability.default.findAll({
        where: conditions
      });
      return capabilities;
    } catch (error) {
      throw new _CodedError.default(error.message, 400, "CAPABILITY|00");
    }
  }

  /**
   * Returns the first capability that matches the conditions
   */
  async getCapability(conditions = {}) {
    try {
      const capability = await _Capability.default.findOne({
        where: conditions
      });
      return capability;
    } catch (error) {
      throw new _CodedError.default(error.message, 400, "CAPABILITY|01");
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
    const {
      name,
      description
    } = data;
    const {
      roles
    } = options;
    try {
      const capability = await _Capability.default.create({
        name,
        description
      });
      if (roles) {
        await capability.setRoles(roles);
      }
      return capability;
    } catch (error) {
      throw new _CodedError.default(error.message, 400, "CAPABILITY|02");
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
      if (!capabilities) throw new _CodedError.default("No capabilities provided", 400, "CAPABILITY|02");
      if (!Array.isArray(capabilities)) throw new _CodedError.default("Capabilities must be an array", 400, "CAPABILITY|03");
      await _Capability.default.destroy({
        where: {
          name: capabilities
        }
      });

      // Remove the capabilities from all roles
      const roles = await _Role.default.findAll({
        include: [{
          model: _Capability.default,
          as: "capabilities"
        }]
      });
      roles.forEach(async role => {
        const roleCapabilities = role.capabilities.map(capability => capability.name);
        const updatedCapabilities = roleCapabilities.filter(capability => !capabilities.includes(capability));
        await role.setCapabilities(updatedCapabilities);
      });
      return true;
    } catch (error) {
      throw new _CodedError.default(error.message, 400, "CAPABILITY|03");
    }
  }
}
var _default = exports.default = Capability;