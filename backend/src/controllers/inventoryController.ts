import { Response } from 'express';
import { InventoryItemModel } from '../models/InventoryItem';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const listInventory = asyncHandler(async (_req, res: Response) => {
  const items = await InventoryItemModel.find().sort({ updatedAt: -1 }).lean();
  res.json({ data: items, meta: { total: items.length, page: 1, pageSize: items.length } });
});

export const createInventoryItem = asyncHandler(async (req, res: Response) => {
  const item = await InventoryItemModel.create(req.body);
  res.status(201).json(item);
});

export const updateInventoryItem = asyncHandler(async (req, res: Response) => {
  const item = await InventoryItemModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) {
    throw new ApiError(404, 'Inventory item not found.');
  }
  res.json(item);
});
