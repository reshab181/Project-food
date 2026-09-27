import { Router } from 'express';
import { addAddress, googleLogin, login, me, registerPushToken, sendOtp, signup, verifyOtp } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', requireAuth, me);
router.post('/addresses', requireAuth, addAddress);
router.post('/push-token', requireAuth, registerPushToken);

export default router;
