import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthGuard } from './common/guards/auth.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GlobalHttpFilter } from './common/filters/global-http.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // 全局守卫：所有路由先过认证（@Public() 除外）
  app.useGlobalGuards(new AuthGuard());

  // 全局拦截器：注意注册顺序 —— LoggingInterceptor 是最外层，TransformInterceptor 在内层
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // 全局管道：DTO 自动校验 + 类型转换 + 剔除多余字段
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剔除 DTO 中未声明的属性
      forbidNonWhitelisted: true, // 出现未声明属性直接报错
      transform: true, // 按 DTO 类型自动转换（如 query 字符串转 number）
    }),
  );

  // 全局异常过滤器：最后兜底
  app.useGlobalFilters(new GlobalHttpFilter());

  app.enableCors();

  const port = 3000;
  await app.listen(port);
  console.log(`Application is running on http://localhost:${port}`);
}

void bootstrap();
