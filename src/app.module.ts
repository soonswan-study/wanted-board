import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { KeywordAlert } from './entities/keyword-alert.entity';
import { PostController } from './controllers/post.controller';
import { CommentController } from './controllers/comment.controller';
import { PostService } from './services/post.service';
import { CommentService } from './services/comment.service';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        if (configService.get('NODE_ENV') === 'test') {
          // NOTE(swan): 테스트 환경에서는 인메모리 SQLite 사용.
          return {
            type: 'sqlite',
            database: ':memory:',
            entities: [Post, Comment, KeywordAlert],
            synchronize: true,
            dropSchema: true, // 테스트마다 스키마 초기화
          };
        }
        // NOTE(swan): 개발/운영 환경에서는 MySQL 사용.
        return {
          type: 'mysql',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [Post, Comment, KeywordAlert],
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Post, Comment, KeywordAlert]),
  ],
  controllers: [PostController, CommentController],
  providers: [AppService, PostService, CommentService, NotificationService],
})
export class AppModule {}
