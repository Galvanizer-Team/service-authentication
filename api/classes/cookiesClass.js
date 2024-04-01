"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _CodedError = _interopRequireDefault(require("../config/CodedError"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class Cookies {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  /**
   * Sets a cookie in the response
   */
  set(name, value, options = {}) {
    try {
      this.res.cookie(name, value, options);
      return true;
    } catch (error) {
      throw new _CodedError.default(`Error setting cookie: ${error.message}`, 500, "LOG|05");
    }
  }
  setSessionCookie(value) {
    this.set("session", value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
  }

  /**
   * Gets the refresh token from the request cookies
   * @returns {String} - The refresh token or false if not found
   */
  getRefreshToken() {
    try {
      const token = this.req?.cookies?.refreshToken;
      return token;
    } catch (error) {
      return false;
    }
  }

  /**
   * Adds an httpOnly cookie to the response
   * @param {string} name - The name of the cookie
   * @param {*} value - The value of the cookie
   * @param {*} options - The options of the cookie
   * @returns true if the cookie was added, throws an error otherwise
   */
  setHttpOnly(name, value, options = {}) {
    try {
      this.res.cookie(name, value, _objectSpread({
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
      }, options));
      return true;
    } catch (error) {
      throw new _CodedError.default(`Error setting cookie: ${error.message}`, 500, "LOG|05");
    }
  }

  /**
   * Sets the refresh token in the response cookies
   *
   * @param {*} token - The refresh token
   * @returns true if the cookie was added, throws an error otherwise
   */
  setRefreshToken(token) {
    try {
      this.setHttpOnly("refreshToken", token, {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      });

      return true;
    } catch (error) {
      throw new _CodedError.default(`Error setting cookie: ${error.message}`, 500, "LOG|05");
    }
  }
}
var _default = exports.default = Cookies;