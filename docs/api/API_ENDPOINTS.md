# API Endpoints

Base URL: `/api/v1`

## Health

- `GET /health`

## Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/send-otp`
- `POST /auth/verify-otp`
- `POST /auth/seed-super-admin`
- `POST /auth/push-token`
- `GET /auth/me`

## Products

- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`
- `POST /products/:id/reviews`

## Orders

- `GET /orders`
- `GET /orders/:id`
- `POST /orders`
- `PATCH /orders/:id/status`
- `PATCH /orders/:id/assign-delivery`
- `GET /orders/:id/invoice`

## Inventory

- `GET /inventory`
- `POST /inventory`
- `PATCH /inventory/:id`

## Admin

- `GET /admin/dashboard`
- `GET /admin/customers`
- `GET /admin/reports`
- `GET /admin/staff`
- `POST /admin/staff`
- `PATCH /admin/staff/:id`
- `DELETE /admin/staff/:id`

## Coupons

- `GET /coupons`
- `POST /coupons`
- `PATCH /coupons/:id`

## Notifications

- `GET /notifications`
- `PATCH /notifications/:id/read`

## Uploads

- `POST /uploads/image`

## Real-time socket events

- `orders.created`
- `orders.updated`
- `products.updated`
- `join:user`
- `join:role`
