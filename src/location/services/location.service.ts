import { BadRequestException, Injectable } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from '../entities';
import { CreateLocationDto, GetLocationsDto } from '../dtos';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async getLocations(getLocationDto: GetLocationsDto): Promise<Location[]> {
    const qb = this.locationRepository.createQueryBuilder();

    if (getLocationDto.name) {
      qb.where({
        name: ILike(`%${getLocationDto.name}%`),
      });
    }

    if (getLocationDto.code) {
      qb.where({
        code: getLocationDto.code,
      });
    }

    qb.offset((getLocationDto.page - 1) * getLocationDto.size)
      .limit(getLocationDto.size)
      .orderBy(getLocationDto.sortBy, getLocationDto.sortType);

    return qb.getMany();
  }

  async createLocation(
    createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    try {
      if (createLocationDto.parentId) {
        const parent = await this.getLocationById(createLocationDto.parentId);
        if (!parent) {
          throw new BadRequestException(
            'Location with provided parentId does not exist',
          );
        }
      }

      return await this.locationRepository.save(createLocationDto);
    } catch (error) {
      // duplicate code in location
      if (error.constraint === 'location_code_key') {
        throw new BadRequestException(
          'Location with provided code already exists',
        );
      }
      throw error;
    }
  }

  async getLocationById(id: number): Promise<Location> {
    return this.locationRepository.findOneBy({ id });
  }

  async deleteLocationById(id: number): Promise<void> {
    await this.locationRepository.delete(id);
  }
}
