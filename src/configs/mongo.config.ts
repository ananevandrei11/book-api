import { ConfigService } from '@nestjs/config';

const getMongoOptions = (configService: ConfigService) => {
  const login = configService.get('MONGODB_LOGIN');
  const pass = configService.get('MONGODB_PASSWORD');
  const host = configService.get('MONGODB_HOST');
  const port = configService.get('MONGODB_PORT');
  const authDB = configService.get('MONGODB_AUTH');
  return `mongodb://${login}:${pass}@${host}:${port}/book-api?authSource=${authDB}&directConnection=true`;
};

export const getMongoConfig = async (configService: ConfigService) => ({
  uri: getMongoOptions(configService),
});
