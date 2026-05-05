import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { UserModel } from '../../../../workflow/infrastructure/persistence/typeorm/models/user.model'

import { GetTemplateByIdUseCase } from './get-template-by-id.use-case'

@Module({
  imports: [TemplateRepositoriesModule, TypeOrmModule.forFeature([UserModel])],
  providers: [GetTemplateByIdUseCase],
  exports: [GetTemplateByIdUseCase],
})
export class GetTemplateByIdUseCaseModule {}
