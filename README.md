<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Wanted Board - 게시판 및 키워드 알림 시스템

NestJS로 구현된 게시판과 키워드 알림 기능을 제공하는 API 서버입니다.

## 주요 기능

- **게시판**: 게시글 작성, 수정, 삭제(soft delete, 복구 가능), 검색, 페이징, 정렬 옵션 지원
- **댓글**: 댓글 작성, 대댓글 지원, 삭제(soft delete, 복구 가능), 페이징, 정렬 옵션 지원
  - ※ soft delete는 데이터의 안전한 보존과 관리(복구, 감사, 추적 등)를 위해 실제 삭제 대신 deletedAt만 기록합니다.
- **키워드 알림**: 등록된 키워드가 포함된 게시글이나 댓글 등록 시 알림
- **API 문서화**: Swagger를 통한 인터랙티브 API 문서 및 테스트 환경
  - Swagger UI: `http://localhost:3000/docs`
- **e2e 테스트**: 인메모리 DB 기반의 안전한 통합 테스트 지원

## 기술 스택

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MySQL (Docker)
- **ORM**: TypeORM
- **Test**: Jest, Supertest, sqlite3 (인메모리 테스트 DB)
- **Container**: Docker & Docker Compose

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

> **참고**: Node.js 18 이상이 필요합니다. `node --version`으로 버전을 확인하고, 필요시 업데이트하세요.

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=wanted
DB_PASSWORD=1234
DB_DATABASE=wanted_board
PORT=3000
NODE_ENV=development
```

### 3. MySQL 컨테이너 시작

1. Docker가 설치되어 있지 않다면 [공식 Docker 설치 가이드](https://docs.docker.com/get-started/get-docker/)를 따라 설치하세요.
2. Docker 설치 후 다음 명령어로 MySQL 컨테이너를 실행합니다:
```bash
docker-compose up -d mysql
```

### 4. 애플리케이션 실행

```bash
npm run start:dev
```

### 5. 예시 데이터 삽입 (선택)

> 예시 데이터는 아래 **등록된 키워드** 목록을 참고하세요.

```bash
npm run seed:example
```

## 테스트 환경 및 실행 방법

- e2e 테스트는 실제 MySQL이 아닌 **인메모리 SQLite** 데이터베이스에서 실행됩니다.
- 테스트 실행 시 데이터는 실제 DB에 저장되지 않고, 테스트가 끝나면 모두 사라집니다.
- 테스트 환경은 `NODE_ENV=test`로 자동 분기되며, 관련 설정은 `src/app.module.ts`에서 확인할 수 있습니다.
- 인메모리 DB 사용을 위해 `sqlite3` 패키지를 추가했습니다.

### e2e 테스트 실행

1. **e2e 테스트 실행**
   ```bash
   npm run test:e2e
   ```

### Push 시 자동 검증

- **Husky pre-push hook**: push 시 자동으로 ESLint와 E2E 테스트가 실행됩니다.
- **조건부 실행**: `src/` 폴더에 변경된 `.js` 또는 `.ts` 파일이 있을 때만 검증이 실행됩니다.
- **실패 시 차단**: ESLint 오류나 E2E 테스트 실패 시 push가 자동으로 차단됩니다.

> 테스트는 인메모리 DB에서 실행되므로, 실제 데이터베이스나 운영 데이터에는 영향이 없습니다.

## API 엔드포인트

### 게시글 API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts` | 게시글 작성 |
| GET | `/api/posts` | 게시글 목록 (페이징, 검색, **정렬**) |
| GET | `/api/posts/:id` | 게시글 상세 조회 |
| PUT | `/api/posts/:id` | 게시글 수정 |
| DELETE | `/api/posts/:id` | 게시글 삭제(soft delete) |

### 댓글 API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts/:postId/comments` | 댓글 작성 |
| GET | `/api/posts/:postId/comments` | 댓글 목록 (페이징, **정렬**) |
| GET | `/api/posts/:postId/comments/:id` | 댓글 상세 조회 |

