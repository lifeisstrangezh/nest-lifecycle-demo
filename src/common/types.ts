import type { Request } from 'express';

/** 登录用户信息（AuthGuard 认证后挂到 req.user） */
export interface AuthedUser {
  id: number;
  username: string;
  roles: string[];
}

/** 扩展 Express Request，携带业务字段 */
export interface AppRequest extends Request {
  user?: AuthedUser;
  requestId?: string;
}
