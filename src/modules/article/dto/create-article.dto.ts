import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * 创建文章入参，全局 ValidationPipe 会依据这些装饰器自动校验。
 */
export class CreateArticleDto {
  @IsString({ message: 'title 必须是字符串' })
  @MinLength(2, { message: 'title 至少 2 个字符' })
  @MaxLength(50, { message: 'title 最多 50 个字符' })
  title!: string;

  @IsString({ message: 'content 必须是字符串' })
  @IsNotEmpty({ message: 'content 不能为空' })
  content!: string;

  @IsOptional()
  @IsArray({ message: 'tags 必须是数组' })
  @IsString({ each: true, message: 'tags 每一项都必须是字符串' })
  tags?: string[];
}
