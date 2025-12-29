# 🚀 Final Deployment Guide for InfinityFree

## Your Database Credentials (Already Configured)

| Setting | Value |
|---------|-------|
| **Host** | `sql207.infinityfree.com` |
| **Database** | `if0_38807577_curtisworkspace` |
| **Username** | `if0_38807577` |
| **Password** | `Arcuwamb12` |
| **Port** | `3306` |

---

## Step 1: Import Database Schema

1. Go to [InfinityFree Control Panel](https://dash.infinityfree.com)
2. Click on **MySQL Databases**
3. Find your database and click **phpMyAdmin** (Admin button)
4. In phpMyAdmin, select your database `if0_38807577_curtisworkspace` from the left sidebar
5. Click the **Import** tab at the top
6. Click **Choose File** and select: `database_schema.sql` (from your project folder)
7. Scroll down and click **Go**
8. ✅ You should see "Import has been successfully finished"

---

## Step 2: Build Production Version

Open your terminal in the project folder and run:

```powershell
npm run build:production
```

This will:
- Build the React app
- Copy the `api/` folder with your credentials to `build/`

---

## Step 3: Upload to InfinityFree

### Option A: Using File Manager (Easier)
1. Go to InfinityFree Control Panel
2. Click **File Manager** → **Online File Manager**
3. Navigate to `htdocs/`
4. Delete any existing files (select all → delete)
5. Click **Upload** and upload ALL files from your `build/` folder
   - You may need to upload folders separately (static, api)
   - Or zip the build folder, upload, and extract

### Option B: Using FTP (Faster for many files)
1. Use an FTP client like FileZilla
2. Connect with:
   - **Host**: Your FTP hostname from control panel
   - **Username**: Your FTP username
   - **Password**: Your FTP password
3. Navigate to `htdocs/`
4. Upload all contents from `build/` folder

---

## Step 4: Verify Deployment

### Test the Site
1. Visit your InfinityFree domain (e.g., `yourdomain.infinityfree.com`)
2. The React app should load

### Test the API
Visit these URLs to test (should return JSON):
- `yourdomain.infinityfree.com/api/guestbook.php?approved=true`
- `yourdomain.infinityfree.com/api/contacts.php`

If you see JSON responses (even empty arrays `[]`), the API is working!

### Test Form Submission
1. Go to your Contact page
2. Submit a test message
3. Check if it appears in Admin panel (`/admin10@10`)

---

## Step 5: Security Cleanup

> ⚠️ **IMPORTANT**: Delete `setup.php` from the server!

1. In File Manager, navigate to `htdocs/api/`
2. Delete `setup.php`

This prevents anyone from seeing your database structure.

---

## Troubleshooting

### "Database connection failed"
- Double-check credentials in `api/config.php` on the server
- Make sure you imported the SQL schema first

### API returns 500 error
- Check `api/config.php` has correct credentials
- Verify tables exist in phpMyAdmin

### Page refresh shows 404
- Confirm `.htaccess` was uploaded to `htdocs/`
- Check the file has the `/api/` exception rule

### CORS errors
- The API already includes CORS headers
- Clear browser cache and try again

---

## Files to Upload Summary

```
From: build/
To:   htdocs/

├── index.html           ✓
├── static/              ✓ (folder with JS/CSS)
├── .htaccess            ✓ (IMPORTANT!)
├── api/                 ✓ (folder with PHP files)
│   ├── config.php       ✓ (has your credentials)
│   ├── guestbook.php    ✓
│   ├── contacts.php     ✓
│   ├── bookings.php     ✓
│   ├── resume-requests.php ✓
│   └── admin-stats.php  ✓
├── favicon.ico          ✓
├── manifest.json        ✓
├── robots.txt           ✓
└── [other assets]       ✓
```

---

## Quick Checklist

- [ ] Imported `database_schema.sql` to phpMyAdmin
- [ ] Ran `npm run build:production`
- [ ] Uploaded all files from `build/` to `htdocs/`
- [ ] Visited site and confirmed it loads
- [ ] Tested API endpoints
- [ ] Tested form submission
- [ ] Deleted `setup.php` from server
- [ ] 🎉 Done!

---

## Need Help?

If something doesn't work:
1. Check browser console (F12) for errors
2. Check Network tab for failed API requests
3. Verify files uploaded correctly in File Manager
4. Test API directly in browser to see error messages
