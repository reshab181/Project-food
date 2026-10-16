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
