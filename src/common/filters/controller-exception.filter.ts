import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { log } from '../flow-logger';
import { BusinessException } from '../exceptions/business.exception';
import type { AppRequest } from '../types';

/**
 * 控制器级异常过滤器（在 ArticleController 类上 @UseFilters 注册）。
 * 只"吃掉" BusinessException：返回统一的业务错误响应；
 * 其他异常重新抛出，交给更外层的全局过滤器兜底。
 *
 * 这演示了过滤器的就近原则与异常透传：
 *   路由级 -> 控制器级 -> 全局
 */
@Catch()
export class ControllerExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof BusinessException) {
      const ctx = host.switchToHttp();
      const res = ctx.getResponse<Response>();
      const req = host.switchToHttp().getRequest<AppRequest>();

      log(
        '8-Filter',
        'Controller',
        `ControllerExceptionFilter 处理业务异常 code=${exception.bizCode} message=${exception.message}`,
      );

      res.status(exception.getStatus()).json({
        code: exception.bizCode,
        message: exception.message,
        data: null,
        path: req.originalUrl,
        handledBy: 'ControllerExceptionFilter',
      });
      return;
    }

    log('8-Filter', 'Controller', `ControllerExceptionFilter 非业务异常，透传给全局过滤器：${(exception as Error)?.message}`);
    throw exception;
  }
}
