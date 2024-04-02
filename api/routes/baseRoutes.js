import express from "express"
import verifyUser from "../middleware/verifyUser"
import Response from "../classes/responseClass"

const router = express.Router()

router.get("/", verifyUser(), async (req, res) => {
  const response = new Response(req, res)

  try {
    response.success({ message: "Hello, world!" })
  } catch (error) {
    response.error(error)
  }
})

const baseRoutes = router
export default baseRoutes
