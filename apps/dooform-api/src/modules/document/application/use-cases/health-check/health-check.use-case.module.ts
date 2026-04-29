import { Module } from '@nestjs/common'

import { DocumentServicesModule } from '../../../infrastructure/services/document-services.module'

import { HealthCheckUseCase } from './health-check.use-case'

@Module({
  imports: [DocumentServicesModule],
  providers: [HealthCheckUseCase],
  exports: [HealthCheckUseCase],
})
export class HealthCheckUseCaseModule {}
