"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
_dotenv.default.config({
  path: ".env"
});
_dotenv.default.config({
  path: ".env.secrets"
});
class CodedError extends Error {
  constructor(message, status, location, data) {
    super(message); // Human-readable message
    this.name = this.constructor.name;
    this.status = status; // HTTP status code
    this.location = location;
    this.data = data;
  }
}
var _default = exports.default = CodedError;