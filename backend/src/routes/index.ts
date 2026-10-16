import { Router } from 'express';
import adminRoutes from './adminRoutes';
import authRoutes from './authRoutes';
import couponRoutes from './couponRoutes';
import inventoryRoutes from './inventoryRoutes';
import notificationRoutes from './notificationRoutes';
import orderRoutes from './orderRoutes';
import productRoutes from './productRoutes';
import uploadRoutes from './uploadRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Bam Bam Cake Shop API is running.'
  });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/admin', adminRoutes);
router.use('/coupons', couponRoutes);
router.use('/notifications', notificationRoutes);
router.use('/uploads', uploadRoutes);

export default router;
