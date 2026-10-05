import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { log } from '../flow-logger';
import type { AppRequest } from '../types';

/**
 * 全局日志中间件（在 AppModule 中通过 forRoutes('*') 注册）。
 * 典型用途：访问日志、请求计时、基础访问统计。
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    log('1-Middleware', 'Global', `LoggerMiddleware 收到请求 ${req.method} ${req.originalUrl}`);

    // res.finish 事件：响应真正发回客户端时触发，是一次请求的终点
    res.on('finish', () => {
      log('9-Response', 'Global', `响应已返回 status=${res.statusCode}，总耗时=${Date.now() - start}ms`);
    });

    next();
  }
}
