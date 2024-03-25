import bcrypt from "bcryptjs"
import isStrongPassword from "validator/lib/isStrongPassword"
import isJWT from "validator/lib/isJWT"
import CodedError from "../config/CodedError"
import JWT from "./jwtClass"
import Role from "./rolesClass"
import UserModel from "../models/User"

/**
 * Default data to create a new user
 * @typedef {Object} DefaultUser
 * @property {String} email - The user email
 * @property {String} password - The user password
 * @property {Boolean} active - The user status
 * @property {String} role - The name of the role
 */

class User {
  /**
   * Class for handling User operations
   */
  constructor() {
    this.User = UserModel
  }

  /**
   * Get all users that match the conditions
   * - Gets all users if no conditions are provided
   * @async
   * @param {object} conditions - Conditions to filter the users
   * @returns {Promise<User[]>} Users
   */
  async getUsers(conditions) {
    try {
      const users = await UserModel.findAll({ where: conditions })

      users.forEach((user) => {
        // eslint-disable-next-line no-param-reassign
        delete user.dataValues.password
      })

      return users
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|00")
    }
  }

  /**
   * Get a single user
   * @async
   * @param {object} conditions - Conditions to filter the user
   * @returns {Promise<User>} User
   */
  async getUser(conditions = {}) {
    try {
      const user = await UserModel.findOne({ where: conditions })
      // if (user) delete user.dataValues.password

      return user
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|01")
    }
  }

  /**
   * Hashes a password
   * - Also ensures the password complies with the password policy
   * @param {*} password
   */
  async hashPassword(password) {
    try {
      if (!password) throw new CodedError("Password is required", 400, "USER|32")
      if (!isStrongPassword(password)) throw new CodedError("Password does not meet requirements", 400, "USER|33")

      const hashedPassword = await bcrypt.hash(password, 10)
      return hashedPassword
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|34")
    }
  }

  /**
   * Creates a new User
   * @async
   * @param {object} data - Data to create the user
   * @returns {Promise<User>} User
   */
  async createUser(data = {}) {
    const role = new Role()

    try {
      const createUserData = {
        active: data.active ?? true,
      }

      if (!data.email) throw new CodedError("Email is required", 400, "USER|02")
      createUserData.email = data.email

      const roleName = data.role || "User"
      const roleObject = await role.getRole({ name: roleName })
      createUserData.roleId = roleObject.id

      if (!roleObject) {
        if (roleName !== "User") throw new CodedError("Role not found", 400, "USER|03")
        const newRole = await role.createRole({ name: roleName })
        createUserData.roleId = newRole.id
      }

      if (data.password) {
        const hashedPassword = await this.hashPassword(data.password)
        createUserData.password = hashedPassword
      }

      const user = await UserModel.create(createUserData)
      return user
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|04")
    }
  }

  /**
   * Updates a single user
   * - Can be used to update a user's password
   * - Can be used to update a user's role
   * @async
   * @param {object} data - Data to update the user
   * @param {object} conditions - Conditions to filter the user
   * @returns {Promise<User>} User
   */
  async updateUser(data, conditions) {
    try {
      // get users
      const user = await this.getUser(conditions)

      if (!user.length) throw new CodedError("No users found", 400, "USER|05")

      // prep data
      const updateUserData = {}

      if (data.email) {
        const userWithEmail = await this.getUser({ email: data.email })
        if (userWithEmail && user.dataValues.id !== userWithEmail.dataValues.id) throw new CodedError("Email already taken", 400, "USER|06")
        updateUserData.email = data.email
      }

      if (typeof data.active !== "undefined") updateUserData.active = data.active

      if (data.password) updateUserData.password = await this.hashPassword(data.password)

      if (data.role) {
        const role = new Role()

        const roleObject = await role.getRole({ name: data.role })
        if (!roleObject) throw new CodedError("Role not found", 400, "USER|07")

        updateUserData.roleId = roleObject.id
      }

      // update user
      const updatedUser = await user.update(updateUserData)
      return updatedUser
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|08")
    }
  }

  /**
   * Deletes a single user
   * @async
   * @param {object} conditions - Will delete the first user that matches the conditions
   * @returns {Promise<User>} User
   */
  async deleteUser(conditions) {
    try {
      const user = await this.getUser(conditions)
      if (!user) throw new CodedError("User not found", 400, "USER|09")

      await user.destroy()
      return user
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|10")
    }
  }

