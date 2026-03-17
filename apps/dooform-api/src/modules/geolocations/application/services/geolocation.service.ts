import { BadRequestException, Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DataSource } from 'typeorm'

@Injectable()
export class GeolocationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GeolocationService.name)
  private geoDB!: DataSource

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const mainUrl = this.configService.get<string>('DATABASE_URL', '')
    // Replace the database name with dooform_geolocations
    const geoUrl = mainUrl.replace(/\/[^/]+$/, '/dooform_geolocations')

    this.geoDB = new DataSource({
      type: 'postgres',
      url: geoUrl,
      ssl: this.configService.get<string>('DATABASE_SSL', 'false') === 'true'
        ? { rejectUnauthorized: false } as any
        : false,
      extra: { max: 3 },
    })

    try {
      await this.geoDB.initialize()
      this.logger.log('Connected to dooform_geolocations database')
    } catch (err) {
      this.logger.error(`Failed to connect to geolocations DB: ${err}`)
    }
  }

  async onModuleDestroy() {
    if (this.geoDB?.isInitialized) {
      await this.geoDB.destroy()
    }
  }

  private formatRows(rows: any[]): any[] {
    return rows.map((row) => ({
      OBJECTID: row.objectid,
      ADMIN_ID1: row.admin_id1,
      ADMIN_ID2: row.admin_id2,
      ADMIN_ID3: row.admin_id3,
      NAME1: row.name1,
      NAME_ENG1: row.name_eng1,
      NAME2: row.name2,
      NAME_ENG2: row.name_eng2,
      NAME3: row.name3,
      NAME_ENG3: row.name_eng3,
      Type: row.TYPE ?? row.type,
      Version: row.VERSION ?? row.version,
      POP_YEAR: row.pop_year,
      POPULATION: row.population,
      MALE: row.male,
      FEMALE: row.female,
      HOUSE: row.house,
      Shape_Area: row.shape__area,
      Shape_Length: row.shape__length,
    }))
  }

  async list() {
    const rows = await this.geoDB.query(
      `SELECT * FROM administrative_boundaries`,
    )
    return this.formatRows(rows)
  }

  async query(name1?: string, name2?: string, name3?: string) {
    const conditions: string[] = []
    const params: any[] = []
    let idx = 1

    if (name1) {
      conditions.push(`name1 = $${idx++}`)
      params.push(name1)
    }
    if (name2) {
      conditions.push(`name2 = $${idx++}`)
      params.push(name2)
    }
    if (name3) {
      conditions.push(`name3 = $${idx++}`)
      params.push(name3)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const rows = await this.geoDB.query(
      `SELECT * FROM administrative_boundaries ${where}`,
      params,
    )
    return this.formatRows(rows)
  }

  async search(q: string) {
    if (!q) {
      throw new BadRequestException('q query parameter is required')
    }

    const sanitized = q.replace(/[^a-zA-Z0-9\s\u0E00-\u0E7F]/g, '')
    if (!sanitized) {
      return []
    }

    const likeQuery = `%${sanitized}%`

    // Use ILIKE fallback; add tsquery if search_vector is populated
    const rows = await this.geoDB.query(
      `SELECT * FROM administrative_boundaries
       WHERE (name1 || ' ' || name2 || ' ' || name3 || ' ' || name_eng1 || ' ' || name_eng2 || ' ' || name_eng3) ILIKE $1
       LIMIT 10`,
      [likeQuery],
    )
    return this.formatRows(rows)
  }
}
