import CodedError from "../config/CodedError"

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof CodedError) {
    const responseBody = {
      success: false,
      message: err.message,
      location: err.location,
      req: process.env.NODE_ENV === "development" ? req.body : undefined,
      data: err.data,
    }
    return res.status(err.status ?? 500).json(responseBody)
  }
  if (process.env.NODE_ENV === "development") console.error(err)
  res.status(500).json({ status: false, message: err.message })
}

export default errorMiddleware
