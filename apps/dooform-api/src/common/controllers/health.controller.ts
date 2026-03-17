import { Controller, Get } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';

@Controller()
export class HealthController {
  @Get('health')
  @Public()
  health() {
    return {
      status: 'ok',
      service: 'dooform-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @Public()
  ready() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }
}
