import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { Location } from '../entities';
import { LocationService } from '../services';
import { CreateLocationDto, GetLocationsDto } from '../dtos';

@Controller('/locations')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get()
  async getLocations(
    @Query(new ValidationPipe()) getLocationsDto: GetLocationsDto,
  ): Promise<Location[]> {
    return this.locationService.getLocations(getLocationsDto);
  }

  @Post()
  async createLocation(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    return this.locationService.createLocation(createLocationDto);
  }
}
