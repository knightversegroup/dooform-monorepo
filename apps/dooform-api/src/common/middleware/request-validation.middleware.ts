import { Injectable, type NestMiddleware } from '@nestjs/common';

const MAX_CONTENT_LENGTH = 50 * 1024 * 1024; // 50MB

const ALLOWED_CONTENT_TYPES = [
  'application/json',
  'application/xml',
  'multipart/form-data',
  'application/x-www-form-urlencoded',
  'application/octet-stream',
];

@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      // Validate Content-Length
      const contentLength = req.headers['content-length'];
      if (contentLength && parseInt(contentLength, 10) > MAX_CONTENT_LENGTH) {
        res.status(413).json({
          statusCode: 413,
          type: 'REQUEST_TOO_LARGE',
          message: `Request body exceeds maximum size of ${MAX_CONTENT_LENGTH / (1024 * 1024)}MB`,
        });
        return;
      }

      // Validate Content-Type
      const contentType = req.headers['content-type'];
      if (contentType) {
        const baseType = contentType.split(';')[0].trim().toLowerCase();
        const isAllowed = ALLOWED_CONTENT_TYPES.some((type) =>
          baseType.startsWith(type),
        );
        if (!isAllowed) {
          res.status(415).json({
            statusCode: 415,
            type: 'UNSUPPORTED_MEDIA_TYPE',
            message: `Content-Type '${baseType}' is not supported`,
          });
          return;
        }
      }
    }

    next();
  }
}
