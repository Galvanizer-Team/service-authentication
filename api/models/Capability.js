"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _database = _interopRequireDefault(require("../config/database"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const Capability = _database.default.define("Capability", {
  id: {
    type: _sequelize.DataTypes.INTEGER,
    // or DataTypes.UUID
    primaryKey: true,
    autoIncrement: true // set to false if using UUID
  },

  name: {
    type: _sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: _sequelize.DataTypes.STRING,
    allowNull: true
  }
});
var _default = exports.default = Capability;