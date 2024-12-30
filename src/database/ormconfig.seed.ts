import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

const options: DataSourceOptions = {
  name: 'seed',
  type: process.env.DB_TYPE as any,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  synchronize: false,
  migrationsRun: true,
  dropSchema: false,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'seeds', '*.*')],
};
const dataSource = new DataSource(options);
export default dataSource;
