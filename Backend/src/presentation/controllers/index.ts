import { container } from '../../infrastructure/di/container';
import { UserController } from './UserController';
import { VendorController } from './VendorController';
import { AdminController } from './AdminController';
import { CategoryController } from './CategoryController';
import { EventController } from './EventController';
import { AuthController } from './AuthController';
import { BookingController } from './BookingController';
import { ServiceController } from './ServiceController';

// Resolve Controllers from Container
export const userController = container.resolve(UserController);
export const vendorController = container.resolve(VendorController);
export const adminController = container.resolve(AdminController);
export const categoryController = container.resolve(CategoryController);
export const eventController = container.resolve(EventController);
export const authController = container.resolve(AuthController);
export const bookingController = container.resolve(BookingController);
export const serviceController = container.resolve(ServiceController);


