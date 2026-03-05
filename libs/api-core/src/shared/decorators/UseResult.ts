import { Result } from '../Result'

export function UseResult() {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value

    descriptor.value = async function (this: any, ...args: Parameters<T>) {
      try {
        const result = await originalMethod?.apply(this, args)

        if (result instanceof Result) {
          return result
        }

        return Result.success(result)
      } catch (error) {
        if (error instanceof Result) {
          return error
        }

        return Result.failure(error)
      }
    } as T

    return descriptor
  }
}
