import { MigrationInterface, QueryRunner } from 'typeorm';

export class DetectCircularLocation1736254105516 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION is_circular_location(new_id INTEGER, new_parent_id INTEGER)
        RETURNS BOOLEAN AS $$
            -- use recursive CTE to build a temporary table containing all ancestor (from parent to the root) of the location
        WITH RECURSIVE location_ancestor AS (
                -- non-recursive term: start with the parent of location
                SELECT id, parent_id, 1 as level
                FROM location
                WHERE id = new_parent_id

                UNION ALL

                -- recursive term
                SELECT l.id, l.parent_id, la.level + 1
                FROM location l
                INNER JOIN location_ancestor la ON l.id = la.parent_id
            )
            SELECT EXISTS (
                SELECT 1 FROM location_ancestor WHERE id = new_id
            );
        $$ LANGUAGE SQL;        
    `);
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION detect_circular_location()
        RETURNS TRIGGER AS $$
        BEGIN 
            IF new.parent_id IS NOT NULL THEN 
                IF is_circular_location(NEW.id, NEW.parent_id) THEN 
                    RAISE EXCEPTION USING
                        ERRCODE = 'Z0001', -- custom error code for circular detection
                        MESSAGE = 'Circular location detected',
                        DETAIL = format('Inserting or updating id %s with parent_id %s would create a cycle', NEW.id, NEW.parent_id),
                        HINT = 'Ensure the parent_id does not create a circular reference';
                END IF;
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE PLPGSQL;
    `);
    await queryRunner.query(`
        CREATE TRIGGER circular_location_check
        BEFORE INSERT OR UPDATE ON location 
        FOR EACH ROW EXECUTE FUNCTION detect_circular_location();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TRIGGER IF EXISTS circular_location_check ON location;
    `);
    await queryRunner.query(`
        DROP FUNCTION IF EXISTS detect_circular_location;
    `);
    await queryRunner.query(`
        DROP FUNCTION IF EXISTS is_circular_location;
    `);
  }
}
