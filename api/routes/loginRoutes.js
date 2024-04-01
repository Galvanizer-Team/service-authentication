"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _isEmail = _interopRequireDefault(require("validator/lib/isEmail"));
var _normalizeEmail = _interopRequireDefault(require("validator/lib/normalizeEmail"));
var _CodedError = _interopRequireDefault(require("../config/CodedError"));
var _usersClass = _interopRequireDefault(require("../classes/usersClass"));
var _rateLimiters = require("../middleware/rateLimiters");
var _responseClass = _interopRequireDefault(require("../classes/responseClass"));
var _cookiesClass = _interopRequireDefault(require("../classes/cookiesClass"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = _express.default.Router();
router.post("/", _rateLimiters.noAuthLimiter, async (req, res) => {
  let {
    email,
    password
  } = req.body;
  const response = new _responseClass.default(req, res);
  try {
    if (!password) throw new _CodedError.default("Invalid Password", 400, "LOG|02");
    if (!email || !(0, _isEmail.default)(email)) throw new _CodedError.default("Invalid Email", 400, "LOG|01");
    email = (0, _normalizeEmail.default)(email, {
      gmail_remove_subaddress: false
    });
    const userMethods = new _usersClass.default();
    const user = await userMethods.getUser({
      email
    });
    if (!user) throw new _CodedError.default("User not found", 400, "LOG|03");
    const userId = user.id;
    const isPasswordValid = await userMethods.checkPassword(userId, password);
    if (!isPasswordValid) throw new _CodedError.default("Password is incorrect", 400, "LOG|04");
    let token;
    if (user?.dataValues?.mfa) {
      token = await userMethods.createHalfSessionToken(userId);
    } else {
      const cookies = new _cookiesClass.default(req, res);
      token = await userMethods.createSessionToken(userId);
      cookies.setSessionCookie(token);
      const refreshToken = await userMethods.createRefreshToken(userId);
      if (!refreshToken) throw new _CodedError.default("Error creating refresh token", 500, "REG|06");
      cookies.setRefreshToken(refreshToken);
    }
    const tokenBody = JSON.parse(atob(token.split(".")[1]));
    response.setToken(token);
    response.success({
      message: "Login successful",
      data: tokenBody
    });
  } catch (error) {
    response.error(error);
  }
});
const loginRoutes = router;
var _default = exports.default = loginRoutes;