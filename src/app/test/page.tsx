// src/app/test/page.tsx

"use client"; // This file is a client component, necessary for hooks like useState, useEffect, useRouter.

// This page depends on URL query parameters, so we force it to be dynamically rendered
// on every request, rather than prerendered at build time.
export const dynamic = 'force-dynamic'; // This line ensures dynamic rendering.

import React, { useState, useEffect } from 'react'; // Import React hooks for state and side effects.
import { useSearchParams, useRouter } from 'next/navigation'; // Import Next.js App Router hooks for URL parameters and navigation.
import styles from './test.module.css'; // Import CSS module for styling specific to this page.

// Import MOKA test question data and its type definition.
// The path '../../data/mokaData' assumes 'src/data' is a sibling directory to 'src/app'.
import { mokaQuestions, MokaQuestion } from '../../data/mokaData'; // Import the questions array and the MokaQuestion type.


// Define labels for the 7-point scale answer options. This data is best defined outside the component function.
const scaleLabels = [
    { value: 7, text_ko: "Yes++", text_en: "Strongly Agree", colorClass: styles.buttonColor7 },
    { value: 6, text_ko: "Yes+", text_en: "Agree", colorClass: styles.buttonColor6 },
    { value: 5, text_ko: "Yes", text_en: "Slightly Agree", colorClass: styles.buttonColor5 },
    { value: 4, text_ko: "Mid", text_en: "Neutral", colorClass: styles.buttonColor4 },
    { value: 3, text_ko: "No", text_en: "Slightly Disagree", colorClass: styles.buttonColor3 },
    { value: 2, text_ko: "No+", text_en: "Disagree", colorClass: styles.buttonColor2 },
    { value: 1, text_ko: "No++", text_en: "Strongly Disagree", colorClass: styles.buttonColor1 },
];


// ***** MOKA Test Score Calculation Logic Function *****
// This function takes an array of user answers and the full question data,
// then applies the scoring rules from each question to calculate total scores for all 8 dimensions (16 poles).
const calculateMokaScores = (
    userAnswers: { questionId: number; answer: number }[], // Array of user answers (objects with questionId and answer value).
    questions: MokaQuestion[] // Array of all MokaQuestion objects.
): { [pole: string]: number } => { // Returns an object where keys are pole names (strings) and values are total scores (numbers).
    console.log("Calculating MOKA Scores..."); // Log to console when score calculation starts.

    // Initialize scores for all 16 poles of MOKA's 8 dimensions to zero.
    const scores: { [pole: string]: number } = {
        E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
        M: 0, B: 0, O: 0, U: 0, K: 0, R: 0, A: 0, Y: 0
    };

    // Iterate through each user answer to apply scoring logic.
    userAnswers.forEach(userAnswer => {
        // Find the corresponding question data from the full questions array using the questionId.
        const question = questions.find(q => q.id === userAnswer.questionId);

        // If the question data exists and has scoring rules:
        if (question && question.scoring) {
            // Iterate through each scoring rule defined for the current question.
            question.scoring.forEach(scoreInfo => {
                const pole = scoreInfo.pole; // The pole affected by this scoring rule (e.g., 'E' or 'M').
                const polarity = scoreInfo.polarity; // How the user's answer value is reflected ('positive' or 'negative').
                const answerValue = userAnswer.answer; // The user's answer value (1-7).
                const weight = scoreInfo.weight ?? 1; // The weight for this scoring rule (defaults to 1 if not specified).

                let scoreContribution = 0; // Variable to calculate how much this answer contributes to the pole's score.

                // Calculate score contribution based on polarity.
                if (polarity === 'positive') {
                    // 'positive': Higher answer value means stronger inclination towards this pole, so add answer value directly.
                    scoreContribution = answerValue;
                } else if (polarity === 'negative') {
                    // 'negative': Lower answer value means stronger inclination towards this pole, so reverse the answer value (1 becomes 7, 7 becomes 1).
                    scoreContribution = (7 - answerValue) + 1;
                }

                // Add the calculated score contribution (multiplied by weight) to the total score for the relevant pole.
                // Safely update the score only if the pole exists in the scores object.
                if (scores[pole] !== undefined) {
                    scores[pole] += scoreContribution * weight;
                } else {
                    // Warn if an invalid pole name is encountered (indicates a potential typo in mokaData.ts).
                    console.warn(`Tried to score for an unknown pole: ${pole}. Check mokaData.ts MokaScoring definitions.`);
                }
            });
        } else {
            // Warn if a question ID from user answers is not found or lacks scoring info.
            console.warn(`Question with ID ${userAnswer.questionId} not found or missing scoring info.`);
        }
    });

    // Return the final scores object after processing all user answers.
    return scores;
};


