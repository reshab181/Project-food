# Bam Bam Cake Shop - Go Live Guide

This is the single, start-to-finish guide to take the whole system live:
backend API, database, and the two Android apps (Customer + Admin).

Follow the parts in order. Part A (backend) must be done before Part C
(rebuilding the apps), because the apps need the real backend URL baked in.

---

## What you are deploying

| Piece          | What it is                               | Where it runs                 |
|----------------|-------------------------------------------|-------------------------------|
| Backend API    | Express + MongoDB + Socket.IO server      | Render / Railway (cloud)      |
| Database       | MongoDB                                   | MongoDB Atlas (cloud)         |
| Customer app   | Android app `com.bambamcakeshop.customer` | Users' phones (APK)           |
| Admin app      | Android app `com.bambamcakeshop.admin`    | Staff/admin phones (APK)      |

Ready-made installable APKs already exist in the `dist-apk/` folder, but they
point at a placeholder backend URL. After deploying the backend you must
rebuild the apps once with the real URL (Part C).

---

## Accounts you need (all have free tiers)

1. **MongoDB Atlas** - the database. https://www.mongodb.com/atlas
2. **Render** - hosts the backend. https://render.com (or Railway / Fly.io)
3. **GitHub** - to connect the repo to Render. https://github.com
4. (Optional) **Cloudinary** - image uploads. https://cloudinary.com
5. (Optional) **Expo** - only if you later want cloud app builds. https://expo.dev

You do NOT need a Google Play account unless you want to publish on the Play
Store. Sharing the APK file directly is enough for most clients.

---

## Part A - Deploy the backend

### A1. Create the database (MongoDB Atlas)

1. Sign up at MongoDB Atlas and create a free **M0** cluster.
2. Under **Database Access**, create a database user (note the username/password).
3. Under **Network Access**, add IP `0.0.0.0/0` (allow from anywhere) so the
   host can connect. (You can tighten this later.)
4. Click **Connect -> Drivers** and copy the connection string. It looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/bambam-cake-shop?retryWrites=true&w=majority`
   Replace `USER` and `PASSWORD` with the user you created, and keep the
   `/bambam-cake-shop` database name.

### A2. Put the code on GitHub

1. Create a new (private) GitHub repository.
2. Push this project to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

### A3. Deploy on Render (using the included blueprint)

The repo already contains `render.yaml`, so Render can configure everything.

1. On Render: **New + -> Blueprint**, pick your GitHub repo.
2. Render reads `render.yaml` and creates the `bambam-backend` web service.
   - Build command: `npm install && npm --workspace @bambam/backend run build`
   - Start command: `npm --workspace @bambam/backend run start`
   - Health check path: `/health`
   - `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are generated automatically.
3. When prompted, fill in the secret env vars:
   - `MONGODB_URI` = the Atlas connection string from step A1.
   - (Optional) `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
   - Leave `CLIENT_APP_URL` / `ADMIN_APP_URL` / `CORS_ORIGINS` blank for now.
4. Click **Apply / Deploy** and wait for the build to finish.
5. Render gives you a public URL, e.g. `https://bambam-backend.onrender.com`.

> Not using Render? A `backend/Dockerfile` is included for any container host
> (Railway, Fly.io, AWS, etc.). Build from the repo root:
> `docker build -f backend/Dockerfile -t bambam-backend .`
> Set the same env vars listed in `backend/.env.production.example`.

### A4. Verify the backend is live

Open these in a browser (replace the host with your Render URL):

- `https://bambam-backend.onrender.com/health` -> `{"status":"ok"}`
- `https://bambam-backend.onrender.com/api/v1/health` -> status ok message

### A5. Seed starter data + first admin

The database starts empty. To load demo products/coupons/inventory and create
the first super admin, run the seed once. Easiest options:

- **Locally against the production DB** (one time):
  ```bash
  # from the repo root, with the Atlas URI exported
  # PowerShell:  $env:MONGODB_URI="<your atlas uri>"
  npm --workspace @bambam/backend run build
  npm --workspace @bambam/backend run seed:prod
  ```
- Or run the same command from the Render Shell.

**Default super admin after seeding:**
- Email: `admin@bambamcakeshop.com`
- Password: `Admin@123`

> SECURITY: log in and change this password immediately after go-live.

---

## Part B - Point the apps at the backend

The apps read the backend URL from two environment variables at build time:

```
EXPO_PUBLIC_API_URL     = https://bambam-backend.onrender.com/api/v1
EXPO_PUBLIC_SOCKET_URL  = https://bambam-backend.onrender.com
```

Note the `/api/v1` suffix on the API URL and NOT on the socket URL. Use your
real Render host. These are the values you will pass in Part C.

---

## Part C - Rebuild the Android apps with the real URL

> The APKs already in `dist-apk/` were built with a placeholder URL and will
> not connect to your server. Rebuild once with the steps below.

### Build environment (one time)

