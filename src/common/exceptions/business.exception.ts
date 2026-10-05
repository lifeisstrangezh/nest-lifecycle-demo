import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 自定义业务异常。
 * 真实项目中常用于：参数语义校验失败、数据状态不合法等可预期错误，
 * 携带业务错误码 bizCode，便于前端按 code 做分支处理。
 */
export class BusinessException extends HttpException {
  constructor(
    public readonly bizCode: number,
    message: string,
    httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code: bizCode, message }, httpStatus);
  }
}
