interface ILogger {
    info(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
}

class Logger implements ILogger {
    info(message: string, ...args: unknown[]): void {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`, ...args);
    }

    error(message: string, ...args: unknown[]): void {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...args);
    }
}

export const logger = new Logger();
