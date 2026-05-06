import { Router } from 'express';
import { serviceController as serviceCtrl } from '../controllers';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '../../domain/enums/enums';
import { upload } from '../middleware/multer';

const router = Router();

// VENDOR & ADMIN
router.get('/vendor/me', authenticate, authorize([Role.VENDOR]), serviceCtrl.getVendorServices);

// PUBLIC
router.get('/', serviceCtrl.getServices);
router.get('/vendor/:vendorId', serviceCtrl.getVendorServices);
router.get('/:id', serviceCtrl.getServiceById);

router.post('/', authenticate, authorize([Role.VENDOR]), upload.single('image'), serviceCtrl.createService);
router.put('/:id', authenticate, authorize([Role.VENDOR, Role.ADMIN]), upload.single('image'), serviceCtrl.updateService);
router.delete('/:id', authenticate, authorize([Role.VENDOR, Role.ADMIN]), serviceCtrl.deleteService);

export default router;
