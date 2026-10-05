import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { log } from '../flow-logger';
import type { AppRequest } from '../types';

/**
 * 模块级中间件（在 ArticleModule 中通过 forRoutes('articles') 注册），
 * 只作用于文章模块路由。
 * 典型用途：为每个请求生成 requestId，写入响应头，便于全链路排障。
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: AppRequest, res: Response, next: NextFunction): void {
    req.requestId = randomUUID();
    res.setHeader('x-request-id', req.requestId);
    log('1-Middleware', 'Module', `RequestIdMiddleware 注入 requestId=${req.requestId}`);
    next();
  }
}
