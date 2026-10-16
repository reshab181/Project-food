import { randomUUID } from 'crypto';
import { Response } from 'express';
import { ProductModel } from '../models/Product';
import { socketService } from '../services/socketService';
import { AuthenticatedRequest } from '../types/auth';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

// The Product schema (and its variant/addOn sub-schemas) use a String `_id`
// with no default, which disables Mongoose's automatic ObjectId generation.
// When the client omits `_id`, saving fails with "document must have an _id".
// Generate stable string ids here for any document/sub-document missing one.
const withGeneratedIds = (body: Record<string, any>) => {
  const ensureId = (prefix: string, item: any) =>
    item && !item._id ? { ...item, _id: `${prefix}_${randomUUID()}` } : item;

  return {
    ...body,
    _id: body._id ?? `prod_${randomUUID()}`,
    variants: Array.isArray(body.variants) ? body.variants.map((v: any) => ensureId('var', v)) : body.variants,
    addOns: Array.isArray(body.addOns) ? body.addOns.map((a: any) => ensureId('addon', a)) : body.addOns
  };
};

export const listProducts = asyncHandler(async (req, res: Response) => {
  const { category, search, sortBy } = req.query;
  const filter: Record<string, unknown> = {};

  if (category) filter.category = category;
  if (search) filter.name = { $regex: String(search), $options: 'i' };

  let query = ProductModel.find(filter);
  if (sortBy === 'price') {
    query = query.sort({ 'variants.0.price': 1 });
  } else if (sortBy === 'popularity') {
    query = query.sort({ rating: -1, reviewCount: -1 });
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const products = await query.lean();
  res.json({
    data: products,
    meta: {
      total: products.length,
      page: 1,
      pageSize: products.length
    }
  });
});

export const getProductById = asyncHandler(async (req, res: Response) => {
  const product = await ProductModel.findById(req.params.id).lean();
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }
  res.json(product);
});

export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  let product;
  try {
    product = await ProductModel.create(
      withGeneratedIds({
        ...req.body,
        veg: true,
        badges: Array.from(new Set([...(req.body.badges ?? []), 'Pure Veg']))
      })
    );
  } catch (error: any) {
    // slug has a unique index; surface a clear 409 instead of an opaque 500.
    if (error?.code === 11000) {
      throw new ApiError(409, 'A product with this slug already exists. Please use a different slug.');
    }
    throw error;
  }

  socketService.emitToAll('products.updated', { productId: String(product._id) });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await ProductModel.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      veg: true,
      badges: Array.from(new Set([...(req.body.badges ?? []), 'Pure Veg']))
    },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  socketService.emitToAll('products.updated', { productId: String(product._id) });
  res.json(product);
});

export const deleteProduct = asyncHandler(async (_req: AuthenticatedRequest, _res: Response) => {
  throw new ApiError(403, 'Deleting products is intentionally restricted. Soft disable availability instead.');
});

export const addProductReview = asyncHandler(async (req, res: Response) => {
  const { customerName, rating, comment } = req.body;
  const product = await ProductModel.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  product.reviews.push({ customerName, rating, comment } as any);
  product.reviewCount = product.reviews.length;
  product.rating =
    product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviewCount;
  await product.save();

  res.status(201).json(product);
});
