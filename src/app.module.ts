import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ArticleModule } from './modules/article/article.module';

/**
 * 根模块。
 * 全局中间件没有 useGlobalMiddleware 这种 API，
 * 惯例是在根模块的 configure() 中 forRoutes('*') 注册。
 */
@Module({
  imports: [ArticleModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
