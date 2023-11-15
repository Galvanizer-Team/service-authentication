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

```js
{
  "email": "example@mail.com", // required
  "password": "password123", // optional, if not provided, a random password will be generated
  "options": {
    "sendEmail": true, // optional, defaults to true
    "sendSms": true, // optional, defaults to false
    "setCookie": false // optional, will set a cookie with the JWT, defaults to false
    "sendResetEmail": true // optional, will send a password reset email if password is not provided
  }
}
```

#### Response

Sets a cookie with the JWT if `options.setCookie` is true.

---

### POST /login

Authenticates a user via username/password and returns a JWT.

#### Request

```js
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

### POST /password/forgot

---

### GET /password/reset/:token

---

### POST /password/reset/:token

---

### GET /oauth/:provider

Authenticates a user via an OAuth provider

#### Request

_None_

---

### Get /oauth/:provider/callback

Callback for OAuth provider

#### Request

_This endpoint is not meant to be called directly_

---

### POST /oauth/link

---

### POST /login/magic

---

### GET /login/magic/:token

---

### GET /token/refresh

---

### GET /token/revoke

Logs out the user and clears the JWT cookie. Also revokes the refresh token.

#### Request

_None_

#### Response

**200** Clears the JWT cookie.

###

---

### POST /mfa/setup

---

### POST /mfa/verify

---

### POST /mfa/remove

---

### POST /otp/send

---

### POST /otp/verify

---

### POST /otp/remove

---

### POST /authenticator/setup

---

### POST /authenticator/verify

---

### GET /user

---

### GET /user/:user_id

---

### POST /user

---

### PUT /user/:user_id
