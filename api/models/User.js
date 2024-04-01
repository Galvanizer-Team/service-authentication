"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _database = _interopRequireDefault(require("../config/database"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const User = _database.default.define("User", {
  id: {
    type: _sequelize.DataTypes.UUID,
    primaryKey: true,
    defaultValue: _sequelize.DataTypes.UUIDV4
  },
  email: {
    type: _sequelize.DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: _sequelize.DataTypes.STRING
  },
  active: {
    type: _sequelize.DataTypes.BOOLEAN,
    defaultValue: true
  },
  mfa: {
    type: _sequelize.DataTypes.BOOLEAN,
    defaultValue: false
  },
  primaryAuth: {
    type: _sequelize.DataTypes.STRING,
    defaultValue: "UNPW"
  }
}, {
  indexes: [{
    unique: true,
    fields: ["email"]
  }]
});
var _default = exports.default = User;