import 'reflect-metadata';
import { container } from 'tsyringe';

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
import { EventRepository } from '../infrastructure/repositories/EventRepository';
import { EventUseCase } from '../application/use-cases/event/EventUseCase';
import { EventController } from '../presentation/controllers/EventController';

// ─── Repositories ─────────────────────────────────────────────────────────────
container.register('UserRepository', { useClass: UserRepository });
container.register('VendorRepository', { useClass: VendorRepository });
container.register('AdminRepository', { useClass: AdminRepository });
container.register('CategoryRepository', { useClass: CategoryRepository });
container.register('EventRepository', { useClass: EventRepository });

// ─── Infrastructure Services ──────────────────────────────────────────────────
container.register('EmailService', { useClass: EmailService });

// ─── Use Cases (Application Layer) ───────────────────────────────────────────
container.register('AuthUseCase', { useClass: AuthUseCase });
container.register('UserUseCase', { useClass: UserUseCase });
container.register('VendorUseCase', { useClass: VendorUseCase });
container.register('AdminUseCase', { useClass: AdminUseCase });
container.register('CategoryUseCase', { useClass: CategoryUseCase });
container.register('EventService', { useClass: EventUseCase });

// ─── Controllers (Presentation Layer) ────────────────────────────────────────
// Controllers are resolved on demand or exported as singletons here
export const authController = container.resolve(AuthController);
export const userController = container.resolve(UserController);
export const vendorController = container.resolve(VendorController);
export const adminController = container.resolve(AdminController);
export const categoryController = container.resolve(CategoryController);
export const eventController = container.resolve(EventController);

export const appContainer = {
    authController,
    userController,
    vendorController,
    adminController,
    categoryController,
    eventController,
};
