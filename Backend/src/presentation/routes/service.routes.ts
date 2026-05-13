import { Router } from 'express';
import { serviceController as serviceCtrl } from '../controllers';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '../../domain/enums/enums';
import { upload } from '../middleware/multer';
import { validateRequest } from '../middleware/validation.middleware';
import { createServiceSchema, updateServiceSchema } from '../../application/utils/validation';

const router = Router();

// VENDOR & ADMIN
router.get('/vendor/me', authenticate, authorize([Role.VENDOR]), serviceCtrl.getVendorServices);

// PUBLIC
router.get('/', serviceCtrl.getServices);
router.get('/vendor/:vendorId', serviceCtrl.getVendorServices);
router.get('/:id', serviceCtrl.getServiceById);

router.post('/', authenticate, authorize([Role.VENDOR]), upload.single('image'), validateRequest(createServiceSchema), serviceCtrl.createService);
router.put('/:id', authenticate, authorize([Role.VENDOR, Role.ADMIN]), upload.single('image'), validateRequest(updateServiceSchema), serviceCtrl.updateService);

router.delete('/:id', authenticate, authorize([Role.VENDOR, Role.ADMIN]), serviceCtrl.deleteService);

export default router;

