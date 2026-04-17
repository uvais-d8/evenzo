import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { VendorRepository } from '../../infrastructure/repositories/VendorRepository';
import { AdminRepository } from '../../infrastructure/repositories/AdminRepository';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { EventRepository } from '../../infrastructure/repositories/EventRepository';
import { EmailService } from '../../infrastructure/services/EmailService';
import { LoggerService } from '../../infrastructure/services/LoggerService';

import { UserUseCase } from '../../application/use-cases/user/UserUseCase';
import { VendorUseCase } from '../../application/use-cases/vendor/VendorUseCase';
import { AdminUseCase } from '../../application/use-cases/admin/AdminUseCase';
import { CategoryUseCase } from '../../application/use-cases/category/CategoryUseCase';
import { EventUseCase } from '../../application/use-cases/event/EventUseCase';
import { AuthUseCase } from '../../application/use-cases/auth/AuthUseCase';

import { UserController } from './UserController';
import { VendorController } from './VendorController';
import { AdminController } from './AdminController';
import { CategoryController } from './CategoryController';
import { EventController } from './EventController';
import { AuthController } from './AuthController';

// 1. Repositories & Services
const userRepo = new UserRepository();
const vendorRepo = new VendorRepository();
const adminRepo = new AdminRepository();
const categoryRepo = new CategoryRepository();
const eventRepo = new EventRepository();
const emailService = new EmailService();
const loggerService = new LoggerService();

// 2. Use Cases
const userUseCase = new UserUseCase(userRepo);
const vendorUseCase = new VendorUseCase(vendorRepo);
const adminUseCase = new AdminUseCase(userRepo, vendorRepo);
const categoryUseCase = new CategoryUseCase(categoryRepo);
const eventUseCase = new EventUseCase(eventRepo);
const authUseCase = new AuthUseCase(userRepo, vendorRepo, adminRepo, emailService, loggerService);

// 3. Controllers
export const userController = new UserController(userUseCase);
export const vendorController = new VendorController(vendorUseCase);
export const adminController = new AdminController(adminUseCase);
export const categoryController = new CategoryController(categoryUseCase);
export const eventController = new EventController(eventUseCase);
export const authController = new AuthController(authUseCase);
