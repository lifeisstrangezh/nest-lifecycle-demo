import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { log } from '../flow-logger';
import type { AppRequest } from '../types';

/**
 * 全局日志拦截器（main.ts 中 useGlobalInterceptors 第一个注册，处于最外层）。
 * pre 阶段记录请求进入，post 阶段记录返回/异常与总耗时。
 * 拦截器是"洋葱模型"：注册越早，pre 越早执行、post 越晚执行。
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AppRequest>();
    const start = Date.now();

    log('3-Interceptor-pre', 'Global', `LoggingInterceptor pre：${req.method} ${req.originalUrl}`);

    return next.handle().pipe(
      tap({
        next: () => {
          log('7-Interceptor-post', 'Global', `LoggingInterceptor post：正常返回，耗时=${Date.now() - start}ms`);
        },
        error: (err: Error) => {
          log(
            '7-Interceptor-post',
            'Global',
            `LoggingInterceptor post：异常流过 name=${err.name} message=${err.message}，耗时=${Date.now() - start}ms`,
          );
        },
      }),
    );
  }
}
