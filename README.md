# 와우링고 백엔드 (WowLingo Backend)

NestJS 기반의 언어 학습 애플리케이션 백엔드 서버

## 기술 스택

- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **ORM**: TypeORM
- **Database**: MySQL
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer
- **Authentication**: Passport JWT
- **File Upload**: Multer

## 프로젝트 구조

```
src/
├── app/                              # 도메인 모듈
│   ├── user/                         # 사용자 관리
│   │   ├── dto/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   ├── user-quest-attempt.entity.ts
│   │   │   └── ai-feedback.entity.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   ├── quest/                        # 퀘스트 관리
│   │   ├── dto/
│   │   ├── entities/
│   │   │   ├── quest.entity.ts
│   │   │   ├── quest-item.entity.ts
│   │   │   └── quest-item-unit.entity.ts
│   │   ├── quest.controller.ts
│   │   ├── quest-admin.controller.ts
│   │   ├── quest.service.ts
│   │   └── quest.module.ts
│   ├── user-quest/                   # 사용자 퀘스트 진행
│   │   ├── dto/
│   │   ├── entities/
│   │   │   ├── user-quest.entity.ts
│   │   │   ├── user-quest-item.entity.ts
│   │   │   └── user-quest-progress.entity.ts
│   │   ├── user-quest.controller.ts
│   │   ├── user-quest.service.ts
│   │   └── user-quest.module.ts
│   ├── vocabulary/                   # 단어장
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── vocabulary.entity.ts
│   │   ├── vocabulary.controller.ts
│   │   ├── vocabulary.service.ts
│   │   └── vocabulary.module.ts
│   └── hashtag/                      # 해시태그
│       ├── dto/
│       ├── entities/
│       │   ├── hashtag.entity.ts
│       │   ├── quest-hashtag.entity.ts
│       │   ├── quest-item-unit-hashtag.entity.ts
│       │   └── vocab-hashtag.entity.ts
│       ├── hashtag.controller.ts
│       ├── hashtag-admin.controller.ts
│       ├── hashtag.service.ts
│       └── hashtag.module.ts
├── common/                           # 공통 요소
│   ├── dto/
│   │   └── base-response.dto.ts
│   ├── exception/
│   │   └── web.exception.ts
│   ├── pipes/
│   │   └── parse-date.pipe.ts
│   └── upload/                       # 파일 업로드
│       ├── upload.controller.ts
│       ├── upload.service.ts
│       └── upload.module.ts
├── infra/                            # 인프라 계층
│   └── persistence/
│       ├── orm.module.ts
│       └── data-source.ts
├── app.module.ts
└── main.ts
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 설정합니다:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=wowlingo
NODE_ENV=development
PORT=8080
```

환경별 설정 파일:
- `.env` - 기본 설정
- `.env.development` - 개발 환경
- `.env.production` - 운영 환경

### 3. 데이터베이스 준비

```bash
# MySQL 데이터베이스 생성
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

### 6. 테스트 실행

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## API 문서

서버 실행 후 Swagger UI에서 API 명세를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8080/swagger-ui.html

## API 엔드포인트

글로벌 프리픽스: `/api`

### Users (사용자)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | 사용자 생성 |
| POST | `/api/users/login` | 닉네임으로 로그인 |
| GET | `/api/users/:id/quest-attempts` | 사용자 학습 기록 조회 (year, month) |
| GET | `/api/users/:id/quest-attempts/this-week` | 이번 주 학습 현황 |
| GET | `/api/users/:id/quest-attempts/ai-feedback` | AI 피드백 조회 |
| GET | `/api/users/:id/quest-attempts/ai-feedbacks` | AI 피드백 목록 조회 (year, month) |

### Quests (퀘스트)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quests` | 모든 퀘스트 조회 |
| GET | `/api/quests/:id` | 특정 퀘스트 조회 |
| POST | `/api/quests` | 퀘스트 생성 |
| PUT | `/api/quests/:id` | 퀘스트 수정 |
| DELETE | `/api/quests/:id` | 퀘스트 삭제 |
| GET | `/api/quests/items` | 퀘스트 아이템 목록 (questId 필터) |
| GET | `/api/quests/items/:id` | 특정 퀘스트 아이템 조회 |
| POST | `/api/quests/items` | 퀘스트 아이템 생성 |
| GET | `/api/quests/units` | 퀘스트 아이템 유닛 목록 |
| GET | `/api/quests/units/:id` | 특정 유닛 조회 |
| POST | `/api/quests/units` | 유닛 생성 |

