import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const defaultRecipient = process.env.TO_EMAIL || process.env.SMTP_USER
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`))
    },
  }),
)
app.use(express.json({ limit: '20kb' }))
app.use(express.urlencoded({ extended: true }))

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
    },
  })

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Portfolio mail API is running.' })
})

app.post('/api/contact', async (req, res) => {
  const { name = '', email = '', message = '' } = req.body || {}
  const cleanName = name.trim()
  const cleanEmail = email.trim()
  const cleanMessage = message.trim()

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' })
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !defaultRecipient) {
    return res.status(500).json({
      success: false,
      message: 'SMTP is not configured. Add valid email environment variables before sending mail.',
    })
  }

  try {
    const transporter = createTransporter()

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: defaultRecipient,
      replyTo: cleanEmail,
      subject: `New portfolio inquiry from ${cleanName}`,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`,
      html: `
        <h2>New portfolio inquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(cleanName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(cleanMessage).replace(/\n/g, '<br />')}</p>
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

