import { Router } from 'express';
import { authController as authCtrl } from '../controllers';

import { upload } from '../middleware/multer';

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
router.post('/register/user', authCtrl.register);

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
router.post('/register/vendor', upload.single('idProof'), authCtrl.register);

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
router.post('/login', authCtrl.login);

router.post('/verify-otp', authCtrl.verifyOtp);
router.post('/resend-otp', authCtrl.resendOtp);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/reset-password', authCtrl.resetPassword);
router.post('/google', authCtrl.googleAuth);
router.post('/refresh', authCtrl.refresh);

export default router;
