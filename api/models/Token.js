"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _database = _interopRequireDefault(require("../config/database"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const Token = _database.default.define("Token", {
  id: {
    type: _sequelize.DataTypes.UUID,
    primaryKey: true,
    defaultValue: _sequelize.DataTypes.UUIDV4
  },
  token: {
    type: _sequelize.DataTypes.STRING(1000),
    allowNull: false
  },
  expires: {
    type: _sequelize.DataTypes.DATE,
    allowNull: false
  },
  blacklisted: {
    type: _sequelize.DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});
var _default = exports.default = Token;