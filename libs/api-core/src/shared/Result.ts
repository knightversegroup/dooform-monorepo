export interface IResult<T, E = Error> {
  isSuccess(): boolean
  isFailure(): boolean
  getValue(): T
  getError(): E | null
}

export class Result<T, E = Error> implements IResult<T, E> {
  private readonly _isSuccess: boolean
  private readonly _error: E | null
  private readonly _value: T

  private constructor(isSuccess: boolean, value: T, error: E | null) {
    this._isSuccess = isSuccess
    this._value = value
    this._error = error
  }

  isSuccess(): boolean {
    return this._isSuccess
  }

  isFailure(): boolean {
    return !this._isSuccess
  }

  getValue(): T {
    return this._value
  }

  getError(): E | null {
    return this._error
  }

  static success<T>(value: T): Result<T> {
    return new Result<T>(true, value, null)
  }

  static failure<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(false, null as T, error)
  }
}

export function getResultValue<T>(result: Result<T>): T
export function getResultValue<T>(result: Promise<Result<T>>): Promise<T>
export function getResultValue<T>(result: Result<T> | Promise<Result<T>>): T | Promise<T> {
  if (result instanceof Promise) {
    return result.then((r) => {
      if (r.isFailure()) {
        throw r.getError()
      }
      return r.getValue()
    })
  }

  if (result.isFailure()) {
    throw result.getError()
  }
  return result.getValue()
}
