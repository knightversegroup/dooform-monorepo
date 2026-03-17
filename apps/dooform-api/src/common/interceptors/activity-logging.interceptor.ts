import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
  Inject,
  Optional,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export const ACTIVITY_LOG_SERVICE = 'ACTIVITY_LOG_SERVICE';

export interface IActivityLogService {
  logActivity(data: {
    userId?: string | null;
    userEmail?: string | null;
    method: string;
    path: string;
    statusCode: number;
    responseTime: number;
    userAgent?: string;
    ipAddress?: string;
    requestBody?: string | null;
    queryParams?: string | null;
  }): void;
}

const SENSITIVE_FIELDS = ['password', 'refresh_token', 'id_token', 'code', 'client_secret', 'token']

function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') return body
  const sanitized = { ...body }
  for (const field of SENSITIVE_FIELDS) {
    if (field in sanitized) sanitized[field] = '[REDACTED]'
  }
  return sanitized
}

@Injectable()
export class ActivityLoggingInterceptor implements NestInterceptor {
  constructor(
    @Optional()
    @Inject(ACTIVITY_LOG_SERVICE)
    private readonly activityLogService?: IActivityLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          this.log(request, response.statusCode, Date.now() - start);
        },
        error: (error) => {
          const statusCode = error?.status ?? error?.statusCode ?? 500;
          this.log(request, statusCode, Date.now() - start);
        },
      }),
    );
  }

  private log(request: any, statusCode: number, responseTime: number): void {
    if (!this.activityLogService) return;

    this.activityLogService.logActivity({
      userId: request.user?.userId ?? request.user?.id ?? request.headers?.['x-user-id'] ?? null,
      userEmail:
        request.user?.email ?? request.headers?.['x-user-email'] ?? null,
      method: request.method,
      path: request.path || request.url,
      statusCode,
      responseTime,
      userAgent: request.headers?.['user-agent'] ?? '',
      ipAddress:
        request.headers?.['x-forwarded-for'] ||
        request.ip ||
        request.connection?.remoteAddress ||
        '',
      requestBody:
        request.method !== 'GET' && request.body
          ? JSON.stringify(sanitizeBody(request.body))
          : null,
      queryParams:
        request.query && Object.keys(request.query).length > 0
          ? JSON.stringify(request.query)
          : null,
    });
  }
}
