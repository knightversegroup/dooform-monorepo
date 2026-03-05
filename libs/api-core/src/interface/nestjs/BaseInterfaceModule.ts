import type { Provider } from '@nestjs/common'
import type { Controller, Type } from '@nestjs/common/interfaces'

export class BaseInterfaceModule {
  static getControllersAndProviders(): [Type<Controller>[], Provider[]] {
    const controllers: Type<Controller>[] = []
    const providers: Provider[] = []

    controllers.push(...this.getRESTControllers())

    return [controllers, providers]
  }

  static getRESTControllers(): Type<Controller>[] {
    return []
  }
}
