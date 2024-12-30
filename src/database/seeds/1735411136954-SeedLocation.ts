import { MigrationInterface, QueryRunner } from 'typeorm';
import { Location } from '../../location';

export class SeedLocation1735411136954 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.getRepository(Location).save([
      {
        name: 'Building A',
        code: 'Building-A',
        area: 100,
        children: [
          {
            name: 'Car Park',
            code: 'A-CarPark',
            area: 80.62,
          },
          {
            name: 'Level 1',
            code: 'A-01',
            area: 100.92,
          },
          {
            name: 'Lobby Level 1',
            code: 'A-01-Lobby',
            area: 80.62,
          },
          {
            name: 'Master Room',
            code: 'A-01-01',
            area: 50.11,
          },
          {
            name: 'Meeting Room 1',
            code: 'A-01-01-M1',
            area: 20.11,
          },
          {
            name: 'Corridor Level 1',
            code: 'A-01-Corridor',
            area: 30.2,
          },
          {
            name: 'Toilet Level 1',
            code: 'A-01-02',
            area: 30.2,
          },
        ],
      },
      {
        name: 'Building B',
        code: 'Building-B',
        area: 200,
        children: [
          {
            name: 'Level 5',
            code: 'B-05',
            area: 150,
          },
          {
            name: 'Utility Room',
            code: 'B-05-11',
            area: 10.2,
          },
          {
            name: 'Sanitary Room',
            code: 'B-05-12',
            area: 12.2,
          },
          {
            name: 'Male Toilet',
            code: 'B-05-13',
            area: 30.2,
          },
          {
            name: 'Genset Room',
            code: 'B-05-14',
            area: 35.2,
          },
          {
            name: 'Pantry Level 5',
            code: 'B-05-15',
            area: 50.2,
          },
          {
            name: 'Corridor Level 5',
            code: 'B-05-Corridor',
            area: 30,
          },
        ],
      },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.clearTable('location');
  }
}
