"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _responseClass = _interopRequireDefault(require("../classes/responseClass"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const errorMiddleware = (err, req, res) => {
  const response = new _responseClass.default(req, res);
  response.error(err);
};
var _default = exports.default = errorMiddleware;