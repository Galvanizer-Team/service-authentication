import express from "express"
import verifyUser from "../middleware/verifyUser"

const router = express.Router()

router.get("/", verifyUser(), async (req, res) => {
  res.json({ success: true, message: "Auth Service is live" })
})

const baseRoutes = router
export default baseRoutes
