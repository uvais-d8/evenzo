/**
 * Dependency Injection Container
 * 
 * Wires concrete implementations to their abstractions:
 *   Models → Repositories → Use Cases → Controllers
 * 
 * This is the ONLY place that knows about all concrete classes.
 * Everything else depends on interfaces.
 */
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { VendorRepository } from '../infrastructure/repositories/VendorRepository';
import { AdminRepository } from '../infrastructure/repositories/AdminRepository';
import { CategoryRepository } from '../infrastructure/repositories/CategoryRepository';
import { EventRepository } from '../infrastructure/repositories/EventRepository';
import { BookingRepository } from '../infrastructure/repositories/BookingRepository';
import { EmailService } from '../infrastructure/services/EmailService';

import { AuthUseCase } from '../application/use-cases/auth/AuthUseCase';
import { UserUseCase } from '../application/use-cases/user/UserUseCase';
import { VendorUseCase } from '../application/use-cases/vendor/VendorUseCase';
import { AdminUseCase } from '../application/use-cases/admin/AdminUseCase';
import { CategoryUseCase } from '../application/use-cases/category/CategoryUseCase';
import { EventUseCase } from '../application/use-cases/event/EventUseCase';
import { BookingUseCase } from '../application/use-cases/booking/BookingUseCase';

import { AuthController } from '../presentation/controllers/AuthController';
import { UserController } from '../presentation/controllers/UserController';
import { VendorController } from '../presentation/controllers/VendorController';
import { AdminController } from '../presentation/controllers/AdminController';
import { CategoryController } from '../presentation/controllers/CategoryController';
import { EventController } from '../presentation/controllers/EventController';
import { BookingController } from '../presentation/controllers/BookingController';

import { logger } from '../infrastructure/services/LoggerService';

// ─── Repositories ─────────────────────────────────────────────────────────────
const userRepository = new UserRepository();
const vendorRepository = new VendorRepository();
const adminRepository = new AdminRepository();
const categoryRepository = new CategoryRepository();
const eventRepository = new EventRepository();
const bookingRepository = new BookingRepository();

// ─── Infrastructure Services ──────────────────────────────────────────────────
const emailService = new EmailService();

// ─── Use Cases (Application Layer) ───────────────────────────────────────────
const authUseCase = new AuthUseCase(userRepository, vendorRepository, adminRepository, emailService, logger);
const userUseCase = new UserUseCase(userRepository);
const vendorUseCase = new VendorUseCase(vendorRepository, eventRepository, bookingRepository);
const adminUseCase = new AdminUseCase(userRepository, vendorRepository);
const categoryUseCase = new CategoryUseCase(categoryRepository);
const eventUseCase = new EventUseCase(eventRepository);
const bookingUseCase = new BookingUseCase(bookingRepository, eventRepository);

// ─── Controllers (Presentation Layer) ────────────────────────────────────────
export const authController = new AuthController(authUseCase);
export const userController = new UserController(userUseCase);
export const vendorController = new VendorController(vendorUseCase);
export const adminController = new AdminController(adminUseCase);
export const categoryController = new CategoryController(categoryUseCase);
export const eventController = new EventController(eventUseCase);
export const bookingController = new BookingController(bookingUseCase);

export const appContainer = {
    authController,
    userController,
    vendorController,
    adminController,
    categoryController,
    eventController,
    bookingController,
};
