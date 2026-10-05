import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { log } from '../flow-logger';
import type { AppRequest } from '../types';

/**
 * 控制器级审计拦截器（在 ArticleController 类上 @UseInterceptors 注册）。
 * 模拟操作审计：记录"谁"在"什么时间"访问了文章模块。
 * 真实项目可在此写入审计日志库 / 上报监控系统。
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AppRequest>();
    const start = Date.now();
    const operator = req.user?.username ?? '匿名用户';

    log('3-Interceptor-pre', 'Controller', `AuditInterceptor pre：审计开始，操作人=${operator}`);

    return next.handle().pipe(
      tap({
        next: () => {
          log('7-Interceptor-post', 'Controller', `AuditInterceptor post：审计结束，耗时=${Date.now() - start}ms`);
        },
        error: () => {
          log('7-Interceptor-post', 'Controller', `AuditInterceptor post：审计到异常，耗时=${Date.now() - start}ms`);
        },
      }),
    );
  }
}
