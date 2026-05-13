import { Router } from 'express';
import { bookingController } from '../../di/container';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '../../domain/enums/enums';

import { validateRequest } from '../middleware/validation.middleware';
import { createBookingSchema } from '../../application/utils/validation';

const router = Router();

// User routes
router.post('/', authenticate, authorize([Role.USER]), validateRequest(createBookingSchema), bookingController.createBooking);

router.get('/my-bookings', authenticate, authorize([Role.USER]), bookingController.getUserBookings);
router.put('/:id/cancel', authenticate, authorize([Role.USER]), bookingController.cancelBooking);

// Vendor routes
router.get('/vendor', authenticate, authorize([Role.VENDOR]), bookingController.getVendorBookings);

export default router;
