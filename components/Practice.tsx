"use client";

import { usePractice } from "@/contexts/PracticeContext";
import { useEffect, useRef, useState } from "react";
import { generateQuestions } from "@/lib/questionGenerator";
import ConfirmModal from "@/components/ConfirmModal";

export default function Practice() {
    const {
        operation,
        numOperands,
        difficulty,
        rootValue,
        timeLimit,
        isSequential,
        sequenceCount,
        questions,
        setQuestions,
        currentIndex,
        setCurrentIndex,
        correctCount,
        setCorrectCount,
        wrongCount,
        setWrongCount,
        totalCount,
        setTotalCount,
        isRunning,
        setIsRunning,
        timeLeft,
        setTimeLeft,
        isAnswered,
        setIsAnswered,
        feedback,
        setFeedback,
        resetPracticeState,
        setScreen,
        setSequenceData,
    } = usePractice();

    const [inputValue, setInputValue] = useState<string>("");
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

    // State untuk sequential
    const [numbersList, setNumbersList] = useState<number[]>([]);
    const [currentSeqIndex, setCurrentSeqIndex] = useState<number>(0);
    const [showTotalInput, setShowTotalInput] = useState<boolean>(false);
    const [seqTimer, setSeqTimer] = useState<NodeJS.Timeout | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // === INISIALISASI ===
    useEffect(() => {
        if (!isInitialized && operation !== null) {
            try {
                const validTime = typeof timeLimit === "number" && timeLimit > 0 ? timeLimit : 10;

                let qs;
                if (isSequential && (operation === 1 || operation === 2)) {
                    qs = generateQuestions(operation, sequenceCount, difficulty, rootValue, 1);
                } else {
                    qs = generateQuestions(operation, numOperands, difficulty, rootValue, 60);
                }

                setQuestions(qs);
                setCurrentIndex(0);
                setCorrectCount(0);
                setWrongCount(0);
                setTotalCount(0);

                if (isSequential && (operation === 1 || operation === 2)) {
                    const numbers = (qs[0] as any)?.nums || [];
                    console.log("📋 numbersList dari qs[0]:", numbers); // <-- LOG INI
                    if (numbers.length === 0) {
                        console.error("❌ numbersList KOSONG! qs[0]:", qs[0]);
                    }
                    setNumbersList(numbers);
                    setCurrentSeqIndex(0);
                    setShowTotalInput(false);
                    setTimeLeft(validTime);
                    setIsRunning(true);
                    setIsAnswered(false);
                    setFeedback({ message: "", type: "" });
                    setInputValue("");
                    setIsInitialized(true);
                } else {
                    setTimeLeft(validTime);
                    setIsRunning(true);
                    setIsAnswered(false);
                    setFeedback({ message: "", type: "" });
                    setInputValue("");
                    setIsInitialized(true);
                }
            } catch (error) {
                console.error("Gagal generate soal:", error);
                setFeedback({ message: "Terjadi error saat memuat soal", type: "wrong" });
            }
        }
    }, [isInitialized, operation, isSequential, sequenceCount, numOperands, difficulty, rootValue, timeLimit]);

    // === TIMER SEQUENTIAL ===
    useEffect(() => {
        console.log("🔥 TIMER SEQUENTIAL RUNNING", {
            isRunning,
            isSequential,
            operation,
            currentSeqIndex,
            numbersListLength: numbersList.length,
            showTotalInput
        });

        if (!isRunning || !isSequential || (operation !== 1 && operation !== 2)) {
            console.log("⛔ Timer skipped karena kondisi false");
            return;
        }
        if (showTotalInput) {
            console.log("⛔ Timer skipped karena showTotalInput true");
            return;
        }

        const delay = 2000;
        console.log(`⏳ Set timeout ${delay}ms untuk index ${currentSeqIndex}`);

        const timer = setTimeout(() => {
            const nextIndex = currentSeqIndex + 1;
            console.log(`➡️ Next index: ${nextIndex}, total: ${numbersList.length}`);
            if (nextIndex < numbersList.length) {
                setCurrentSeqIndex(nextIndex);
            } else {
                setShowTotalInput(true);
                setFeedback({ message: "📝 Sekarang jumlahkan semua angka!", type: "" });
                if (inputRef.current) inputRef.current.focus();
            }
        }, delay);

        setSeqTimer(timer);
        return () => clearTimeout(timer);
    }, [isRunning, isSequential, operation, currentSeqIndex, numbersList.length, showTotalInput]);

    // === TIMER BIASA ===
    useEffect(() => {
        if (!isRunning || !isSequential || (operation !== 1 && operation !== 2)) return;
        if (timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft((prev) => {
                    const newTime = prev - 1;
                    if (newTime <= 0) {
                        endPractice();
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isRunning, isSequential, timeLeft]);

    // === AUTO FOCUS ===
    useEffect(() => {
        if (inputRef.current && !isAnswered && isRunning) {
            if (isSequential && !showTotalInput) return;
            inputRef.current.focus();
        }
    }, [currentIndex, isAnswered, isRunning, isSequential, showTotalInput]);

    const currentQuestion = questions[currentIndex];

    // === HANDLE ANSWER ===
    const handleAnswer = () => {
        if (!isRunning || isAnswered || !currentQuestion) return;

        // Sequential: user input total
        if (isSequential && (operation === 1 || operation === 2)) {
            const val = inputValue.trim();
            if (val === "") {
                setFeedback({ message: "⚠️ Masukkan jawaban!", type: "wrong" });
                return;
            }
            const userAnswer = parseFloat(val);
            if (isNaN(userAnswer)) {
                setFeedback({ message: "⚠️ Masukkan angka yang valid!", type: "wrong" });
                return;
            }

            const correct = Math.abs(userAnswer - currentQuestion.answer) < 0.001;
            setTotalCount((prev) => prev + 1);
            if (correct) {
                setCorrectCount((prev) => prev + 1);
                setFeedback({ message: `✅ Benar!`, type: "correct" });
            } else {
                setWrongCount((prev) => prev + 1);
                setFeedback({ message: `❌ Salah!`, type: "wrong" });
            }
            setIsAnswered(true);
            setTimeout(() => {
                endPractice(); // otomatis simpan data dan pindah ke results
            }, 1500);
            return;
        }

        // Mode biasa
        const val = inputValue.trim();
        if (val === "") {
            setFeedback({ message: "⚠️ Masukkan jawaban!", type: "wrong" });
            return;
        }
        const userAnswer = parseFloat(val);
        if (isNaN(userAnswer)) {
            setFeedback({ message: "⚠️ Masukkan angka yang valid!", type: "wrong" });
            return;
        }

        const correct = Math.abs(userAnswer - currentQuestion.answer) < 0.001;
        setTotalCount((prev) => prev + 1);
        if (correct) {
            setCorrectCount((prev) => prev + 1);
            setFeedback({ message: "✅ Benar!", type: "correct" });
        } else {
            setWrongCount((prev) => prev + 1);
            const expected =
                typeof currentQuestion.answer === "number"
                    ? currentQuestion.answer.toFixed(4).replace(/\.?0+$/, "")
                    : currentQuestion.answer;
            setFeedback({ message: `❌ Salah! Jawaban: ${expected}`, type: "wrong" });
        }
        setIsAnswered(true);

        setTimeout(() => {
            if (!isRunning) return;
            const nextIndex = currentIndex + 1;
            if (nextIndex >= questions.length) {
                endPractice();
            } else {
                setCurrentIndex(nextIndex);
                setIsAnswered(false);
                setFeedback({ message: "", type: "" });
                setInputValue("");
                if (inputRef.current) inputRef.current.focus();
            }
        }, 600);
    };

    // === END PRACTICE ===
    const endPractice = () => {
        setIsRunning(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        if (seqTimer) clearTimeout(seqTimer);

        // Simpan data sequential jika ada
        if (isSequential && (operation === 1 || operation === 2) && numbersList.length > 0 && currentQuestion) {
            setSequenceData({
                numbers: numbersList,
                answer: currentQuestion.answer,
            });
        } else {
            setSequenceData(null);
        }

        setScreen("results");
    };

    // === QUIT ===
    const handleQuit = () => {
        if (isRunning) {
            setShowConfirmModal(true);
        } else {
            resetPracticeState();
            setIsInitialized(false);
            setNumbersList([]);
            setCurrentSeqIndex(0);
            setShowTotalInput(false);
            setScreen("menu");
        }
    };

    const confirmQuit = () => {
        setShowConfirmModal(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        if (seqTimer) clearTimeout(seqTimer);
        resetPracticeState();
        setIsInitialized(false);
        setNumbersList([]);
        setCurrentSeqIndex(0);
        setShowTotalInput(false);
        setScreen("menu");
    };

    const cancelQuit = () => {
        setShowConfirmModal(false);
        if (inputRef.current) inputRef.current.focus();
    };

    // === LOADING ===
    if (!currentQuestion) {
        return (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 18, marginBottom: 20 }}>⏳ Memuat soal...</div>
                <button className="btn btn-outline" onClick={handleQuit}>
                    Kembali
                </button>
            </div>
        );
    }

    // === RENDER SEQUENTIAL ===
    if (isSequential && (operation === 1 || operation === 2)) {
        const currentNumber = numbersList[currentSeqIndex];
        const isFinished = showTotalInput;

        return (
            <>
                <ConfirmModal
                    isOpen={showConfirmModal}
                    onConfirm={confirmQuit}
                    onCancel={cancelQuit}
                    title="Keluar Latihan?"
                    message="Apakah Anda yakin ingin keluar dari latihan? Semua progres akan hilang."
                    confirmText="Ya, Keluar"
                    cancelText="Batalkan"
                />

                <div className="practice-header">
                    <div>
                        <button className="back-btn" onClick={handleQuit} style={{ marginBottom: 4 }}>
                            <span className="back-icon">✕</span> Keluar
                        </button>
                        <div className="practice-stats">
                            <span>✅ <span className="stat-value correct">{correctCount}</span></span>
                            <span>❌ <span className="stat-value wrong">{wrongCount}</span></span>
                            <span>📝 <span className="stat-value">{totalCount}</span></span>
                        </div>
                    </div>
                    <div className={`timer-display ${timeLeft <= 3 ? "warning" : ""}`}>
                        {timeLeft}
                    </div>
                </div>

                <div className="question-box" style={{ minHeight: 160 }}>
                    {!isFinished ? (
                        <>
                            <div className="question-number">
                                Angka ke-{currentSeqIndex + 1} dari {numbersList.length}
                            </div>
                            <div className="question-text" style={{ fontSize: 48, fontWeight: 700, color: "#fbbf24" }}>
                                {currentNumber}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="question-number">🧠 Jumlahkan semua angka yang tadi muncul!</div>
                            <div className="question-text" style={{ fontSize: 24, color: "#fbbf24", fontWeight: 700 }}>
                                ?
                            </div>
                            <div style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>
                                Masukkan total dari semua angka yang sudah ditampilkan
                            </div>
                        </>
                    )}
                </div>

                {isFinished && (
                    <div className="answer-area">
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9.-]*"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAnswer()}
                            placeholder="Jumlah total..."
                            disabled={!isRunning || isAnswered}
                            autoComplete="off"
                        />
                        <button className="btn btn-primary" onClick={handleAnswer} disabled={!isRunning || isAnswered}>
                            Kirim
                        </button>
                    </div>
                )}

                <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
            </>
        );
    }

    // === RENDER BIASA ===
    return (
        <>
            <ConfirmModal
                isOpen={showConfirmModal}
                onConfirm={confirmQuit}
                onCancel={cancelQuit}
                title="Keluar Latihan?"
                message="Apakah Anda yakin ingin keluar dari latihan? Semua progres akan hilang."
                confirmText="Ya, Keluar"
                cancelText="Batalkan"
            />

            <div className="practice-header">
                <div>
                    <button className="back-btn" onClick={handleQuit} style={{ marginBottom: 4 }}>
                        <span className="back-icon">✕</span> Keluar
                    </button>
                    <div className="practice-stats">
                        <span>✅ <span className="stat-value correct">{correctCount}</span></span>
                        <span>❌ <span className="stat-value wrong">{wrongCount}</span></span>
                        <span>📝 <span className="stat-value">{totalCount}</span></span>
                    </div>
                </div>
                <div className={`timer-display ${timeLeft <= 3 ? "warning" : ""}`}>
                    {timeLeft}
                </div>
            </div>

            <div className="question-box">
                <div className="question-number">Soal #{currentIndex + 1}</div>
                <div className="question-text">{currentQuestion.display}</div>
            </div>

            <div className="answer-area">
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.-]*"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnswer()}
                    placeholder="Jawaban..."
                    disabled={!isRunning || isAnswered}
                    autoComplete="off"
                />
                <button className="btn btn-primary" onClick={handleAnswer} disabled={!isRunning || isAnswered}>
                    Kirim
                </button>
            </div>
            <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
        </>
    );
}