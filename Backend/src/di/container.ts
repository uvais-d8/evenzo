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
import { EmailService } from '../infrastructure/services/EmailService';

import { AuthUseCase } from '../application/use-cases/auth/AuthUseCase';
import { UserUseCase } from '../application/use-cases/user/UserUseCase';
import { VendorUseCase } from '../application/use-cases/vendor/VendorUseCase';
import { AdminUseCase } from '../application/use-cases/admin/AdminUseCase';
import { CategoryUseCase } from '../application/use-cases/category/CategoryUseCase';

import { AuthController } from '../presentation/controllers/AuthController';
import { UserController } from '../presentation/controllers/UserController';
import { VendorController } from '../presentation/controllers/VendorController';
import { AdminController } from '../presentation/controllers/AdminController';
import { CategoryController } from '../presentation/controllers/CategoryController';

// ─── Repositories ─────────────────────────────────────────────────────────────
const userRepository = new UserRepository();
const vendorRepository = new VendorRepository();
const adminRepository = new AdminRepository();
const categoryRepository = new CategoryRepository();

// ─── Infrastructure Services ──────────────────────────────────────────────────
const emailService = new EmailService();

// ─── Use Cases (Application Layer) ───────────────────────────────────────────
const authUseCase = new AuthUseCase(userRepository, vendorRepository, adminRepository, emailService);
const userUseCase = new UserUseCase(userRepository);
const vendorUseCase = new VendorUseCase(vendorRepository);
const adminUseCase = new AdminUseCase(userRepository, vendorRepository);
const categoryUseCase = new CategoryUseCase(categoryRepository);

// ─── Controllers (Presentation Layer) ────────────────────────────────────────
const authController = new AuthController(authUseCase);
const userController = new UserController(userUseCase);
const vendorController = new VendorController(vendorUseCase);
const adminController = new AdminController(adminUseCase);
const categoryController = new CategoryController(categoryUseCase);

export const container = {
    authController,
    userController,
    vendorController,
    adminController,
    categoryController,
};
