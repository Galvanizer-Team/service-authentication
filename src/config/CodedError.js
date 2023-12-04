class CodedError extends Error {
  constructor(message, status, location, data) {
    super(message) // Human-readable message
    this.name = this.constructor.name
    this.status = status // HTTP status code
    this.location = location
    this.data = data
  }
}

export default CodedError
