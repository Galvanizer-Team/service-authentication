"use strict";

var _express = _interopRequireWildcard(require("express"));
require("dotenv/config");
var _cors = _interopRequireDefault(require("cors"));
var _cookieParser = _interopRequireDefault(require("cookie-parser"));
var _helmet = _interopRequireDefault(require("helmet"));
var _database = _interopRequireDefault(require("./config/database"));
var _requireSSL = _interopRequireDefault(require("./middleware/requireSSL"));
var _baseRoutes = _interopRequireDefault(require("./routes/baseRoutes"));
var _registerRoutes = _interopRequireDefault(require("./routes/registerRoutes"));
var _loginRoutes = _interopRequireDefault(require("./routes/loginRoutes"));
var _passwordRoutes = _interopRequireDefault(require("./routes/passwordRoutes"));
var _userRoutes = _interopRequireDefault(require("./routes/userRoutes"));
var _refreshRoutes = _interopRequireDefault(require("./routes/refreshRoutes"));
var _totpRoutes = _interopRequireDefault(require("./routes/totpRoutes"));
require("./models/index");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// Routes

// DB Models

const PORT = process.env.PORT || 3000;
const app = (0, _express.default)();
app.set("trust proxy", 1);
app.use((0, _express.json)());
app.use((0, _cors.default)());
app.use((0, _helmet.default)());
app.use((0, _cookieParser.default)());
app.use(_requireSSL.default);
app.use("/", _baseRoutes.default);
app.use("/register", _registerRoutes.default);
app.use("/login", _loginRoutes.default);
app.use("/password", _passwordRoutes.default);
app.use("/users", _userRoutes.default);
app.use("/refresh", _refreshRoutes.default);
app.use("/totp", _totpRoutes.default);
app.listen(PORT, async () => {
  try {
    await _database.default.sync();
  } catch (error) {
    if (process.env.NODE_ENV !== "development") return;
    // eslint-disable-next-line no-console
    console.error("Error syncing database:", error.message);
  }
});