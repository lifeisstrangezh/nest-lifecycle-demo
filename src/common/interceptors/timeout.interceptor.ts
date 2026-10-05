import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, TimeoutError, catchError, throwError, timeout } from 'rxjs';
import { log } from '../flow-logger';

/**
 * 路由级超时拦截器（在具体路由上 @UseInterceptors(new TimeoutInterceptor(3000)) 注册）。
 * 下游在指定时间内没有返回，则中断流并抛出 RequestTimeoutException(408)。
 * 典型用途：调用第三方接口、慢查询保护。
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutMs = 3000) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    log('3-Interceptor-pre', 'Route', `TimeoutInterceptor pre：设置 ${this.timeoutMs}ms 超时保护`);

    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err: unknown) => {
        if (err instanceof TimeoutError) {
          log('7-Interceptor-post', 'Route', `TimeoutInterceptor post：请求超过 ${this.timeoutMs}ms，转为 408 异常`);
          return throwError(() => new RequestTimeoutException(`请求超过 ${this.timeoutMs}ms 未响应`));
        }
        return throwError(() => err);
      }),
    );
  }
}
