# 와우링고 백엔드 (NestJS + TypeScript)

## 🚀 기술 스택

- **Framework**: NestJS
- **Language**: TypeScript
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer

## 📁 프로젝트 구조

```
src/
├── common/
│   ├── dto/
│   │   └── base-response.dto.ts    # 공통 응답 DTO
│   └── exception/
│       └── web.exception.ts        # 커스텀 예외
├── controllers/
│   └── sample.controller.ts        # API 컨트롤러
├── dto/
│   └── study-summary-info.dto.ts   # 학습 요약 정보 DTO
├── process/
│   └── sample.process.ts           # 비즈니스 로직 처리
├── services/
│   └── sample.service.ts           # 서비스 레이어
├── app.module.ts                   # 애플리케이션 모듈
└── main.ts                         # 애플리케이션 진입점
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run start:dev
```

### 3. 프로덕션 빌드
```bash
npm run build
npm run start:prod
```

## 📚 API 문서

애플리케이션 실행 후 다음 URL에서 Swagger UI를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8080/swagger-ui.html

## 🔗 API 엔드포인트

### 기본 API
- **GET** `/api/v1/sample/hello` - 샘플 조회
  - Query: `name` (optional, default: "World")

### 학습 관련 API
- **GET** `/api/v1/sample/lms/api/v1/study/{studyId}/summary-info` - 간략 학습 조회
  - Path: `studyId` (number) - 학습 ID

## 🔧 설정

### 환경 변수
- `PORT`: 서버 포트 (기본값: 8080)

### CORS 설정
- 프론트엔드 URL: `http://localhost:18090`

## 📝 마이그레이션 내용

### Java Spring Boot → NestJS
- **Controller**: `@RestController` → `@Controller`
- **Service**: `@Service` → `@Injectable()`
- **DTO**: Lombok → TypeScript 인터페이스 + class-validator
- **Exception**: `WebException` → NestJS `HttpException`
- **Swagger**: SpringDoc → `@nestjs/swagger`

### 주요 변경사항
1. **타입 안정성**: Java의 강타입 → TypeScript의 타입 시스템
2. **의존성 주입**: Spring DI → NestJS DI
3. **API 문서화**: SpringDoc → NestJS Swagger
4. **검증**: Bean Validation → class-validator

## 🚀 향후 개발 계획

- [ ] 데이터베이스 연동 (TypeORM/Prisma)
- [ ] JWT 인증 구현
- [ ] 로깅 시스템 구축
- [ ] 테스트 코드 작성
- [ ] Docker 컨테이너화

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.