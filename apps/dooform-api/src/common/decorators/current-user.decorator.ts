import { createParamDecorator, type ExecutionContext } from '@nestjs/common'

export interface RequestUser {
  userId: string
  email: string
  roles: string[]
}

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | string | string[] => {
    const request = ctx.switchToHttp().getRequest()
    const user: RequestUser = request.user
    return data ? user?.[data] : user
  },
)
