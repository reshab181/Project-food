import { Router } from 'express';
import { listCustomers } from '../controllers/customerController';
import { getDashboardSummary } from '../controllers/dashboardController';
import { getReports } from '../controllers/reportController';
import { createStaff, listStaff, removeStaff, updateStaff } from '../controllers/staffController';
import { requireAuth } from '../middleware/auth';
import { allowRoles } from '../middleware/roleGuard';

const router = Router();

router.use(requireAuth, allowRoles('super_admin', 'staff'));
router.get('/dashboard', getDashboardSummary);
router.get('/customers', listCustomers);
router.get('/reports', getReports);
router.get('/staff', listStaff);
router.post('/staff', allowRoles('super_admin'), createStaff);
router.patch('/staff/:id', allowRoles('super_admin'), updateStaff);
router.delete('/staff/:id', allowRoles('super_admin'), removeStaff);

export default router;
