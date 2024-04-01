"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _isEmail = _interopRequireDefault(require("validator/lib/isEmail"));
var _isJWT = _interopRequireDefault(require("validator/lib/isJWT"));
var _normalizeEmail = _interopRequireDefault(require("validator/lib/normalizeEmail"));
var _CodedError = _interopRequireDefault(require("../config/CodedError"));
var _responseClass = _interopRequireDefault(require("../classes/responseClass"));
var _jwtClass = _interopRequireDefault(require("../classes/jwtClass"));
var _usersClass = _interopRequireDefault(require("../classes/usersClass"));
var _sendEmail = _interopRequireDefault(require("../utils/sendEmail"));
var _rateLimiters = require("../middleware/rateLimiters");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = _express.default.Router();
router.post("/forgot", _rateLimiters.noAuthLimiter, async (req, res) => {
  const response = new _responseClass.default(req, res);
  let {
    email
  } = req.body;
  try {
    if (!email) throw new _CodedError.default("Email is required", 400, "PAS|01");
    if (!(0, _isEmail.default)(email)) throw new _CodedError.default("Invalid Email", 400, "PAS|02");
    email = (0, _normalizeEmail.default)(email, {
      gmail_remove_subaddress: false
    });
    const userMethods = new _usersClass.default();
    const user = await userMethods.getUser({
      email
    });
    if (!user) throw new _CodedError.default("User not found", 400, "PAS|02");
    const token = await userMethods.createPasswordResetToken(email);
    const emailSent = await (0, _sendEmail.default)({
      to: email,
      subject: "Password Reset",
      text: `Click here to reset your password: ${process.env.PASSWORD_RESET_URL}/${token}`
    });
    if (!emailSent) throw new _CodedError.default("Email failed to send", 500, "PAS|03");
    response.success({
      message: "Email sent"
    });
  } catch (error) {
    response.error(error);
  }
});
router.get("/reset/:token", _rateLimiters.noAuthLimiter, async (req, res) => {
  const response = new _responseClass.default(req, res);
  const {
    token
  } = req.params;
  try {
    if (!token) throw new _CodedError.default("Token is required", 400, "PAS|04");
    if (!(0, _isJWT.default)(token)) throw new _CodedError.default("Invalid Token", 400, "PAS|05");
    const jwt = new _jwtClass.default(process.env.PASSWORD_JWT_PUBLIC, process.env.PASSWORD_JWT_PRIVATE);
    let decoded;
    try {
      decoded = await jwt.verify(token);
    } catch (error) {
      throw new _CodedError.default("Verification Failed", 400, "PAS|05");
    }
    const userMethods = new _usersClass.default();
    const user = await userMethods.getUser({
      email: decoded.email
    });
    if (!user) throw new _CodedError.default("User not found", 400, "PAS|06");
    response.success({
      message: "Token is valid"
    });
  } catch (error) {
    response.error(error);
  }
});
router.post("/reset/:token", _rateLimiters.noAuthLimiter, async (req, res) => {
  const response = new _responseClass.default(req, res);
  const {
    token
  } = req.params;
  const {
    password
  } = req.body;
  try {
    if (!token) throw new _CodedError.default("Token is required", 400, "PAS|07");
    if (!(0, _isJWT.default)(token)) throw new _CodedError.default("Invalid Token", 400, "PAS|07");
    if (!password) throw new _CodedError.default("Password is required", 400, "PAS|08");
    const userMethods = new _usersClass.default();
    const resetPassword = await userMethods.resetPassword(token, password);
    if (!resetPassword) throw new _CodedError.default("Password reset failed", 500, "PAS|09");
    response.success({
      message: "Password reset successful"
    });
  } catch (error) {
    response.error(error);
  }
});
const passwordRoutes = router;
var _default = exports.default = passwordRoutes;