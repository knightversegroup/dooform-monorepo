import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { GetCurrentUserUseCase } from './get-current-user.use-case'

@Module({
  imports: [WorkflowRepositoriesModule],
  providers: [GetCurrentUserUseCase],
  exports: [GetCurrentUserUseCase],
})
export class GetCurrentUserUseCaseModule {}
