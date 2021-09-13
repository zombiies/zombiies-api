import { MongooseModuleOptions } from '@nestjs/mongoose';
import { registerAs } from '@nestjs/config';
import { getEnvConfig } from '../env.config';

type MongoConfigOption = MongooseModuleOptions;

export const getMongoOption = (): MongoConfigOption => {
  const { MONGO_URI } = getEnvConfig();

  return {
    uri: MONGO_URI,
    useCreateIndex: true,
    useNewUrlParser: true,
  };
};

const mongoConfigOption = registerAs('mongo', () => getMongoOption());
export default mongoConfigOption;
