import { AppDataSource } from '../infra/persistence/data-source';
import { Course } from '../app/course/entities/course.entity';
import { Quest } from '../app/quest/entities/quest.entity';
import { QuestItem } from '../app/quest/entities/quest-item.entity';
import { QuestItemUnit } from '../app/quest/entities/quest-item-unit.entity';

async function seedData() {
  try {
    // 데이터베이스 연결
    await AppDataSource.initialize();
    console.log('데이터베이스 연결 성공');

    // 기존 데이터 삭제 (개발용) - 외래키 순서 고려
    await AppDataSource.query('DELETE FROM quest_item_units');
    await AppDataSource.query('DELETE FROM quest_items');
    await AppDataSource.query('DELETE FROM quests');
    await AppDataSource.query('DELETE FROM courses');
    console.log('기존 데이터 삭제 완료');

    // 1. 코스 생성
    const course = new Course();
    course.title = '문장 검사 과정';
    course.type = '문장';
    course.questCount = 1;
    course.order = 1;
    course.objective = '한국어 문장 듣기 능력 향상';
    await AppDataSource.getRepository(Course).save(course);
    console.log('코스 생성 완료:', course.title);

    // 2. 퀘스트(문제집) 생성
    const quest = new Quest();
    quest.courseId = course.courseId;
    quest.questItemCount = 2;
    quest.order = 1;
    await AppDataSource.getRepository(Quest).save(quest);
    console.log('퀘스트 생성 완료');

    // 3. 퀘스트 아이템 생성 (먼저 생성)
    const questItem1 = new QuestItem();
    questItem1.questId = quest.questId;
    questItem1.type = 'choice';
    questItem1.hasAnswer = true;
    questItem1.question1 = 0; // 나중에 업데이트
    questItem1.question2 = 0; // 사용하지 않음
    questItem1.question3 = 0; // 사용하지 않음
    questItem1.answer1 = 0; // 나중에 업데이트
    questItem1.answer2 = 0; // 나중에 업데이트
    questItem1.answer3 = 0; // 나중에 업데이트
    questItem1.remark = '첫 번째 문장 검사 문제';
    await AppDataSource.getRepository(QuestItem).save(questItem1);

    const questItem2 = new QuestItem();
    questItem2.questId = quest.questId;
    questItem2.type = 'choice';
    questItem2.hasAnswer = true;
    questItem2.question1 = 0; // 나중에 업데이트
    questItem2.question2 = 0; // 사용하지 않음
    questItem2.question3 = 0; // 사용하지 않음
    questItem2.answer1 = 0; // 나중에 업데이트
    questItem2.answer2 = 0; // 나중에 업데이트
    questItem2.answer3 = 0; // 나중에 업데이트
    questItem2.remark = '두 번째 문장 검사 문제';
    await AppDataSource.getRepository(QuestItem).save(questItem2);

    console.log('퀘스트 아이템 생성 완료');

    // 4. 퀘스트 아이템 유닛 생성 (음원 및 선택지)
    const audioUnit1 = new QuestItemUnit();
    audioUnit1.questItemId = questItem1.questItemId;
    audioUnit1.type = '여자 목소리';
    audioUnit1.str = '날씨가 춥다';
    audioUnit1.urlNormal = '/audio/sentence1.mp3';
    audioUnit1.urlSlow = '/audio/sentence1_slow.mp3';
    audioUnit1.remark = '첫 번째 문장 음원';
    await AppDataSource.getRepository(QuestItemUnit).save(audioUnit1);

    const audioUnit2 = new QuestItemUnit();
    audioUnit2.questItemId = questItem2.questItemId;
    audioUnit2.type = '여자 목소리';
    audioUnit2.str = '아침마다 조깅을 하면 건강에 좋다';
    audioUnit2.urlNormal = '/audio/sentence2.mp3';
    audioUnit2.urlSlow = '/audio/sentence2_slow.mp3';
    audioUnit2.remark = '두 번째 문장 음원';
    await AppDataSource.getRepository(QuestItemUnit).save(audioUnit2);

    // 선택지 유닛들
    const option1_1 = new QuestItemUnit();
    option1_1.questItemId = questItem1.questItemId;
    option1_1.type = '텍스트';
    option1_1.str = '아프다.';
    option1_1.remark = '첫 번째 문제 선택지 1';
    await AppDataSource.getRepository(QuestItemUnit).save(option1_1);

    const option1_2 = new QuestItemUnit();
    option1_2.questItemId = questItem1.questItemId;
    option1_2.type = '텍스트';
    option1_2.str = '날씨가 춥다.';
    option1_2.remark = '첫 번째 문제 선택지 2 (정답)';
    await AppDataSource.getRepository(QuestItemUnit).save(option1_2);

    const option1_3 = new QuestItemUnit();
    option1_3.questItemId = questItem1.questItemId;
    option1_3.type = '텍스트';
    option1_3.str = '아침마다 조깅을 하면 건강에 좋다.';
    option1_3.remark = '첫 번째 문제 선택지 3';
    await AppDataSource.getRepository(QuestItemUnit).save(option1_3);

    const option2_1 = new QuestItemUnit();
    option2_1.questItemId = questItem2.questItemId;
    option2_1.type = '텍스트';
    option2_1.str = '아프다.';
    option2_1.remark = '두 번째 문제 선택지 1';
    await AppDataSource.getRepository(QuestItemUnit).save(option2_1);

    const option2_2 = new QuestItemUnit();
    option2_2.questItemId = questItem2.questItemId;
    option2_2.type = '텍스트';
    option2_2.str = '날씨가 춥다.';
    option2_2.remark = '두 번째 문제 선택지 2';
    await AppDataSource.getRepository(QuestItemUnit).save(option2_2);

    const option2_3 = new QuestItemUnit();
    option2_3.questItemId = questItem2.questItemId;
    option2_3.type = '텍스트';
    option2_3.str = '아침마다 조깅을 하면 건강에 좋다.';
    option2_3.remark = '두 번째 문제 선택지 3 (정답)';
    await AppDataSource.getRepository(QuestItemUnit).save(option2_3);

    console.log('퀘스트 아이템 유닛 생성 완료');

    // 5. 퀘스트 아이템의 question과 answer 필드 업데이트
    questItem1.question1 = audioUnit1.questItemUnitId;
    questItem1.answer1 = option1_2.questItemUnitId; // 정답
    questItem1.answer2 = option1_1.questItemUnitId;
    questItem1.answer3 = option1_3.questItemUnitId;
    await AppDataSource.getRepository(QuestItem).save(questItem1);

    questItem2.question1 = audioUnit2.questItemUnitId;
    questItem2.answer1 = option2_3.questItemUnitId; // 정답
    questItem2.answer2 = option2_1.questItemUnitId;
    questItem2.answer3 = option2_2.questItemUnitId;
    await AppDataSource.getRepository(QuestItem).save(questItem2);

    console.log('퀘스트 아이템 업데이트 완료');
    console.log('샘플 데이터 생성 완료!');
    console.log(`코스 ID: ${course.courseId}`);
    console.log(`퀘스트 ID: ${quest.questId}`);
    console.log(`퀘스트 아이템 ID: ${questItem1.questItemId}, ${questItem2.questItemId}`);

  } catch (error) {
    console.error('샘플 데이터 생성 중 오류:', error);
  } finally {
    // 데이터베이스 연결 종료
    await AppDataSource.destroy();
    console.log('데이터베이스 연결 종료');
  }
}

// 스크립트 실행
seedData();
