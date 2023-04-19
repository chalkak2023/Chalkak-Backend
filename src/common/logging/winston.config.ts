import { utilities } from 'nest-winston';
import { format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { simple, combine, timestamp, printf } = format;
const env = process.env.NODE_ENV;

const logFormat = printf(({ timestamp, level, message, context }) => {
  return `${timestamp} [${level}] [${context}] ${message}`;
});

export const winstonConfig = {
  transports: [
    new transports.Console({
      level: env === 'production' ? 'info' : 'debug',
      format:
        env === 'production'
          ? simple()
          : combine(
              format.colorize(),
              timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              utilities.format.nestLike('chalkak', { prettyPrint: true }),
              logFormat
            ),
    }),
    new DailyRotateFile({
      filename: 'logs/info-%DATE%.log',
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),

    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),

  ],
};
