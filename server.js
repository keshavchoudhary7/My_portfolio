import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const defaultRecipient = process.env.TO_EMAIL || 'keshavchoudhary782@gmail.com'

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: true,
  logger: true,
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Portfolio mail API is running.' })
})

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {}

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' })
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_PASS === 'your_gmail_app_password') {
    return res.status(500).json({
      success: false,
      message: 'SMTP is not configured. Add a valid Gmail App Password in the environment before sending mail.',
    })
  }

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: defaultRecipient,
      replyTo: email.trim(),
      subject: `New portfolio inquiry from ${name.trim()}`,
      text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\nMessage:\n${message.trim()}`,
      html: `
        <h2>New portfolio inquiry</h2>
        <p><strong>Name:</strong> ${name.trim()}</p>
        <p><strong>Email:</strong> ${email.trim()}</p>
        <p><strong>Message:</strong></p>
        <p>${message.trim().replace(/\n/g, '<br />')}</p>
      `,
    })

    return res.json({ success: true, message: 'Your message was sent successfully.' })
  } catch (error) {
    console.error('SMTP send failed:', error.response?.body || error.message)
    return res.status(500).json({
      success: false,
      message: error.response?.body?.includes('Application-specific password required')
        ? 'SMTP authentication failed. Use a valid Gmail App Password in the environment.'
        : 'Unable to send the message right now. Please try again later.',
    })
  }
})

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
