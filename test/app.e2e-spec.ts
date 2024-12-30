import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { AppModule } from './../src/app.module';
import DataSource from '../src/database/ormconfig.migration';
import {
  GetLocationsSortBy,
  Location,
  SortType,
  LocationService,
} from '../src/location';

const logger = new Logger();

describe('LocationController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    if (DataSource.isInitialized) return;
    try {
      await DataSource.initialize();
      logger.debug('Data Source has been initialized!');

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({ transform: true }));
      await app.init();
    } catch (error) {
      logger.error(error);
    }
  });

  afterAll(async () => {
    try {
      await DataSource.destroy();
      logger.debug('Data Source has been destroyed!');

      await app.close();
    } catch (error) {
      logger.error(error);
    }
  });

  describe('/locations (GET)', () => {
    it('should return locations with default parameters', async () => {
      const locationService = app.get(LocationService);
      const mockLocations: Location[] = [
        {
          id: 1,
          name: 'Bulding A',
          code: 'Building-A',
          area: 1000,
          children: [],
        },
        {
          id: 2,
          name: 'Floor 1',
          code: 'A-Floor-1',
          area: 100,
          children: [],
          parentId: 1,
        },
      ];
      jest
        .spyOn(locationService, 'getLocations')
        .mockImplementationOnce(async () => mockLocations);
      await request(app.getHttpServer())
        .get('/locations')
        .expect(200)
        .expect(mockLocations);
      expect(locationService.getLocations).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        sortBy: GetLocationsSortBy.ID,
        sortType: SortType.ASC,
      });
    });

    it('should throw 400 Bad Request if page is less than 1', () => {
      return request(app.getHttpServer())
        .get(`/locations?page=${faker.number.int({ max: 0 })}`)
        .expect(400);
    });

    it('should throw 400 Bad Request if page is not an integer', () => {
      return request(app.getHttpServer())
        .get(`/locations?page=${faker.number.float()}`)
        .expect(400);
    });

    it('should throw 400 Bad Request if size is less than min', () => {
      return request(app.getHttpServer())
        .get(`/locations?size=${faker.number.int({ max: 0 })}`)
        .expect(400);
    });

    it('should throw 400 Bad Request if size is greater than max', () => {
      return request(app.getHttpServer())
        .get(`/locations?size=${faker.number.int({ min: 51 })}`)
        .expect(400);
    });
  });
});
