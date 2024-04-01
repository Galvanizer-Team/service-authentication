"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = requireSSL;
var _responseClass = _interopRequireDefault(require("../classes/responseClass"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function requireSSL(req, res, next) {
  const response = new _responseClass.default(req, res);
  try {
    // if (!req.secure && process.env.NODE_ENV === "production") throw new Error("SSL required")
    next();
  } catch (err) {
    response.error(err);
  }
}