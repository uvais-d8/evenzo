import { Router } from 'express';
import { container } from '../../di/container';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '../../domain/enums/Role.enum';

const router = Router();
const authCtrl = container.authController;
const adminCtrl = container.adminController;

// ADMIN LOGIN
router.post('/login', (req, res, next) => {
    req.body.role = Role.ADMIN;
    authCtrl.login(req, res, next);
});

// DASHBOARD STATS
router.get('/stats', authenticate, authorize([Role.ADMIN]), adminCtrl.getDashboardStats);

// VENDOR MANAGEMENT (all paginated: ?page=1&limit=10)
router.get('/vendors/pending', authenticate, authorize([Role.ADMIN]), adminCtrl.getPendingVendors);
router.get('/vendors/approved', authenticate, authorize([Role.ADMIN]), adminCtrl.getApprovedVendors);
router.get('/vendors', authenticate, authorize([Role.ADMIN]), adminCtrl.getAllVendors);
router.put('/vendors/:vendorId/verify', authenticate, authorize([Role.ADMIN]), adminCtrl.verifyVendor);
router.patch('/vendors/:vendorId/toggle-block', authenticate, authorize([Role.ADMIN]), adminCtrl.toggleBlockVendor);

// USER MANAGEMENT (paginated: ?page=1&limit=10)
router.get('/users', authenticate, authorize([Role.ADMIN]), adminCtrl.getUsers);
router.patch('/users/:id/toggle-block', authenticate, authorize([Role.ADMIN]), adminCtrl.toggleBlockUser);

export default router;