  /**
   * Checks if a user has a capability
   * @async
   * @param {Number} userId - The user id
   * @param {String} capability - The capability to check
   * @returns {Promise<Boolean>} - True if the user has the capability
   */
  async hasCapabilities(userId, ...capabilities) {
    return true
    // try {
    //   return true // right now, all users have all capabilities

    //   // if (!userId) throw new CodedError("User ID is required", 400, "USER|11")
    //   // if (!capabilities.length) throw new CodedError("At least 1 capability is required", 400, "USER|12")

    //   // const user = await this.getUser({ id: userId })
    //   // if (!user) throw new CodedError("User not found", 400, "USER|13")

    //   // const userRole = await user.getRole()
    //   // const userRoleData = userRole.get()
    //   // const userCapabilities = userRoleData.capabilities.map((capability) => capability.dataValues?.name)
    //   // const userHasAllCapabilities = capabilities.every((capability) => userCapabilities.includes(capability))

    //   // return userHasAllCapabilities
    // } catch (error) {
    //   // throw new CodedError(error.message, error.status ?? 500, error.location ?? "USER|15")
    // }
  }

  /**
   * Checks if a password matches the user's password
   * @async
   * @param {String} userId - The user id
   * @param {String} password - The password to check
   * @returns {Promise<Boolean>} - True if the password matches
   */
  async checkPassword(userId, password) {
    try {
      const user = await this.getUser({ id: userId })
      if (!user) throw new CodedError("User not found", 400, "USER|13")

      const passwordMatches = await bcrypt.compare(password, user?.dataValues?.password)
      return passwordMatches
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|14")
    }
  }

