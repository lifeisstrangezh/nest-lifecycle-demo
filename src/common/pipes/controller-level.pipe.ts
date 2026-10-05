import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { log } from '../flow-logger';

/**
 * 控制器级管道（在 ArticleController 类上 @UsePipes 注册），
 * 对该控制器下所有路由的所有参数生效。
 *
 * 这里用于"层级演示"：打印每个参数的类型后原样返回。
 * 真实项目中控制器级管道常做：该模块通用的入参规范化、权限相关的数据裁剪等。
 */
@Injectable()
export class ControllerLevelPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    log(
      '4-Pipe',
      'Controller',
      `ControllerLevelPipe 处理参数 type=${metadata.type} metatype=${metadata.metatype?.name ?? '-'}，原样返回`,
    );
    return value;
  }
}
