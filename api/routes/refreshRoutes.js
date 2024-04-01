"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _responseClass = _interopRequireDefault(require("../classes/responseClass"));
var _usersClass = _interopRequireDefault(require("../classes/usersClass"));
var _cookiesClass = _interopRequireDefault(require("../classes/cookiesClass"));
var _CodedError = _interopRequireDefault(require("../config/CodedError"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = _express.default.Router();
router.post("/", async (req, res) => {
  const response = new _responseClass.default(req, res);
  const {
    refreshToken
  } = req.body;
  try {
    const cookies = new _cookiesClass.default(req, res);
    if (!refreshToken) throw new _CodedError.default("Token not found", 401, "REFRESH|01");
    const userMethods = new _usersClass.default();
    const {
      sessionToken,
      refreshToken: newRefreshToken
    } = await userMethods.refreshSessionToken(refreshToken);
    const refreshTokenSet = cookies.setRefreshToken(newRefreshToken);
    if (!refreshTokenSet) throw new _CodedError.default("Token not set", 500, "REFRESH|02");
    response.setToken(sessionToken);
    response.success({
      refreshToken: newRefreshToken
    });
  } catch (error) {
    response.error(error);
  }
});
const refreshRoutes = router;
var _default = exports.default = refreshRoutes;