import express from "express"
import Response from "../classes/responseClass"
import User from "../classes/usersClass"
import Cookies from "../classes/cookiesClass"
import CodedError from "../config/CodedError"

const router = express.Router()

router.post("/", async (req, res) => {
  const response = new Response(req, res)
  const { refreshToken } = req.body

  try {
    const cookies = new Cookies(req, res)

    if (!refreshToken) throw new CodedError("Token not found", 401, "REFRESH|01")

    const userMethods = new User()
    const { sessionToken, refreshToken: newRefreshToken } = await userMethods.refreshSessionToken(refreshToken)

    const refreshTokenSet = cookies.setRefreshToken(newRefreshToken)
    if (!refreshTokenSet) throw new CodedError("Token not set", 500, "REFRESH|02")

    response.setToken(sessionToken)
    response.success({ refreshToken: newRefreshToken })
  } catch (error) {
    response.error(error)
  }
})

const refreshRoutes = router
export default refreshRoutes
