# Portfolio Backend Setup

## Required environment variables

Create a .env file in the project root with these values:

PORT=5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-app-password
TO_EMAIL=keshavchoudhary782@gmail.com

## Gmail setup

1. Enable 2-factor authentication on the Gmail account.
2. Generate an App Password.
3. Put the app password in SMTP_PASS.
4. Ensure SMTP_USER is the Gmail address.

## Run the backend

npm install
npm run backend
