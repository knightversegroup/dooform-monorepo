export enum InfrastructureExceptionType {
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  FILE_SYSTEM_ERROR = 'FILE_SYSTEM_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
}

export class InfrastructureException extends Error {
  constructor(
    message: string,
    public readonly type: InfrastructureExceptionType
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class DatabaseException extends InfrastructureException {
  constructor(message: string) {
    super(message, InfrastructureExceptionType.DATABASE_ERROR)
  }
}

export class NetworkException extends InfrastructureException {
  constructor(message: string) {
    super(message, InfrastructureExceptionType.NETWORK_ERROR)
  }
}

export class ExternalServiceException extends InfrastructureException {
  constructor(message: string) {
    super(message, InfrastructureExceptionType.EXTERNAL_SERVICE_ERROR)
  }
}

export class CacheException extends InfrastructureException {
  constructor(message: string) {
    super(message, InfrastructureExceptionType.CACHE_ERROR)
  }
}

export class FileSystemException extends InfrastructureException {
  constructor(message: string) {
    super(message, InfrastructureExceptionType.FILE_SYSTEM_ERROR)
  }
}

export class ConfigurationException extends InfrastructureException {
  constructor(message: string) {
    super(message, InfrastructureExceptionType.CONFIGURATION_ERROR)
  }
}

export class ConnectionException extends InfrastructureException {
  constructor(message: string) {
    super(message, InfrastructureExceptionType.CONNECTION_ERROR)
  }
}

export class SerializationException extends InfrastructureException {
  constructor(message: string) {
    super(message, InfrastructureExceptionType.SERIALIZATION_ERROR)
  }
}