## 키워드 알림 기능

등록된 키워드가 포함된 게시글이나 댓글이 등록될 때 콘솔에 알림이 출력됩니다.

**등록된 키워드:**
- 원티드: "채용지원"
- 김수환: "최종합격"

**알림 예시:**
```
알림 전송: 원티드님이 등록하신 키워드 "채용지원" 포함된 내용이 등록되었습니다.
내용: 채용지원에 대해 궁금한 점이 있습니다...

알림 전송: 김수환님이 등록하신 키워드 "최종합격" 포함된 내용이 등록되었습니다.
내용: 드디어 최종합격 소식을 받았습니다!
```

## 검색 및 정렬 파라미터 안내

- **게시글 검색 가능 필드**: `title`, `authorName`
- **댓글 검색 가능 필드**: `content`, `authorName`
- **orderBy**: 정렬 기준 필드 (`createdAt`, `updatedAt` 등)
- **sortDir**: 정렬 방향 (`asc`, `desc`)
- 기본값: 최신순(`orderBy=createdAt&sortDir=desc`)
- soft delete된 데이터(삭제된 글/댓글)는 기본적으로 목록/상세 조회에서 제외됨

## 범위 검색(Range Search) 지원

- 날짜/숫자 등 필드에 대해 from/to(이상/미만) 패턴의 범위 검색이 가능합니다.
- 예를 들어, `createdAtFrom`(이상, GTE), `createdAtTo`(미만, LT) 쿼리 파라미터를 사용하면 아래와 같이 동작합니다:

### 예시

```
GET /comments?createdAtFrom=2024-07-01T00:00:00Z&createdAtTo=2024-08-01T00:00:00Z
```
- 위 요청은 2024-07-01 이상, 2024-08-01 미만의 댓글만 조회합니다.

- DTO에서 아래와 같이 선언되어 있으면 자동으로 쿼리 조건이 생성됩니다:

```typescript
@Searchable({ op: Operator.GTE, field: 'createdAt' })
createdAtFrom?: string;

@Searchable({ op: Operator.LT, field: 'createdAt' })
createdAtTo?: string;
```

- from/to 네이밍은 날짜, 숫자 등 다양한 필드에 적용할 수 있습니다.
- BETWEEN 대신 GTE/LT(이상/미만) 조합이 실무에서 가장 안전하게 쓰입니다.

## 개발/빌드

### 빌드

```bash
npm run build
```

## Docker 관리

### MySQL 컨테이너 관리

```bash
# MySQL 시작
docker-compose up -d mysql

# MySQL 중지
docker-compose down

```

### 데이터베이스 초기화

```bash
# 컨테이너와 볼륨 모두 삭제 (데이터 초기화)
docker-compose down -v

# 다시 시작
docker-compose up -d mysql
```

## 문제 해결

### Node.js 버전 문제

```bash
# Node.js 버전 확인
node --version

# Node.js 18 이상 설치 (macOS)
brew install node@18
nvm use 18 
```

### Docker 관련

```bash
# Docker Desktop 실행 확인
docker --version

# Docker Desktop 실행
open -a Docker
```

### MySQL 컨테이너

```bash
# 컨테이너 상태 확인
docker-compose ps

# 컨테이너 재시작
docker-compose restart mysql
```

### 포트 충돌

```bash
# 기존 프로세스 종료
pkill -f "npm run start:dev"
```

## 프로젝트 구조

```
wanted-board/
├── src/
│   ├── controllers/     # API 컨트롤러
│   ├── services/        # 비즈니스 로직
│   ├── entities/        # 데이터베이스 엔티티
│   ├── dto/            # 데이터 전송 객체
│   └── main.ts         # 애플리케이션 진입점
├── docker-compose.yml  # Docker Compose 설정
└── README.md          # 프로젝트 문서
```
