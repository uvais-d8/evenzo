import { Router } from 'express';
import { authController as authCtrl, userController as userCtrl } from '../controllers';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '../../domain/enums/enums';
import { validateRequest } from '../middleware/validation.middleware';
import { registerSchema, loginSchema, updateUserSchema } from '../../application/utils/validation';

const router = Router();

// USER REGISTER
router.post('/register', validateRequest(registerSchema), (req, res, next) => {
    req.body.role = Role.USER;
    authCtrl.register(req, res, next);
});

// USER LOGIN
router.post('/login', validateRequest(loginSchema), (req, res, next) => {
    req.body.role = Role.USER;
    authCtrl.login(req, res, next);
});

// PROFILE MANAGEMENT
router.get('/profile', authenticate, authorize([Role.USER]), userCtrl.getProfile);
router.put('/profile', authenticate, authorize([Role.USER]), validateRequest(updateUserSchema), userCtrl.updateProfile);

export default router;

