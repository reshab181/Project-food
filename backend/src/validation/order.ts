import { z } from 'zod';

const addressSchema = z.object({
  label: z.string().trim().min(1).max(60),
  line1: z.string().trim().min(1).max(160),
  line2: z.string().trim().max(160).optional(),
  landmark: z.string().trim().max(160).optional(),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(3).max(12)
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        variantId: z.string().trim().min(1),
        quantity: z.coerce.number().int().min(1).max(50),
        addOnIds: z.array(z.string().trim().min(1)).max(20).default([])
      })
    )
    .min(1)
    .max(50),
  address: addressSchema,
  paymentMethod: z.enum(['cod', 'upi', 'qr', 'razorpay']),
  scheduledFor: z.string().datetime({ offset: true }).optional(),
  note: z.string().trim().max(500).optional(),
  couponCode: z.string().trim().min(1).max(40).optional()
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
