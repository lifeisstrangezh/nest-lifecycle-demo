import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { log } from '../flow-logger';
import { BusinessException } from '../exceptions/business.exception';

/**
 * 路由级异常过滤器（在 demo/route-error 路由上 @UseFilters 注册），
 * 是离异常最近的一层，优先捕获。
 */
@Catch(BusinessException)
export class RouteExceptionFilter implements ExceptionFilter {
  catch(exception: BusinessException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    log(
      '8-Filter',
      'Route',
      `RouteExceptionFilter 就近捕获业务异常 code=${exception.bizCode} message=${exception.message}`,
    );

    res.status(exception.getStatus()).json({
      code: exception.bizCode,
      message: `[路由过滤器已处理] ${exception.message}`,
      data: null,
      handledBy: 'RouteExceptionFilter',
    });
  }
}
