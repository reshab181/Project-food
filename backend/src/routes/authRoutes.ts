import { Router } from 'express';
import { googleLogin, login, me, registerPushToken, requestOtp, seedSuperAdmin, signup, verifyOtp } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/request-otp', requestOtp);
// Keep the old path as an alias so existing clients keep working.
router.post('/send-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/seed-super-admin', seedSuperAdmin);
router.get('/me', requireAuth, me);
router.post('/push-token', requireAuth, registerPushToken);

export default router;
