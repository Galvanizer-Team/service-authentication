"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _isJWT = _interopRequireDefault(require("validator/lib/isJWT"));
var _CodedError = _interopRequireDefault(require("../config/CodedError"));
var _usersClass = _interopRequireDefault(require("../classes/usersClass"));
var _cookiesClass = _interopRequireDefault(require("../classes/cookiesClass"));
var _responseClass = _interopRequireDefault(require("../classes/responseClass"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Middleware to verify a user's session
 * @param  {...string} capabilities - The capabilities required to access the route
 */

function verifyUser(...capabilities) {
  return async function verifyUserInner(req, res, next) {
    const response = new _responseClass.default(req, res);
    let token = req.headers?.authorization?.split(" ")?.[1]; // Bearer <token>

    try {
      if (!token) throw new _CodedError.default("Session Token is required", 400, "VERIFY|01");
      if (!(0, _isJWT.default)(token)) throw new _CodedError.default("Session Token is invalid", 400, "VERIFY|02");
      const userMethods = new _usersClass.default();
      const userTokenIsValid = await userMethods.checkSessionToken(token);
      const tokenContent = JSON.parse(atob(token.split(".")[1]));
      if (tokenContent.sessionState !== "full") throw new _CodedError.default("Session Token is invalid", 400, "VERIFY|021");
      if (!userTokenIsValid) {
        const cookies = new _cookiesClass.default(req, res);
        const refreshToken = cookies.getRefreshToken();
        const newTokens = await userMethods.refreshSessionToken(refreshToken);
        token = newTokens.sessionToken;
        req.token = newTokens.sessionToken;
        cookies.setRefreshToken(newTokens.refreshToken);
      }
      req.user = JSON.parse(atob(token.split(".")[1]));
      if (!capabilities.length) return next();
      const userHasCapabilities = await userMethods.hasCapabilities(req.user.id, ...capabilities);
      if (!userHasCapabilities) throw new _CodedError.default("User does not have required capabilities", 403, "VERIFY|03");
      next();
    } catch (error) {
      response.error(error);
    }
  };
}
var _default = exports.default = verifyUser;