import { Module } from '@nestjs/common'

import { GeolocationService } from './application/services/geolocation.service'
import { GeolocationController } from './interface/rest/controllers/geolocation.controller'

@Module({
  controllers: [GeolocationController],
  providers: [GeolocationService],
  exports: [GeolocationService],
})
export class GeolocationsModule {}
