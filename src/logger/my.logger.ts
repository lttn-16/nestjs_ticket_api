import { LoggerService, LogLevel } from '@nestjs/common';
import chalk from 'chalk';
import * as winston from 'winston';

export class MyLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    // Cấu hình Winston Logger
    this.logger = winston.createLogger({
      level: 'info', // Cấp độ log mặc định thấp nhất được ghi lại
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }), // Tự động in ra stack trace nếu có lỗi
        winston.format.splat(),
        winston.format.json(), // Định dạng log dạng JSON để dễ quản lý/đọc bằng các tool như ELK, Grafana
      ),
      transports: [
        // 1. In log ra màn hình Console (có thêm màu sắc cho dễ nhìn)
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, message, context, ...meta }) => {
                const ctx = context ? chalk.yellow(` [${context}]`) : '';
                const metaData = Object.keys(meta).length
                  ? ` ${JSON.stringify(meta)}`
                  : '';
                return `${chalk.green(`[Winston]`)} ${timestamp} ${level}:${ctx} ${message}${metaData}`;
              },
            ),
          ),
        }),
        // 2. Ghi riêng log lỗi vào file error.log
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        // 3. Ghi tất cả các loại log vào file combined.log
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });
  }

  // Tiện ích bóc tách optionalParams để lấy "context" chuẩn theo cách gọi của NestJS
  private parseContext(optionalParams: any[]) {
    return optionalParams.length > 0
      ? optionalParams[optionalParams.length - 1]
      : undefined;
  }

  log(message: any, ...optionalParams: any[]) {
    const context = this.parseContext(optionalParams);
    this.logger.info(message, { context });
  }

  error(message: any, ...optionalParams: any[]) {
    const context = this.parseContext(optionalParams);

    if (message instanceof Error) {
      this.logger.error(message.message, {
        context,
        stack: message.stack,
      });
    } else if (typeof message === 'object') {
      this.logger.error(JSON.stringify(message), { context });
    } else {
      this.logger.error(message, { context });
    }
  }

  warn(message: any, ...optionalParams: any[]) {
    const context = this.parseContext(optionalParams);
    this.logger.warn(message, { context });
  }

  debug(message: any, ...optionalParams: any[]) {
    const context = this.parseContext(optionalParams);
    this.logger.debug(message, { context });
  }

  verbose(message: any, ...optionalParams: any[]) {
    const context = this.parseContext(optionalParams);
    this.logger.verbose(message, { context });
  }

  fatal(message: any, ...optionalParams: any[]) {
    const context = this.parseContext(optionalParams);
    // Winston không có sẵn level 'fatal', nó tương đương mức độ cao nhất là 'error'
    this.logger.error(`[FATAL] ${message}`, { context });
  }

  setLogLevels(levels: LogLevel[]) {
    // Cập nhật động danh sách cấp độ log nếu NestJS yêu cầu thay đổi
    if (levels.length > 0) {
      this.logger.level = levels[0];
    }
  }
}
