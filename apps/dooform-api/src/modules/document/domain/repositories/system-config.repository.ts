import type { SystemConfig } from '../entities/system-config.entity'

export interface ISystemConfigRepository {
  findByKey(key: string): Promise<SystemConfig | null>
  save(entity: SystemConfig): Promise<SystemConfig>
  deleteByKey(key: string): Promise<void>
}
