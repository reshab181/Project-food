import { Router } from 'express';
import { assignDelivery, createOrder, getInvoice, getOrderById, listOrders, updateOrderStatus } from '../controllers/orderController';
import { requireAuth } from '../middleware/auth';
import { allowRoles } from '../middleware/roleGuard';

const router = Router();

router.use(requireAuth);
router.get('/', listOrders);
router.get('/:id', getOrderById);
router.post('/', allowRoles('customer'), createOrder);
router.patch('/:id/status', allowRoles('super_admin'), updateOrderStatus);
router.patch('/:id/assign-delivery', allowRoles('super_admin'), assignDelivery);
router.get('/:id/invoice', allowRoles('super_admin', 'staff'), getInvoice);

export default router;
