import Response from "../classes/responseClass"

const errorMiddleware = (err, req, res) => {
  const response = new Response(req, res)
  response.error(err)
}

export default errorMiddleware
