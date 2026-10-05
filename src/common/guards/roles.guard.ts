import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { log } from '../flow-logger';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AppRequest } from '../types';

/**
 * 控制器级角色守卫（在 ArticleController 类上 @UseGuards 注册）。
 * 读取路由上的 @Roles(...) 元数据，判断 req.user 是否拥有所需角色。
 * 未声明 @Roles 的路由默认放行（守卫仍会执行，可在日志中观察到）。
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly reflector = new Reflector();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AppRequest>();
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      log('2-Guard', 'Controller', 'RolesGuard 该路由未声明角色要求，放行');
      return true;
    }

    const userRoles = req.user?.roles ?? [];
    const passed = requiredRoles.some((role) => userRoles.includes(role));
    log(
      '2-Guard',
      'Controller',
      `RolesGuard 要求=[${requiredRoles.join(',')}] 实际=[${userRoles.join(',') || '-'}] => ${passed ? '通过' : '拒绝'}`,
    );

    if (!passed) {
      throw new ForbiddenException(`权限不足，需要角色：${requiredRoles.join(' 或 ')}`);
    }
    return true;
  }
}
