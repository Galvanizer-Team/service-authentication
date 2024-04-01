"use strict";

var _User = _interopRequireDefault(require("./User"));
var _Role = _interopRequireDefault(require("./Role"));
var _Capability = _interopRequireDefault(require("./Capability"));
var _AuthFactor = _interopRequireDefault(require("./AuthFactor"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
_User.default.belongsTo(_Role.default, {
  foreignKey: "roleId"
});
_Role.default.hasMany(_User.default, {
  foreignKey: "roleId"
});
_User.default.hasMany(_AuthFactor.default, {
  foreignKey: "userId"
});
_AuthFactor.default.belongsTo(_User.default, {
  foreignKey: "userId"
});
_Role.default.belongsToMany(_Capability.default, {
  through: "Role_Capability",
  as: "capabilities"
});
_Capability.default.belongsToMany(_Role.default, {
  through: "Role_Capability",
  as: "roles"
});
_Role.default.addScope("defaultScope", {
  include: [{
    model: _Capability.default,
    as: "capabilities",
    attributes: ["id", "name", "description"],
    through: {
      attributes: []
    }
  }]
}, {
  override: true
});
_User.default.addScope("defaultScope", {
  include: [{
    model: _Role.default,
    attributes: ["name", "description"],
    include: [{
      model: _Capability.default,
      as: "capabilities",
      attributes: ["name", "description"],
      through: {
        attributes: []
      }
    }]
  }, {
    model: _AuthFactor.default,
    attributes: ["factor", "verified", "verifiedAt"]
  }]
}, {
  override: true
});