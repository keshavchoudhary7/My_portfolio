# Keshav Portfolio

Professional portfolio with a separate deployable frontend and backend.

## Folder structure

```txt
portfolio/
  client/   # Netlify frontend: React + Vite
  server/   # Render backend: Express + Nodemailer
```

There is intentionally no root `package.json`. The frontend and backend are independent apps with their own dependencies and lockfiles.

## Local development

Install and run the frontend:

```bash
cd client
npm install
npm run dev
```

Install and run the backend in another terminal:

```bash
cd server
npm install
npm start
```

Frontend local URL: `http://localhost:5173`
Backend local URL: `http://localhost:5000`

## Deployment

See `DEPLOYMENT.md` for Netlify and Render setup.
