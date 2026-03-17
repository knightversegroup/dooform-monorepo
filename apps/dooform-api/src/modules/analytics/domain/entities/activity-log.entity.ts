import { Entity, type IEntityProps } from '@dooform-api-core/domain'

export interface ActivityLogProps extends IEntityProps {
  method: string
  path: string
  userAgent: string
  ipAddress: string
  requestBody: string | null
  queryParams: string | null
  statusCode: number
  responseTime: number
  userId: string | null
  userEmail: string | null
}

export class ActivityLog extends Entity<ActivityLogProps> {
  static create(props: {
    method: string
    path: string
    userAgent?: string
    ipAddress?: string
    requestBody?: string | null
    queryParams?: string | null
    statusCode: number
    responseTime: number
    userId?: string | null
    userEmail?: string | null
  }): ActivityLog {
    return new ActivityLog({
      method: props.method.toUpperCase(),
      path: props.path,
      userAgent: props.userAgent ?? '',
      ipAddress: props.ipAddress ?? '',
      requestBody: props.requestBody ?? null,
      queryParams: props.queryParams ?? null,
      statusCode: props.statusCode,
      responseTime: props.responseTime,
      userId: props.userId ?? null,
      userEmail: props.userEmail ?? null,
    })
  }

  get method(): string {
    return this.getProp('method')
  }

  get path(): string {
    return this.getProp('path')
  }

  get userAgent(): string {
    return this.getProp('userAgent')
  }

  get ipAddress(): string {
    return this.getProp('ipAddress')
  }

  get requestBody(): string | null {
    return this.getProp('requestBody')
  }

  get queryParams(): string | null {
    return this.getProp('queryParams')
  }

  get statusCode(): number {
    return this.getProp('statusCode')
  }

  get responseTime(): number {
    return this.getProp('responseTime')
  }

  get userId(): string | null {
    return this.getProp('userId')
  }

  get userEmail(): string | null {
    return this.getProp('userEmail')
  }
}
