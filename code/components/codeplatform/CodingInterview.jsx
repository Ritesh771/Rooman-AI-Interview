import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import CodeEditor from "./CodeEditor";
import { executeCode } from "@/code/utils/codeplatform/api";
import "@/code/styles/coding-interview.css";

const CodingInterview = ({ interviewData, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [testResults, setTestResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null); // Will be set based on number of challenges
    const [totalTime, setTotalTime] = useState(null); // Store total time for progress bar
    const [scores, setScores] = useState([]);
    const [roomId, setRoomId] = useState("interview-" + Date.now());
    
    const editorRef = useRef(null);
    const manualInputRef = useRef("");
    const currentChallenge = interviewData.challenges[currentQuestionIndex];
    
    // Set initial time based on number of challenges (8 minutes per challenge)
    useEffect(() => {
        if (interviewData && interviewData.challenges) {
            const numChallenges = interviewData.challenges.length;
            const totalTime = numChallenges * 8 * 60; // 8 minutes per challenge in seconds
            setTimeLeft(totalTime);
            setTotalTime(totalTime);
        }
    }, [interviewData]);
    
    const timerRef = useRef(null);
    const hasStartedTimer = useRef(false);
    
    // Start timer when timeLeft is first set to a positive value
    useEffect(() => {
        if (timeLeft && timeLeft > 0 && !hasStartedTimer.current) {
            hasStartedTimer.current = true;

            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (!prev || prev <= 1) {
                        completeInterview();
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    }, [timeLeft]); // Depend on timeLeft to start when it becomes positive

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);
    
    // Format time for display
    const formatTime = (seconds) => {
        if (!seconds || seconds <= 0) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const normalizeOutput = (value) => {
        if (value === null || value === undefined) return "";
        return value.toString().replace(/\r/g, "").trim();
    };

    const runManualExecution = async (code, language, stdin) => {
        if (stdin !== undefined) {
            manualInputRef.current = stdin;
        }
        setIsRunning(true);
        setTestResults([]);
        
        try {
            const result = await executeCode(language, code, stdin);
            const actualOutput = normalizeOutput(result.run.stdout || result.run.output);

            setTestResults([
                {
                    label: "Manual Run",
                    testCaseIndex: 0,
                    input: manualInputRef.current || "(stdin empty)",
                    expectedOutput: null,
                    actualOutput: actualOutput || "(empty)",
                    passed: !result.run.stderr,
                    error: result.run.stderr || null,
                },
            ]);
        } catch (error) {
            console.error("Manual execution error:", error);
            setTestResults([
                {
                    label: "Manual Run",
                    testCaseIndex: 0,
                    input: manualInputRef.current || "(stdin empty)",
                    expectedOutput: null,
                    actualOutput: "Manual execution failed",
                    passed: false,
                    error: error.message || "Unknown error",
                },
            ]);
        } finally {
            setIsRunning(false);
        }
    };

    // Run code against sample test cases
    const runSampleTests = async (code, language) => {
        setIsRunning(true);
        setTestResults([]);
        
        try {
            // Execute the code with the first sample test case input
            const testCase = currentChallenge.sampleTestCases[0];
            
            const result = await executeCode(language, code, testCase.input);
            const actualOutput = normalizeOutput(result.run.stdout || result.run.output);
            const expectedOutput = normalizeOutput(testCase.output);
            const passed = !result.run.stderr && actualOutput === expectedOutput;
            
            const results = [
                {
                    testCaseIndex: 0,
                    input: testCase.input,
                    expectedOutput: expectedOutput,
                    actualOutput: actualOutput || "(empty)",
                    passed,
                    error: result.run.stderr || null,
                },
            ];
            
            setTestResults(results);
        } catch (error) {
            console.error("Error executing code:", error);
            setTestResults([{
                testCaseIndex: 0,
                input: currentChallenge.sampleTestCases[0].input,
                expectedOutput: currentChallenge.sampleTestCases[0].output,
                actualOutput: "Error occurred during execution",
                passed: false,
                error: error.message || "Unknown error"
            }]);
        } finally {
            setIsRunning(false);
        }
    };
    
    // Submit code for evaluation
    const submitCode = async (code, language) => {
        setIsRunning(true);
        setTestResults([]);
        
        try {
            // In a real implementation, this would evaluate against all test cases
            // For now, we'll simulate evaluation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate scoring
            const score = Math.floor(Math.random() * 40) + 60; // 60-100 for demo
            const newScores = [...scores];
            newScores[currentQuestionIndex] = score;
            setScores(newScores);
            
            // Move to next question or complete interview
            if (currentQuestionIndex < interviewData.challenges.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                completeInterview();
            }
        } catch (error) {
            console.error("Error submitting code:", error);
            setTestResults([{
                testCaseIndex: 0,
                input: "N/A",
                expectedOutput: "N/A",
                actualOutput: "Error occurred during submission",
                passed: false,
                error: error.message || "Unknown error"
            }]);
        } finally {
            setIsRunning(false);
        }
    };
    
    // Complete the interview
    const completeInterview = () => {
        // Don't complete if no questions have been attempted
        if (scores.length === 0) {
            console.log("Interview completion prevented - no questions attempted yet");
            return;
        }
        
        const totalScore = scores.reduce((sum, score) => sum + (score || 0), 0);
        const averageScore = scores.length > 0 ? Math.round(totalScore / scores.length) : 0;
        const passed = averageScore >= 70;
        
        if (onComplete) {
            onComplete({
                scores,
                averageScore,
                passed,
                totalScore
            });
        }
    };
    
    // Navigate to specific question
    const goToQuestion = (index) => {
        if (index >= 0 && index < interviewData.challenges.length) {
            setCurrentQuestionIndex(index);
            setTestResults([]);
        }
    };
    
    // Get difficulty color
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "Easy": return "coding-interview-difficulty-easy";
            case "Medium": return "coding-interview-difficulty-medium";
            case "Hard": return "coding-interview-difficulty-hard";
            default: return "text-gray-600 bg-gray-100";
        }
    };
    
    return (
        <div className="coding-interview-shell min-h-screen bg-slate-50 overflow-y-auto">
            <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col">
                {/* Header */}
                <div className="coding-interview-header flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-slate-500">
                            Live Coding Interview
                        </p>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {interviewData.title}
                        </h1>
                        <p className="text-sm text-slate-500">
                            Question {currentQuestionIndex + 1} of{" "}
                            {interviewData.challenges.length}
                        </p>
                    </div>
                    <div className="flex items-end gap-4">
                        <div className="text-right">
                            <p className="text-xs text-slate-500">Time Remaining</p>
                            <p className="text-3xl font-bold text-rose-500">
                                {formatTime(timeLeft)}
                            </p>
                            <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-rose-500 transition-all"
                                    style={{
                                        width: `${
                                            totalTime ? ((totalTime - timeLeft) / totalTime) * 100 : 0
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="hidden lg:block text-right text-sm text-slate-500">
                            <p>Room ID</p>
                            <p className="font-mono text-xs text-slate-900">
                                {roomId}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="coding-interview-body flex flex-1 flex-col gap-6 px-4 pb-10 pt-4 lg:pt-6">
                    <div className="grid flex-1 gap-6 min-h-[720px] lg:grid-cols-[1.05fr,1fr]">
                        {/* Question Panel */}
                        <section className="coding-interview-question-card flex min-h-[420px] flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
                            <div className="flex items-start justify-between border-b px-6 py-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        {currentChallenge.title}
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Review the prompt and sample cases before you
                                        begin coding.
                                    </p>
                                </div>
                                <span
                                    className={`coding-interview-difficulty-pill ${getDifficultyColor(
                                        currentChallenge.difficulty
                                    )}`}
                                >
                                    {currentChallenge.difficulty}
                                </span>
                            </div>
                            <div className="coding-interview-scrollarea flex-1 overflow-y-auto px-6 py-6">
                                <div className="space-y-6 text-slate-700">
                                    <div>
                                        <h3 className="coding-interview-section-title">
                                            Description
                                        </h3>
                                        <p>{currentChallenge.description}</p>
                                    </div>
                                    <div>
                                        <h3 className="coding-interview-section-title">
                                            Input Format
                                        </h3>
                                        <p>{currentChallenge.inputFormat}</p>
                                    </div>
                                    <div>
                                        <h3 className="coding-interview-section-title">
                                            Output Format
                                        </h3>
                                        <p>{currentChallenge.outputFormat}</p>
                                    </div>
                                    <div>
                                        <h3 className="coding-interview-section-title">
                                            Constraints
                                        </h3>
                                        <p>{currentChallenge.constraints}</p>
                                    </div>
                                    <div>
                                        <h3 className="coding-interview-section-title">
                                            Sample Test Cases
                                        </h3>
                                        <div className="space-y-4">
                                            {currentChallenge.sampleTestCases.map(
                                                (testCase, index) => (
                                                    <div
                                                        key={index}
                                                        className="coding-interview-test-case space-y-4 rounded-xl border bg-slate-50 p-4"
                                                    >
                                                        <div className="grid gap-4 lg:grid-cols-2">
                                                            <div>
                                                                <p className="coding-interview-micro-label">
                                                                    Input
                                                                </p>
                                                                <pre className="coding-interview-pre">
                                                                    {testCase.input}
                                                                </pre>
                                                            </div>
                                                            <div>
                                                                <p className="coding-interview-micro-label">
                                                                    Output
                                                                </p>
                                                                <pre className="coding-interview-pre">
                                                                    {testCase.output}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Editor + Results */}
                        <section className="coding-interview-right grid grid-rows-[minmax(480px,1fr)_minmax(220px,0.45fr)] gap-4">
                        <CodeEditor 
                            roomId={roomId} 
                            ref={editorRef}
                            onRun={runManualExecution}
                            onSubmit={submitCode}
                            isRunning={isRunning}
                        />

                            <div className="coding-interview-results-card rounded-2xl border bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b px-5 py-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            Sample Test Results
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Run tests to validate your solution
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            runSampleTests(
                                                editorRef.current?.getCode() || "",
                                                editorRef.current?.getLanguage() ||
                                                    "javascript"
                                            )
                                        }
                                        disabled={isRunning}
                                    >
                                        {isRunning ? "Running..." : "Run Tests"}
                                    </Button>
                                </div>
                                <div className="coding-interview-scrollbar h-full overflow-y-auto px-5 py-4">
                                    {testResults.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                            No results yet. Click “Run” to execute the
                                            sample tests.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {testResults.map((result, index) => (
                                                <div
                                                    key={index}
                                                    className="coding-interview-test-result rounded-xl border px-4 py-3"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {result.label ||
                                                                `Test Case ${result.testCaseIndex + 1}`}
                                                        </p>
                                                        <span
                                                            className={`coding-interview-status-pill ${
                                                                result.passed
                                                                    ? "pass"
                                                                    : "fail"
                                                            }`}
                                                        >
                                                            {result.passed
                                                                ? "Passed"
                                                                : "Failed"}
                                                        </span>
                                                    </div>
                                                    {result.error ? (
                                                        <div className="mt-3">
                                                            <p className="coding-interview-micro-label text-red-600">
                                                                Error
                                                            </p>
                                                            <pre className="coding-interview-pre error">
                                                                {result.error}
                                                            </pre>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={`mt-3 grid gap-3 ${
                                                                result.expectedOutput
                                                                    ? "sm:grid-cols-2"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <div>
                                                                <p className="coding-interview-micro-label">
                                                                    Input
                                                                </p>
                                                                <pre className="coding-interview-pre">
                                                                    {result.input}
                                                                </pre>
                                                            </div>
                                                            {result.expectedOutput && (
                                                                <div>
                                                                    <p className="coding-interview-micro-label">
                                                                        Expected Output
                                                                    </p>
                                                                    <pre className="coding-interview-pre">
                                                                        {result.expectedOutput}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {result.actualOutput && (
                                                        <div className="mt-3">
                                                            <p className="coding-interview-micro-label">
                                                                Your Output
                                                            </p>
                                                            <pre className="coding-interview-pre">
                                                                {result.actualOutput}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Question Navigation */}
                    <div className="coding-interview-navigation rounded-2xl border bg-white px-5 py-4 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-wrap gap-2">
                                {interviewData.challenges.map((_, index) => (
                                    <Button
                                        key={index}
                                        size="sm"
                                        variant={
                                            index === currentQuestionIndex
                                                ? "default"
                                                : "outline"
                                        }
                                        onClick={() => goToQuestion(index)}
                                        className="h-9 w-9 p-0"
                                    >
                                        {index + 1}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        goToQuestion(
                                            Math.max(0, currentQuestionIndex - 1)
                                        )
                                    }
                                    disabled={currentQuestionIndex === 0}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        goToQuestion(
                                            Math.min(
                                                interviewData.challenges.length - 1,
                                                currentQuestionIndex + 1
                                            )
                                        )
                                    }
                                    disabled={
                                        currentQuestionIndex ===
                                        interviewData.challenges.length - 1
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodingInterview;