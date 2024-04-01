"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sendEmail;
async function sendEmail(email) {
  const {
    to,
    subject,
    text,
    html
  } = email;
  console.log("Email sending is not implemented yet");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Text: ${text}`);
  console.log(`HTML: ${html}`);
  return true;
}