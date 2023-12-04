import jwt from "jsonwebtoken"
import CodedError from "../config/CodedError"
import { Role } from "../database/Role"

const verifyUser = (...capabilities) => {
  // list of required capabilities to access the route
  return async (req, res, next) => {
    const token = req.headers?.["authorization"]?.split(" ")?.[1] // Bearer <token>

    try {
      if (!token) throw new CodedError("Token is required", 400, "VERIFY|01")

      let decoded
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
      } catch (error) {
        throw new CodedError("Verification Failed", 400, "VERIFY|02")
      }

      req.user = decoded

      // Check if user has the required capabilities
      if (capabilities.length > 0) {
        if (!decoded.role) throw new CodedError("Role not found", 400, "VERIFY|03")

        const userRole = await Role.findOne({ where: { name: decoded.role } })
        if (!userRole) throw new CodedError("Role not found", 400, "VERIFY|04")

        const userCapabilities = userRole.dataValues.capabilities
        if (!userCapabilities) throw new CodedError("No capabilities found for this role", 400, "VERIFY|05")

        req.capabilities = userCapabilities // so we can use without re-querying the database

        const hasCapabilities = capabilities.every((capability) => userCapabilities.includes(capability))
        if (!hasCapabilities) throw new CodedError("User does not have the required capabilities", 400, "VERIFY|06")
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default verifyUser
