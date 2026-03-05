import { plainToInstance, type ClassTransformOptions } from 'class-transformer'
import { validate, type ValidatorOptions, type ValidationError } from 'class-validator'

import { ValidationException } from '../../domain/exceptions/DomainException'

type PrimitiveConstructor =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | BigIntConstructor
  | SymbolConstructor
  | DateConstructor
  | ArrayConstructor
  | ObjectConstructor
  | RegExpConstructor

interface ParameterValidation {
  index: number
  type: 'dto' | 'primitive'
  schema?: new () => unknown
  validator?: (value: unknown) => boolean | Promise<boolean>
  message?: string
}

interface ValidateInputOptions {
  transformOptions?: ClassTransformOptions
  validatorOptions?: ValidatorOptions
  parameters: ParameterValidation[]
}

export function ValidateInput<T extends object>(dto: new () => T): MethodDecorator
export function ValidateInput<T extends object>(
  dto: new () => T,
  paramIndex: number
): MethodDecorator
export function ValidateInput(type: PrimitiveConstructor, paramIndex: number): MethodDecorator
export function ValidateInput(options: ValidateInputOptions): MethodDecorator

export function ValidateInput<T extends object>(
  dtoOrTypeOrOptions: (new () => T) | PrimitiveConstructor | ValidateInputOptions,
  paramIndex?: number
): MethodDecorator {
  // Case 1: Simple DTO validation
  if (typeof dtoOrTypeOrOptions === 'function' && paramIndex === undefined) {
    return createDecorator({
      parameters: [
        {
          index: 0,
          type: 'dto',
          schema: dtoOrTypeOrOptions as new () => T,
        },
      ],
    })
  }

  // Case 2: Primitive validation
  if (typeof dtoOrTypeOrOptions === 'function' && typeof paramIndex === 'number') {
    return createDecorator({
      parameters: [
        {
          index: paramIndex,
          type: 'primitive',
          validator: (value: unknown) => typeof value === dtoOrTypeOrOptions.name.toLowerCase(),
          message: `Invalid input: Expected ${dtoOrTypeOrOptions.name.toLowerCase()} type for parameter at position ${paramIndex}`,
        },
      ],
    })
  }

  // Case 3: Advanced options
  return createDecorator(dtoOrTypeOrOptions as ValidateInputOptions)
}

function getNestedConstraints(error: ValidationError): { [type: string]: string } | undefined {
  if (!error.constraints && error.children && error.children.length > 0) {
    const nestedConstraints = error.children.reduce(
      (acc: { [type: string]: string }, child: ValidationError) => {
        const childConstraints = getNestedConstraints(child)
        return { ...acc, ...(childConstraints ?? {}) }
      },
      {}
    )

    return nestedConstraints
  }
  return error.constraints
}

function getNestedPropertyPath(error: ValidationError, parentPath?: string): string | string[] {
  const currentPath = parentPath ? [parentPath, error.property].join('.') : error.property
  if (error.children && error.children.length > 0) {
    return error.children.flatMap((child) => getNestedPropertyPath(child, currentPath))
  }

  return currentPath
}

function createDecorator(options: ValidateInputOptions): MethodDecorator {
  const {
    transformOptions = { enableImplicitConversion: true },
    validatorOptions = { whitelist: true, forbidNonWhitelisted: false },
    parameters,
  } = options

  return function (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      for (const param of parameters) {
        const value = args[param.index]

        if (param.type === 'dto') {
          if (!param.schema) {
            throw new ValidationException('Schema is required for DTO validation')
          }

          const dtoInstance = plainToInstance(param.schema, value, transformOptions)
          const errors = await validate(dtoInstance as object, validatorOptions)

          if (errors.length > 0) {
            const formattedErrors = errors.map((error) => {
              const constraints = getNestedConstraints(error)
              const propertyPath = getNestedPropertyPath(error)

              return {
                property: propertyPath,
                value: error.value,
                constraints,
              }
            })

            throw new ValidationException({
              message: 'Input validation failed',
              parameter: param.index,
              details: formattedErrors,
            })
          }

          args[param.index] = dtoInstance
        } else if (param.validator) {
          if (!(await param.validator(value))) {
            throw new ValidationException({
              message:
                param.message || `Validation failed for parameter at position ${param.index}`,
              parameter: param.index,
              details: [
                {
                  property: 'value',
                  constraints: {
                    validator: param.validator.toString(),
                  },
                  value,
                },
              ],
            })
          }
        }
      }

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}
