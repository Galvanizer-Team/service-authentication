import express from "express"
import logMiddleware from "../middleware/logMiddleware"

const router = express.Router()

router.use(logMiddleware)

router.get("/", async (req, res) => {
  res.json({ status: true, message: "This test was successful." })
})

router.get("/:id", async (req, res) => {
  const { id } = req.params
  res.json({ status: true, message: `This test was successful. ID: ${id}` })
})

const testRoutes = router
export default testRoutes
