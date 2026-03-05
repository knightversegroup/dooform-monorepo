import { Module } from '@nestjs/common'
import { DataSource } from 'typeorm'

import {
  UnitOfWork,
  type IUnitOfWork,
  type IUnitOfWorkProvider,
  type IUnitOfWorkTransaction,
} from '../../../application/UnitOfWork'

class TypeOrmUnitOfWorkTransaction implements IUnitOfWorkTransaction {
  constructor(
    private readonly queryRunner: import('typeorm').QueryRunner
  ) {}

  async commit(): Promise<void> {
    await this.queryRunner.commitTransaction()
    await this.queryRunner.release()
  }

  async rollback(): Promise<void> {
    await this.queryRunner.rollbackTransaction()
    await this.queryRunner.release()
  }

  getTransactionInstance(): import('typeorm').EntityManager {
    return this.queryRunner.manager
  }
}

class TypeOrmUnitOfWorkProvider implements IUnitOfWorkProvider {
  constructor(private readonly dataSource: DataSource) {}

  async beginTransaction(): Promise<IUnitOfWorkTransaction> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    return new TypeOrmUnitOfWorkTransaction(queryRunner)
  }
}

export const UNIT_OF_WORK_TOKEN = 'IUnitOfWork'

@Module({
  providers: [
    {
      provide: UNIT_OF_WORK_TOKEN,
      useFactory: (dataSource: DataSource) => {
        const provider = new TypeOrmUnitOfWorkProvider(dataSource)
        return new UnitOfWork(provider)
      },
      inject: [DataSource],
    },
  ],
  exports: [UNIT_OF_WORK_TOKEN],
})
export class UnitOfWorkTypeOrmModule {}
