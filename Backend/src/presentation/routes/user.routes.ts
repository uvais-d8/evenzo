import { Router } from 'express';
import { authController as authCtrl, userController as userCtrl } from '../controllers';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '../../domain/enums/enums';

const router = Router();

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
