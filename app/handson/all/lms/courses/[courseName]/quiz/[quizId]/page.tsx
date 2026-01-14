"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchQuiz, fetchQuestionDetails, checkAnswer, fetchQuizSummary, fetchQuizAttempts } from "@/app/actions/handson/all/lms/quiz/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const quizName = decodeURIComponent(params.quizId as string);
    const courseName = decodeURIComponent(params.courseName as string);

    // Quiz State
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(-1); // -1 = Start Screen
    const [questions, setQuestions] = useState<any[]>([]);

    // Active Question State
    const [currentQuestionDetails, setCurrentQuestionDetails] = useState<any>(null);
    const [selectedOptions, setSelectedOptions] = useState<number[]>([0, 0, 0, 0]); // 0=unchecked, 1=checked
    const [showAnswers, setShowAnswers] = useState<any[]>([]); // Result of check_answer
    const [questionLoading, setQuestionLoading] = useState(false);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    // Submission State
    const [submitted, setSubmitted] = useState(false);
    const [summary, setSummary] = useState<any>(null);
    const [attempts, setAttempts] = useState<any[]>([]);

    useEffect(() => {
        loadQuiz();
    }, [quizName]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        submitQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    async function loadQuiz() {
        setLoading(true);
        try {
            const data = await fetchQuiz(quizName);
            if (data) {
                setQuiz(data);
                setQuestions(data.questions || []);
                if (data.duration) setTimeLeft(data.duration * 60);

                // Fetch attempts
                const attemptsData = await fetchQuizAttempts(quizName);
                if (attemptsData) setAttempts(attemptsData);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load quiz");
        } finally {
            setLoading(false);
        }
    }

    async function startQuiz() {
        setActiveQuestionIndex(0);
        setTimerActive(!!quiz.duration);
        loadQuestion(0);
    }

    async function loadQuestion(index: number) {
        if (index >= questions.length || index < 0) return;

        setQuestionLoading(true);
        try {
            const q = questions[index];
            const details = await fetchQuestionDetails(q.question);
            if (details) {
                setCurrentQuestionDetails(details);
                // Reset Selection
                setSelectedOptions([0, 0, 0, 0]);
                setShowAnswers([]);
            }
        } catch (err) {
            toast.error("Failed to load question");
        } finally {
            setQuestionLoading(false);
        }
    }

    function handleOptionSelect(optionIndex: number) { // 0-based index
        if (showAnswers.length > 0) return; // Already checked

        const newSelection = [...selectedOptions];
        if (currentQuestionDetails?.multiple) {
            // Toggle
            newSelection[optionIndex] = newSelection[optionIndex] ? 0 : 1;
        } else {
            // Radio behavior
            newSelection.fill(0);
            newSelection[optionIndex] = 1;
        }
        setSelectedOptions(newSelection);
    }

    async function handleCheckAnswer() {
        const answers = getAnswers();
        if (answers.length === 0) {
            toast.warning("Please select an answer");
            return;
        }

        try {
            const result = await checkAnswer(
                currentQuestionDetails.name, // Should usually be the question name or ID
                currentQuestionDetails.type,
                answers
            );

            // Result is array of 0 (wrong), 1 (correct), 2 (partial/missing) matching option indices
            // Or single value if text input.
            // Simplified handling for 'Choices' type:
            if (currentQuestionDetails.type === 'Choices') {
                // Map result back to UI state
                // Note: Implementation may need refinement based on exact API response format
                // Assuming result is array matching options count
                setShowAnswers(result);
            } else {
                // Handle text input result
                setShowAnswers([result]);
            }

        } catch (err) {
            toast.error("Error checking answer");
        }
    }

    function getAnswers() {
        const ans: string[] = [];
        if (currentQuestionDetails?.type === 'Choices') {
            selectedOptions.forEach((isSelected, idx) => {
                if (isSelected) {
                    ans.push(currentQuestionDetails[`option_${idx + 1}`]);
                }
            });
        }
        return ans;
    }

    async function handleNext() {
        if (activeQuestionIndex < questions.length - 1) {
            const nextIdx = activeQuestionIndex + 1;
            setActiveQuestionIndex(nextIdx);
            loadQuestion(nextIdx);
        } else {
            submitQuiz();
        }
    }

    async function submitQuiz() {
        setTimerActive(false);
        setSubmitted(true);
        try {
            const summaryData = await fetchQuizSummary(quizName);
            setSummary(summaryData);
            toast.success("Quiz Submitted");
        } catch (err) {
            toast.error("Error submitting quiz");
        }
    }

    function formatTime(seconds: number) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // --- RENDER ---

    if (loading) return <div className="p-10"><Skeleton className="h-96 w-full" /></div>;

    if (!quiz) return <div className="p-10 text-center">Quiz not found</div>;

    // 1. Result Screen
    if (submitted && summary) {
        return (
            <div className="container max-w-2xl py-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-3xl">Quiz Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-center">
                        <div className="text-lg">
                            Score: <span className="font-bold">{summary.score}</span> / {summary.score_out_of}
                        </div>
                        <div className="text-4xl font-bold text-primary">
                            {Math.ceil(summary.percentage)}%
                        </div>
                        <p className="text-muted-foreground">
                            {summary.percentage >= (quiz.passing_percentage || 50) ? "Congratulations! You passed." : "Keep practicing."}
                        </p>
                    </CardContent>
                    <CardFooter className="justify-center gap-4">
                        <Button onClick={() => window.location.reload()}>Try Again</Button>
                        <Button variant="outline" onClick={() => router.back()}>Back to Course</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // 2. Start Screen
    if (activeQuestionIndex === -1) {
        return (
            <div className="container max-w-2xl py-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>{questions.length} Questions</p>
                        {quiz.duration && <p>Time limit: {quiz.duration} minutes</p>}
                        <p>{quiz.introduction || "Complete the quiz to test your knowledge."}</p>

                        {attempts.length > 0 && (
                            <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-2">Previous Attempts</h4>
                                {attempts.map((att: any, i) => (
                                    <div key={i} className="flex justify-between text-sm py-1">
                                        <span>Attempt {att.idx}</span>
                                        <span className={att.percentage >= quiz.passing_percentage ? "text-green-600" : "text-red-500"}>
                                            {Math.round(att.percentage)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" onClick={startQuiz}>Start Quiz</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // 3. Question Screen
    return (
        <div className="container max-w-3xl py-10 space-y-6">
            {/* Header / Timer */}
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="font-medium">
                    Question {activeQuestionIndex + 1} of {questions.length}
                </div>
                {quiz.duration && (
                    <div className="flex items-center gap-2 font-mono text-lg text-orange-600">
                        <Clock className="h-5 w-5" />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {/* Question Card */}
            <Card>
                <CardContent className="pt-6 space-y-6">
                    {questionLoading || !currentQuestionDetails ? (
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : (
                        <>
                            {/* Question Text */}
                            <div
                                className="text-lg font-medium leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: currentQuestionDetails.question }}
                            />

                            {/* Options */}
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((idx) => {
                                    const optionText = currentQuestionDetails[`option_${idx}`];
                                    if (!optionText) return null;

                                    const isSelected = selectedOptions[idx - 1] === 1;
                                    const answerStatus = showAnswers[idx - 1]; // 1=correct, 0=wrong

                                    let borderClass = "border-transparent";
                                    let bgClass = "bg-muted/40 hover:bg-muted/60";

                                    // Visual Feedback
                                    if (showAnswers.length > 0) {
                                        if (answerStatus === 1) { // This option is correct
                                            borderClass = "border-green-500 bg-green-50";
                                            bgClass = "bg-green-50";
                                        } else if (answerStatus === 0 && isSelected) { // User picked wrong
                                            borderClass = "border-red-500 bg-red-50";
                                            bgClass = "bg-red-50";
                                        }
                                    } else if (isSelected) {
                                        borderClass = "border-primary";
                                        bgClass = "bg-primary/5";
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => handleOptionSelect(idx - 1)}
                                            className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${borderClass} ${bgClass}`}
                                        >
                                            <div className="mt-0.5">
                                                {isSelected ? (
                                                    <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                                                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                                                    </div>
                                                ) : (
                                                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div dangerouslySetInnerHTML={{ __html: optionText }} />
                                                {/* Explanation if answered */}
                                                {showAnswers.length > 0 && currentQuestionDetails[`explanation_${idx}`] && (
                                                    <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                                                        {currentQuestionDetails[`explanation_${idx}`]}
                                                    </div>
                                                )}
                                            </div>
                                            {showAnswers.length > 0 && answerStatus === 1 && <CheckCircle className="h-5 w-5 text-green-500" />}
                                            {showAnswers.length > 0 && answerStatus === 0 && isSelected && <XCircle className="h-5 w-5 text-red-500" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </CardContent>
                <CardFooter className="justify-between border-t p-6">
                    <Button variant="ghost" disabled={activeQuestionIndex === 0} onClick={() => {
                        setActiveQuestionIndex(prev => prev - 1);
                        loadQuestion(activeQuestionIndex - 1);
                    }}>
                        Back
                    </Button>

                    <div className="flex gap-2">
                        {quiz.show_answers && showAnswers.length === 0 && (
                            <Button variant="secondary" onClick={handleCheckAnswer}>Check Answer</Button>
                        )}
                        <Button onClick={handleNext}>
                            {activeQuestionIndex === questions.length - 1 ? "Finish" : "Next"}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