  /**
   * Generate a session token for a user
   * @async
   * @param {Number} userId - The user id
   * @returns {Promise<String>} - The session token
   */
  async createSessionToken(userId) {
    try {
      const jwt = new JWT()

      const user = await this.getUser({ id: userId })
      if (!user) throw new CodedError("User not found", 400, "USER|15")

      const token = await jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user?.dataValues?.roleId,
          mfa: user?.dataValues?.mfa ?? false,
          sessionState: "full",
        },
        "15m" // change to 15m in production
      )
      return token
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|16")
    }
  }

  /**
   * Create a 'half' session token for a user
   * - This token signifies that the user has input their password correctly
   * - but has not yet completed 2FA
   * @async
   * @param {Number} userId - The user id
   * @returns {Promise<String>} - The session token
   */
  async createHalfSessionToken(userId) {
    try {
      const jwt = new JWT()

      const user = await this.getUser({ id: userId })
      if (!user) throw new CodedError("User not found", 400, "USER|15")

      const token = await jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user?.dataValues?.roleId,
          sessionState: "half",
        },
        "5m"
      )
      return token
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|16")
    }
  }

  /**
   * Generates a refresh token for a user
   * @async
   * @param {Number} userId - The user id
   * @returns {Promise<String>} - The refresh token
   */
  async createRefreshToken(userId) {
    try {
      const jwt = new JWT(process.env.REFRESH_JWT_PUBLIC, process.env.REFRESH_JWT_PRIVATE)

      const user = await this.getUser({ id: userId })
      if (!user) throw new CodedError("User not found", 400, "USER|17")

      // expires in 1 week
      const token = await jwt.sign({ id: user.id, email: user.email, role: user?.dataValues?.roleId }, "1w")
      return token
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|18")
    }
  }

  /**
   * Checks if a session token is valid
   * - Session token needs to be a 'full' session token
   * - Half session tokens are not valid
   * @async
   * @param {String} token - The session token
   * @returns {Promise<Boolean>} - True if the token is valid
   */
  async checkSessionToken(token) {
    try {
      const jwt = new JWT()

      const decodedToken = await jwt.verify(token)
      if (decodedToken instanceof CodedError) throw decodedToken

      if (decodedToken.sessionState !== "full") throw new CodedError("Session Token is invalid", 400, "USER|18")

      const user = await this.getUser({ id: decodedToken.id })
      if (!user) throw new CodedError("User not found", 400, "USER|19")

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Checks if a half session token is valid
   * @async
   * @param {String} token - The session token
   * @returns {Promise<Boolean>} - True if the token is valid
   */
  async checkHalfSessionToken(token) {
    try {
      const jwt = new JWT()

      const decodedToken = await jwt.verify(token)
      if (decodedToken instanceof CodedError) throw decodedToken

      if (decodedToken.sessionState !== "half") throw new CodedError("Session Token is invalid", 400, "USER|18")

      const user = await this.getUser({ id: decodedToken.id })
      if (!user) throw new CodedError("User not found", 400, "USER|19")

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Checks if a refresh token is valid
   * @async
   * @param {String} token - The refresh token
   * @returns {Promise<Object>} - An object containing the data from the token
   */
  async checkRefreshToken(token) {
    try {
      if (!token) throw new CodedError("Refresh Token is required", 400, "USER|20")
      if (!isJWT(token)) throw new CodedError("Token is invalid", 400, "USER|21")

      const jwt = new JWT(process.env.REFRESH_JWT_PUBLIC, process.env.REFRESH_JWT_PRIVATE)

      const decodedToken = await jwt.verify(token)
      if (decodedToken instanceof CodedError) throw decodedToken

      const user = await this.getUser({ id: decodedToken.id })
      if (!user) throw new CodedError("User not found", 400, "USER|21")

      return decodedToken
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|22")
    }
  }

  /**
   * Refreshes a session token
   * @async
   * @param {String} refreshToken - The refresh token
   * @returns {Promise<Object>} - An object containing the new session token and new refresh token
   */
  async refreshSessionToken(refreshToken) {
    try {
      const jwt = new JWT()
      const validRefreshToken = await this.checkRefreshToken(refreshToken)

      const token = await this.createSessionToken(validRefreshToken.id)
      const newRefreshToken = await this.createRefreshToken(validRefreshToken.id)

      const blacklistOldToken = await jwt.blacklist(refreshToken)
      if (!blacklistOldToken) throw new CodedError("Could not blacklist old token", 500, "USER|23")

      return { sessionToken: token, refreshToken: newRefreshToken }
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|24")
    }
  }

  /**
   * Issues a password reset token
   * @async
   * @param {String} email - The user email
   * @returns {Promise<String>} - The password reset token
   */
  async createPasswordResetToken(email) {
    try {
      const jwt = new JWT(process.env.PASSWORD_JWT_PUBLIC, process.env.PASSWORD_JWT_PRIVATE)

      const user = await this.getUser({ email })
      if (!user) throw new CodedError("User not found", 400, "USER|25")

      const token = await jwt.sign({ id: user.id, email: user.email }, "15m")
      return token
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|26")
    }
  }

  /**
   * Checks if a password reset token is valid
   * @async
   * @param {String} token - The password reset token
   * @returns {Promise<Boolean>} - True if the token is valid
   */
  async checkPasswordResetToken(token) {
    try {
      const jwt = new JWT(process.env.PASSWORD_JWT_PUBLIC, process.env.PASSWORD_JWT_PRIVATE)

      const decodedToken = await jwt.verify(token)
      if (decodedToken instanceof CodedError) throw decodedToken

      const user = await this.getUser({ id: decodedToken.id })
      if (!user) throw new CodedError("User not found", 400, "USER|27")

      return true
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|28")
    }
  }

  /**
   * Resets a user's password
   * @async
   * @param {String} token - The password reset token
   * @param {String} password - The new password
   * @returns {Promise<Boolean>} - True if the password was reset
   */
  async resetPassword(token, password) {
    try {
      if (!token) throw new CodedError("Password Token is required", 400, "USER|29")
      if (!password) throw new CodedError("Password is required", 400, "USER|30")

      const jwt = new JWT(process.env.PASSWORD_JWT_PUBLIC, process.env.PASSWORD_JWT_PRIVATE)

      const decodedToken = await jwt.verify(token)
      if (decodedToken instanceof CodedError) throw decodedToken

      const user = await this.getUser({ id: decodedToken.id })
      if (!user) throw new CodedError("User not found", 400, "USER|29")

      const hashedPassword = await this.hashPassword(password)
      await user.update({ password: hashedPassword })

      const blacklistOldToken = await jwt.blacklist(token)
      if (!blacklistOldToken) throw new CodedError("Could not blacklist old token", 400, "USER|30")

      return true
    } catch (error) {
      throw new CodedError(error.message, 400, "USER|31")
    }
  }
}

export default User
