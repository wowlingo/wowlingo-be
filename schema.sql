CREATE TABLE IF NOT EXISTS `quest_item_units` (
  `quest_item_unit_id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL COMMENT '유닛 타입',
  `str` text NULL COMMENT '문자열',
  `url_normal` varchar(500) NULL COMMENT '일반 URL',
  `url_slow` varchar(500) NULL COMMENT '느린 URL',
  `remark` text NULL COMMENT '비고',
  PRIMARY KEY (`quest_item_unit_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `quest_items` (
  `quest_item_id` int NOT NULL AUTO_INCREMENT,
  `quest_id` int NOT NULL,
  `type` varchar(20) NOT NULL COMMENT '문제 타입',
  `has_answer` tinyint NOT NULL COMMENT '답변 여부' DEFAULT 0,
  `question1` text NULL,
  `question2` text NULL,
  `question3` text NULL,
  `answer_ox` varchar(1) NULL COMMENT 'O/X 답변',
  `answer_sq` varchar(10) NULL COMMENT '평서문/의문문 답변',
  `answer1` text NULL,
  `answer2` text NULL,
  `answer3` text NULL,
  `answer4` text NULL,
  `answer5` text NULL,
  PRIMARY KEY (`quest_item_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `quests` (
  `quest_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `quest_item_count` smallint NOT NULL COMMENT 'Quest Item 갯수' DEFAULT '0',
  `order` smallint NOT NULL COMMENT '순서' DEFAULT '0',
  PRIMARY KEY (`quest_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `courses` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL COMMENT '과정 타이틀',
  `type` varchar(20) NOT NULL COMMENT '단어, 문장, 비교, 소리',
  `quest_count` smallint NOT NULL COMMENT 'Quest 갯수' DEFAULT '0',
  `order` smallint NOT NULL COMMENT '순서' DEFAULT '0',
  `objective` text NULL COMMENT '학습 목적',
  `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(50) NULL,
  `updated_by` varchar(50) NULL,
  PRIMARY KEY (`course_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `user_courses` (
  `user_course_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `done_yn` varchar(1) NOT NULL COMMENT '완료 여부' DEFAULT 'N',
  `started_at` datetime NULL COMMENT '시작일시',
  `completed_at` datetime NULL COMMENT '완료일시',
  `progress_rate` smallint NOT NULL COMMENT '진행률' DEFAULT '0',
  PRIMARY KEY (`user_course_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `auth_type` varchar(20) NOT NULL COMMENT '인증 타입 (google, kakao, apple 등)',
  `auth` varchar(100) NOT NULL COMMENT '외부 인증 ID',
  `nickname` varchar(50) NOT NULL COMMENT '닉네임',
  PRIMARY KEY (`user_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS user_quest_items
(
  user_quest_item_id BIGINT   NOT NULL AUTO_INCREMENT,
  user_quest_id      BIGINT   NOT NULL COMMENT '사용자 학습 문제집 Id',
  quest_item_id      BIGINT   NOT NULL COMMENT '문제 항목 Id',
  user_answer_ox     VARCHAR(1)   NULL     COMMENT '사용자 답변 ox',
  user_answer_sq     VARCHAR(10)  NULL     COMMENT '사용자 답변 평서문/의문문',
  user_answer        BIGINT   NULL     COMMENT '사용자 답변  (quest_item_unit_id)',
  correct_yn         boolean    NULL     COMMENT '정답 여부',
  attempt_at         DATETIME NULL     COMMENT '학습 시도 시간',
  time_spent         INT      NULL     COMMENT '소요 시간 (초)',
  quest_item         JSON     NULL     COMMENT '문제(json)',
  PRIMARY KEY (user_quest_item_id)
) COMMENT '사용자 학습 문제';