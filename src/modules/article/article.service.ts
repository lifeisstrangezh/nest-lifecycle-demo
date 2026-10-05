import { Injectable, NotFoundException } from '@nestjs/common';
import { log } from '../../common/flow-logger';
import type { AuthedUser } from '../../common/types';
import type { Article } from './article.entity';
import type { CreateArticleDto } from './dto/create-article.dto';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 文章服务：内存数据模拟数据库。
 * 业务异常（如文章不存在）在这一层抛出，会沿调用链向上，
 * 最终由异常过滤器处理。
 */
@Injectable()
export class ArticleService {
  private readonly articles: Article[] = [
    {
      id: 1,
      title: 'NestJS 生命周期详解',
      content: '中间件 -> 守卫 -> 拦截器 -> 管道 -> 控制器 -> 服务',
      tags: ['nestjs', 'backend'],
      author: 'admin',
      createdAt: new Date(),
    },
  ];

  private seq = 1;

  findAll(page: number, pageSize: number) {
    log('6-Service', '-', `ArticleService.findAll page=${page} pageSize=${pageSize}`);
    const start = (page - 1) * pageSize;
    return {
      list: this.articles.slice(start, start + pageSize),
      total: this.articles.length,
      page,
      pageSize,
    };
  }

  findOne(id: number): Article {
    log('6-Service', '-', `ArticleService.findOne id=${id}`);
    const article = this.articles.find((item) => item.id === id);
    if (!article) {
      throw new NotFoundException(`文章不存在，id=${id}`);
    }
    return article;
  }

  create(dto: CreateArticleDto, user: AuthedUser): Article {
    log('6-Service', '-', `ArticleService.create title=${dto.title} author=${user.username}`);
    const article: Article = {
      id: ++this.seq,
      title: dto.title,
      content: dto.content,
      tags: dto.tags ?? [],
      author: user.username,
      createdAt: new Date(),
    };
    this.articles.push(article);
    return article;
  }

  /** 模拟慢接口：4 秒后才返回，用于演示 3 秒超时拦截器 */
  async slowQuery() {
    log('6-Service', '-', 'ArticleService.slowQuery 开始，预计 4s 后返回');
    await sleep(4000);
    return { note: '正常情况下你看不到我，因为会被 TimeoutInterceptor 在 3s 时中断' };
  }
}
