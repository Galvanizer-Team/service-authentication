"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _verifyUser = _interopRequireDefault(require("../middleware/verifyUser"));
var _usersClass = _interopRequireDefault(require("../classes/usersClass"));
var _responseClass = _interopRequireDefault(require("../classes/responseClass"));
var _CodedError = _interopRequireDefault(require("../config/CodedError"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = _express.default.Router();
router.get("/:id", (0, _verifyUser.default)("users_read"), async (req, res) => {
  const response = new _responseClass.default(req, res);
  const {
    id
  } = req.params;
  try {
    const userMethods = new _usersClass.default();
    const {
      user
    } = req;
    const userCanReadAllUsers = await userMethods.hasCapabilities(user.id, "users_read_all");
    const users = await userMethods.getUser({
      id
    });
    if (!userCanReadAllUsers) {
      if (users?.dataValues?.id === user.id) return response.success(users);
      throw new _CodedError.default("You are not allowed to read this user", 403, "USERS|01");
    }
    response.success(users);
  } catch (error) {
    response.error(error);
  }
});
router.get("/", (0, _verifyUser.default)("users_read"), async (req, res) => {
  const response = new _responseClass.default(req, res);
  try {
    const userMethods = new _usersClass.default();
    const {
      user
    } = req;
    const userCanReadAllUsers = await userMethods.hasCapabilities(user.id, "users_read_all");
    if (!userCanReadAllUsers) {
      const users = await userMethods.getUsers({
        id: user.id
      });
      return response.success(users);
    }
    const users = await userMethods.getUsers();
    response.success(users);
  } catch (error) {
    response.error(error);
  }
});
router.post("/", (0, _verifyUser.default)("users_create"), async (req, res) => {
  const response = new _responseClass.default(req, res);
  const {
    body
  } = req;
  try {
    const userMethods = new _usersClass.default();
    const {
      user
    } = req;
    delete body.id;
    delete body.password; // You can't set the password when creating a user.

    const userCanCreateUsers = await userMethods.hasCapabilities(user.id, "users_create");
    if (!userCanCreateUsers) throw new _CodedError.default("You are not allowed to create users", 403, "USERS|02");
    const newUser = await userMethods.createUser(body);
    response.success(newUser);
  } catch (error) {
    response.error(error);
  }
});
router.put("/:id", (0, _verifyUser.default)("users_update"), async (req, res) => {
  const response = new _responseClass.default(req, res);
  const {
    body
  } = req;
  const {
    id
  } = req.params;
  try {
    const userMethods = new _usersClass.default();
    const {
      user
    } = req;
    delete body.password;
    delete body.id;
    const userCanUpdateUsers = await userMethods.hasCapabilities(user.id, "users_update");
    if (!userCanUpdateUsers) throw new _CodedError.default("You are not allowed to update users", 403, "USERS|03");
    const updatedUser = await userMethods.updateUser(id, body);
    response.success(updatedUser);
  } catch (error) {
    response.error(error);
  }
});
router.delete("/:id", (0, _verifyUser.default)("users_delete"), async (req, res) => {
  const response = new _responseClass.default(req, res);
  const {
    id
  } = req.params;
  try {
    const userMethods = new _usersClass.default();
    const {
      user
    } = req;
    const userCanDeleteUsers = await userMethods.hasCapabilities(user.id, "users_delete");
    if (!userCanDeleteUsers) throw new _CodedError.default("You are not allowed to delete users", 403, "USERS|04");
    await userMethods.deleteUser(id);
    response.success("User deleted");
  } catch (error) {
    response.error(error);
  }
});
const baseRoutes = router;
var _default = exports.default = baseRoutes;