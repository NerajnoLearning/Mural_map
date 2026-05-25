// Centralized logging utility
// Provides development logging with production safety
import * as Sentry from '@sentry/vue'

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug'

interface LoggerOptions {
  prefix?: string
  enabled?: boolean
}

class Logger {
  private prefix: string
  private enabled: boolean
  private isDev: boolean

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix || '[MuralMap]'
    this.enabled = options.enabled ?? true
    this.isDev = import.meta.env.DEV
  }

  private formatMessage(level: LogLevel, ...args: any[]): any[] {
    const timestamp = new Date().toISOString()
    return [`${this.prefix} [${level.toUpperCase()}] ${timestamp}`, ...args]
  }

  log(...args: any[]): void {
    if (this.isDev && this.enabled) {
      console.log(...this.formatMessage('log', ...args))
    }
  }

  info(...args: any[]): void {
    if (this.isDev && this.enabled) {
      console.info(...this.formatMessage('info', ...args))
    }
  }

  warn(...args: any[]): void {
    if (this.isDev && this.enabled) {
      console.warn(...this.formatMessage('warn', ...args))
    }
    // In production, consider sending to error tracking service
    if (!this.isDev) {
      this.sendToErrorTracking('warn', args)
    }
  }

  error(...args: any[]): void {
    // Always log errors, even in production
    if (this.isDev) {
      console.error(...this.formatMessage('error', ...args))
    }
    // In production, send to error tracking service
    if (!this.isDev) {
      this.sendToErrorTracking('error', args)
    }
  }

  debug(...args: any[]): void {
    if (this.isDev && this.enabled) {
      console.debug(...this.formatMessage('debug', ...args))
    }
  }

  private sendToErrorTracking(level: 'warn' | 'error', args: any[]): void {
    try {
      const err = args.find(a => a instanceof Error)
      if (err) {
        Sentry.captureException(err, { level })
      } else {
        Sentry.captureMessage(args.map(a => String(a)).join(' '), level)
      }
    } catch {
      // Silently fail if error tracking fails
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export factory for creating loggers with custom prefixes
export function createLogger(prefix: string, options?: Omit<LoggerOptions, 'prefix'>): Logger {
  return new Logger({ ...options, prefix: `[${prefix}]` })
}

// Export for testing
export { Logger }
