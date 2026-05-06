import { injectable } from 'tsyringe';
import winston from 'winston';
import { ILogger } from '../../application/interfaces/ILogger';

const loggerInstance = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
    ],
});

@injectable()
export class LoggerService implements ILogger {
    info(message: string, context?: any): void {
        loggerInstance.info(message, context);
    }

    error(message: string, context?: any): void {
        loggerInstance.error(message, context);
    }

    warn(message: string, context?: any): void {
        loggerInstance.warn(message, context);
    }

    debug(message: string, context?: any): void {
        loggerInstance.debug(message, context);
    }
}

// Export a singleton for easy use in entry points, though Use Cases will use injection
export const logger = loggerInstance;
