CREATE TABLE IF NOT EXISTS `quest_item_units` (
  `quest_item_unit_id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL COMMENT '유닛 타입',
  `str` text COMMENT '문자열',
  `url_normal` varchar(500) DEFAULT NULL COMMENT '일반 URL',
  `url_slow` varchar(500) DEFAULT NULL COMMENT '느린 URL',
  `remark` text COMMENT '비고',
  PRIMARY KEY (`quest_item_unit_id`)
) ENGINE=InnoDB ;

CREATE TABLE `quest_items` (
  `quest_id` int NOT NULL,
  `type` varchar(20) NOT NULL COMMENT '문제 타입',
  `has_answer` tinyint NOT NULL DEFAULT '0' COMMENT '답변 여부',
  `question1` bigint DEFAULT NULL,
  `question2` bigint DEFAULT NULL,
  `question3` bigint DEFAULT NULL,
  `answer1` bigint DEFAULT NULL,
  `answer2` bigint DEFAULT NULL,
  `answer4` bigint DEFAULT NULL,
  `answer3` bigint DEFAULT NULL,
  `answer5` bigint DEFAULT NULL,
  `answer_sq` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '평서문/의문문 답변',
  `answer_ox` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'O/X 답변',
  `quest_item_id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`quest_item_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `quests` (
  `quest_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `quest_item_count` smallint NOT NULL DEFAULT '0' COMMENT 'Quest Item 갯수',
  `order` smallint NOT NULL DEFAULT '0' COMMENT '순서',
  `title` varchar(100) NOT NULL COMMENT '문제집 타이틀',
  `type` varchar(100) NOT NULL COMMENT '문제집 타입',
  PRIMARY KEY (`quest_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `courses` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL COMMENT '과정 타이틀',
  `type` varchar(20) NOT NULL COMMENT '단어, 문장, 비교, 소리',
  `quest_count` smallint NOT NULL DEFAULT '0' COMMENT 'Quest 갯수',
  `order` smallint NOT NULL DEFAULT '0' COMMENT '순서',
  `objective` text COMMENT '학습 목적',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(50) DEFAULT NULL,
  `updated_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `user_courses` (
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `done_yn` tinyint NOT NULL DEFAULT '0' COMMENT '완료 여부',
  `started_at` datetime DEFAULT NULL COMMENT '시작일시',
  `completed_at` datetime DEFAULT NULL COMMENT '완료일시',
  `progress_rate` smallint NOT NULL DEFAULT '0' COMMENT '진행률',
  `user_course_id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`user_course_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `auth_type` varchar(20) NOT NULL COMMENT '인증 타입 (google, kakao, apple 등)',
  `auth` varchar(100) NOT NULL COMMENT '외부 인증 ID',
  `nickname` varchar(50) NOT NULL COMMENT '닉네임',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `user_quest_items` (
  `user_answer_ox` varchar(1) DEFAULT NULL COMMENT 'O/X 답변',
  `user_answer_sq` varchar(10) DEFAULT NULL COMMENT '평서문/의문문 답변',
  `user_answer` bigint DEFAULT NULL,
  `correct_yn` tinyint DEFAULT NULL,
  `attempt_at` datetime DEFAULT NULL,
  `temp_spent` int DEFAULT NULL,
  `quest_item` json DEFAULT NULL,
  `user_quest_item_id` int NOT NULL AUTO_INCREMENT,
  `user_quest_id` int NOT NULL,
  `quest_item_id` bigint NOT NULL,
  PRIMARY KEY (`user_quest_item_id`)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS `user_quests` (
  `done_yn` tinyint NOT NULL,
  `started_at` datetime NOT NULL,
  `ended_at` datetime DEFAULT NULL,
  `time_spent` int DEFAULT NULL,
  `total_quest_item_count` int NOT NULL,
  `correct_quest_item_count` int DEFAULT '0',
  `accuracy_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `user_quest_id` int NOT NULL AUTO_INCREMENT,
  `user_course_id` int NOT NULL,
  `quest_id` bigint NOT NULL,
  PRIMARY KEY (`user_quest_id`)
) ENGINE=InnoDB;


INSERT INTO wowlingo.courses
(course_id, title, `type`, quest_count, `order`, objective, created_at, updated_at, created_by, updated_by)
VALUES(1, '듣기연습 2', 'string', 1, 1, '평서문과 의문문 억양 변별', '2025-09-21 03:45:07', '2025-09-21 04:24:20.008880', 'boran', 'boran');


INSERT INTO wowlingo.quests
(quest_id, course_id, quest_item_count, `order`, title, `type`)
VALUES(1, 1, 10, 1, '2.1 평서문/의문문 억양 변별', 'statement-question');


INSERT INTO wowlingo.quest_items
(quest_id, `type`, has_answer, question1, question2, question3, answer1, answer2, answer4, answer3, answer5, answer_sq, answer_ox, quest_item_id)
VALUES(1, 'string', 1, 1, NULL, NULL, 1, -1, NULL, NULL, NULL, 'statement', NULL, 1),
(1, 'string', 1, 2, NULL, NULL, -1, 2, NULL, NULL, NULL, 'question', NULL, 2),
(1, 'string', 1, 3, NULL, NULL, 3, -1, NULL, NULL, NULL, 'statement', NULL, 3),
(1, 'string', 1, 4, NULL, NULL, 4, -1, NULL, NULL, NULL, 'statement', NULL, 4),
(1, 'string', 1, 5, NULL, NULL, -1, 5, NULL, NULL, NULL, 'question', NULL, 5),
(1, 'string', 1, 6, NULL, NULL, -1, 6, NULL, NULL, NULL, 'question', NULL, 6),
(1, 'string', 1, 7, NULL, NULL, 7, -1, NULL, NULL, NULL, 'statement', NULL, 7),
(1, 'string', 1, 8, NULL, NULL, -1, 8, NULL, NULL, NULL, 'question', NULL, 8),
(1, 'string', 1, 9, NULL, NULL, 9, -1, NULL, NULL, NULL, 'statement', NULL, 9),
(1, 'string', 1, 10, NULL, NULL, 10, -1, NULL, NULL, NULL, 'statement', NULL, 10),
(1, 'string', 1, 11, NULL, NULL, -1, 11, NULL, NULL, NULL, 'question', NULL, 11),
(1, 'string', 1, 12, NULL, NULL, -1, 12, NULL, NULL, NULL, 'question', NULL, 12);


INSERT INTO wowlingo.quest_item_units
(quest_item_unit_id, `type`, str, url_normal, url_slow, remark)
VALUES(1, 'statement', '감자', '/sounds/potato-normal.wav', '/sounds/potato-slow.wav', NULL),
(2, 'question', '고구마', '/sounds/sweetpotato.wav', '/sounds/sweetpotato-slow.wav', NULL),
(3, 'statement', '다리미', '/sounds/iron.wav', '/sounds/iron-slow.wav', NULL),
(4, 'statement', '도깨비', '/sounds/goblin.wav', '/sounds/goblin-slow.wav', NULL),
(5, 'question', '모래사장', '/sounds/sandybeach.wav', '/sounds/sandybeach-slow.wav', NULL),
(6, 'question', '미꾸라지', '/sounds/loach.wav', '/sounds/loach-slow.wav', NULL),
(7, 'statement', '감자', '/sounds/potato-normal.wav', '/sounds/potato-slow.wav', NULL),
(8, 'question', '고구마', '/sounds/sweetpotato.wav', '/sounds/sweetpotato-slow.wav', NULL),
(9, 'statement', '다리미', '/sounds/iron.wav', '/sounds/iron-slow.wav', NULL),
(10, 'statement', '도깨비', '/sounds/goblin.wav', '/sounds/goblin-slow.wav', NULL),
(11, 'question', '모래사장', '/sounds/sandybeach.wav', '/sounds/sandybeach-slow.wav', NULL),
(12, 'question', '미꾸라지', '/sounds/loach.wav', '/sounds/loach-slow.wav', NULL);


INSERT INTO wowlingo.`user`
(user_id, auth_type, auth, nickname)
VALUES(1, 'kakao', 'kakaoauth', 'guest');