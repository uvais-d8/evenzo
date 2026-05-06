
import { container } from 'tsyringe';
import { TOKENS } from './tokens';

// Repositories
import { UserRepository } from '../repositories/UserRepository';
import { VendorRepository } from '../repositories/VendorRepository';
import { AdminRepository } from '../repositories/AdminRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { EventRepository } from '../repositories/EventRepository';
import { BookingRepository } from '../repositories/BookingRepository';
import { ServiceRepository } from '../repositories/ServiceRepository';

// Services
import { EmailService } from '../services/EmailService';
import { LoggerService } from '../services/LoggerService';

// Use Cases
import { UserUseCase } from '../../application/use-cases/user/UserUseCase';
import { VendorUseCase } from '../../application/use-cases/vendor/VendorUseCase';
import { AdminUseCase } from '../../application/use-cases/admin/AdminUseCase';
import { CategoryUseCase } from '../../application/use-cases/category/CategoryUseCase';
import { EventUseCase } from '../../application/use-cases/event/EventUseCase';
import { AuthUseCase } from '../../application/use-cases/auth/AuthUseCase';
import { BookingUseCase } from '../../application/use-cases/booking/BookingUseCase';
import { ServiceUseCase } from '../../application/use-cases/service/ServiceUseCase';

// Controllers
import { UserController } from '../../presentation/controllers/UserController';
import { VendorController } from '../../presentation/controllers/VendorController';
import { AdminController } from '../../presentation/controllers/AdminController';
import { CategoryController } from '../../presentation/controllers/CategoryController';
import { EventController } from '../../presentation/controllers/EventController';
import { AuthController } from '../../presentation/controllers/AuthController';
import { BookingController } from '../../presentation/controllers/BookingController';
import { ServiceController } from '../../presentation/controllers/ServiceController';

// Register Repositories
container.register(TOKENS.UserRepository, { useClass: UserRepository });
container.register(TOKENS.VendorRepository, { useClass: VendorRepository });
container.register(TOKENS.AdminRepository, { useClass: AdminRepository });
container.register(TOKENS.CategoryRepository, { useClass: CategoryRepository });
container.register(TOKENS.EventRepository, { useClass: EventRepository });
container.register(TOKENS.BookingRepository, { useClass: BookingRepository });
container.register(TOKENS.ServiceRepository, { useClass: ServiceRepository });

// Register Services
container.register(TOKENS.EmailService, { useClass: EmailService });
container.register(TOKENS.LoggerService, { useClass: LoggerService });

// Register Use Cases
container.register(TOKENS.UserUseCase, { useClass: UserUseCase });
container.register(TOKENS.VendorUseCase, { useClass: VendorUseCase });
container.register(TOKENS.AdminUseCase, { useClass: AdminUseCase });
container.register(TOKENS.CategoryUseCase, { useClass: CategoryUseCase });
container.register(TOKENS.EventUseCase, { useClass: EventUseCase });
container.register(TOKENS.AuthUseCase, { useClass: AuthUseCase });
container.register(TOKENS.BookingUseCase, { useClass: BookingUseCase });
container.register(TOKENS.ServiceUseCase, { useClass: ServiceUseCase });

// Controllers are typically resolved directly or can be registered
container.register(UserController, { useClass: UserController });
container.register(VendorController, { useClass: VendorController });
container.register(AdminController, { useClass: AdminController });
container.register(CategoryController, { useClass: CategoryController });
container.register(EventController, { useClass: EventController });
container.register(AuthController, { useClass: AuthController });
container.register(BookingController, { useClass: BookingController });
container.register(ServiceController, { useClass: ServiceController });

export { container };
