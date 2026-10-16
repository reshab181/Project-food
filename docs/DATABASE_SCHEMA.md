# Database Schema

## Collections

### `users`

- `fullName`
- `email`
- `phone`
- `passwordHash`
- `role`: `customer | super_admin | staff | delivery_partner`
- `permissions[]`
- `avatarUrl`
- `loyaltyPoints`
- `googleId`
- `addresses[]`
- `wishlist[]`
- `expoPushTokens[]`

### `products`

- `name`
- `slug`
- `category`: `cakes | pizza | burger`
- `shortDescription`
- `description`
- `ingredients[]`
- `imageUrls[]`
- `badges[]`
- `veg`: always `true`
- `rating`
- `reviewCount`
- `isBestSeller`
- `isTrending`
- `isRecommended`
- `isAvailable`
- `variants[]`
- `addOns[]`
- `stockQty`
- `prepTimeMinutes`
- `loyaltyPoints`
- `reviews[]`

### `orders`

- `orderNumber`
- `customer`
- `items[]`
- `address`
- `pricing`
- `status`
- `paymentMethod`
- `paymentStatus`
- `scheduledFor`
- `note`
- `couponCode`
- `deliveryPartnerName`
- `timeline[]`

### `inventoryitems`

- `name`
- `unit`
- `currentStock`
- `reorderLevel`
- `category`: `raw_material | finished_good`

### `coupons`

- `code`
- `title`
- `description`
- `discountType`
- `discountValue`
- `minimumOrderValue`
- `maxDiscountValue`
- `isActive`

### `notifications`

- `userId`
- `title`
- `message`
- `type`
- `orderId`
- `readAt`

## Index suggestions

- `users.email`
- `users.phone`
- `products.slug`
- `orders.orderNumber`
- `orders.customer._id`
- `notifications.userId`
