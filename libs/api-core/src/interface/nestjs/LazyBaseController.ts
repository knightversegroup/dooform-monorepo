import type { LazyModuleLoader } from '@nestjs/core'

export abstract class LazyBaseController {
  protected readonly lazyModuleLoaderInstance: LazyModuleLoader

  constructor(lazyModuleLoader: LazyModuleLoader) {
    this.lazyModuleLoaderInstance = lazyModuleLoader
  }

  protected async loadUseCase<T>(
    moduleFactory: () => Promise<any>,
    useCaseFactory: () => Promise<any>
  ): Promise<T> {
    if (!this.lazyModuleLoaderInstance) {
      throw new Error('LazyModuleLoader is not initialized.')
    }

    const moduleImport = await moduleFactory()
    const useCaseImport = await useCaseFactory()

    const moduleName = Object.keys(moduleImport)[0]
    const useCaseName = Object.keys(useCaseImport)[0]

    const moduleInstance = await this.lazyModuleLoaderInstance.load(() => moduleImport[moduleName])
    const UseCase = useCaseImport[useCaseName]

    return moduleInstance.get(UseCase)
  }

  protected async load<T>(
    moduleFactory: () => Promise<any>,
    serviceFactory: () => Promise<any>
  ): Promise<T> {
    if (!this.lazyModuleLoaderInstance) {
      throw new Error('LazyModuleLoader is not initialized.')
    }

    const moduleImport = await moduleFactory()
    const serviceImport = await serviceFactory()

    const moduleName = Object.keys(moduleImport)[0]
    const serviceName = Object.keys(serviceImport)[0]

    const moduleInstance = await this.lazyModuleLoaderInstance.load(() => moduleImport[moduleName])
    const service = serviceImport[serviceName]

    return moduleInstance.get(service)
  }
}
