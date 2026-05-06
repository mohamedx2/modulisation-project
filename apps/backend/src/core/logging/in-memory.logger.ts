import Transport from 'winston-transport';

export class InMemoryLogger {
  private static instance: InMemoryLogger;
  private logs: string[] = [];
  private maxSize = 500;

  static getInstance(): InMemoryLogger {
    if (!InMemoryLogger.instance) {
      InMemoryLogger.instance = new InMemoryLogger();
    }
    return InMemoryLogger.instance;
  }

  addLog(message: string, level = 'info', timestamp?: string, stack?: string) {
    const entry = `[${level}] ${timestamp || new Date().toISOString()} ${message}${stack ? '\n' + stack : ''}`;
    this.logs.push(entry);
    if (this.logs.length > this.maxSize) {
      this.logs.shift();
    }
  }

  getLogs(count = 100): string[] {
    return this.logs.slice(-count);
  }
}

export class WinstonInMemoryTransport extends Transport {
  private logger = InMemoryLogger.getInstance();

  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts);
  }

  log(info: any, callback: () => void) {
    setImmediate(() => this.emit('logged', info));
    this.logger.addLog(info.message, info.level, info.timestamp, info.stack);
    callback();
  }
}

export function initGlobalLogging() {
  const logger = InMemoryLogger.getInstance();

  const origLog = console.log;
  const origError = console.error;
  const origWarn = console.warn;

  console.log = (...args: unknown[]) => {
    logger.addLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), 'info');
    origLog.apply(console, args);
  };

  console.error = (...args: unknown[]) => {
    logger.addLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), 'error');
    origError.apply(console, args);
  };

  console.warn = (...args: unknown[]) => {
    logger.addLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), 'warn');
    origWarn.apply(console, args);
  };
}
