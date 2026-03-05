import { AsyncLocalStorage } from 'async_hooks'

export interface IUnitOfWorkTransaction {
  commit(): Promise<void>
  rollback(): Promise<void>
  getTransactionInstance(): any
}

export interface IUnitOfWorkProvider {
  beginTransaction(): Promise<IUnitOfWorkTransaction>
}

export interface IUnitOfWork {
  getCurrentTransaction(): IUnitOfWorkTransaction | null
  withTransaction<T>(work: () => Promise<T>): Promise<T>
}

interface UnitOfWorkStore {
  transaction: IUnitOfWorkTransaction | null
}

export class UnitOfWork implements IUnitOfWork {
  private static readonly als = new AsyncLocalStorage<UnitOfWorkStore>()

  constructor(private readonly provider: IUnitOfWorkProvider) {}

  private getStore(): UnitOfWorkStore | undefined {
    return UnitOfWork.als.getStore()
  }

  private setTransaction(transaction: IUnitOfWorkTransaction | null) {
    const store = this.getStore()
    if (store) {
      store.transaction = transaction
    }
  }

  getCurrentTransaction(): IUnitOfWorkTransaction | null {
    return this.getStore()?.transaction ?? null
  }

  async withTransaction<T>(work: () => Promise<T>): Promise<T> {
    const existing = this.getCurrentTransaction()
    if (existing) {
      return work()
    }

    return UnitOfWork.als.run({ transaction: null }, async () => {
      let trx: IUnitOfWorkTransaction | null = null
      try {
        trx = await this.provider.beginTransaction()
        this.setTransaction(trx)
        const result = await work()
        await trx.commit()
        return result
      } catch (err) {
        if (trx) {
          try {
            await trx.rollback()
          } catch (rollbackErr) {
            console.error('Rollback failed:', rollbackErr)
          }
        }
        throw err
      } finally {
        this.setTransaction(null)
      }
    })
  }
}
