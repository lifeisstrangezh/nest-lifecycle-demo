import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { log } from '../flow-logger';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AppRequest, AuthedUser } from '../types';

/**
 * 全局认证守卫（main.ts 中 useGlobalGuards 注册）。
 * 模拟 JWT 认证流程：
 *   - @Public() 接口直接放行
 *   - 读取 Authorization: Bearer <token>
 *   - 校验通过后把用户信息挂到 req.user
 *
 * 约定两个测试 token：
 *   admin-token -> 管理员；user-token -> 普通用户
 */
@Injectable()
export class AuthGuard implements CanActivate {
  // 直接 new Reflector()，因此该守卫不依赖 DI 容器也能工作
  private readonly reflector = new Reflector();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AppRequest>();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      log('2-Guard', 'Global', `AuthGuard 命中 @Public()，放行 ${req.method} ${req.path}`);
      return true;
    }

    const authHeader = req.headers.authorization ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const user = this.mockVerifyToken(token);

    if (!user) {
      log('2-Guard', 'Global', 'AuthGuard 认证失败，抛出 401 Unauthorized');
      throw new UnauthorizedException('未登录或登录已过期，请在请求头携带 Bearer Token');
    }

    req.user = user;
    log('2-Guard', 'Global', `AuthGuard 认证通过 user=${user.username} roles=[${user.roles.join(',')}]`);
    return true;
  }

  /** 模拟 JWT 校验，真实项目应解析并验证签名 */
  private mockVerifyToken(token: string): AuthedUser | null {
    if (token === 'admin-token') return { id: 1, username: 'admin', roles: ['admin'] };
    if (token === 'user-token') return { id: 2, username: 'reader', roles: ['user'] };
    return null;
  }
}
