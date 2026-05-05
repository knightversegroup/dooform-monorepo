import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { CreateUserUseCase } from './create-user.use-case'

@Module({
  imports: [WorkflowRepositoriesModule],
  providers: [CreateUserUseCase],
  exports: [CreateUserUseCase],
})
export class CreateUserUseCaseModule {}
