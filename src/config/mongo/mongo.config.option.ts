import { MongooseModuleOptions } from '@nestjs/mongoose';
import { registerAs } from '@nestjs/config';
import { getProcessEnv } from '../../common/env/process.env';

type MongoConfigOption = MongooseModuleOptions;

export const getMongoOption = (): MongoConfigOption => {
  const { MONGO_URI } = getProcessEnv();

  return {
    uri: MONGO_URI,
    useCreateIndex: true,
    useNewUrlParser: true,
  };
};

const mongoConfigOption = registerAs('mongo', () => getMongoOption());
export default mongoConfigOption;
