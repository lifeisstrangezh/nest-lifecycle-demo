import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { log } from '../flow-logger';
import type { AppRequest } from '../types';

/**
 * 全局异常过滤器（main.ts 中 useGlobalFilters 注册），最后兜底。
 * 同时处理 HttpException 和未知异常，输出统一错误结构。
 */
@Catch()
export class GlobalHttpFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<AppRequest>();

    const { status, code, message } = this.normalize(exception);

    log('8-Filter', 'Global', `GlobalHttpFilter 兜底处理 ${(exception as Error)?.name ?? typeof exception} -> HTTP ${status} code=${code}`);

    res.status(status).json({
      code,
      message,
      data: null,
      path: req.originalUrl,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    });
  }

  private normalize(exception: unknown): { status: number; code: number; message: string } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'object' && response !== null) {
        const r = response as Record<string, unknown>;
        const rawMessage = r.message ?? exception.message;
        return {
          status,
          code: typeof r.code === 'number' ? r.code : status,
          message: Array.isArray(rawMessage) ? rawMessage.join('; ') : String(rawMessage),
        };
      }
      return { status, code: status, message: String(response) };
    }

    // 非 HttpException：通常是程序 bug，打印完整堆栈便于排查
    console.error(exception);
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, code: 500, message: '服务器内部错误' };
  }
}
