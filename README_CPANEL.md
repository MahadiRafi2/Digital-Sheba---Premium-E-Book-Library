# Deployment Instructions for cPanel (PHP + MySQL)

Follow these steps to deploy **Digital Sheba** to your shared hosting environment.

### 1. Database Setup
1. Log in to your cPanel and open **MySQL® Databases**.
2. Create a new database (e.g., `yourname_library`).
3. Create a new database user and give them a password.
4. Add the user to the database with **ALL PRIVILEGES**.
5. Open **phpMyAdmin**, select your new database, and click the **Import** tab.
6. Upload the `database.sql` file provided in this project and click **Go**.

### 2. Configure PHP
1. Open the file `config.php` in your File Manager.
2. Update the following lines with your cPanel database details:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'your_database_name'); // e.g., yourname_library
   define('DB_USER', 'your_database_user'); // e.g., yourname_libuser
   define('DB_PASS', 'your_database_password');
   ```
3. Change the `JWT_SECRET` to a random string for security.

### 3. Build & Upload Files
1. Run `npm run build` in your local terminal (or wait for the environment to build).
2. All files in the `dist/` folder are your frontend.
3. Upload the **contents** of the `dist/` folder to your cPanel's `public_html` directory.
4. Upload the following files/folders to the same `public_html` directory:
   - `api/` (folder)
   - `.htaccess`
   - `config.php`

### 4. Verification
1. Visit your domain (e.g., `https://yourdomain.com`).
2. You should see the login screen or home page.
3. To test the API, visit `https://yourdomain.com/api/health`. It should return `{"status":"ok", ...}`.

### Administrative Credentials
- **Admin Email**: `admin@example.com`
- **Admin Password**: `admin123`
- **User Access PIN**: `admin123` (Change these in the Admin Dashboard settings after login).

### Important Note on Redirects
The included `.htaccess` ensures that if you are on `/admin` and refresh the page, Apache will load the React app correctly instead of showing a 404 error.
