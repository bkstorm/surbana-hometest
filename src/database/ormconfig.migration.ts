import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

const options: DataSourceOptions = {
  name: 'default',
  type: process.env.DB_TYPE as any,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  synchronize: false,
  migrationsRun: true,
  dropSchema: false,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations', '*.*')],
};
const dataSource = new DataSource(options);
export default dataSource;