- Node.js 20+ and npm 10+
- Java 17+ (JDK) and Android SDK (Android Studio installs both)
- `ANDROID_HOME` / `ANDROID_SDK_ROOT` pointing at the SDK

> Windows note: this project builds through a short virtual drive to avoid the
> Windows 260-character path limit during the native build. The commands below
> set that up with `subst`. On macOS/Linux this is not needed - just run the
> gradle commands from the app's `android` folder.

### C1. Install dependencies (from repo root)

```bash
npm install
```

### C2. Build the Customer APK (Windows)

```powershell
# 1. Map a short drive to the repo root to keep native build paths short
subst X: "D:\Personal\Project-food-main\Project-food-main"

# 2. Make sure the native project exists (safe to re-run)
cd X:\apps\customer-app
npx expo prebuild --platform android

# 3. Build, injecting the real backend URL
cd X:\apps\customer-app\android
$env:EXPO_PUBLIC_API_URL="https://bambam-backend.onrender.com/api/v1"
$env:EXPO_PUBLIC_SOCKET_URL="https://bambam-backend.onrender.com"
.\gradlew.bat assembleRelease --no-daemon

# APK: X:\apps\customer-app\android\app\build\outputs\apk\release\app-release.apk

# 4. Remove the virtual drive when done
subst X: /D
```

### C3. Build the Admin APK (Windows)

Same as C2 but with the `admin-app` folder:

```powershell
subst X: "D:\Personal\Project-food-main\Project-food-main"
cd X:\apps\admin-app
npx expo prebuild --platform android
cd X:\apps\admin-app\android
$env:EXPO_PUBLIC_API_URL="https://bambam-backend.onrender.com/api/v1"
$env:EXPO_PUBLIC_SOCKET_URL="https://bambam-backend.onrender.com"
.\gradlew.bat assembleRelease --no-daemon
# APK: X:\apps\admin-app\android\app\build\outputs\apk\release\app-release.apk
subst X: /D
```

> If the native build fails on `generateCodegenSchemaFromJavaScript` with a
> "different roots" message, run `.\gradlew.bat generateCodegenArtifactsFromSchema --no-daemon`
> once from the normal `D:\...\<app>\android` path first, then re-run the
> `assembleRelease` from the `X:` drive.

### macOS / Linux build (no subst needed)

```bash
npm install
cd apps/customer-app && npx expo prebuild --platform android
cd android
EXPO_PUBLIC_API_URL="https://bambam-backend.onrender.com/api/v1" \
EXPO_PUBLIC_SOCKET_URL="https://bambam-backend.onrender.com" \
./gradlew assembleRelease
# repeat for apps/admin-app
```

---

## Part D - Install the apps

- Copy each `app-release.apk` to the phone (USB, email, or a download link).
- On the phone, allow "Install unknown apps" for the file manager/browser.
- Tap the APK to install.
- Customer app = "Bam Bam Cake Shop"; Admin app = "Bam Bam Management".

The Customer and Admin apps have different package IDs, so both can be
installed on the same device.

---

## Part E - Final go-live checklist

- [ ] Atlas cluster created, network access allows the host.
- [ ] Backend deployed; `/health` returns ok.
- [ ] Seed run once; demo data visible via `/api/v1/products`.
- [ ] Logged in as super admin and **changed the default password**.
- [ ] Apps rebuilt with the real backend URL (Part C).
- [ ] Installed both APKs and confirmed login + product list load on a phone.
- [ ] (If a web admin is used) set `CLIENT_APP_URL` / `ADMIN_APP_URL` /
      `CORS_ORIGINS` on the backend and redeploy.
- [ ] (Recommended before public launch) add rate limiting and upload MIME/size
      limits - see `docs/deployment/DEPLOYMENT_GUIDE.md` security checklist.

---

## Optional services (connect later)

These are stubbed and can be wired when needed (see `docs/INSTALLATION.md`):

- **Payments** - Razorpay / PhonePe / Paytm / UPI in the checkout flow.
- **Push notifications** - set `EXPO_ACCESS_TOKEN`; store device push tokens.
- **Image uploads** - set the Cloudinary env vars to enable the upload endpoint.
- **Google Sign-In / OTP** - wire the provider to the existing auth hooks.

---

## Where things are (quick reference)

| Need                        | File / location                                  |
|-----------------------------|--------------------------------------------------|
| Backend env template        | `backend/.env.production.example`                |
| Backend host config         | `render.yaml`, `backend/Dockerfile`              |
| App env template            | `apps/*/.env.production.example`                 |
| App config (URLs, IDs)      | `apps/*/app.config.js`                           |
| Prebuilt APKs               | `dist-apk/`                                       |
| API endpoint reference      | `docs/api/API_ENDPOINTS.md`                      |
| Database schema             | `docs/DATABASE_SCHEMA.md`                        |
| Security checklist          | `docs/deployment/DEPLOYMENT_GUIDE.md`            |
