# Deployment Guide

This project is split into two independent deployable apps:

- `client/`: Vite + React portfolio, deploy to Netlify.
- `server/`: Express + Nodemailer contact API, deploy to Render.

There is no root `package.json`. Run install/build commands inside the app folder you are deploying.

## Local development

Frontend:

```bash
cd client
npm install
npm run dev
```

Backend:

```bash
cd server
npm install
npm start
```

The frontend calls `/api/contact` locally. Vite proxies `/api` to `http://localhost:5000`.

## Render backend

Create a Render Web Service with:

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`

Add these Render environment variables:

```txt
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-gmail-app-password
TO_EMAIL=your-recipient-email@gmail.com
CLIENT_ORIGIN=https://your-netlify-site.netlify.app
```

After deploy, your API URL will look like:

```txt
https://your-render-service.onrender.com
```

## Netlify frontend

Netlify can read `netlify.toml`, or set manually:

- Base directory: `client`
- Build command: `npm install && npm run build`
- Publish directory: `client/dist`

Add this Netlify environment variable:

```txt
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

Redeploy Netlify after changing `VITE_API_BASE_URL`.

## Important security note

Do not commit `.env` files. If a Gmail app password has ever been committed or shared, revoke it and create a new app password.
