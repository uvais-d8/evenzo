
export const TOKENS = {
    // Repositories
    UserRepository: Symbol.for('UserRepository'),
    VendorRepository: Symbol.for('VendorRepository'),
    AdminRepository: Symbol.for('AdminRepository'),
    CategoryRepository: Symbol.for('CategoryRepository'),
    EventRepository: Symbol.for('EventRepository'),
    BookingRepository: Symbol.for('BookingRepository'),

    // Services
    EmailService: Symbol.for('EmailService'),
    LoggerService: Symbol.for('LoggerService'),

    // Use Cases
    UserUseCase: Symbol.for('UserUseCase'),
    VendorUseCase: Symbol.for('VendorUseCase'),
    AdminUseCase: Symbol.for('AdminUseCase'),
    CategoryUseCase: Symbol.for('CategoryUseCase'),
    EventUseCase: Symbol.for('EventUseCase'),
    AuthUseCase: Symbol.for('AuthUseCase'),
    BookingUseCase: Symbol.for('BookingUseCase'),
    ServiceRepository: Symbol.for('ServiceRepository'),
    ServiceUseCase: Symbol.for('ServiceUseCase'),
};
