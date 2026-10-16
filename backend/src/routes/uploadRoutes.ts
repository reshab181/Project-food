import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController';
import { requireAuth } from '../middleware/auth';
import { allowRoles } from '../middleware/roleGuard';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/image', requireAuth, allowRoles('super_admin'), upload.single('image'), uploadImage);

export default router;
