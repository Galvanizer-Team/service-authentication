# service-authentication

This is a service that provides authentication for the other services in the system.

### Features:

Registration, login, logout, email verification, SMS verification. magic links. password Reset, webhooks, JWTs, token refresh, OAuth (Configurable token providers, Linking oAuth to user profile), MFA (SMS-based, OTPs, Authenticator apps), rate limiting, CAPTCHA, audit trail, roles and caps

### Contents:

- [Reference](#reference)
- [Endpoints](#endpoints)
  - [POST /register](#post-register)
  - [POST /login](#post-login)
  - [POST /password/forgot](#post-passwordforgot)
  - [GET /password/reset/:token](#get-passwordresettoken)
  - [POST /password/reset/:token](#post-passwordresettoken)
  - [GET /oauth/:provider](#get-oauthprovider)
  - [Get /oauth/:provider/callback](#get-oauthprovidercallback)
  - [POST /oauth/link](#post-oauthlink)
  - [POST /login/magic](#post-loginmagic)
  - [GET /login/magic/:token](#get-loginmagictoken)
  - [GET /token/refresh](#get-tokenrefresh)
  - [GET /token/revoke](#get-tokenrevoke)
  - [POST /email/verify](#post-emailverify)
  - [GET /email/verify/:token](#get-emailverifytoken)
  - [POST /mfa/setup](#post-mfasetup)
  - [POST /mfa/verify](#post-mfaverify)
  - [POST /mfa/remove](#post-mfaremove)
  - [POST /otp/send](#post-otpsend)
  - [POST /otp/verify](#post-otpverify)
  - [POST /otp/remove](#post-otpremove)
  - [POST /authenticator/setup](#post-authenticatorsetup)
  - [POST /authenticator/verify](#post-authenticatorverify)
  - [GET /user](#get-user)
  - [GET /user/:user_id](#get-useruser_id)
  - [POST /user](#post-user)
  - [PUT /user/:user_id](#put-useruser_id)
  - [GET /webhooks](#get-webhooks)
  - [POST /webhooks](#post-webhooks)
  - [PUT /webhooks/:webhook_id](#put-webhookswebhook_id)
  - [DELETE /webhooks/:webhook_id](#delete-webhookswebhook_id)
  - [GET /audit/logs](#get-auditlogs)

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
    "sendEmail": true, // optional
    "sendSms": true, // optional
    "setCookie": true // optional
    "sendResetEmail": true // optional, will send a password reset email if password is not provided
    "verifyEmail": true // optional, will send a verification email when the user is created
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

### POST /email/verify

---

### GET /email/verify/:token

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

---

### GET /webhooks

---

### POST /webhooks

---

### PUT /webhooks/:webhook_id

---

### DELETE /webhooks/:webhook_id

---

### GET /audit/logs
