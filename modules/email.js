import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  service: "elasticemail",
  host:'smtp.elasticemail.com',
  port:25,
  auth: {
    user: 'user',
    pass: 'pass'
  }
})

export const getPasswordResetURL = (user, token) =>
  `http://localhost:3000/password/reset/${user._id}/${token}`

export const resetPasswordTemplate = (user, url) => {
  const from = 'bakaretemitayo712@gmail.com'
  const to = user.email
  const subject = "Dev Pool Password Reset"
  const html = `
  <p>Hey ${user.name || user.email},</p>
  <p>We heard that you lost your Dev pool password. Sorry about that!</p>
  <p>But don’t worry! You can use the following link to reset your password:</p>
  <a href=${url}>${url}</a>
  <p>If you don’t use this link within 1 hour, it will expire.</p>
  <p>Do something outside today! </p>
  <p>–Your friends at Dev Pool</p>
  `

  return { from, to, subject, html }
}