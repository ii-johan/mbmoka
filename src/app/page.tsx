// src/app/page.tsx

"use client"; // 이 파일은 클라이언트 컴포넌트임을 명시합니다. (useRouter 훅 사용)

import { useRouter } from 'next/navigation'; // 페이지 이동을 위한 useRouter 훅 임포트
import styles from './page.module.css'; // 페이지 디자인을 위한 CSS 모듈 임포트
import React from 'react'; // React 임포트

// 테스트 문항 ID 목록 정의 (실제 문항 ID와 일치하도록 조정)
// 이 부분은 src/data/mokaData.ts 파일에 있는 실제 문항 ID를 기반으로 해야 합니다.
// 현재는 예시로 1부터 160까지의 ID를 사용합니다.
const fastTestQuestionIds = Array.from({ length: 32 }, (_, i) => i + 1); // 1-32번 문항 사용
const slowTestQuestionIds = Array.from({ length: 80 }, (_, i) => i + 1); // 1-80번 문항 사용
const fullTestQuestionIds = Array.from({ length: 160 }, (_, i) => i + 1); // 1-160번 문항 사용

// 메인 시작 페이지 컴포넌트 정의
export default function Home() {
  const router = useRouter(); // useRouter 훅 초기화

  // "테스트 시작" 버튼 클릭 시 실행될 함수
  const startTest = (questionIds: number[]) => {
    // 쿼리 파라미터와 함께 /test 페이지로 이동
    router.push(`/test?ids=${questionIds.join(',')}`);
  };

  return (
    <div className={styles.container}>
      {/* 메인 타이틀 */}
      <h1 className={styles.title}>MBTI MOKA</h1>

      {/* 달 모양 노란색 원형 */}
      <div className={styles.moon}></div>

      {/* 테스트 시작 버튼들을 담을 컨테이너 */}
      <div className={styles.buttonContainer}>
        {/* FAST TEST 버튼 */}
        <button
          className={`${styles.testButton} ${styles.greenButton1}`}
          onClick={() => startTest(fastTestQuestionIds)}
        >
          FAST TEST (32문항)
        </button>

        {/* SLOW TEST 버튼 */}
        <button
          className={`${styles.testButton} ${styles.greenButton2}`}
          onClick={() => startTest(slowTestQuestionIds)}
        >
          SLOW TEST (80문항)
        </button>

        {/* FULL TEST 버튼 */}
        <button
          className={`${styles.testButton} ${styles.greenButton3}`}
          onClick={() => startTest(fullTestQuestionIds)}
        >
          FULL TEST (160문항)
        </button>
      </div>
    </div>
  );
}
