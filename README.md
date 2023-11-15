# service-authentication

This is a service that provides authentication for the other services in the system.

### Features:

- Registration
- Login
- Logout
- Email verification
- SMS verification
- Magic links
- Password Reset
- Webhooks
- JWTs
  - Token Refresh
- OAuth
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
  "email": "example@mail.com", // required
  "password": "password123", // optional, if not provided, a random password will be generated
  "options": {
    "sendEmail": true, // optional, defaults to true
    "sendSms": true, // optional, defaults to false
    "setCookie": false // optional, will set a cookie with the JWT, defaults to false
  }
}
```

#### Response

Sets a cookie with the JWT if `options.setCookie` is true.

---

### POST /auth/unpw

Authenticates a user via username/password and returns a JWT.

#### Request

```json
{
  "email": "example@mail.com", // required
  "password": "password123", // required
  "options": {
    "setCookie": true // optional, will set a cookie with the JWT, defaults to true
  }
}
```

#### Response

Sets a cookie with the JWT if `options.setCookie` is true.

---

### GET /auth/{provider}

Authenticates a user via an OAuth provider

#### Request

_None_

---

### Get /auth/{provider}/callback

Callback for OAuth provider

#### Request

_This endpoint is not meant to be called directly_

---

### GET /logout

Logs out the user and clears the JWT cookie. Also revokes the refresh token.

#### Request

_None_

#### Response

**200** Clears the JWT cookie.
