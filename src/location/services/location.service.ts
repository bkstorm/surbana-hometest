import { Injectable } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from '../entities';
import { GetLocationsDto } from '../dtos';

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
}
