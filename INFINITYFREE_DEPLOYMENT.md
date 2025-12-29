# InfinityFree Deployment Guide

This guide explains how to deploy your React + PHP portfolio to InfinityFree hosting.

## Architecture Overview

```
htdocs/                    ← Your InfinityFree htdocs folder
├── index.html             ← React app entry point
├── static/                ← React compiled assets (JS, CSS)
├── .htaccess              ← Routes SPA + allows PHP API
└── api/                   ← PHP backend
    ├── config.php         ← Database configuration
    ├── guestbook.php      ← Guestbook CRUD
    ├── contacts.php       ← Contact form handling
    ├── bookings.php       ← Call booking system
    ├── resume-requests.php
    ├── admin-stats.php
    └── setup.php          ← DB table creation (DELETE after use!)
```

## Step 1: Create MySQL Database on InfinityFree

1. Log into [InfinityFree Control Panel](https://infinityfree.net/accounts)
2. Go to **MySQL Databases**
3. Click **Create New Database**
4. Note down these credentials:
   - **Host**: `sql###.infinityfree.com` (the ### is your server number)
   - **Database Name**: Something like `if0_XXXXXXXX_portfolio`
   - **Username**: Usually like `if0_XXXXXXXX`
   - **Password**: The password you set

## Step 2: Configure Production Credentials

Edit `api/config.production.php` and fill in your credentials:

```php
$MYSQL_HOST = 'sql123.infinityfree.com';  // Your actual host
$MYSQL_NAME = 'if0_12345678_portfolio';    // Your database name
$MYSQL_USER = 'if0_12345678';               // Your username
$MYSQL_PASS = 'your_actual_password';       // Your password
```

## Step 3: Build for Production

Run this command to build and prepare for InfinityFree:

```bash
npm run build:production
```

This will:
1. Build the React app
2. Copy the `api/` folder to `build/`
3. Replace `config.php` with your production credentials from `config.production.php`

## Step 4: Upload to InfinityFree

1. Access your InfinityFree file manager or use FTP
2. Navigate to `htdocs/`
3. Delete any existing files (backup first if needed)
4. Upload **all contents** from your `build/` folder

## Step 5: Initialize Database Tables

1. Visit `https://yourdomain.infinityfree.com/api/setup.php`
2. You should see a success message with tables created
3. **IMPORTANT**: Delete `setup.php` from the server for security!
   - In file manager, navigate to `htdocs/api/`
   - Delete `setup.php`

## Step 6: Test Your Deployment

Test these features:
- [ ] Homepage loads correctly
- [ ] Navigation works (React Router)
- [ ] Contact form submits successfully
- [ ] Guestbook entries appear
- [ ] Admin panel shows data (`/admin10@10`)

## Troubleshooting

### "Database connection failed"
- Double-check your credentials in `config.php`
- Make sure the database exists in InfinityFree panel
- Verify the host format: `sql###.infinityfree.com`

### API calls return 404
- Confirm `api/` folder was uploaded to `htdocs/`
- Check `.htaccess` is present and has the API exception

### Page refresh shows 404
- Verify `.htaccess` was uploaded
- Make sure `mod_rewrite` is enabled (it is on InfinityFree by default)

### CORS errors in console
- The API files already include CORS headers
- If still having issues, check if your domain matches the request origin

## Security Checklist

- [ ] Delete `setup.php` after initial database setup
- [ ] Never commit `config.production.php` with real credentials to Git
- [ ] Consider adding admin authentication for sensitive endpoints

## Local Development

For local testing with the PHP backend:

**Terminal 1 - PHP Server:**
```bash
cd api
php -S localhost:8080
```

**Terminal 2 - React Dev Server:**
```bash
npm start
```

The React app will call `http://localhost:8080` for API requests during development.

## Build Scripts Reference

| Command | Description |
|---------|-------------|
| `npm start` | Start React dev server |
| `npm run build` | Build + copy API (dev config) |
| `npm run build:dev` | Build only (no API copy) |
| `npm run build:production` | Build + copy API with production config |
