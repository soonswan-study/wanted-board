import { DataSource } from 'typeorm';
import { Post } from '../entities/post.entity';
import { Comment } from '../entities/comment.entity';
import { KeywordAlert } from '../entities/keyword-alert.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Post, Comment, KeywordAlert],
  synchronize: false,
});

async function seed() {
  await AppDataSource.initialize();

  // NOTE(swan): 키워드 알림 등록.
  const keyword1 = AppDataSource.manager.create(KeywordAlert, {
    authorName: '원티드',
    keyword: '채용지원',
  });
  const keyword2 = AppDataSource.manager.create(KeywordAlert, {
    authorName: '김수환',
    keyword: '최종합격',
  });
  await AppDataSource.manager.save([keyword1, keyword2]);

  console.log('예시 데이터가 성공적으로 삽입되었습니다.');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('데이터 삽입 중 오류 발생:', err);
  process.exit(1);
});
