import { z } from 'zod';

export const addressInputSchema = z.object({
  label: z.string().trim().min(1, 'Address label is required.').max(60),
  line1: z.string().trim().min(1, 'Address line is required.').max(160),
  line2: z.string().trim().max(160).optional(),
  landmark: z.string().trim().max(160).optional(),
  city: z.string().trim().min(1, 'City is required.').max(80),
  state: z.string().trim().min(1, 'State is required.').max(80),
  postalCode: z.string().trim().min(3, 'Enter a valid postal code.').max(12)
});
