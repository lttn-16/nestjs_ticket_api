import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { MyLogger } from 'src/logger/my.logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new MyLogger();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
    const message = exceptionResponse 
      ? (typeof exceptionResponse === 'object' ? (exceptionResponse as any).message : exceptionResponse)
      : (exception as any).message || 'Internal server error';

    const logMessage = `[${request.method}] ${request.url} - Status: ${status} - Error: ${JSON.stringify(message)}`;
    
    // ─── SỬA TẠI ĐÂY: Tạo hẳn một object Error để Winston ghi nhận chính xác vào error.log ───
    const customError = new Error(logMessage);
    if ((exception as any).stack) {
      customError.stack = (exception as any).stack; // Giữ lại vết báo lỗi gốc
    }

    // Bắt buộc gọi hàm error() thay vì chia if/else warn()
    this.logger.error(customError, 'ExceptionsHandler');

    // Trả response về cho client
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}