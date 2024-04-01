"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noAuthLimiter = exports.authLimiter = void 0;
var _expressRateLimit = _interopRequireDefault(require("express-rate-limit"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const noAuthLimiter = exports.noAuthLimiter = (0, _expressRateLimit.default)({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});
const authLimiter = exports.authLimiter = (0, _expressRateLimit.default)({
  windowMs: 5 * 60 * 1000,
  // 5 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});