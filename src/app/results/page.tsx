// src/app/results/page.tsx

'use client'; // Next.js 13 이상에서 클라이언트 컴포넌트로 명시

import React, { useEffect, useState } from 'react';
import styles from './results.module.css';
// 모든 필요한 것을 mokaData.ts에서 import 합니다.
import {
  mokaQuestions,
  calculateMokaScores,
  getMokaType,
  mokaPoleDescriptions,
  mokaFullTypeDescriptions,
  Dichotomy,
  UserAnswer,
} from '../../data/mokaData';

export default function ResultsPage() {
  const [mokaType, setMokaType] = useState<string | null>(null);
  const [dichotomyScores, setDichotomyScores] = useState<{ [key in Dichotomy]: number } | null>(null);

  useEffect(() => {
    // 실제 앱에서는 여기에서 사용자의 답변을 불러와야 합니다.
    // 예시를 위해 임시 답변 데이터를 사용합니다.
    const tempUserAnswers: UserAnswer[] = [
      // 예시 답변 데이터 (실제로는 사용자가 제출한 160개 답변)
      // 이 부분은 테스트용으로만 사용하고, 실제 구현 시에는 삭제하거나 동적으로 불러와야 합니다.
      { questionId: 1, answer: 6 }, { questionId: 2, answer: 2 }, { questionId: 3, answer: 7 }, { questionId: 4, answer: 6 },
      { questionId: 5, answer: 7 }, { questionId: 6, answer: 6 }, { questionId: 7, answer: 2 }, { questionId: 8, answer: 1 },
      { questionId: 80, answer: 2 }, { questionId: 81, answer: 2 }, { questionId: 82, answer: 6 }, { questionId: 83, answer: 6 },
      { questionId: 84, answer: 5 }, { questionId: 85, answer: 6 }, { questionId: 86, answer: 2 }, { questionId: 87, answer: 7 },
      { questionId: 88, answer: 2 }, { questionId: 89, answer: 6 }, { questionId: 90, answer: 7 }, { questionId: 91, answer: 6 },
      { questionId: 92, answer: 5 }, { questionId: 93, answer: 7 }, { questionId: 94, answer: 6 }, { questionId: 95, answer: 6 },
      { questionId: 96, answer: 2 }, { questionId: 97, answer: 7 }, { questionId: 98, answer: 6 }, { questionId: 99, answer: 6 },
      { questionId: 100, answer: 5 }, { questionId: 101, answer: 2 }, { questionId: 102, answer: 7 }, { questionId: 103, answer: 6 },
      { questionId: 104, answer: 7 }, { questionId: 105, answer: 7 }, { questionId: 106, answer: 6 }, { questionId: 107, answer: 6 },
      { questionId: 108, answer: 5 }, { questionId: 109, answer: 7 }, { questionId: 110, answer: 6 }, { questionId: 111, answer: 6 },
      { questionId: 112, answer: 7 }, { questionId: 113, answer: 6 }, { questionId: 114, answer: 7 }, { questionId: 115, answer: 6 },
      { questionId: 116, answer: 5 }, { questionId: 117, answer: 2 }, { questionId: 118, answer: 2 }, { questionId: 119, answer: 6 },
      { questionId: 120, answer: 7 }, { questionId: 121, answer: 7 }, { questionId: 122, answer: 7 }, { questionId: 123, answer: 6 },
      { questionId: 124, answer: 5 }, { questionId: 125, answer: 2 }, { questionId: 126, answer: 2 }, { questionId: 127, answer: 6 },
      { questionId: 128, answer: 2 }, { questionId: 129, answer: 7 }, { questionId: 130, answer: 6 }, { questionId: 131, answer: 6 },
      { questionId: 132, answer: 6 }, { questionId: 133, answer: 2 }, { questionId: 134, answer: 6 }, { questionId: 135, answer: 6 },
      { questionId: 136, answer: 7 }, { questionId: 137, answer: 7 }, { questionId: 138, answer: 7 }, { questionId: 139, answer: 6 },
      { questionId: 140, answer: 5 }, { questionId: 141, answer: 2 }, { questionId: 142, answer: 2 }, { questionId: 143, answer: 2 },
      { questionId: 144, answer: 7 }, { questionId: 145, answer: 6 }, { questionId: 146, answer: 7 }, { questionId: 147, answer: 6 },
      { questionId: 148, answer: 6 }, { questionId: 149, answer: 7 }, { questionId: 150, answer: 2 }, { questionId: 151, answer: 6 },
      { questionId: 152, answer: 7 }, { questionId: 153, answer: 6 }, { questionId: 154, answer: 7 }, { questionId: 155, answer: 6 },
      { questionId: 156, answer: 6 }, { questionId: 157, answer: 2 }, { questionId: 158, answer: 2 }, { questionId: 159, answer: 6 },
      { questionId: 160, answer: 2 }
    ];


    if (mokaQuestions.length === 160 && tempUserAnswers.length === 160) {
      const calculatedScores = calculateMokaScores(tempUserAnswers, mokaQuestions);
      setDichotomyScores(calculatedScores);
      setMokaType(getMokaType(calculatedScores));
    } else {
        console.warn("Moka questions not loaded correctly or not all 160 answers provided.");
        // 모든 질문에 대한 답변이 없을 경우 처리 (예: 테스트 시작 페이지로 리다이렉트)
    }
  }, []);

  if (!mokaType || !dichotomyScores) {
    return (
      <div className={styles.loadingContainer}>
        <p>결과를 분석 중입니다...</p>
      </div>
    );
  }

  // MOKA 유형의 각 극(예: E, S, T, J, M, O, K, A)에 대한 설명 렌더링
  const renderPoleDescriptions = () => {
    return mokaType.split('').map((poleChar, index) => {
      const pole = poleChar as keyof typeof mokaPoleDescriptions;
      const descriptionData = mokaPoleDescriptions[pole];

      if (descriptionData) {
        return (
          <div key={index} className={styles.typeDetail}>
            <h3>{descriptionData.title} ({pole})</h3>
            {descriptionData.description.map((desc, i) => (
              <p key={i}>{desc}</p>
            ))}
          </div>
        );
      }
      return null;
    });
  };

  // 각 차원별 점수 그래프 렌더링
  const renderDichotomyScores = () => {
    const dichotomies: Dichotomy[] = ['EI', 'SN', 'TF', 'JP', 'MB', 'OU', 'KR', 'AY'];
    return dichotomies.map(dichotomy => {
      const score = dichotomyScores[dichotomy];
      // 해당 차원의 질문 수에 따라 최대 점수 계산 (정규화 위함)
      const questionsForDichotomy = mokaQuestions.filter(q => q.scoring.some(s => s.dichotomy === dichotomy));
      const maxDichotomyDifference = questionsForDichotomy.length * 6; // 각 질문당 1~7점, 차이 최대 6점

      // 점수를 0 (전적으로 반대 극) ~ 100 (전적으로 해당 극)으로 정규화
      const normalizedScore = (score + maxDichotomyDifference) / (2 * maxDichotomyDifference) * 100;

      // 막대 색상 결정
      const barColor = score >= 0 ? '#4CAF50' : '#f44336'; // 양수면 녹색(E, S 등), 음수면 빨간색(I, N 등)

      return (
        <div key={dichotomy} className={styles.dichotomyBarContainer}>
          <span className={styles.dichotomyLabel}>{dichotomy.charAt(0)}</span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressBarFill}
              style={{
                width: `${normalizedScore}%`,
                backgroundColor: barColor,
              }}
            ></div>
          </div>
          <span className={styles.dichotomyLabel}>{dichotomy.charAt(1)}</span>
        </div>
      );
    });
  };

  const fullTypeDescription = mokaFullTypeDescriptions[mokaType]; // 전체 유형 설명 가져오기

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>MOKA 성격 검사 결과</h1>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.yourTypeSection}>
          <h2>당신의 MOKA 유형은: <span className={styles.mokaTypeHighlight}>{mokaType}</span></h2>
          {fullTypeDescription ? (
            <p className={styles.typeSummary}>
              {fullTypeDescription.summary}
            </p>
          ) : (
            <p className={styles.typeSummary}>
              이 유형에 대한 상세 설명은 아직 준비되지 않았습니다.
            </p>
          )}
        </section>

        <section className={styles.dichotomyScoresSection}>
          <h2>차원별 성향 분석</h2>
          <div className={styles.dichotomyBars}>
            {renderDichotomyScores()}
          </div>
          <p className={styles.scoreNote}>
            (각 막대는 해당 차원의 강도를 나타냅니다. 막대가 오른쪽으로 길수록 오른쪽 극(E, S, T 등)의 성향이 강합니다.)
          </p>
        </section>

        <section className={styles.typeDescriptionsSection}>
          <h2>유형별 상세 설명</h2>
          <div className={styles.typeDescriptionGrid}>
            {renderPoleDescriptions()}
          </div>
        </section>

        {fullTypeDescription && (
          <section className={styles.additionalInfoSection}>
            <h2>나에게 맞는 특징</h2>
            <div className={styles.characteristics}>
              <h3>강점</h3>
              <ul>
                {fullTypeDescription.strengths.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <h3>보완점</h3>
              <ul>
                {fullTypeDescription.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <h3>관계</h3>
              <ul>
                {fullTypeDescription.relationships.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <h3>직업 추천</h3>
              <ul>
                {fullTypeDescription.careerPaths.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2025 MOKA Personality Test. All rights reserved.</p>
      </footer>
    </div>
  );
}