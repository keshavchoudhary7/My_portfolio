# Portfolio Backend

Express API used by the portfolio contact form.

## Environment variables

Create `server/.env` locally:

```txt
PORT=5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-gmail-app-password
TO_EMAIL=your-recipient-email@gmail.com
CLIENT_ORIGIN=http://localhost:5173
SMTP_REJECT_UNAUTHORIZED=false
```

For Render, set `CLIENT_ORIGIN` to your Netlify URL, for example:

```txt
CLIENT_ORIGIN=https://your-site.netlify.app
```

## Gmail setup

1. Enable 2-factor authentication on the Gmail account.
2. Generate a Gmail App Password.
3. Put the app password in `SMTP_PASS`.
4. Use the Gmail address in SMTP_USER.

SMTP_REJECT_UNAUTHORIZED=false is useful for local networks that inject a self-signed certificate. In production, omit it or set it to 	rue unless Render has the same certificate issue.

## Run locally

From the project root:

```bash
npm install
npm run server
```

Health check:

```txt
http://localhost:5000/api/health
```

