import express from "express"
import logMiddleware from "../middleware/logMiddleware"

const router = express.Router()

router.use(logMiddleware)

router.get("/", async (req, res) => {
  res.json({ status: true, message: "Welcome to the auth microservice" })
})

const baseRoutes = router
export default baseRoutes
