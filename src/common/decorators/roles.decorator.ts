import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * 声明接口所需角色，配合控制器级 RolesGuard 使用。
 * 用法：@Roles('admin')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
