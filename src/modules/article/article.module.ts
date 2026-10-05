import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestIdMiddleware } from '../../common/middleware/request-id.middleware';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

/**
 * 文章功能模块。
 * 在这里注册模块级中间件 RequestIdMiddleware，仅作用于 articles 路由。
 */
@Module({
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('articles');
  }
}
