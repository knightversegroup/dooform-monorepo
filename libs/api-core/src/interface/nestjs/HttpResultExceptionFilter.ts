import { Catch, type ExceptionFilter, type ArgumentsHost } from '@nestjs/common'

import {
  ValidationException,
  DomainExceptionType,
  BusinessRuleViolationException,
  EntityNotFoundException,
  UnauthorizedAccessException,
  ConcurrencyException,
  InvalidOperationException,
  PropertyNotFoundException,
  NotImplementedException,
} from '../../domain'
import { DatabaseException, InfrastructureExceptionType } from '../../infrastructure/exceptions'

type ErrorMapping = {
  type: string
  statusCode: number
}

@Catch()
export class HttpResultExceptionFilter implements ExceptionFilter {
  private readonly errorMappings = new Map<new (...args: any[]) => Error, ErrorMapping>([
    [ValidationException, { type: DomainExceptionType.VALIDATION_FAILED, statusCode: 400 }],
    [
      BusinessRuleViolationException,
      { type: DomainExceptionType.BUSINESS_RULE_VIOLATED, statusCode: 422 },
    ],
    [EntityNotFoundException, { type: DomainExceptionType.ENTITY_NOT_FOUND, statusCode: 404 }],
    [
      UnauthorizedAccessException,
      { type: DomainExceptionType.UNAUTHORIZED_ACCESS, statusCode: 401 },
    ],
    [ConcurrencyException, { type: DomainExceptionType.CONCURRENT_MODIFICATION, statusCode: 409 }],
    [InvalidOperationException, { type: DomainExceptionType.INVALID_OPERATION, statusCode: 400 }],
    [PropertyNotFoundException, { type: DomainExceptionType.PROPERTY_NOT_FOUND, statusCode: 400 }],
    [DatabaseException, { type: InfrastructureExceptionType.DATABASE_ERROR, statusCode: 500 }],
    [NotImplementedException, { type: DomainExceptionType.NOT_IMPLEMENTED, statusCode: 501 }],
  ])

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()
    const error = exception as Error
    const defaultMapping = { type: 'INTERNAL_SERVER_ERROR', statusCode: 500 }

    const errorType = [...this.errorMappings.entries()].find(
      ([errorClass]) => error instanceof errorClass
    )

    const { type, statusCode } = errorType ? this.errorMappings.get(errorType[0])! : defaultMapping

    const { message, ...errorRest } = error

    return response.status(statusCode).json({
      statusCode,
      type,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...errorRest,
    })
  }
}
