// src/app/results/page.tsx

"use client"; // 이 파일이 클라이언트 컴포넌트임을 명시합니다. (useSearchParams, useRouter 훅 사용)

// 이 페이지는 URL 쿼리 파라미터에 의존하므로, 빌드 시점에 미리 렌더링하지 않고
// 요청이 들어올 때마다 서버에서 동적으로 렌더링하도록 강제합니다.
export const dynamic = 'force-dynamic'; // <-- 이 줄을 추가했습니다.

import React, { useEffect, useState, useCallback } from 'react'; // 필요한 훅 임포트
import { useSearchParams, useRouter } from 'next/navigation'; // App Router 훅 임포트 (URL 파라미터 읽기, 페이지 이동)
import styles from './results.module.css'; // 현재 폴더의 CSS 모듈 임포트

// MokaQuestion 타입 정의 (mokaData.ts에서 임포트하거나 여기에 직접 정의해야 할 수 있습니다.)
// 여기서는 mokaData.ts에서 가져온다고 가정합니다.
// import { MokaQuestion } from '../../data/mokaData'; // 필요시 임포트

// 각 차원의 두 극과 해당 극의 설명을 정의합니다.
// 'H'와 'M' 대신 'M'과 'B'를 사용합니다.
const dichotomies = [
    { name: 'EI', poles: ['E', 'I'], type: 'MBTI' },
    { name: 'SN', poles: ['S', 'N'], type: 'MBTI' },
    { name: 'TF', poles: ['T', 'F'], type: 'MBTI' },
    { name: 'JP', poles: ['J', 'P'], type: 'MBTI' },
    { name: 'MB', poles: ['M', 'B'], type: 'MOKA' }, // H/M -> M/B
    { name: 'OU', poles: ['O', 'U'], type: 'MOKA' },
    { name: 'KR', poles: ['K', 'R'], type: 'MOKA' },
    { name: 'AY', poles: ['A', 'Y'], type: 'MOKA' },
];

