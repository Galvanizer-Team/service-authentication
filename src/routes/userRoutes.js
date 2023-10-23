import express from "express"
import logMiddleware from "../middleware/logMiddleware"
import ash from "express-async-handler"
import { User } from "../database/User"

const router = express.Router()

router.use(logMiddleware)

router.get(
  "/",
  ash(async (req, res) => {
    const users = await User.findAll()
    res.json({ status: "success", data: users })
  })
)

router.post(
  "/",
  ash(async (req, res) => {
    const { username, email, password } = req.body
    const user = await User.create({ username, email, password })
    res.json({ status: "success", data: user })
  })
)

const userRoutes = router
export default userRoutes
