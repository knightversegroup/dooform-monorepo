import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { ListUsersUseCase } from './list-users.use-case'

@Module({
  imports: [WorkflowRepositoriesModule],
  providers: [ListUsersUseCase],
  exports: [ListUsersUseCase],
})
export class ListUsersUseCaseModule {}
