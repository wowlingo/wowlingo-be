# 와우링고 백엔드 (NestJS + TypeScript)

## 🚀 기술 스택

- **Framework**: NestJS
- **Language**: TypeScript
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer

## 📁 프로젝트 구조

```
src/
├── app/                              # 애플리케이션 모듈들 (도메인별)
│   ├── user/                         # 사용자 관리
│   │   ├── dto/                      # 사용자 전용 DTO
│   │   ├── entities/                 # 사용자 도메인 엔티티
│   │   │   ├── user.entity.ts
│   │   │   └── user-course.entity.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   ├── course/                       # 코스 관리
│   │   ├── dto/                      # 코스 전용 DTO
│   │   ├── entities/                 # 코스 도메인 엔티티
│   │   │   └── course.entity.ts
│   │   ├── course.controller.ts
│   │   ├── course.service.ts
│   │   └── course.module.ts
│   └── quest/                        # 퀘스트 관리
│       ├── dto/                      # 퀘스트 전용 DTO
│       ├── entities/                 # 퀘스트 도메인 엔티티
│       │   ├── quest.entity.ts
│       │   ├── quest-item.entity.ts
│       │   └── quest-item-unit.entity.ts
│       ├── quest.controller.ts
│       ├── quest.service.ts
│       └── quest.module.ts
├── infra/                            # 인프라 계층
│   └── persistence/                  # 데이터 영속성
│       ├── orm.module.ts             # TypeORM 설정 모듈
│       └── data-source.ts            # DataSource 설정
├── common/                           # 공통 요소
│   ├── dto/
│   │   └── base-response.dto.ts      # 공통 응답 DTO
│   ├── exception/
│   │   └── web.exception.ts          # 커스텀 예외
│   ├── guards/                       # 인증/권한 가드
│   ├── interceptors/                 # 응답 변환 인터셉터
│   └── pipes/                        # 유효성 검사 파이프
├── shared/                           # 공유 유틸리티
│   ├── database/                     # DB 설정/마이그레이션
│   ├── config/                       # 환경 설정
│   └── utils/                        # 유틸리티 함수
├── app.module.ts                     # 루트 모듈
└── main.ts                           # 앱 부트스트랩
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정 (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=wowlingo
NODE_ENV=development
PORT=8080
```

### 3. MySQL 준비
```bash
# macOS (Homebrew)
brew install mysql
brew services start mysql

# 데이터베이스 생성
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS wowlingo;"
```

### 4. 개발 서버 실행
```bash
npm run start:dev
```

### 5. 프로덕션 빌드
```bash
npm run build
npm run start:prod
```

## 📚 API 문서

애플리케이션 실행 후 다음 URL에서 Swagger UI를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8080/swagger-ui.html

## 🔗 API 엔드포인트

글로벌 프리픽스는 `api` 입니다.

### 샘플
- **GET** `/api/sample/hello`
- **GET** `/api/sample/lms/api/v1/study/{studyId}/summary-info`

### 사용자 (User)
- **GET** `/api/users`
- **GET** `/api/users/{id}`
- **POST** `/api/users`
- **PUT** `/api/users/{id}`
- **DELETE** `/api/users/{id}`
- **POST** `/api/users/{id}/courses/{courseId}`
- **GET** `/api/users/{id}/courses`

### 코스 (Course)
- **GET** `/api/courses` (query: `type`)
- **GET** `/api/courses/{id}`
- **POST** `/api/courses`
- **PUT** `/api/courses/{id}`
- **DELETE** `/api/courses/{id}`

### 퀘스트 (Quest)
- **GET** `/api/quests` (query: `courseId`)
- **GET** `/api/quests/{id}`
- **POST** `/api/quests`
- **GET** `/api/quests/items` (query: `questId`)
- **GET** `/api/quests/items/{id}`
- **POST** `/api/quests/items`
- **GET** `/api/quests/units` (query: `questItemId`)
- **GET** `/api/quests/units/{id}`
- **POST** `/api/quests/units`

## 🔧 설정

### 환경 변수
- `PORT`: 서버 포트 (기본값: 8080)
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `NODE_ENV`: development/production

### CORS 설정
- 프론트엔드 URL: `http://localhost:18090`

## 📝 마이그레이션 내용

### Java Spring Boot → NestJS
- **Controller**: `@RestController` → `@Controller`
- **Service**: `@Service` → `@Injectable()`
- **DTO**: Lombok → TypeScript 인터페이스 + class-validator
- **Exception**: `WebException` → NestJS `HttpException`
- **Swagger**: SpringDoc → `@nestjs/swagger`

## 🚀 향후 개발 계획


## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.