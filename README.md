# Scented Muse

## Deployment

This project is deployed to Truehost/cPanel shared hosting from:

```bash
/home/mlyycypz/Scented-Muse-Shop
```

The public web root is:

```bash
/home/mlyycypz/public_html
```

Frontend assets must be built locally because the server does not have Node.js or npm:

```bash
npm run build
git add public/build
git commit -m "Build frontend assets"
git push origin main
```

### Make The Script Executable

Run this once on the server:

```bash
cd /home/mlyycypz/Scented-Muse-Shop
chmod +x deploy.sh
```

### Run Deployment

```bash
cd /home/mlyycypz/Scented-Muse-Shop
./deploy.sh
```

### What The Script Does

The deployment script:

- Verifies it is running from the Laravel project root by checking for `artisan`.
- Pulls the latest code with `git pull origin main`.
- Runs `composer install --no-dev --optimize-autoloader`.
- Runs database migrations with `php artisan migrate --force`.
- Optimizes Laravel with `php artisan optimize`.
- Verifies `public/build/manifest.json` exists.
- Copies everything from `public/` into `/home/mlyycypz/public_html`.
- Creates upload directories under `/home/mlyycypz/public_html/uploads`.
- Applies upload permissions with `chmod -R 775`.
- Verifies `/home/mlyycypz/public_html/index.php` exists.

Uploads are stored directly in `public_html/uploads`; no `php artisan storage:link` is required.

### Common Deployment Errors

`public/build/manifest.json is missing`:

Run `npm run build` locally, commit `public/build`, push to GitHub, then run `./deploy.sh` again.

`vendor/autoload.php` is missing or Composer fails:

Run the script again after checking that Composer is available for PHP 8.3 on the server.

Database migration fails:

Check the production `.env` database credentials, then rerun:

```bash
php artisan migrate --force
```

Images upload but do not display:

Confirm production `.env` has:

```env
PUBLIC_PATH=/home/mlyycypz/public_html
```

Then ensure upload folders exist:

```bash
mkdir -p /home/mlyycypz/public_html/uploads/products
mkdir -p /home/mlyycypz/public_html/uploads/products/variants
mkdir -p /home/mlyycypz/public_html/uploads/hero-slides
chmod -R 775 /home/mlyycypz/public_html/uploads
```

Permission denied:

Ask Truehost support to reset ownership of the project and `public_html` files to the cPanel user, then rerun the deployment.

### Recover From A Failed Deployment

Because the script uses `set -e`, it stops at the first failed command and prints the command that failed.

To recover:

1. Read the failed command shown in red.
2. Fix the underlying issue, such as permissions, missing build files, Composer, or `.env`.
3. Rerun:

```bash
./deploy.sh
```

If assets were copied before a later failure, rerunning the script is safe. The script syncs dependencies, reruns migrations safely, recopies public assets, and recreates upload directories.
