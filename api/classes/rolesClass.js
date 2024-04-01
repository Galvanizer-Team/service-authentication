"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Role = _interopRequireDefault(require("../models/Role"));
var _Capability = _interopRequireDefault(require("../models/Capability"));
var _capabilitiesClass = _interopRequireDefault(require("./capabilitiesClass"));
var _CodedError = _interopRequireDefault(require("../config/CodedError"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class Role {
  /**
   * Get all roles that match the conditions
   * - Gets all roles if no conditions are provided
   * @async
   * @param {*} conditions
   * @returns {Promise<Role[]>}
   */
  async getRoles(conditions = {}) {
    try {
      const roles = await _Role.default.findAll({
        where: conditions
      });
      return roles;
    } catch (error) {
      throw new _CodedError.default(error.message, 400, "ROLE|00");
    }
  }

  /**
   * Gets a single role
   * @async
   * @param {*} conditions
   * @returns {Promise<Role>}
   */
  async getRole(conditions = {}) {
    try {
      const role = await _Role.default.findOne({
        where: conditions
      });
      return role;
    } catch (error) {
      throw new _CodedError.default(error.message, 400, "ROLE|01");
    }
  }

  /**
   * Creates a new role
   * @async
   * @param {*} data
   * @param {Object} options - custom options
   * - copyFrom: String - The name of the role to copy capabilities from
   * @returns {Promise<Role>}
   */
  async createRole(data = {}, options = {}) {
    const {
      name,
      description,
      capabilities: cababilityNames
    } = data;
    const {
      copyFrom
    } = options;
    try {
      const role = await _Role.default.create({
        name,
        description
      });
      const capability = new _capabilitiesClass.default();
      const SETTING_NEW_CAPABILITIES = cababilityNames && cababilityNames.length;
      const capabilityObjects = SETTING_NEW_CAPABILITIES ? await capability.getCapabilities({
        name: cababilityNames
      }) : [];
      if (copyFrom) {
        const existingRole = await _Role.default.findOne({
          where: {
            name: copyFrom
          },
          include: [{
            model: _Capability.default,
            as: "capabilities"
          }]
        });
        if (!existingRole?.capabilities) return role;
        const capabilitiesList = [...existingRole.capabilities, ...capabilityObjects];
        await role.setCapabilities(capabilitiesList);
      } else {
        if (!capabilityObjects.length) return role;
        await role.setCapabilities(capabilityObjects);
      }
      return role;
    } catch (error) {
      throw new _CodedError.default(error.message, 400, "ROLE|02");
    }
  }

  /**
   * Updates a role
   * @async
   * @param {*} data
   * - Can use name or id to select the role to update
   * - If capabilities are provided, it will replace the existing capabilities
   * @returns {Promise<Role>}
   */
  async updateRole(data = {}) {
    const {
      id,
      name,
      description,
      capabilities: capabilityNames
    } = data;
    const capability = new _capabilitiesClass.default();
    try {
      const condition = id ? {
        id
      } : {
        name
      };
      const role = await _Role.default.findOne({
        where: condition
      });
      if (!role) throw new _CodedError.default("Role not found", 400, "ROLE|03");
      await role.update({
        name,
        description
      });
      if (Array.isArray(capabilityNames) && !capabilityNames.length) {
        await role.setCapabilities([]);
        return role;
      }
      if (capabilityNames) {
        const capabilities = await capability.getCapabilities({
          name: capabilityNames
        });
        if (!capabilities.length) return role;
        await role.setCapabilities(capabilities);
      }
      return role;
    } catch (error) {
      throw new _CodedError.default(error.message, 400, "ROLE|04");
    }
  }

  /**
   * Adds capabilities to a role
   * @async
   * @param {String} roleName
   * @param {String[]} capabilities - array of capability names
   * @returns {Promise<Role>}
   */
  async addCapabilities(roleName, capabilities = []) {
    const capability = new _capabilitiesClass.default();
    try {
      if (typeof roleName !== "string") throw new _CodedError.default("Role name is required", 400, "ROLE|05");
      const role = await _Role.default.findOne({
        where: {
          name: roleName
        }
      });
      if (!role) throw new _CodedError.default("Role not found", 400, "ROLE|05");
      const capabilityObjects = await capability.getCapabilities({
        name: capabilities
      });
      if (!capabilityObjects.length) return role;
      await role.addCapabilities(capabilityObjects);
      return role;
    } catch (error) {
      throw new _CodedError.default(error.message, 400, "ROLE|06");
    }
  }

  /**
   * Removes capabilities from a role
   * @async
   * @param {String} roleName
   * @param {String[]} capabilities - array of capability names to remove
   * @returns {Promise<Role>}
   */
  async removeCapabilities(roleName, capabilities = []) {
    const capability = new _capabilitiesClass.default();
    try {
      if (typeof roleName !== "string") throw new _CodedError.default("Role name is required", 400, "ROLE|07");
      const role = await _Role.default.findOne({
        where: {
          name: roleName
        }
      });
      if (!role) throw new _CodedError.default("Role not found", 400, "ROLE|07");
      const capabilityObjects = await capability.getCapabilities({
        name: capabilities
      });
      if (!capabilityObjects.length) return role;
      await role.removeCapabilities(capabilityObjects);
      return role;
    } catch (error) {
      throw new _CodedError.default(error.message, 400, "ROLE|08");
    }
  }

  /**
   * Deletes a role
   * - Migrates all users with the role to another role
   * @async
   * @param {String} roleName
   * @param {String} migrateToRole - The role to migrate users to
   * @returns {Promise<Role>}
   */
  async deleteRole(roleName, migrateToRole) {
    try {
      if (typeof roleName !== "string") throw new _CodedError.default("Role name is required", 400, "ROLE|09");
      const role = await _Role.default.findOne({
        where: {
          name: roleName
        }
      });
      if (!role) throw new _CodedError.default("Role not found", 400, "ROLE|09");
      const migrateToRoleObject = await _Role.default.findOne({
        where: {
          name: migrateToRole
        }
      });
      if (!migrateToRoleObject) throw new _CodedError.default("Role to migrate to not found", 400, "ROLE|09");
      await role.setUsers(migrateToRoleObject.users);
      await role.destroy();
      return role;
    } catch (error) {
      throw new _CodedError.default(error.message, 400, "ROLE|10");
    }
  }
}
var _default = exports.default = Role;