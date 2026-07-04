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
    } = usePractice();

    const [inputValue, setInputValue] = useState<string>("");
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // === INISIALISASI ===
    useEffect(() => {
        if (!isInitialized && operation !== null) {
            try {
                const validTime = typeof timeLimit === "number" && timeLimit > 0 ? timeLimit : 10;

                const qs = generateQuestions(operation, numOperands, difficulty, rootValue, 60);
                setQuestions(qs);
                setCurrentIndex(0);
                setCorrectCount(0);
                setWrongCount(0);
                setTotalCount(0);
                setTimeLeft(validTime);
                setIsRunning(true);
                setIsAnswered(false);
                setFeedback({ message: "", type: "" });
                setInputValue("");
                setIsInitialized(true);
            } catch (error) {
                console.error("Gagal generate soal:", error);
                setFeedback({ message: "Terjadi error saat memuat soal", type: "wrong" });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInitialized, operation]);

    // === TIMER ===
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning, timeLeft]);

    // === AUTO FOCUS ===
    useEffect(() => {
        if (inputRef.current && !isAnswered && isRunning) {
            inputRef.current.focus();
        }
    }, [currentIndex, isAnswered, isRunning]);

    const currentQuestion = questions[currentIndex];

    // === JAWAB ===
    const handleAnswer = () => {
        if (!isRunning || isAnswered || !currentQuestion) return;
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

    // === AKHIRI LATIHAN ===
    const endPractice = () => {
        setIsRunning(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setScreen("results");
    };

    // === KELUAR (dengan modal) ===
    const handleQuit = () => {
        if (isRunning) {
            // Buka modal konfirmasi
            setShowConfirmModal(true);
        } else {
            // Kalau gak running, langsung keluar
            resetPracticeState();
            setIsInitialized(false);
            setScreen("menu");
        }
    };

    // === KONFIRMASI KELUAR ===
    const confirmQuit = () => {
        setShowConfirmModal(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        resetPracticeState();
        setIsInitialized(false);
        setScreen("menu");
    };

    // === BATALKAN KELUAR ===
    const cancelQuit = () => {
        setShowConfirmModal(false);
        // Fokus balik ke input
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

    return (
        <>
            {/* Modal Konfirmasi */}
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