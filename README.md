# Bam Bam Cake Shop Ecosystem

Production-oriented monorepo for the Bam Bam Cake Shop mobile platform.

## Included apps

- `apps/customer-app`: Pure Veg ecommerce experience for customers
- `apps/admin-app`: Super admin and staff management app
- `backend`: Express + MongoDB + Socket.IO API
- `packages/shared`: Shared types, constants, theme tokens, and demo data

## Key business rules

- Every menu item is `100% Pure Veg`
- No egg, no meat, no non-veg ingredients
- Products are auto-tagged with a Pure Veg badge
- Staff can view incoming orders
- Only the super admin can manage order status, product availability, staff permissions, and offers

## Core capabilities delivered

- Secure authentication flows for customer and admin apps
- Customer catalog, cart, checkout, wishlist, notifications, and order tracking
- Admin dashboard, order operations, product management, inventory visibility, staff/customer views, coupons, and reports
- Shared backend contracts across mobile and server code
- Real-time updates through Socket.IO
- Push notification integration hooks through Expo
- Cloudinary-ready image upload endpoint

## Docs

- Go live (deploy everything for a client): `docs/deployment/GO_LIVE_GUIDE.md`
- Setup guide: `docs/INSTALLATION.md`
- Database schema: `docs/DATABASE_SCHEMA.md`
- API endpoints: `docs/api/API_ENDPOINTS.md`
- Deployment: `docs/deployment/DEPLOYMENT_GUIDE.md`
- Branding and app assets: `docs/branding/APP_ASSETS.md`
