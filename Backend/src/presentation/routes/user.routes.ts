import { Router } from 'express';
import { container } from '../../di/container';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '../../domain/enums/Role.enum';

const router = Router();
const authCtrl = container.authController;
const userCtrl = container.userController;

// USER REGISTER
router.post('/register', (req, res, next) => {
    req.body.role = Role.USER;
    authCtrl.register(req, res, next);
});

// USER LOGIN
router.post('/login', (req, res, next) => {
    req.body.role = Role.USER;
    authCtrl.login(req, res, next);
});

// PROFILE MANAGEMENT
router.get('/profile', authenticate, authorize([Role.USER]), userCtrl.getProfile);
router.put('/profile', authenticate, authorize([Role.USER]), userCtrl.updateProfile);

export default router;
