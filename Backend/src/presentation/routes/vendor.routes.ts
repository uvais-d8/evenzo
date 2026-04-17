import { Router } from 'express';
import { authController as authCtrl, vendorController as vendorCtrl } from '../controllers';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '../../domain/enums/enums';

import { upload } from '../middleware/multer';

const router = Router();

// VENDOR REGISTER
router.post('/register', upload.single('idProof'), (req, res, next) => {
    req.body.role = Role.VENDOR;
    authCtrl.register(req, res, next);
});

// VENDOR LOGIN
router.post('/login', (req, res, next) => {
    req.body.role = Role.VENDOR;
    authCtrl.login(req, res, next);
});

// PROFILE
router.get('/profile', authenticate, authorize([Role.VENDOR]), vendorCtrl.getProfile);
router.put('/profile', authenticate, authorize([Role.VENDOR]), upload.single('idProof'), vendorCtrl.updateProfile);

// STATS
router.get('/stats', authenticate, authorize([Role.VENDOR]), vendorCtrl.getStats);

export default router;
