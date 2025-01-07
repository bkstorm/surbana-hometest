import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateLocationPath1736261987508 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE EXTENSION IF NOT EXISTS ltree;    
    `);
    await queryRunner.query(`
        ALTER TABLE location
        ADD COLUMN path ltree;
    `);

    // update path for existing locations in the database
    await queryRunner.query(`
        WITH RECURSIVE location_path AS (
            SELECT id, parent_id, id::text::ltree as path
            FROM location
            WHERE parent_id IS NULL

            UNION ALL

            SELECT l.id, l.parent_id, (lp.path || l.id::text)::ltree
            FROM location l
            INNER JOIN location_path lp ON l.parent_id = lp.id
        )
        UPDATE location l
        SET path = lp.path
        FROM location_path lp
        WHERE l.id = lp.id;
    `);

    // create indexes for path, each index can be used to speed up some operators (https://www.postgresql.org/docs/current/ltree.html)
    await queryRunner.query(`
        CREATE INDEX location_path_gist_idx ON location USING GIST(path);    
    `);
    await queryRunner.query(`
        CREATE INDEX location_path_idx ON location USING BTREE(path);    
    `);
    await queryRunner.query(`
        CREATE INDEX location_path_hash_idx ON location USING HASH(path);
    `);

    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION update_location_path()
        RETURNS TRIGGER AS $$
        DECLARE
            new_path ltree;
            has_circle boolean;
        BEGIN
            -- calculate new path based on parent_id
            IF NEW.parent_id IS NULL THEN
                new_path = NEW.id::text::ltree;
            ELSE
                SELECT path || NEW.id::text INTO new_path
                FROM location
                WHERE id = NEW.parent_id;
            END IF;
            
            -- If this is an UPDATE and path is changing
            IF TG_OP = 'UPDATE' THEN
                SELECT EXISTS (
                    SELECT 1 FROM location
                    WHERE id = NEW.parent_id
                    AND path <@ OLD.path
                ) INTO has_circle;

                IF has_circle THEN
                    RAISE EXCEPTION USING
                        ERRCODE = 'Z0001', -- custom error code for circular detection
                        MESSAGE = 'Circular location detected',
                        DETAIL = format('Inserting or updating id %s with parent_id %s would create a cycle', NEW.id, NEW.parent_id),
                        HINT = 'Ensure the parent_id does not create a circular reference';
                END IF;

                -- Update all descendant locations
                IF new_path IS DISTINCT FROM OLD.path THEN
                    UPDATE location
                    SET path = new_path || subpath(path, nlevel(OLD.path))
                    WHERE path <@ OLD.path AND path != OLD.path;
                END IF;
            END IF;

            NEW.path = new_path;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);
    await queryRunner.query(`
        CREATE TRIGGER location_path_insert_update
        BEFORE INSERT OR UPDATE OF parent_id ON location
        FOR EACH ROW EXECUTE FUNCTION update_location_path();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
       DROP TRIGGER IF EXISTS location_path_insert_update ON location;
    `);
    await queryRunner.query(`
        DROP FUNCTION IF EXISTS update_location_path;
    `);
    await queryRunner.query(`
       DROP INDEX IF EXISTS location_path_hash_idx; 
    `);
    await queryRunner.query(`
        DROP INDEX IF EXISTS location_path_idx; 
     `);
    await queryRunner.query(`
        DROP INDEX IF EXISTS location_path_gist_idx; 
     `);
    await queryRunner.query(`
        ALTER TABLE location
        DROP COLUMN path;    
    `);
    await queryRunner.query(`
        DROP EXTENSION IF EXISTS ltree;    
    `);
  }
}
