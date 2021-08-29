import { MongooseModuleOptions } from '@nestjs/mongoose';
import { cleanEnv, str } from 'envalid';
import { registerAs } from '@nestjs/config';

type MongoConfigOption = MongooseModuleOptions;

export const getMongoOption = (): MongoConfigOption => {
  const env = cleanEnv(process.env, {
    MONGO_URI: str(),
  });

  return {
    uri: env.MONGO_URI,
  };
};

const mongoConfigOption = registerAs('mongo', () => getMongoOption());
export default mongoConfigOption;
