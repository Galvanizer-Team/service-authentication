"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("dotenv/config");
var _sequelize = require("sequelize");
var _config2 = _interopRequireDefault(require("./config"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const nodeEnv = process.env.NODE_ENV || "development";
const {
  username: user,
  password,
  database: db,
  host,
  port
} = _config2.default[nodeEnv];
const sequelize = new _sequelize.Sequelize(db, user, password, {
  host,
  port,
  dialect: "mysql",
  logging: false
});
var _default = exports.default = sequelize;