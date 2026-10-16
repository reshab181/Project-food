import mongoose, { Schema } from 'mongoose';

const inventoryItemSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    currentStock: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, required: true, default: 0 },
    category: { type: String, enum: ['raw_material', 'finished_good'], required: true }
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const InventoryItemModel = mongoose.model('InventoryItem', inventoryItemSchema);
