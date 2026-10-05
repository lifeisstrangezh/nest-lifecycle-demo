import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 标记接口为公开接口，全局 AuthGuard 会跳过认证。
 * 用法：@Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
