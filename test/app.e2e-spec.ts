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
  CreateLocationDto,
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

    it('should return 400 Bad Request if page is less than 1', () => {
      return request(app.getHttpServer())
        .get(`/locations?page=${faker.number.int({ max: 0 })}`)
        .expect(400);
    });

    it('should return 400 Bad Request if page is not an integer', () => {
      return request(app.getHttpServer())
        .get(`/locations?page=${faker.number.float()}`)
        .expect(400);
    });

    it('should return 400 Bad Request if size is less than min', () => {
      return request(app.getHttpServer())
        .get(`/locations?size=${faker.number.int({ max: 0 })}`)
        .expect(400);
    });

    it('should return 400 Bad Request if size is greater than max', () => {
      return request(app.getHttpServer())
        .get(`/locations?size=${faker.number.int({ min: 51 })}`)
        .expect(400);
    });
  });

  describe('/locations (POST)', () => {
    it('should create a new location if data is valid', async () => {
      const location: CreateLocationDto = {
        name: faker.string.alpha({ length: { min: 1, max: 255 } }),
        code: faker.location.buildingNumber(),
        area: faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
      };
      const { body } = await request(app.getHttpServer())
        .post('/locations')
        .send(location)
        .expect(201);
      expect(body).toMatchObject(location);
    });

    it('should return 400 Bad Request if code already exists', async () => {
      const location: CreateLocationDto = {
        name: faker.string.alpha({ length: { min: 1, max: 255 } }),
        code: faker.location.buildingNumber(),
        area: faker.number.float({ min: 1, max: 1000 }),
      };
      await request(app.getHttpServer()).post('/locations').send(location);
      return request(app.getHttpServer())
        .post('/locations')
        .send(location)
        .expect(400);
    });

    it('should return 400 Bad Request if parentId does not exists', async () => {
      await DataSource.getRepository(Location).clear();
      const location: CreateLocationDto = {
        name: faker.string.alpha({ length: { min: 1, max: 255 } }),
        code: faker.location.buildingNumber(),
        area: faker.number.float({ min: 1, max: 1000 }),
        parentId: faker.number.int({ min: 1, max: 1000 }),
      };
      return request(app.getHttpServer())
        .post('/locations')
        .send(location)
        .expect(400);
    });
  });

  describe('/locations (PUT)', () => {
    it('should update the location if data is valid', async () => {
      const location = await DataSource.getRepository(Location).save({
        name: faker.string.alpha({ length: { min: 1, max: 255 } }),
        code: faker.location.buildingNumber(),
        area: faker.number.float({ min: 1, max: 1000 }),
      });
      const data: CreateLocationDto = {
        name: faker.string.alpha({ length: { min: 1, max: 255 } }),
        code: faker.location.buildingNumber(),
        area: faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
      };
      const { body } = await request(app.getHttpServer())
        .put(`/locations/${location.id}`)
        .send(data)
        .expect(200);
      expect(body).toMatchObject(data);
    });

    it('should return 400 Bad Request if code already exists', async () => {
      const location1 = await DataSource.getRepository(Location).save({
        name: faker.string.alpha({ length: { min: 1, max: 255 } }),
        code: faker.location.buildingNumber(),
        area: faker.number.float({ min: 1, max: 1000 }),
      });
      const location2 = await DataSource.getRepository(Location).save({
        name: faker.string.alpha({ length: { min: 1, max: 255 } }),
        code: faker.location.buildingNumber(),
        area: faker.number.float({ min: 1, max: 1000 }),
      });
      const data: CreateLocationDto = {
        name: faker.string.alpha({ length: { min: 1, max: 255 } }),
        code: location1.code,
        area: faker.number.float({ min: 1, max: 1000 }),
      };
      return request(app.getHttpServer())
        .put(`/locations/${location2.id}`)
        .send(data)
        .expect(400);
    });

    it('should return 400 Bad Request if parentId does not exists', async () => {
      await DataSource.getRepository(Location).clear();
      const location = await DataSource.getRepository(Location).save({
        name: faker.string.alpha({ length: { min: 1, max: 255 } }),
        code: faker.location.buildingNumber(),
        area: faker.number.float({ min: 1, max: 1000 }),
      });
      const data: CreateLocationDto = {
        name: faker.string.alpha({ length: { min: 1, max: 255 } }),
        code: faker.location.buildingNumber(),
        area: faker.number.float({ min: 1, max: 1000 }),
        parentId: faker.number.int({ min: location.id + 1, max: 10e6 }),
      };
      return request(app.getHttpServer())
        .put(`/locations/${location.id}`)
        .send(data)
        .expect(400);
    });

    it('should return 404 Not Found if location does not exists', async () => {
      await DataSource.getRepository(Location).clear();
      const data: CreateLocationDto = {
        name: faker.string.alpha({ length: { min: 1, max: 255 } }),
        code: faker.location.buildingNumber(),
        area: faker.number.float({ min: 1, max: 1000 }),
      };
      return request(app.getHttpServer())
        .put(`/locations/${faker.number.int({ min: 1, max: 10e6 })}`)
        .send(data)
        .expect(404);
    });
  });
});
