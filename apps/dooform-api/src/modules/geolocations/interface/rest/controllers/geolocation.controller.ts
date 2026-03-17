import { Controller, Get, Query } from '@nestjs/common'

import { Public } from '../../../../../common/decorators/public.decorator'
import { GeolocationService } from '../../../application/services/geolocation.service'

@Controller('geolocations')
@Public()
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  @Get('list')
  async list() {
    return this.geolocationService.list()
  }

  @Get('query')
  async query(
    @Query('name1') name1?: string,
    @Query('name2') name2?: string,
    @Query('name3') name3?: string,
  ) {
    return this.geolocationService.query(name1, name2, name3)
  }

  @Get('search')
  async search(@Query('q') q: string) {
    return this.geolocationService.search(q)
  }
}
