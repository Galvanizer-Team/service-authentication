"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _verifyUser = _interopRequireDefault(require("../middleware/verifyUser"));
var _responseClass = _interopRequireDefault(require("../classes/responseClass"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = _express.default.Router();
router.get("/", (0, _verifyUser.default)(), async (req, res) => {
  const response = new _responseClass.default(req, res);
  try {
    response.success({
      message: "Hello, world!"
    });
  } catch (error) {
    response.error(error);
  }
});
const baseRoutes = router;
var _default = exports.default = baseRoutes;