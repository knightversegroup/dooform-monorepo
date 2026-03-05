import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { Logger } from '@dooform-api-core/shared';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body } = req;
    const controller = context.getClass().name;
    const handler = context.getHandler().name;

    this.logger.info(`${method} ${url}`, {
      controller,
      handler,
      ...(method !== 'GET' && body && Object.keys(body).length > 0 ? { body } : {}),
    });

    const start = performance.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (performance.now() - start).toFixed(2);
          this.logger.info(`${method} ${url} completed`, {
            durationMs: duration,
            statusCode: context.switchToHttp().getResponse().statusCode,
          });
        },
        error: (error) => {
          const duration = (performance.now() - start).toFixed(2);
          this.logger.error(`${method} ${url} failed (${duration}ms)`, error);
        },
      }),
    );
  }
}
