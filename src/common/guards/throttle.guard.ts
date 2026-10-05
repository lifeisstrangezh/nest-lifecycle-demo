import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { log } from '../flow-logger';
import type { AppRequest } from '../types';

/**
 * 路由级限流守卫（在具体路由上 @UseGuards 注册）。
 * 内存版滑动窗口限流：60 秒内最多 5 次，超出返回 429。
 * 真实项目一般替换为 Redis 实现（如 @nestjs/throttler + Redis storage）。
 */
@Injectable()
export class ThrottleGuard implements CanActivate {
  private readonly limit = 5;
  private readonly windowMs = 60_000;
  private readonly hits = new Map<string, number[]>();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AppRequest>();
    const key = `${req.ip}-${req.method}-${req.path}`;
    const now = Date.now();

    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    recent.push(now);
    this.hits.set(key, recent);

    log('2-Guard', 'Route', `ThrottleGuard 限流检查 ${recent.length}/${this.limit}（${this.windowMs / 1000}s 窗口）`);

    if (recent.length > this.limit) {
      throw new HttpException('请求过于频繁，请稍后再试', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}
