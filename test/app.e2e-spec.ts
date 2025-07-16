import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

type PostResponse = {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  password?: string;
};

type PostListResponse = {
  data: PostResponse[];
  total: number;
  page: number;
  limit: number;
};

type CommentResponse = {
  id: number;
  postId: number;
  parentId: number | null;
  content: string;
  authorName: string;
  createdAt: string;
};

type CommentListResponse = {
  data: CommentResponse[];
  total: number;
  page: number;
  limit: number;
};

describe('Board API (e2e)', () => {
  let app: INestApplication;
  let postId: number;
  const postPassword = 'test1234';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // NOTE(swan): 게시글을 생성하고 응답 필드와 값의 유효성을 확인.
  it('게시글 생성', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .send({
        title: '테스트 제목',
        content: '테스트 내용',
        authorName: 'swan',
        password: postPassword,
      })
      .expect(201);

    const body = res.body as PostResponse;
    postId = body.id;
    expect(body.title).toBe('테스트 제목');
    expect(body.content).toBe('테스트 내용');
    expect(body.authorName).toBe('swan');
    expect(typeof body.createdAt).toBe('string');
    expect(typeof body.updatedAt).toBe('string');
    expect(new Date(body.createdAt).toString()).not.toBe('Invalid Date');
    expect(new Date(body.updatedAt).toString()).not.toBe('Invalid Date');
    expect(body.password).toBeUndefined();
  });

  // NOTE(swan): 특정 게시글을 조회하고 비밀번호가 응답에 없는지 확인.
  it('게시글 상세 조회', async () => {
    const res = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .expect(200);

    const body = res.body as PostResponse;
    expect(body.id).toBe(postId);
    expect(body.password).toBeUndefined();
  });

  // NOTE(swan): 게시글에 댓글을 생성하고 내용이 올바른지 확인.
  it('댓글 생성', async () => {
    const res = await request(app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .send({
        content: '댓글 내용',
        authorName: 'swan',
      })
      .expect(201);

    const body = res.body as CommentResponse;
    expect(body.content).toBe('댓글 내용');
  });

  // NOTE(swan): 댓글 목록을 정렬 옵션과 함께 조회 (정렬 기능 테스트).
  it('댓글 목록 조회 (정렬 기능 테스트)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/posts/${postId}/comments?orderBy=createdAt&sortDir=desc`)
      .expect(200);

    const body = res.body as CommentListResponse;
    expect(Array.isArray(body.data)).toBe(true);
  });

  // NOTE(swan): 비밀번호를 검증하여 게시글을 삭제하고, 삭제 후 조회 시 404 반환 확인.
  it('게시글 삭제 (비밀번호 검증)', async () => {
    await request(app.getHttpServer())
      .delete(`/posts/${postId}`)
      .send({ password: postPassword })
      .expect(200);

    await request(app.getHttpServer()).get(`/posts/${postId}`).expect(404);
  });

  // NOTE(swan): 존재하지 않는 ID, 삭제된 게시글 조회 시 404 반환 검증.
  it('게시글 상세 조회 (존재하지 않는 ID/삭제된 게시글)', async () => {
    // 존재하지 않는 ID
    await request(app.getHttpServer()).get('/posts/999999').expect(404);

    // 게시글 삭제 후 조회
    const res = await request(app.getHttpServer())
      .post('/posts')
      .send({
        title: '삭제 테스트',
        content: '삭제될 게시글',
        authorName: 'swan',
        password: 'test1234',
      })
      .expect(201);
    const delId = (res.body as PostResponse).id;
    await request(app.getHttpServer())
      .delete(`/posts/${delId}`)
      .send({ password: 'test1234' })
      .expect(200);
    await request(app.getHttpServer()).get(`/posts/${delId}`).expect(404);
  });

  // NOTE(swan): 잘못된 비밀번호 시 에러, 삭제 후 목록/상세 조회 시 미노출 검증.
  it('게시글 삭제 (비밀번호 오류/삭제 후 미노출)', async () => {
    // 게시글 생성
    const res = await request(app.getHttpServer())
      .post('/posts')
      .send({
        title: '삭제 검증',
        content: '삭제용',
        authorName: 'swan',
        password: 'test1234',
      })
      .expect(201);
    const delId = (res.body as PostResponse).id;

    // 잘못된 비밀번호로 삭제 시도
    await request(app.getHttpServer())
      .delete(`/posts/${delId}`)
      .send({ password: 'wrongpw' })
      .expect(401);

    // 정상 삭제
    await request(app.getHttpServer())
      .delete(`/posts/${delId}`)
      .send({ password: 'test1234' })
      .expect(200);

    // 삭제 후 상세 조회/목록 조회 시 미노출
    await request(app.getHttpServer()).get(`/posts/${delId}`).expect(404);
    const listRes = await request(app.getHttpServer())
      .get('/posts')
      .expect(200);
    expect(
      (listRes.body as PostListResponse).data.some(
        (p: PostResponse) => p.id === delId,
      ),
    ).toBe(false);
  });
});
