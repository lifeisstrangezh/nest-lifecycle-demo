import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ThrottleGuard } from '../../common/guards/throttle.guard';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { TimeoutInterceptor } from '../../common/interceptors/timeout.interceptor';
import { ControllerLevelPipe } from '../../common/pipes/controller-level.pipe';
import { PositiveIntPipe } from '../../common/pipes/positive-int.pipe';
import { RouteLevelPipe } from '../../common/pipes/route-level.pipe';
import { ControllerExceptionFilter } from '../../common/filters/controller-exception.filter';
import { RouteExceptionFilter } from '../../common/filters/route-exception.filter';
import { BusinessException } from '../../common/exceptions/business.exception';
import { log } from '../../common/flow-logger';
import type { AppRequest } from '../../common/types';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';

/**
 * 文章控制器 —— 生命周期各组件的"挂载样板间"：
 *   类上：控制器级守卫 / 拦截器 / 管道 / 过滤器
 *   方法上：路由级守卫 / 拦截器 / 管道 / 过滤器
 *   参数上：参数级管道（ParseIntPipe、PositiveIntPipe）
 */
@Controller('articles')
@UseGuards(RolesGuard) // 控制器级守卫
@UseInterceptors(AuditInterceptor) // 控制器级拦截器
@UsePipes(ControllerLevelPipe) // 控制器级管道
@UseFilters(ControllerExceptionFilter) // 控制器级过滤器
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // ========== 以下为静态路由，必须定义在 @Get(':id') 之前 ==========

  /** 路由级过滤器演示：异常被最近的 RouteExceptionFilter 吃掉 */
  @Get('demo/route-error')
  @Public()
  @UseFilters(RouteExceptionFilter)
  routeError(): void {
    log('5-Controller', 'Route', '执行 routeError()，即将抛出 BusinessException');
    throw new BusinessException(20001, '模拟业务异常：标题包含敏感词');
  }

  /** 控制器级过滤器演示：RouteExceptionFilter 不在场，由控制器过滤器处理 */
  @Get('demo/controller-error')
  @Public()
  controllerError(): void {
    log('5-Controller', 'Route', '执行 controllerError()，即将抛出 BusinessException');
    throw new BusinessException(30001, '模拟业务异常：文章已发布，不允许修改');
  }

  /** 路由级拦截器演示：服务耗时 4s，超时拦截器 3s 中断，异常最终到全局过滤器 */
  @Get('slow')
  @Public()
  @UseInterceptors(new TimeoutInterceptor(3000))
  slow() {
    log('5-Controller', 'Route', '执行 slow()，服务将耗时 4 秒');
    return this.articleService.slowQuery();
  }

  // ========== 常规 CRUD ==========

  /** 文章分页列表（公开）；演示参数级管道 DefaultValuePipe + ParseIntPipe */
  @Get()
  @Public()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    log('5-Controller', 'Route', `执行 findAll() page=${page} pageSize=${pageSize}`);
    return this.articleService.findAll(page, pageSize);
  }

  /**
   * 创建文章：
   *   全局 AuthGuard 要求登录 -> 控制器 RolesGuard 要求 admin
   *   -> 路由 ThrottleGuard 限流 -> 全局 ValidationPipe 校验 DTO
   *   -> 路由 RouteLevelPipe trim 标题
   */
  @Post()
  @Roles('admin')
  @UseGuards(ThrottleGuard) // 路由级守卫
  @UsePipes(RouteLevelPipe) // 路由级管道
  create(@Body() dto: CreateArticleDto, @Req() req: AppRequest) {
    log('5-Controller', 'Route', `执行 create() title="${dto.title}"`);
    return this.articleService.create(dto, req.user!);
  }

  /** 文章详情（公开）；演示参数级管道 ParseIntPipe + PositiveIntPipe */
  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe, PositiveIntPipe) id: number) {
    log('5-Controller', 'Route', `执行 findOne() id=${id}`);
    return this.articleService.findOne(id);
  }
}
