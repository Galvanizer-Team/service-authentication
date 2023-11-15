# service-authentication

This is a service that provides authentication for the other services in the system.

### Features:

- Registration
- Login
- Password Reset
- Webhooks
- JWTs
  - Token Refresh
- oAuth
  - Configurable token providers
  - Linking oAuth to user profile
- MFA
  - SMS-based, OTPs
  - Authenticator apps
- Rate limiting
- CAPTCHA
- Audit trail
- Roles and caps

---

## Reference

## Endpoints

### POST /register

Register a new user.

#### Request

```json
{
  "email": "example@gmail.com", // required
  "password": "password123" // optional, if not provided, a random password will be generated
}
```