// ***** Moka Test Page Function Component Definition *****
// This is the main component that Next.js will render when navigating to '/test'.
export default function MokaTestPage() {
    // ***** State Variables (can only be used in "use client" components) *****
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Index of the current question to display.
    const [userAnswers, setUserAnswers] = useState<{ questionId: number; answer: number }[]>([]); // Array to store all user answers.
    const [filteredQuestions, setFilteredQuestions] = useState<MokaQuestion[]>([]); // List of questions selected for the current test.
    const [loadingQuestions, setLoadingQuestions] = useState(true); // Loading state for questions.

    // ***** Hooks for Routing and URL Parameters *****
    const router = useRouter();
    const searchParams = useSearchParams();

    // ***** useEffect Hook: Reads question IDs from URL and filters questions *****
    useEffect(() => {
        const questionIdsParam = searchParams.get('ids'); // Get the 'ids' parameter value from the URL.

        if (questionIdsParam) {
            try {
                const ids = questionIdsParam.split(',').map(Number); // Convert comma-separated string to an array of numbers.
                const questionsToUse = mokaQuestions.filter(q => ids.includes(q.id)); // Filter questions from the full list.
                setFilteredQuestions(questionsToUse); // Set the filtered questions to state.
                setLoadingQuestions(false); // Mark loading as complete.
            } catch (e) {
                console.error("Failed to parse question IDs from URL:", e);
                // Handle parsing errors, e.g., redirect to home.
                setLoadingQuestions(false);
            }
        } else {
            // If 'ids' parameter is missing (e.g., direct access to /test), redirect to home.
            console.warn("No 'ids' parameter found in URL. Redirecting to home.");
            router.push('/');
        }
    }, [searchParams, router]); // Re-run this effect when searchParams or router changes.


    // ***** handleAnswerSelect Function Definition *****
    // This function is called when a user clicks an answer button (1-7 scale).
    const handleAnswerSelect = (answerValue: number) => {
        // Prevent action if no questions are loaded or current question is invalid.
        if (!filteredQuestions.length || !filteredQuestions[currentQuestionIndex]) {
            console.error("No current question to answer.");
            return;
        }

        // Create an object to store the current user's answer.
        const currentQuestion = filteredQuestions[currentQuestionIndex];
        const newUserAnswer = {
            questionId: currentQuestion.id, // Current question's unique ID.
            answer: answerValue, // User's selected answer value (1 to 7).
        };

        // Update the overall list of user answers.
        const updatedAnswers = [...userAnswers, newUserAnswer];
        setUserAnswers(updatedAnswers);

        console.log(`Question ${currentQuestion.id} Answered: ${answerValue}`);

        // Move to the next question or complete the test if it's the last question.
        if (currentQuestionIndex < filteredQuestions.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            }, 300); // Small delay for visual feedback.
        } else {
            // ***** Test Completion Logic *****
            console.log("✅ MOKA Test Completed!");
            console.log("Total User Answers:", updatedAnswers);

            // Calculate MOKA scores using all user answers and full question data.
            const mokaScores = calculateMokaScores(updatedAnswers, mokaQuestions);
            console.log("Calculated MOKA Scores:", mokaScores);

            // Prepare score data for passing to the results page via URL query.
            const resultDataForQuery = JSON.stringify(mokaScores);

            // Navigate to the results page.
            router.push(`/results?scores=${encodeURIComponent(resultDataForQuery)}`);
        }
    };


    // ***** Loading UI *****
    if (loadingQuestions) {
        return (
            <div className={styles.container}>
                <h1>테스트 문항 로딩 중...</h1>
                <p>잠시만 기다려 주세요.</p>
                <button className={styles.homeButton} onClick={() => router.push('/')}>
                    처음으로 돌아가기
                </button>
            </div>
        );
    }

    // ***** UI for when no questions are found or loaded *****
    if (!filteredQuestions.length) {
        return (
            <div className={styles.container}>
                <h1>테스트 문항을 찾을 수 없습니다.</h1>
                <p>올바른 테스트 경로로 접속했는지 확인하거나, 개발자에게 문의해주세요.</p>
                <button className={styles.homeButton} onClick={() => router.push('/')}>
                    처음으로 돌아가기
                </button>
            </div>
        );
    }

    // ***** Get the current question to display *****
    const currentQuestion = filteredQuestions[currentQuestionIndex];

    // ***** Main UI for the test in progress *****
    return (
        // React Fragment to group elements without adding extra DOM nodes.
        <> {/* React Fragment use start */}
            {/*
                In App Router, <head> elements (like <title>, <meta description>) are typically managed
                in app/layout.tsx for global settings or in a head.tsx file within the route segment.
                Directly including them in page.tsx's return statement is not recommended.
            */}

            {/* Main container for the test page, styled by test.module.css. */}
            <div className={styles.container}>

                {/* Displays current question number out of total questions. */}
                <h1 className={styles.questionCounter}>질문 {currentQuestionIndex + 1} / {filteredQuestions.length}</h1>

                {/* Box to display question content. */}
                <div className={styles.questionBox}>
                    {/* English text of the question, rendered only if it exists. */}
                    {currentQuestion.text_en && <p className={styles.englishText}>{currentQuestion.text_en}</p>}
                    {/* Korean text of the question. */}
                    <p className={styles.koreanText}>{currentQuestion.text_ko}</p>
                </div>

                {/* Container for answer selection buttons. */}
                <div className={styles.buttonContainer}>
                    {/* Dynamically render answer buttons for the 7-point scale. */}
                    {scaleLabels.map((labelInfo) => (
                        <button
                            key={labelInfo.value} // Unique key for list items.
                            onClick={() => handleAnswerSelect(labelInfo.value)} // Call handler on click.
                            className={`${styles.testButton} ${labelInfo.colorClass}`} // Apply base and color styles.
                        >
                            {labelInfo.text_ko} {/* Display Korean label on the button. */}
                        </button>
                    ))}
                </div>

                {/* TODO: Add a progress bar or similar to show test completion status to the user. */}

            </div> {/* End of .container div */}
        </>
    ); // End of JSX for valid current question.

} // End of MokaTestPage function component definition.

// scaleLabels array and calculateMokaScores function are defined before the MokaTestPage component.
