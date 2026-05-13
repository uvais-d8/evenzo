import { Router } from 'express';
import { authController as authCtrl } from '../controllers';
import { upload } from '../middleware/multer';
import { validateRequest } from '../middleware/validation.middleware';
import { 
    registerSchema, 
    loginSchema, 
    verifyOtpSchema, 
    emailSchema, 
    resetPasswordSchema,
    refreshTokenSchema
} from '../../application/utils/validation';

const router = Router();


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register/user:
 *   post:
 *     summary: Register a new user (JSON)
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Registration successful
 */
router.post('/register/user', validateRequest(registerSchema), authCtrl.register);

/**
 * @swagger
 * /api/auth/register/vendor:
 *   post:
 *     summary: Register a new vendor (Multipart)
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Registration successful
 */
router.post('/register/vendor', upload.single('idProof'), validateRequest(registerSchema), authCtrl.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User/Vendor Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, role]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', validateRequest(loginSchema), authCtrl.login);

router.post('/verify-otp', validateRequest(verifyOtpSchema), authCtrl.verifyOtp);
router.post('/resend-otp', validateRequest(emailSchema), authCtrl.resendOtp);
router.post('/forgot-password', validateRequest(emailSchema), authCtrl.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), authCtrl.resetPassword);
router.post('/google', authCtrl.googleAuth);
router.post('/refresh', validateRequest(refreshTokenSchema), authCtrl.refresh);

export default router;


