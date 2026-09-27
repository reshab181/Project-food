# Installation Guide

## 1. Prerequisites

- Node.js 20+
- npm 10+
- MongoDB 7+
- Expo CLI support through `npx expo`

## 2. Install dependencies

From the repo root:

```bash
npm install
```

## 3. Configure environment variables

Backend:

1. Copy `backend/.env.example` to `backend/.env`
2. Fill in MongoDB, JWT, Cloudinary, and Expo push values

Customer app:

1. Copy `apps/customer-app/.env.example` to `apps/customer-app/.env`
2. Set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_SOCKET_URL`

### Local MongoDB on Windows

The backend defaults to `mongodb://127.0.0.1:27017/bambam-cake-shop`. Confirm that MongoDB is listening on port 27017 before starting the API. If the installed Windows service cannot write to its Program Files data directory, start MongoDB against a project-owned directory instead:

```powershell
New-Item -ItemType Directory -Force .mongodb-data
& 'C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe' --dbpath "$PWD\.mongodb-data" --bind_ip 127.0.0.1 --port 27017
```

Keep that terminal open while developing. For production, use MongoDB Atlas or a managed MongoDB deployment rather than a local database.

Admin app:

1. Copy `apps/admin-app/.env.example` to `apps/admin-app/.env`
2. Set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_SOCKET_URL`

## 4. Seed demo data

```bash
npm run dev:backend
```

In another terminal:

```bash
npm --workspace @bambam/backend run seed
```

Default super admin credentials after seeding:

- Email: `admin@bambamcakeshop.com`
- Password: `Admin@123`

## 5. Run the apps

Backend:

```bash
npm run dev:backend
```

Customer app:

```bash
npm run dev:customer
```

Admin app:

```bash
npm run dev:admin
```

## 6. Production services to connect

- Google Sign-In: wire Expo Auth Session client IDs and call `POST /auth/google`
- OTP: connect Twilio, Firebase Auth, MSG91, or equivalent to the OTP hook
- Push notifications: store Expo push tokens per user and use the included notification service
- Payments: replace the current checkout selector with Razorpay, PhonePe, Paytm, or UPI SDK flow
