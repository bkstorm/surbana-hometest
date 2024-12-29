import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      return await this.locationRepository.save(createLocationDto);
    } catch (error) {
      if (error.constraint === 'location_parent_id_fkey') {
        throw new BadRequestException(
          'Location with provided parentId does not exist',
        );
      }

      if (error.constraint === 'location_code_key') {
        throw new BadRequestException(
          'Location with provided code already exists',
        );
      }

      throw error;
    }
  }

  async updateLocation(
    id: number,
    createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    try {
      const { affected } = await this.locationRepository.update(
        id,
        createLocationDto,
      );
      if (affected === 0) {
        throw new NotFoundException(`Location with id ${id} not found`);
      }
      return this.getLocationById(id);
    } catch (error) {
      if (error.constraint === 'location_parent_id_fkey') {
        throw new BadRequestException(
          'Location with provided parentId does not exist',
        );
      }

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
