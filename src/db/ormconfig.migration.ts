import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

const options: DataSourceOptions = {
  name: 'default',
  type: 'postgres',
  database: 'homework',
  username: 'surbana',
  password: '123456a@',
  synchronize: false,
  migrationsRun: true,
  dropSchema: false,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations', '*.*')],
};
const dataSource = new DataSource(options);
dataSource.initialize();
export default dataSource;
