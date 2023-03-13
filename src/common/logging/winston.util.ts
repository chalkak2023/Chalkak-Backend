import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import path from 'path';

const env = process.env.NODE_ENV;

const dailyOptions = (level: string) => {
  return new winston.transports.File({
    level,
    filename: path.join('logs', level, `${level}.log`),
    maxsize: 1024 * 1024 * 10,
  });
};

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: env === 'production' ? 'info' : 'debug',
      format:
        env === 'production'
          ? winston.format.simple()
          : winston.format.combine(
              winston.format.timestamp({}),
              winston.format.colorize(),
              utilities.format.nestLike('chalkak', {
                prettyPrint: true,
              })
            ),
    }),
    new winston.transports.File({ filename: path.join('logs', 'combine', 'combined.log') }),
    dailyOptions('info'),
    dailyOptions('warn'),
    dailyOptions('error'),
  ],
});
