import { Logger as NestJSLogger } from '@nestjs/common'

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE'

export interface LoggerConfig {
  minLevel: LogLevel
  transport?: LogTransport
  enableMetadata?: boolean
  environment?: string
  serviceName?: string
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  context: string
  environment?: string
  serviceName?: string
  message: string
  metadata?: unknown
}

export interface LogTransport {
  log(level: LogLevel, message: string, metadata?: unknown, logEntry?: LogEntry): void
}

export class ConsoleLoggerTransport implements LogTransport {
  log(level: LogLevel, message: string, metadata?: unknown, logEntry?: LogEntry): void {
    const entry = {
      severity: level,
      message: `[${logEntry?.context || 'unknown'}] ${message}`,
      context: logEntry?.context,
      environment: logEntry?.environment,
      serviceName: logEntry?.serviceName,
      timestamp: logEntry?.timestamp,
      metadata: metadata || logEntry?.metadata || {},
    }
    console.log(JSON.stringify(entry))
  }
}

export class NestJSLoggerTransport implements LogTransport {
  log(level: LogLevel, message: string, metadata?: unknown, logEntry?: LogEntry): void {
    switch (level) {
      case 'ERROR':
        if (metadata) {
          NestJSLogger.error(message, metadata, logEntry?.context)
        } else {
          NestJSLogger.error(message, logEntry?.context)
        }
        break
      case 'WARN':
        if (metadata) {
          NestJSLogger.warn(message, metadata, logEntry?.context)
        } else {
          NestJSLogger.warn(message, logEntry?.context)
        }
        break
      case 'INFO':
        if (metadata) {
          NestJSLogger.log(message, metadata, logEntry?.context)
        } else {
          NestJSLogger.log(message, logEntry?.context)
        }
        break
      case 'DEBUG':
        if (metadata) {
          NestJSLogger.debug(message, metadata, logEntry?.context)
        } else {
          NestJSLogger.debug(message, logEntry?.context)
        }
        break
      case 'TRACE':
        if (metadata) {
          NestJSLogger.verbose(message, metadata, logEntry?.context)
        } else {
          NestJSLogger.verbose(message, logEntry?.context)
        }
        break
    }
  }
}

export class Logger {
  private static config: LoggerConfig = {
    minLevel: (process.env['LOG_LEVEL'] as LogLevel) || 'INFO',
    transport: Logger.resolveTransport(),
    enableMetadata: true,
    environment: process.env['NODE_ENV'],
    serviceName: process.env['SERVICE_NAME'],
  }

  private static readonly LOG_LEVELS: Record<LogLevel, number> = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    TRACE: 4,
  }

  private context: string
  private startTimes: Map<string, number> = new Map()

  constructor(context: string) {
    this.context = context
  }

  private static resolveTransport(): LogTransport {
    const transportType = (process.env['LOG_TRANSPORT'] || 'nestjs').toLowerCase()
    switch (transportType) {
      case 'nestjs':
        return new NestJSLoggerTransport()
      case 'console':
      default:
        return new ConsoleLoggerTransport()
    }
  }

  static configure(config: Partial<LoggerConfig>): void {
    Logger.config = { ...Logger.config, ...config }
  }

  private shouldLog(level: LogLevel): boolean {
    return Logger.LOG_LEVELS[level] <= Logger.LOG_LEVELS[Logger.config.minLevel]
  }

  private buildLogEntry(level: LogLevel, message: string, metadata?: unknown): LogEntry {
    const timestamp = new Date().toISOString()
    return {
      timestamp,
      level,
      context: this.context,
      message,
      metadata: metadata || {},
      environment: Logger.config.environment,
      serviceName: Logger.config.serviceName,
    }
  }

  private log(level: LogLevel, message: string, metadata?: unknown): void {
    if (!this.shouldLog(level)) return

    const logEntry = this.buildLogEntry(level, message, metadata)
    Logger.config.transport?.log(level, message, metadata, logEntry)
  }

  error(message: string, error?: Error): void {
    const metadata = error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : undefined
    this.log('ERROR', message, metadata)
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log('WARN', message, metadata)
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log('INFO', message, metadata)
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log('DEBUG', message, metadata)
  }

  trace(message: string, metadata?: Record<string, unknown>): void {
    this.log('TRACE', message, metadata)
  }

  startTimer(label: string): void {
    this.startTimes.set(label, performance.now())
  }

  endTimer(label: string): void {
    const startTime = this.startTimes.get(label)
    if (startTime) {
      const duration = performance.now() - startTime
      this.debug(`${label} completed`, { durationMs: duration.toFixed(2) })
      this.startTimes.delete(label)
    }
  }

  static createLogger(context: string): Logger {
    return new Logger(context)
  }
}
