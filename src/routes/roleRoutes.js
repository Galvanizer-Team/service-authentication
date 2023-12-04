import express from "express"
import verifyUser from "../middleware/verifyUser"

const router = express.Router()

router.get("/", verifyUser("roles_read"), async (req, res) => {
  res.json({ success: true, message: "Auth Service is live" })
})

const roleRoutes = router
export default roleRoutes
