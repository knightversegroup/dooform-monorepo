import { Logger } from '../Logger'
import { Result } from '../Result'

export const UseLogger = (context: string): PropertyDecorator => {
  return (target: object, propertyKey: string | symbol) => {
    const logger = new Logger(context)

    Object.defineProperty(target, propertyKey, {
      value: logger,
      writable: false,
      enumerable: true,
      configurable: true,
    })
  }
}

export function UseClassLogger(context?: string): ClassDecorator {
  return function (target: any) {
    const methodNames = Object.getOwnPropertyNames(target.prototype)

    methodNames.forEach((methodName) => {
      if (methodName === 'constructor') return

      const descriptor = Object.getOwnPropertyDescriptor(target.prototype, methodName)
      const originalMethod = descriptor?.value

      if (originalMethod && typeof originalMethod === 'function') {
        descriptor!.value = function (...args: any[]) {
          let logger = (this as any).logger as Logger
          if (!logger) {
            logger = new Logger(`${context}:${target.name}`)
          }

          logger.startTimer(methodName)

          try {
            logger.debug(`"${methodName}" called with args`, { args })
            const result = originalMethod.apply(this, args)

            // Async path
            if (result instanceof Promise) {
              return result
                .then((asyncResult) => {
                  logger.endTimer(methodName)
                  logger.debug(`"${methodName}" executed successfully`, { result: asyncResult })

                  if (asyncResult instanceof Result && asyncResult.isFailure()) {
                    throw asyncResult.getError()
                  }

                  return asyncResult
                })
                .catch((error) => {
                  logger.error(
                    `"${methodName}" failed`,
                    error instanceof Error ? error : new Error(String(error))
                  )
                  throw error
                })
            }

            // Sync path
            logger.endTimer(methodName)
            logger.debug(`"${methodName}" executed successfully`, { result })
            return result
          } catch (error) {
            logger.error(
              `"${methodName}" failed`,
              error instanceof Error ? error : new Error(String(error))
            )
            throw error
          }
        }

        Object.defineProperty(target.prototype, methodName, descriptor!)
      }
    })
  }
}
