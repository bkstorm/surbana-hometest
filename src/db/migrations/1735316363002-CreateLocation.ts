import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLocation1735316363002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      CREATE TABLE location(
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        area NUMERIC(10, 2),
        parent_id INTEGER REFERENCES location(id)
      )
        `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS location
        `);
  }
}
