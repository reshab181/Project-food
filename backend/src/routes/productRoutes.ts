import { Router } from 'express';
import { addProductReview, createProduct, deleteProduct, getProductById, listProducts, updateProduct } from '../controllers/productController';
import { requireAuth } from '../middleware/auth';
import { allowRoles } from '../middleware/roleGuard';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProductById);
router.post('/', requireAuth, allowRoles('super_admin'), createProduct);
router.patch('/:id', requireAuth, allowRoles('super_admin'), updateProduct);
router.delete('/:id', requireAuth, allowRoles('super_admin'), deleteProduct);
router.post('/:id/reviews', requireAuth, allowRoles('customer'), addProductReview);

export default router;
