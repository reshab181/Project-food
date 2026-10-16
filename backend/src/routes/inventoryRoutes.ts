import { Router } from 'express';
import { createInventoryItem, listInventory, updateInventoryItem } from '../controllers/inventoryController';
import { requireAuth } from '../middleware/auth';
import { allowRoles } from '../middleware/roleGuard';

const router = Router();

router.use(requireAuth, allowRoles('super_admin', 'staff'));
router.get('/', listInventory);
router.post('/', allowRoles('super_admin'), createInventoryItem);
router.patch('/:id', allowRoles('super_admin'), updateInventoryItem);

export default router;
