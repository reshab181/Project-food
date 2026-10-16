# Deployment Guide

## Backend

Recommended stack:

- Node.js server on Render, Railway, Fly.io, or AWS ECS
- MongoDB Atlas
- Cloudinary for image storage
- Expo push notifications or FCM/APNs bridge

Steps:

1. Build the backend with `npm --workspace @bambam/backend run build`
2. Set `backend/.env` values in your hosting platform
3. Enable CORS for production customer and admin app URLs
4. Seed production-safe initial data only if needed
5. Create the first super admin, then rotate the default password

## Customer and Admin apps

Recommended stack:

- Expo EAS Build for Android and iOS
- EAS Update for OTA releases

Steps:

1. Point both apps to the production API and socket endpoints
2. Configure app IDs:
   - Customer: `com.bambamcakeshop.customer`
   - Admin: `com.bambamcakeshop.admin`
3. Add production Google Sign-In credentials
4. Configure push notification certificates / keys
5. Add payment gateway credentials
6. Build with EAS for Android and iOS

## Security checklist

- Replace all example secrets
- Enforce strong admin passwords
- Store JWT refresh tokens securely if you extend refresh flows
- Add request validation and rate limiting before public launch
- Restrict image upload size and MIME types in production
- Add audit logging for admin actions
