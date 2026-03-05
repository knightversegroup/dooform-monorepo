import type { Result } from '../shared'

export interface UseCase<T, R> {
  execute(params: T, ...args: unknown[]): Promise<Result<R>> | Result<R>
}
