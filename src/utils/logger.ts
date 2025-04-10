
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LoggerOptions {
  logLevel?: LogLevel;
  prefix?: string;
  enableTimestamp?: boolean;
  silent?: boolean;
}

export class Logger {
  private level: LogLevel;
  private prefix: string;
  private enableTimestamp: boolean;
  private silent: boolean;

  constructor(options: LoggerOptions = {}) {
    this.level = options.logLevel ?? LogLevel.INFO;
    this.prefix = options.prefix ?? 'BBTG';
    this.enableTimestamp = options.enableTimestamp ?? true;
    this.silent = options.silent ?? false;
  }

  private getTimestamp(): string {
    if (!this.enableTimestamp) return '';
    return `[${new Date().toISOString()}] `;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = this.getTimestamp();
    const prefix = this.prefix ? `[${this.prefix}] ` : '';
    const levelStr = level ? `[${level}] ` : '';
    
    let formattedMessage = `${timestamp}${prefix}${levelStr}${message}`;
    
    if (data !== undefined) {
      if (typeof data === 'object') {
        try {
          formattedMessage += ` ${JSON.stringify(data)}`;
        } catch (e) {
          formattedMessage += ` [Object]`;
        }
      } else {
        formattedMessage += ` ${data}`;
      }
    }
    
    return formattedMessage;
  }

  debug(message: string, data?: any): void {
    if (this.silent || this.level > LogLevel.DEBUG) return;
    console.debug(this.formatMessage('DEBUG', message, data));
  }

  info(message: string, data?: any): void {
    if (this.silent || this.level > LogLevel.INFO) return;
    console.info(this.formatMessage('INFO', message, data));
  }

  warn(message: string, data?: any): void {
    if (this.silent || this.level > LogLevel.WARN) return;
    console.warn(this.formatMessage('WARN', message, data));
  }

  error(message: string, data?: any): void {
    if (this.silent || this.level > LogLevel.ERROR) return;
    console.error(this.formatMessage('ERROR', message, data));
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  setSilent(silent: boolean): void {
    this.silent = silent;
  }
}

export { LogLevel };
