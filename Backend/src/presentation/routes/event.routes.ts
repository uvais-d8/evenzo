import { Router } from 'express';
import { eventController as eventCtrl } from '../controllers';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '../../domain/enums/enums';
import { upload } from '../middleware/multer';

const router = Router();


// PUBLIC
router.get('/', eventCtrl.getEvents);
router.get('/nearby', eventCtrl.getNearbyEvents);
router.get('/:id', eventCtrl.getEventById);

// VENDOR ONLY
router.post('/', authenticate, authorize([Role.VENDOR]), upload.array('images', 5), eventCtrl.createEvent);
router.get('/vendor/my-events', authenticate, authorize([Role.VENDOR]), eventCtrl.getVendorEvents);
router.put('/:id', authenticate, authorize([Role.VENDOR]), upload.array('images', 5), eventCtrl.updateEvent);
router.delete('/:id', authenticate, authorize([Role.VENDOR]), eventCtrl.deleteEvent);

export default router;
