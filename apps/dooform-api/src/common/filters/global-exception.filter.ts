import {
  Catch,
  type ExceptionFilter,
  type ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Handle NestJS HttpException (from guards, pipes, throttler, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const body =
        typeof exceptionResponse === 'string'
          ? {
              statusCode: status,
              type: this.getErrorType(status),
              message: exceptionResponse,
              timestamp: new Date().toISOString(),
              path: request.url,
            }
          : {
              statusCode: status,
              type: this.getErrorType(status),
              timestamp: new Date().toISOString(),
              path: request.url,
              ...(typeof exceptionResponse === 'object' ? exceptionResponse : {}),
            };

      return response.status(status).json(body);
    }

    // Handle unknown errors
    const error = exception instanceof Error ? exception : new Error(String(exception));
    this.logger.error(`Unhandled exception: ${error.message}`, error.stack);

    return response.status(500).json({
      statusCode: 500,
      type: 'INTERNAL_SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : error.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getErrorType(status: number): string {
    const types: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      409: 'CONFLICT',
      413: 'PAYLOAD_TOO_LARGE',
      415: 'UNSUPPORTED_MEDIA_TYPE',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    return types[status] ?? 'HTTP_ERROR';
  }
}