### User Quests (사용자 퀘스트 진행)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user-quests/:userId` | 사용자 퀘스트 상태 목록 (홈 화면) |
| POST | `/api/user-quests/:userId/:questId/submit` | 퀘스트 결과 제출 |
| GET | `/api/user-quests/review-notes/hashtags` | 오답노트 해시태그 조회 |
| GET | `/api/user-quests/review-notes` | 오답노트 조회 (date, hashtags) |

### Vocabulary (단어장)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vocabulary` | 단어장 목록 (hashtags, sort 필터) |
| GET | `/api/vocabulary/hashtags` | 사용자 단어장 해시태그 |
| POST | `/api/vocabulary` | 단어장 등록 |
| DELETE | `/api/vocabulary/:id` | 단어장 삭제 |

### Hashtags (해시태그)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hashtags` | 모든 해시태그 조회 |

### Upload (파일 업로드)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/audio` | 오디오 파일 업로드 (mp3, wav, ogg, webm) |

### Admin API

#### Admin Quests (`/api/admin/quest`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/quest` | 모든 퀘스트 조회 |
| GET | `/api/admin/quest/:id` | 특정 퀘스트 조회 |
| POST | `/api/admin/quest` | 퀘스트 생성 (해시태그 포함) |
| PUT | `/api/admin/quest/:id` | 퀘스트 수정 (해시태그 포함) |
| DELETE | `/api/admin/quest/:id` | 퀘스트 삭제 |
| GET | `/api/admin/quest/items` | 퀘스트 아이템 목록 |
| GET | `/api/admin/quest/items/:id` | 특정 아이템 조회 |
| POST | `/api/admin/quest/items` | 아이템 생성 |
| PUT | `/api/admin/quest/items/:id` | 아이템 수정 |
| DELETE | `/api/admin/quest/items/:id` | 아이템 삭제 |
| GET | `/api/admin/quest/units` | 유닛 목록 |
| GET | `/api/admin/quest/units/:id` | 특정 유닛 조회 |
| POST | `/api/admin/quest/units` | 유닛 생성 (해시태그 포함) |
| PUT | `/api/admin/quest/units/:id` | 유닛 수정 (해시태그 포함) |
| DELETE | `/api/admin/quest/units/:id` | 유닛 삭제 |
| GET | `/api/admin/quest/units/:id/quests` | 유닛이 사용된 퀘스트 목록 |

#### Admin Hashtags (`/api/admin/hashtag`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/hashtag` | 해시태그 생성 |

## 설정

### 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `PORT` | 서버 포트 | 8080 |
| `NODE_ENV` | 환경 (development/production) | - |
| `DB_HOST` | 데이터베이스 호스트 | - |
| `DB_PORT` | 데이터베이스 포트 | 3306 |
| `DB_USERNAME` | 데이터베이스 사용자명 | - |
| `DB_PASSWORD` | 데이터베이스 비밀번호 | - |
| `DB_DATABASE` | 데이터베이스 이름 | - |

### CORS 설정

허용된 Origins:
- `http://localhost:5173`
- `http://localhost:18090`
- `http://localhost:3000`
- `https://wowlingo-client*.vercel.app`

### 정적 파일 서빙

- `/sounds` - 오디오 파일 (sounds 디렉토리)

## 스크립트

