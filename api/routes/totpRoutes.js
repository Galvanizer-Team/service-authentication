"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _totpClass = _interopRequireDefault(require("../classes/totpClass"));
var _responseClass = _interopRequireDefault(require("../classes/responseClass"));
var _CodedError = _interopRequireDefault(require("../config/CodedError"));
var _verifyUser = _interopRequireDefault(require("../middleware/verifyUser"));
var _usersClass = _interopRequireDefault(require("../classes/usersClass"));
var _cookiesClass = _interopRequireDefault(require("../classes/cookiesClass"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = _express.default.Router();

/**
 * Create TOTP auth factor for user and return URI for QR code
 */
router.post("/create", (0, _verifyUser.default)(), async (req, res) => {
  const response = new _responseClass.default(req, res);
  try {
    const {
      user
    } = req;
    const totp = new _totpClass.default();
    const totpRecord = await totp.createRecord(user.id);
    const totpURI = totp.getURI(user.email, "Authenticator", totpRecord?.secret);
    response.success({
      message: "TOTP created",
      data: totpURI
    });
  } catch (error) {
    response.error(error);
  }
});

/**
 * Activate TOTP auth factor for user
 */
router.post("/activate", (0, _verifyUser.default)(), async (req, res) => {
  const response = new _responseClass.default(req, res);
  const {
    code
  } = req.body;
  try {
    const {
      user
    } = req;
    const totp = new _totpClass.default();
    const activated = await totp.activateRecord(user.id, code);
    if (!activated) throw new _CodedError.default("Error activating TOTP", 500, "TOTP|07");

    // give user new session token with mfa flag
    const userMethods = new _usersClass.default();
    const sessionToken = await userMethods.createSessionToken(user.id);
    response.setToken(sessionToken);
    response.success({
      message: "TOTP activated"
    });
  } catch (error) {
    response.error(error);
  }
});

/**
 * Verify TOTP auth factor for user, and authenticate the user
 * - User must have a valid session token with "sessionState": "half"
 */
router.post("/verify", async (req, res) => {
  const response = new _responseClass.default(req, res);
  const {
    code
  } = req.body;
  try {
    const sessionToken = req.headers.authorization.split(" ")[1];
    const userMethods = new _usersClass.default();
    const halfSessionTokenIsValid = await userMethods.checkHalfSessionToken(sessionToken);
    if (!halfSessionTokenIsValid) throw new _CodedError.default("Invalid session token", 400, "TOTP|05");
    const userId = JSON.parse(atob(sessionToken.split(".")[1])).id;
    const totp = new _totpClass.default();
    const isValid = await totp.verify(userId, code);
    if (!isValid) throw new _CodedError.default("Invalid code", 400, "TOTP|08");
    const cookies = new _cookiesClass.default(req, res);
    const fullSessionToken = await userMethods.createSessionToken(userId);
    if (!sessionToken) throw new _CodedError.default("Error creating session token", 500, "TOTP|09");
    cookies.setSessionCookie(fullSessionToken);
    const refreshToken = await userMethods.createRefreshToken(userId);
    if (!refreshToken) throw new _CodedError.default("Error creating refresh token", 500, "TOTP|10");
    const setRefreshCookie = cookies.setRefreshToken(refreshToken);
    if (!setRefreshCookie) throw new _CodedError.default("Error setting refresh token", 500, "TOTP|11");
    response.setToken(fullSessionToken);
    response.success({
      message: "User Session verified"
    });
  } catch (error) {
    response.error(error);
  }
});

/**
 * Deactivate TOTP auth factor for user
 */
router.post("/disable", (0, _verifyUser.default)(), async (req, res) => {
  const response = new _responseClass.default(req, res);
  try {
    const {
      user
    } = req;
    const totp = new _totpClass.default();
    const deactivated = await totp.deleteRecord(user.id);
    if (!deactivated) throw new _CodedError.default("Error deactivating TOTP", 500, "TOTP|12");
    response.success({
      message: "TOTP deactivated"
    });
  } catch (error) {
    response.error(error);
  }
});
const totpRoutes = router;
var _default = exports.default = totpRoutes;