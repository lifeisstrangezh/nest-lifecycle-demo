import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { log } from '../flow-logger';

/** 统一成功响应体 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 全局响应格式化拦截器（post 阶段工作）。
 * 把控制器返回的任意数据包成统一结构：{ code: 0, message: 'success', data }
 * 注意：异常响应不会经过 map，统一交给异常过滤器处理。
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    log('3-Interceptor-pre', 'Global', 'TransformInterceptor pre：占位（该拦截器主要在 post 工作）');

    return next.handle().pipe(
      map((data) => {
        log('7-Interceptor-post', 'Global', 'TransformInterceptor post：包装统一响应体 { code: 0, message: "success", data }');
        return { code: 0, message: 'success', data };
      }),
    );
  }
}
