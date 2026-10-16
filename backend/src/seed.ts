import { demoCoupons, demoInventory, demoProducts } from '@bambam/shared';
import { connectDatabase } from './config/db';
import { CouponModel } from './models/Coupon';
import { InventoryItemModel } from './models/InventoryItem';
import { ProductModel } from './models/Product';
import { UserModel } from './models/User';

const seed = async () => {
  await connectDatabase();

  await ProductModel.deleteMany({});
  await CouponModel.deleteMany({});
  await InventoryItemModel.deleteMany({});

  await ProductModel.insertMany(demoProducts);
  await CouponModel.insertMany(demoCoupons);
  await InventoryItemModel.insertMany(demoInventory);

  const adminEmail = 'admin@bambamcakeshop.com';
  const existingAdmin = await UserModel.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await (UserModel as any).hashPassword('Admin@123');
    await UserModel.create({
      fullName: 'Bam Bam Owner',
      email: adminEmail,
      phone: '+910000000000',
      passwordHash,
      role: 'super_admin',
      permissions: ['manage_orders', 'manage_products', 'manage_inventory', 'manage_staff', 'manage_offers', 'manage_reports']
    });
  }

  console.log('Seed completed.');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