```bash
npm run build          # 프로덕션 빌드
npm run start          # 서버 시작
npm run start:dev      # 개발 서버 (watch mode)
npm run start:debug    # 디버그 모드
npm run start:prod     # 프로덕션 서버
npm run lint           # 린트 검사 및 수정
npm run format         # 코드 포맷팅
npm run test           # 테스트 실행
npm run test:watch     # 테스트 (watch mode)
npm run test:cov       # 테스트 커버리지
npm run test:e2e       # E2E 테스트
npm run seed           # 데이터 시딩
```

## Acknowledgement

본 프로젝트는 카카오임팩트 테크포임팩트 프로그램을 통해 개발되었습니다.

<div align="center">
  <img src="./src/assets/kakao_impact_logo_black.png" alt="카카오임팩트 로고" width="200"/>
  <br/>
  <img src="./src/assets/TF!_Logo_B1.png" alt="테크포임팩트 로고" width="200"/>
</div>

## 서버 세팅 방법 (Docker → 네이티브 서버 이관 가이드)
네이티브 서버가 아래와 같이 설치 되었다고 가정하고 진행한다.

### 1. 서버 설치
- Mariadb
- Apache2
- openJDK-17
- Node 20 LTS
- npm 10.8.2 , pm2
- Web Folder: /var/www/ 아래에 위치 할 것.


### 2. 기존 데이터 마이그레이션 (MySQL → MariaDB)
2-1. 기존 서버에서
```bash
docker exec wowlingo_mysql mysqldump -u root -p wowlingo > wowlingo_dump.sql
```

2-2. 새 서버로 전송
```bash
scp -i {pem 키} wowlingo_dump.sql audadm@{서버 ip}:~/
```

### 3. 애플리케이션 배포
3-1. 디렉토리 구조 생성
```bash
sudo mkdir -p /var/www/wowlingo/be
sudo mkdir -p /var/www/wowlingo/be/sounds
sudo chown -R audadm:audadm /var/www/wowlingo
```

3-2. 소스코드 추출
( 기존 서버 Docker에서 소스코드를 추출해도 되고, 직접 소스에서 빌드 후 작업해도 된다. 본인은 직접 소스에서 빌드 후 작업하였다.)
```bash
npm run build

# tar 압축
tar -cvf dist.tar ./dist
tar -cvf node_modules.tar ./node_modules
```

3-3. 새 서버로 빌드 파일 전송
```bash
sftp -i {pem파일} {접근 가능 user}@{새 서버 ip}
put dist.tar
put node_modules.tar
put package*.json
```

3-4. 새 서버에서 소스 배포
```bash
# tar 압축 해제
tar -xvf dist.tar /var/www/wowlingo/be/
tar -xvf node_modules.tar /var/www/wowlingo/be/
mv package*.json /var/www/wowlingo/be/

# 권한 설정이 아직 되어 있지 않다면.
sudo chown -R audadm:audadm /var/www/wowlingo/be
```


### 4. 애플리케이션 실행
```bash
cd /var/www/wowlingo/be

# .env 파일 생성 (기존 .env.development 기반으로 수정)
cat > .env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME={DB user}
DB_PASSWORD={DB password}
DB_DATABASE=wowlingo

# Application Configuration
NODE_ENV=production
PORT=3000
EOF

# pm2 실행.
pm2 start dist/main.js --name "wowlingo-be" --env production
pm2 save
```


### 5. API 리버스 프록시 (포트 3000)
참고: BE가 이미 3000 포트에서 직접 돌고 있으므로, 클라이언트가 직접 3000에 접근한다면 Apache 프록시 없이 방화벽만 열어도 됩니다.
```bash
sudo tee /etc/apache2/sites-available/wowlingo-be.conf << 'EOF'
<VirtualHost *:3000>
    ServerName 3.35.233.11

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
EOF
```

### 6. 사이트 활성화 및 재시작
```bash
sudo a2dissite 000-default.conf  # 기본 사이트 비활성화
sudo apache2ctl configtest
sudo systemctl restart apache2
```

### 7. 방화벽 설정
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 3000/tcp   # BE API
sudo ufw enable
```

### 7. 확인
```bash
curl http://localhost:3000
pm2 logs wowlingo-be
```