import Response from "../classes/responseClass"

export default function requireSSL(req, res, next) {
  const response = new Response(req, res)

  try {
    // if (!req.secure && process.env.NODE_ENV === "production") throw new Error("SSL required")
    next()
  } catch (err) {
    response.error(err)
  }
}
