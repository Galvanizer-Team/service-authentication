"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _database = _interopRequireDefault(require("../config/database"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// storing information used in 2-factor authentication (2FA)
const AuthFactor = _database.default.define("AuthFactor", {
  id: {
    type: _sequelize.DataTypes.UUID,
    primaryKey: true,
    defaultValue: _sequelize.DataTypes.UUIDV4
  },
  factor: {
    type: _sequelize.DataTypes.STRING,
    allowNull: false
  },
  secret: {
    type: _sequelize.DataTypes.STRING,
    allowNull: false
  },
  verified: {
    type: _sequelize.DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  verifiedAt: {
    type: _sequelize.DataTypes.DATE,
    allowNull: true
  }
});
var _default = exports.default = AuthFactor;