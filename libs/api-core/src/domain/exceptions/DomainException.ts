export enum DomainExceptionType {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  BUSINESS_RULE_VIOLATED = 'BUSINESS_RULE_VIOLATED',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  CONCURRENT_MODIFICATION = 'CONCURRENT_MODIFICATION',
  INVALID_OPERATION = 'INVALID_OPERATION',
  PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',
  IMMUTABLE_ENTITY = 'IMMUTABLE_ENTITY',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
}

export class DomainException extends Error {
  constructor(
    message: string,
    public readonly type: DomainExceptionType
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export interface ValidationExceptionPayload {
  message: string
  parameter?: number
  code?: string
  details?: Array<{
    code?: string
    property: string | string[]
    constraints?: { [type: string]: string }
    value?: unknown
  }>
}

export class ValidationException extends DomainException {
  constructor(payload: ValidationExceptionPayload | string) {
    const message = typeof payload === 'string' ? payload : payload.message
    super(message, DomainExceptionType.VALIDATION_FAILED)

    if (typeof payload !== 'string') {
      Object.assign(this, payload)
    }
  }
}

export interface BusinessRuleViolationExceptionPayload {
  message: string
  code?: string
  details?:
    | Array<{
        code?: string
        value?: unknown
      }>
    | {
        code?: string
        value?: unknown
      }
}

export class BusinessRuleViolationException extends DomainException {
  constructor(payload: BusinessRuleViolationExceptionPayload | string) {
    const message = typeof payload === 'string' ? payload : payload.message
    super(message, DomainExceptionType.BUSINESS_RULE_VIOLATED)

    if (typeof payload !== 'string') {
      Object.assign(this, payload)
    }
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(message: string) {
    super(message, DomainExceptionType.ENTITY_NOT_FOUND)
  }
}

export class UnauthorizedAccessException extends DomainException {
  constructor(message: string) {
    super(message, DomainExceptionType.UNAUTHORIZED_ACCESS)
  }
}

export class ConcurrencyException extends DomainException {
  constructor(message: string) {
    super(message, DomainExceptionType.CONCURRENT_MODIFICATION)
  }
}

export class InvalidOperationException extends DomainException {
  constructor(message: string) {
    super(message, DomainExceptionType.INVALID_OPERATION)
  }
}

export class PropertyNotFoundException extends DomainException {
  constructor(message: string) {
    super(message, DomainExceptionType.PROPERTY_NOT_FOUND)
  }
}

export class ImmutableEntityException extends DomainException {
  constructor(message: string) {
    super(message, DomainExceptionType.IMMUTABLE_ENTITY)
  }
}

export class NotImplementedException extends DomainException {
  constructor(message: string) {
    super(message, DomainExceptionType.NOT_IMPLEMENTED)
  }
}
