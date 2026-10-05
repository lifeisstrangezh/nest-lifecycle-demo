import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { log } from '../flow-logger';

/**
 * 路由级管道（在 create 路由上 @UsePipes 注册），只对该路由生效。
 * 演示一个真实小功能：对 body.title 做 trim，避免标题全是空格。
 */
@Injectable()
export class RouteLevelPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type === 'body' && value !== null && typeof value === 'object') {
      const body = value as Record<string, unknown>;
      if (typeof body.title === 'string') {
        body.title = body.title.trim();
        log('4-Pipe', 'Route', 'RouteLevelPipe 对 body.title 执行 trim()');
        return body;
      }
    }
    log('4-Pipe', 'Route', `RouteLevelPipe 处理参数 type=${metadata.type}，原样返回`);
    return value;
  }
}
