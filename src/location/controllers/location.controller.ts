import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { Location } from '../entities';
import { LocationService } from '../services';
import { CreateLocationDto, GetLocationsDto } from '../dtos';

@Controller('locations')
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

  @Put(':id')
  async updateLocation(
    @Param('id', ParseIntPipe) id: number,
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    return this.locationService.updateLocation(id, createLocationDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteLocation(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.locationService.deleteLocationById(id);
  }
}
