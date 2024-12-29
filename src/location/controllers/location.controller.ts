import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { Location } from '../entities';
import { LocationService } from '../services';
import { GetLocationsDto } from '../dtos';

@Controller('/locations')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get()
  async getLocations(
    @Query(new ValidationPipe()) getLocationsDto: GetLocationsDto,
  ): Promise<Location[]> {
    console.log('dto', getLocationsDto);
    return this.locationService.getLocations(getLocationsDto);
  }
}
