import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from '../entities';
import { CreateLocationDto, GetLocationsDto } from '../dtos';
import {
  LOCATION_ERROR_CODE,
  LOCATION_CONSTRAINT_CODE,
} from './location.constants';

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

    if (getLocationDto.parentId) {
      qb.where({
        parentId: getLocationDto.parentId,
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
      return this.locationRepository.findOneBy({ id });
    } catch (error) {
      if (error.constraint === LOCATION_CONSTRAINT_CODE.PARENT_ID_NOT_FOUND) {
        throw new BadRequestException(
          'Location with provided parentId does not exist',
        );
      }

      if (error.constraint === LOCATION_CONSTRAINT_CODE.CODE_DUPLICATED) {
        throw new BadRequestException(
          'Location with provided code already exists',
        );
      }

      if (error.code === LOCATION_ERROR_CODE.CIRCULAR_LOCATION) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  async getLocationById(id: number): Promise<Location> {
    const location = await this.locationRepository.findOneBy({ id });
    if (!location) {
      throw new NotFoundException('Location with id does not exists');
    }

    return location;
  }

  async deleteLocationById(id: number): Promise<void> {
    await this.locationRepository.delete(id);
  }
}
