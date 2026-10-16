import { v2 as cloudinary } from 'cloudinary';
import { Response } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
  });
}

export const uploadImage = asyncHandler(async (req, res: Response) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(400, 'Image file is required.');
  }

  if (!env.CLOUDINARY_CLOUD_NAME) {
    res.json({
      secureUrl: 'https://placehold.co/600x400?text=Bam+Bam+Pure+Veg',
      message: 'Cloudinary is not configured yet. Placeholder URL returned.'
    });
    return;
  }

  const uploaded = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
    folder: 'bam-bam-cake-shop'
  });

  res.json({ secureUrl: uploaded.secure_url });
});
