import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { log } from '../flow-logger';

/**
 * 参数级管道（在参数装饰器上使用）：
 *   @Param('id', ParseIntPipe, PositiveIntPipe)
 * 参数级管道在全局 -> 控制器 -> 路由级管道之后最后执行。
 *
 * 功能：校验 id 为正整数（ParseIntPipe 负责"能不能转成数字"，
 * 它负责"数字语义是否合法"）。
 */
@Injectable()
export class PositiveIntPipe implements PipeTransform<string | number, number> {
  transform(value: string | number): number {
    const num = Number(value);
    log('4-Pipe', 'Param', `PositiveIntPipe 校验 id="${value}" 是否为正整数`);

    if (!Number.isInteger(num) || num <= 0) {
      throw new BadRequestException(`参数 id 必须是正整数，收到：${value}`);
    }
    return num;
  }
}