// MOKA 테스트 결과 계산 및 유형 판별 함수
// 이 함수는 test/page.tsx에서 넘겨받은 각 극의 총점(scores)을 기반으로
// 최종 MBTI 4가지 지표와 MOKA 4가지 지표의 최종 유형 및 각 지표별 선호도 퍼센티지(선호도 강도)를 계산합니다.
const calculateMokaResults = (rawScores: { [pole: string]: number }) => {
  const results: {
    mbtiType: string;
    mokaType: string;
    combinedType: string;
    percentages: { [dichotomy: string]: { pole: string, percentage: number } };
    descriptions: { [dichotomy: string]: string };
  } = {
    mbtiType: '',
    mokaType: '',
    combinedType: '',
    percentages: {},
    descriptions: {},
  };

  // 'let' 대신 'const'를 사용하여 ESLint 오류 해결
  const mbtiChars: string[] = [];
  const mokaChars: string[] = [];

  dichotomies.forEach(dichotomy => {
    const [pole1, pole2] = dichotomy.poles;
    const score1 = rawScores[pole1] || 0;
    const score2 = rawScores[pole2] || 0;

    let dominantPole: string;
    let percentage: number;

    const totalScore = score1 + score2;

    if (totalScore === 0) {
      // 두 극 모두 점수가 0인 경우 (해당 문항이 없거나 답변이 없는 경우)
      dominantPole = pole1; // 기본값으로 첫 번째 극 선택
      percentage = 0;
    } else if (score1 >= score2) {
      dominantPole = pole1;
      percentage = (score1 / totalScore) * 100;
    } else {
      dominantPole = pole2;
      percentage = (score2 / totalScore) * 100;
    }

    results.percentages[dichotomy.name] = {
      pole: dominantPole,
      percentage: Math.round(percentage), // 소수점 반올림
    };

    if (dichotomy.type === 'MBTI') {
      mbtiChars.push(dominantPole);
    } else {
      mokaChars.push(dominantPole);
    }
  });

  results.mbtiType = mbtiChars.join('');
  results.mokaType = mokaChars.join('');
  results.combinedType = `${results.mbtiType}-${results.mokaType}`;

  // 각 지표에 대한 설명 생성 (제가 멋지게 만들어서 설명합니다!)
  results.descriptions.EI = results.percentages.EI.pole === 'E'
    ? "당신은 **외향적인(E)** 사람으로, 에너지를 외부 활동과 사람들과의 교류에서 얻습니다. 활기찬 분위기를 선호하며, 새로운 사람들과 쉽게 어울리고 자신의 생각을 적극적으로 표현하는 데 능숙합니다. 넓고 다양한 경험을 통해 성장하고 싶어 합니다."
    : "당신은 **내향적인(I)** 사람으로, 에너지를 내면의 성찰과 조용한 활동에서 얻습니다. 깊이 있는 사고를 즐기며, 소수의 사람들과 의미 있는 관계를 맺는 것을 선호합니다. 혼자만의 시간을 통해 재충전하고 아이디어를 발전시키는 데 강점을 보입니다.";

  results.descriptions.SN = results.percentages.SN.pole === 'S'
    ? "당신은 **감각적인(S)** 사람으로, 오감으로 인지하는 현실적이고 구체적인 정보에 집중합니다. 현재의 사실과 경험을 중요하게 여기며, 실용적이고 세부적인 것에 능합니다. 문제 해결에 있어서도 실제적인 접근 방식을 선호합니다."
    : "당신은 **직관적인(N)** 사람으로, 육감과 영감을 통해 미래의 가능성과 숨겨진 의미를 탐색합니다. 추상적인 개념과 복잡한 아이디어를 잘 이해하며, 새로운 시도와 창의적인 발상을 즐깁니다. 큰 그림을 보고 미래를 예측하는 데 강점을 보입니다.";

  results.descriptions.TF = results.percentages.TF.pole === 'T'
    ? "당신은 **사고형(T)** 사람으로, 논리와 분석을 통해 객관적으로 판단하고 결정을 내립니다. 원칙과 기준을 중요하게 여기며, 문제의 옳고 그름을 명확히 따지는 데 능숙합니다. 감정에 휩쓸리지 않고 이성적으로 접근하는 것을 선호합니다."
    : "당신은 **감정형(F)** 사람으로, 사람들과의 관계와 가치를 중요하게 여기며 공감과 조화를 통해 판단합니다. 타인의 감정을 잘 이해하고 배려하며, 따뜻하고 부드러운 소통을 선호합니다. 사람 중심의 결정을 내리는 데 강점을 보입니다.";

  results.descriptions.JP = results.percentages.JP.pole === 'J'
    ? "당신은 **판단형(J)** 사람으로, 계획적이고 체계적인 삶을 선호합니다. 목표를 설정하고 그에 따라 일을 정리하며, 마감 기한을 준수하는 데 능숙합니다. 예측 가능한 환경에서 안정감을 느끼며, 결단력 있게 일을 추진합니다."
    : "당신은 **인식형(P)** 사람으로, 유연하고 자율적인 삶을 선호합니다. 계획에 얽매이기보다 상황에 따라 즉흥적으로 대처하는 것을 즐기며, 새로운 가능성을 열어두는 데 능합니다. 변화에 잘 적응하고 여유로운 태도로 삶을 즐깁니다.";

  results.descriptions.MB = results.percentages.MB.pole === 'M'
    ? "당신은 **주도형(M)** 사람으로, 그룹이나 상황에서 주도적인 역할을 맡는 것을 선 선호합니다. 자신의 아이디어를 적극적으로 제시하고, 리더십을 발휘하여 사람들을 이끄는 데 능숙합니다. 문제 발생 시 책임감을 가지고 해결하려는 경향이 강합니다."
    : "당신은 **협력형(B)** 사람으로, 다른 사람의 의견을 존중하고 조화를 중요하게 생각합니다. 팀워크를 통해 함께 목표를 달성하는 것을 선호하며, 갈등을 피하고 평화로운 분위기를 유지하는 데 능숙합니다. 겸손하고 배려심이 깊습니다.";

  results.descriptions.OU = results.percentages.OU.pole === 'O'
    ? "당신은 **개방형(O)** 사람으로, 유머 감각이 뛰어나고 자신과 타인의 실수를 너그럽게 받아들입니다. 밝고 긍정적인 태도로 주변 사람들을 편안하게 해주며, 가벼운 농담이나 장난을 통해 분위기를 유쾌하게 만듭니다. 자기 비판에 유연합니다."
    : "당신은 **신중형(U)** 사람으로, 진지하고 사려 깊은 태도를 가집니다. 농담이나 가벼운 분위기보다는 깊이 있는 대화를 선호하며, 자신의 실수나 타인의 지적에 대해 민감하게 반응할 수 있습니다. 때로는 고집이 있다는 말을 듣기도 합니다.";

  results.descriptions.KR = results.percentages.KR.pole === 'K'
    ? "당신은 **표현형(K)** 사람으로, 자신의 감정이나 생각을 솔직하고 즉각적으로 표현하는 데 능숙합니다. 대화의 흐름을 자연스럽게 이끌고, 상대방의 이야기에 적극적으로 반응하며 몰입하는 경향이 있습니다. 솔직함이 당신의 매력입니다."
    : "당신은 **절제형(R)** 사람으로, 자신의 속마음이나 감정을 쉽게 드러내지 않는 편입니다. 대화 중 말을 이어가는 것을 어려워하거나, 감정 표현이 부자연스럽다고 느낄 수 있습니다. 신중하게 생각하고 말하는 것을 선호하며, 때로는 말이 끊기는 것을 긴장할 수 있습니다.";

  results.descriptions.AY = results.percentages.AY.pole === 'A'
    ? "당신은 **자신감형(A)** 사람으로, 자신의 외모, 성격, 이미지에 전반적으로 만족하며 당당하고 매력적인 태도를 가집니다. 사회적 상황에서 긴장하지 않고 자신감 있게 행동하며, 타인의 관심을 즐기고 트렌드에 민감합니다. 주변 분위기를 변화시키는 존재감을 가집니다."
    : "당신은 **불안형(Y)** 사람으로, 자신의 외모나 이미지에 대해 다소 불안감을 느끼거나 만족도가 낮을 수 있습니다. 주목받는 것을 어색해하며, 스스로를 매력적으로 포장하는 데 익숙하지 않습니다. 때로는 주변 사람들과 비교하며 위축되거나, 시대에 뒤처지는 느낌을 받을 수 있습니다.";

  return results;
};


