import CodedError from "../config/CodedError"

class Response {
  /**
   * Used to normalize the response
   *
   * @param {*} req
   * @param {*} res
   */
  constructor(req, res) {
    this.req = req
    this.res = res
  }

  /**
   * Called when the request is successful
   * @param {*} data
   * @returns {boolean} true
   */
  success(data) {
    const response = { success: true }

    if (this.req.token) response.token = this.req.token
    if (data) response.data = data

    this.res.status(this.req.status ?? 200).json(response)

    return true
  }

  /**
   * Called when the request is unsuccessful
   * @param {*} error
   * @returns {boolean} true
   */
  error(error) {
    const isDev = process.env.NODE_ENV === "development"
    if (isDev) console.error(error)
    if (error instanceof CodedError) {
      const responseBody = {
        error: true,
        success: false,
        message: error.message,
        location: isDev ? error.location : undefined,
        req: isDev ? this.req.body : undefined,
        data: error.data,
      }
      this.res.status(error.status ?? 500).json(responseBody)
      return true
    }

    this.res.status(500).json({ success: false, error: true, message: error.message })
    return true
  }

  /**
   * Sets the status code for the response
   * @param {*} status
   * @returns {boolean} - true
   */
  setStatus(status) {
    this.req.status = status
    return true
  }

  /**
   * Sets the token for the response
   * @param {*} token
   * @returns {boolean} - true
   */
  setToken(token) {
    this.req.token = token
    return true
  }
}

export default Response
