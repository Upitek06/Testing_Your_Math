"use client";

import { usePractice } from "@/contexts/PracticeContext";
import { useEffect, useRef, useState } from "react";
import { generateQuestions } from "@/lib/questionGenerator";
import ConfirmModal from "@/components/ConfirmModal";

const discoColors = ["#f472b6", "#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#f87171", "#fb923c"];

export default function NumberDiscoPractice() {
    const {
        numberDiscoSettings,
        setIsNumberDisco,
        setScreen,
        resetPracticeState,
        correctCount, setCorrectCount,
        wrongCount, setWrongCount,
        totalCount, setTotalCount,
    } = usePractice();

    const { operations, count, delay, difficulty } = numberDiscoSettings;
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentNumber, setCurrentNumber] = useState<number | null>(null);
    const [currentOp, setCurrentOp] = useState<string>("");
    const [isFinished, setIsFinished] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [feedback, setFeedback] = useState({ message: "", type: "" });
    const [isAnswered, setIsAnswered] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [color, setColor] = useState("#fbbf24");
    const [scale, setScale] = useState(1);
    const [numbersList, setNumbersList] = useState<number[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Generate soal
    // Generate soal
    // Generate soal
    useEffect(() => {
        const op = operations[Math.floor(Math.random() * operations.length)];
        const qs = generateQuestions(op, count, difficulty, 2, 1);
        setQuestions(qs);
        const nums = (qs[0] as any)?.nums || [];
        setNumbersList(nums);
        setCurrentIndex(0);
        setCurrentNumber(nums[0] || 0);
        setCurrentOp("");
        setIsFinished(false);
        setCorrectCount(0);
        setWrongCount(0);
        setTotalCount(0);
    }, [operations, count, difficulty]); // <-- DEPENDENCY
    // Timer sequential
    useEffect(() => {
        if (!currentNumber || isFinished) return;

        const q = questions[currentIndex];
        if (!q) return;

        const nums = q.nums || [];
        const ops = q.opSymbols || [];

        const timer = setTimeout(() => {
            const nextIdx = currentIndex + 1;
            if (nextIdx < nums.length) {
                setCurrentNumber(nums[nextIdx]);
                setCurrentOp(ops[nextIdx - 1] || "");
                setCurrentIndex(nextIdx);
                setColor(discoColors[Math.floor(Math.random() * discoColors.length)]);
                setScale(0.5);
                setTimeout(() => setScale(1), 100);
            } else {
                setIsFinished(true);
                setFeedback({ message: "📝 Jumlahkan semua angka!", type: "" });
                if (inputRef.current) inputRef.current.focus();
            }
        }, delay * 1000);

        timerRef.current = timer;
        return () => clearTimeout(timer);
    }, [currentIndex, currentNumber, isFinished, questions, delay]);

    const handleAnswer = () => {
        if (!isFinished || isAnswered) return;
        const val = parseFloat(inputValue);
        if (isNaN(val)) {
            setFeedback({ message: "⚠️ Masukkan angka!", type: "wrong" });
            return;
        }
        const q = questions[0];
        const correct = Math.abs(val - q.answer) < 0.001;
        setTotalCount(prev => prev + 1);
        if (correct) {
            setCorrectCount(prev => prev + 1);
            setFeedback({ message: `✅ Benar! Jawaban: ${q.answer}`, type: "correct" });
        } else {
            setWrongCount(prev => prev + 1);
            setFeedback({ message: `❌ Salah! Jawaban: ${q.answer}`, type: "wrong" });
        }
        setIsAnswered(true);
        setTimeout(() => {
            setIsNumberDisco(false);
            resetPracticeState();
            setScreen("results");
        }, 2000);
    };

    const handleQuit = () => {
        if (isFinished) {
            setShowConfirm(true);
        } else {
            setIsNumberDisco(false);
            resetPracticeState();
            setScreen("menu");
        }
    };

    if (!currentNumber) return <div>Memuat...</div>;

    return (
        <>
            <ConfirmModal
                isOpen={showConfirm}
                onConfirm={() => {
                    setShowConfirm(false);
                    setIsNumberDisco(false);
                    resetPracticeState();
                    setScreen("menu");
                }}
                onCancel={() => setShowConfirm(false)}
                title="Keluar?"
                message="Yakin ingin keluar dari Number Disco?"
            />

            <div className="practice-header">
                <div>
                    <button className="back-btn" onClick={handleQuit}>
                        <span className="back-icon">✕</span> Keluar
                    </button>
                    <div className="practice-stats">
                        <span>✅ <span className="stat-value correct">{correctCount}</span></span>
                        <span>❌ <span className="stat-value wrong">{wrongCount}</span></span>
                        <span>📝 <span className="stat-value">{totalCount}</span></span>
                    </div>
                </div>
                {!isFinished && (
                    <div style={{ fontSize: 14, color: "#94a3b8", background: "rgba(0,0,0,0.2)", padding: "4px 14px", borderRadius: 12 }}>
                        {currentIndex + 1} / {questions[0]?.nums?.length || 0}
                    </div>
                )}
            </div>

            <div className="question-box" style={{ minHeight: 200, background: "rgba(0,0,0,0.3)" }}>
                {!isFinished ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        flexDirection: 'column',
                        transition: 'all 0.3s',
                    }}>
                        <div className="question-number">Angka ke-{currentIndex + 1}</div>
                        <div style={{
                            fontSize: 72,
                            fontWeight: 700,
                            color: color,
                            textShadow: `0 0 40px ${color}40, 0 0 80px ${color}20`,
                            transform: `scale(${scale})`,
                            transition: 'transform 0.15s ease-out',
                        }}>
                            {currentNumber}
                        </div>
                        {currentIndex > 0 && (
                            <div style={{ fontSize: 32, color: "#a78bfa", fontWeight: 600 }}>
                                {currentOp}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="question-number">📝 Jumlahkan semua angka!</div>
                        <div className="question-text" style={{ fontSize: 24, color: "#94a3b8" }}>
                            {questions[0]?.nums?.join(" + ")} = ?
                        </div>
                        <div className="answer-area" style={{ marginTop: 16 }}>
                            <input
                                ref={inputRef}
                                type="text"
                                inputMode="decimal"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAnswer()}
                                placeholder="Jumlah total..."
                                disabled={isAnswered}
                                autoComplete="off"
                                style={{ width: 200 }}
                            />
                            <button className="btn btn-primary" onClick={handleAnswer} disabled={isAnswered}>
                                Kirim
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
        </>
    );
}