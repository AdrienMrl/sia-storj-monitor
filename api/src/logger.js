import winston from 'winston';

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple(),
);

const fileFormat = winston.format.json();

const logger = winston.createLogger({
  format: fileFormat,
  transports: [new winston.transports.File({ filename: './combined.log' })],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    }),
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'info',
    }),
  );
}

export default logger;