// 결과 페이지 컴포넌트 정의
export default function ResultsPage() {
  // URL에서 쿼리 파라미터(예: ?scores=...)를 읽어오기 위한 훅
  const searchParams = useSearchParams();
  // 페이지 이동을 위한 훅
  const router = useRouter();

  // 상태 변수 선언
  const [mokaResults, setMokaResults] = useState<ReturnType<typeof calculateMokaResults> | null>(null);
  // 데이터 로딩 상태
  const [loading, setLoading] = useState(true);
  // 오류 메시지 상태
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트가 처음 화면에 표시될 때(마운트) 실행됩니다.
  // URL 쿼리 파라미터에서 'scores' 값을 읽어와 점수 상태를 업데이트합니다.
  useEffect(() => {
    const scoresParam = searchParams.get('scores'); // URL에서 'scores' 라는 이름의 파라미터 값을 가져옴

    if (scoresParam) {
      try {
        // 가져온 파라미터 값(JSON 문자열)을 JavaScript 객체로 변환(파싱)
        const parsedScores = JSON.parse(decodeURIComponent(scoresParam)); // decodeURIComponent 추가
        const calculatedResults = calculateMokaResults(parsedScores); // 점수 계산 함수 호출
        setMokaResults(calculatedResults); // 계산된 결과 객체를 상태에 저장
        setLoading(false); // 로딩 상태를 false로 변경
      } catch (e) {
        console.error("Failed to parse or calculate scores from URL:", e); // 파싱 오류 발생 시 콘솔에 로그
        setError("결과 데이터를 불러오거나 계산하는 데 실패했습니다. 데이터 형식이 올바르지 않습니다."); // 사용자에게 보여줄 오류 메시지 설정
        setLoading(false); // 로딩 상태를 false로 변경 (오류 발생 시에도 로딩은 끝남)
      }
    } else {
      // 'scores' 파라미터가 URL에 없는 경우
      setError("결과 데이터가 URL에 없습니다. 테스트를 다시 시도해주세요."); // 데이터가 없다는 오류 메시지 설정
      setLoading(false); // 로딩 상태를 false로 변경
    }
  }, [searchParams]); // searchParams 객체가 변경될 때마다 이 useEffect 훅 안의 코드를 다시 실행

  // 홈 페이지('/')로 이동하는 함수
  const goToHome = useCallback(() => {
    router.push('/'); // Next.js 라우터를 사용하여 루트 경로('/')로 이동
  }, [router]);


  // ***** 로딩 중 UI 표시 *****
  if (loading) {
    return (
      <div className={styles.container}> {/* 결과 페이지 디자인 CSS의 container 클래스 사용 */}
        <h1>결과 로딩 중...</h1>
        <p>잠시만 기다려 주세요.</p>
        {/* 로딩 중에도 홈 버튼을 표시하여 사용자가 페이지를 벗어날 수 있게 함 */}
        <button className={styles.homeButton} onClick={goToHome}>
            처음으로 돌아가기
        </button>
      </div>
    );
  }

  // ***** 오류 발생 시 UI 표시 *****
  if (error) {
    return (
      <div className={styles.container}> {/* 결과 페이지 디자인 CSS의 container 클래스 사용 */}
        <h1>오류 발생</h1>
        <p>{error}</p> {/* 오류 메시지 표시 */}
        {/* 오류 발생 시에도 홈 버튼 제공 */}
        <button className={styles.homeButton} onClick={goToHome}>
          처음으로 돌아가기
        </button>
      </div>
    );
  }

  // ***** 결과 표시 UI (점수 데이터가 성공적으로 로드된 경우) *****
  // mokaResults 상태가 null이 아니고 오류도 없을 때 이 부분이 렌더링됩니다.
  return (
    <div className={styles.container}> {/* 결과 페이지 디자인 CSS의 container 클래스 사용 */}
      {/* 1. 제일 위쪽에 검은색 중간크기 글씨로 "My MBTI-MOKA Type?" */}
      <h2 className={styles.subtitle}>My MBTI-MOKA Type?</h2>

      {/* 2. 그 아래에 최종결과를 진한파란색 큰글씨로 표기 */}
      {mokaResults && (
        <h1 className={styles.finalType}>{mokaResults.combinedType}</h1>
      )}

      {/* 4. 내가 받은 8개 유형의 평가에 대한 간단한 설명 */}
      {mokaResults && (
        <div className={styles.descriptionContainer}>
          {dichotomies.map(dichotomy => ( // Iterate over the dichotomies array
            <div key={dichotomy.name} className={styles.descriptionItem}>
              <h3 className={styles.descriptionTitle}>
                {dichotomy.name === 'EI' && '에너지의 방향 (외향/내향)'}
                {dichotomy.name === 'SN' && '정보 인식 방식 (감각/직관)'}
                {dichotomy.name === 'TF' && '의사결정 방식 (사고/감정)'}
                {dichotomy.name === 'JP' && '생활 양식 (판단/인식)'}
                {dichotomy.name === 'MB' && '관계 및 리더십 스타일 (주도/협력)'}
                {dichotomy.name === 'OU' && '유머 및 자기 비판 (개방/신중)'}
                {dichotomy.name === 'KR' && '감정 표현 방식 (표현/절제)'}
                {dichotomy.name === 'AY' && '자기 인식 및 매력 (자신감/불안)'}
              </h3>
              {/* Display the pole and its percentage */}
              <p className={styles.percentageLine}>
                <strong>{mokaResults.percentages[dichotomy.name].pole}</strong> {mokaResults.percentages[dichotomy.name].percentage}%
              </p>
              <p className={styles.descriptionText} dangerouslySetInnerHTML={{ __html: mokaResults.descriptions[dichotomy.name] }}></p>
            </div>
          ))}
        </div>
      )}

      {/* 홈으로 돌아가기 버튼 */}
      <button className={styles.homeButton} onClick={goToHome}> {/* 홈 버튼 스타일 및 클릭 이벤트 적용 */}
        처음으로 돌아가기
      </button>
    </div>
  );
}
