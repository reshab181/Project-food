import { Router } from 'express';
import { createCoupon, listCoupons, updateCoupon } from '../controllers/couponController';
import { requireAuth } from '../middleware/auth';
import { allowRoles } from '../middleware/roleGuard';

const router = Router();

router.get('/', listCoupons);
router.post('/', requireAuth, allowRoles('super_admin'), createCoupon);
router.patch('/:id', requireAuth, allowRoles('super_admin'), updateCoupon);

export default router;
