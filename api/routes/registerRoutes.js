"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _isEmail = _interopRequireDefault(require("validator/lib/isEmail"));
var _normalizeEmail = _interopRequireDefault(require("validator/lib/normalizeEmail"));
var _isStrongPassword = _interopRequireDefault(require("validator/lib/isStrongPassword"));
var _CodedError = _interopRequireDefault(require("../config/CodedError"));
var _usersClass = _interopRequireDefault(require("../classes/usersClass"));
var _responseClass = _interopRequireDefault(require("../classes/responseClass"));
var _cookiesClass = _interopRequireDefault(require("../classes/cookiesClass"));
var _rateLimiters = require("../middleware/rateLimiters");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = _express.default.Router();
router.post("/", _rateLimiters.noAuthLimiter, async (req, res) => {
  const response = new _responseClass.default(req, res);
  let {
    email,
    password
  } = req.body;
  try {
    const user = new _usersClass.default();
    if (!email || !password) throw new _CodedError.default("Email and password are required", 400, "REG|01");
    if (!(0, _isEmail.default)(email)) throw new _CodedError.default("Invalid Email", 400, "REG|02");
    if (!(0, _isStrongPassword.default)(password)) throw new _CodedError.default("Invalid Password", 400, "REG|02");
    email = (0, _normalizeEmail.default)(email, {
      gmail_remove_subaddress: false
    });
    const existingUser = await user.getUser({
      email
    });
    if (existingUser) throw new _CodedError.default("Email already exists", 500, "REG|03");
    const newUser = await user.createUser({
      email,
      password
    });
    if (!newUser) throw new _CodedError.default("Error creating user", 500, "REG|04");
    const token = await user.createSessionToken(newUser.id);
    if (!token) throw new _CodedError.default("Error creating session token", 500, "REG|05");
    const refreshToken = await user.createRefreshToken(newUser.id);
    if (!refreshToken) throw new _CodedError.default("Error creating refresh token", 500, "REG|06");
    const cookie = new _cookiesClass.default(req, res);
    const setRefreshCookie = cookie.setRefreshToken(refreshToken);
    if (!setRefreshCookie) throw new _CodedError.default("Error setting refresh token", 500, "REG|07");
    response.setToken(token);
    response.success({
      message: "User created",
      data: newUser
    });
  } catch (error) {
    response.error(error);
  }
});
const registerRoutes = router;
var _default = exports.default = registerRoutes;