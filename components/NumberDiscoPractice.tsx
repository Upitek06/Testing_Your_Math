"use client";

import { usePractice } from "@/contexts/PracticeContext";
import { useEffect, useRef, useState } from "react";
import { generateQuestions } from "@/lib/questionGenerator";
import ConfirmModal from "@/components/ConfirmModal";

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

    const { operations, count, delay, difficulty, colorA, colorB } = numberDiscoSettings;

    const [numbersA, setNumbersA] = useState<number[]>([]);
    const [numbersB, setNumbersB] = useState<number[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentA, setCurrentA] = useState<number | null>(null);
    const [currentB, setCurrentB] = useState<number | null>(null);
    const [activeZone, setActiveZone] = useState<'A' | 'B'>('A');
    const [isFinished, setIsFinished] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [feedback, setFeedback] = useState({ message: "", type: "" });
    const [isAnswered, setIsAnswered] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [scaleA, setScaleA] = useState(1);
    const [scaleB, setScaleB] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // === GENERATE SOAL ===
    useEffect(() => {
        setIsLoading(true);
        setErrorMsg("");

        try {
            const safeOps = operations.length > 0 ? operations : [1];
            const op = safeOps[Math.floor(Math.random() * safeOps.length)];

            // Generate 2 set angka: zona A dan zona B
            const qsA = generateQuestions(op, count, difficulty, 2, 1);
            const qsB = generateQuestions(op, count, difficulty, 2, 1);

            if (!qsA || qsA.length === 0 || !qsB || qsB.length === 0) {
                throw new Error("Gagal generate soal");
            }

            const numsA = (qsA[0] as any)?.nums || [];
            const numsB = (qsB[0] as any)?.nums || [];

            if (numsA.length === 0 || numsB.length === 0) {
                throw new Error("Tidak ada angka yang di-generate");
            }

            setNumbersA(numsA);
            setNumbersB(numsB);
            setCurrentIndex(0);
            setCurrentA(numsA[0] || 0);
            setCurrentB(null);
            setActiveZone('A');
            setIsFinished(false);
            setIsAnswered(false);
            setFeedback({ message: "", type: "" });
            setInputValue("");
            setCorrectCount(0);
            setWrongCount(0);
            setTotalCount(0);
            setIsLoading(false);
        } catch (error) {
            console.error("❌ Error generate:", error);
            setErrorMsg(String(error));
            setIsLoading(false);
        }
    }, [operations, count, difficulty]);

    // === TIMER BERGANIAN ===
    useEffect(() => {
        if (isLoading || isFinished || numbersA.length === 0 || numbersB.length === 0) return;

        const totalSteps = numbersA.length + numbersB.length;
        if (currentIndex >= totalSteps) {
            setIsFinished(true);
            setFeedback({ message: "📝 Jumlahkan semua angka!", type: "" });
            if (inputRef.current) inputRef.current.focus();
            return;
        }

        const timer = setTimeout(() => {
            const nextIdx = currentIndex + 1;
            const isEven = nextIdx % 2 === 0;

            if (isEven) {
                // Zona A
                const idxA = Math.floor(nextIdx / 2);
                if (idxA < numbersA.length) {
                    setCurrentA(numbersA[idxA]);
                    setActiveZone('A');
                    setScaleA(0.5);
                    setTimeout(() => setScaleA(1), 100);
                }
            } else {
                // Zona B
                const idxB = Math.floor(nextIdx / 2);
                if (idxB < numbersB.length) {
                    setCurrentB(numbersB[idxB]);
                    setActiveZone('B');
                    setScaleB(0.5);
                    setTimeout(() => setScaleB(1), 100);
                }
            }

            setCurrentIndex(nextIdx);
        }, delay * 1000);

        timerRef.current = timer;
        return () => clearTimeout(timer);
    }, [currentIndex, isLoading, isFinished, numbersA, numbersB, delay]);

    // === HANDLE ANSWER ===
    const handleAnswer = () => {
        if (!isFinished || isAnswered) return;
        const val = parseFloat(inputValue);
        if (isNaN(val)) {
            setFeedback({ message: "⚠️ Masukkan angka!", type: "wrong" });
            return;
        }

        // Jawaban yang diharapkan: jumlah seluruh angka (A + B)
        const totalA = numbersA.reduce((a, b) => a + b, 0);
        const totalB = numbersB.reduce((a, b) => a + b, 0);
        const expectedAnswer = totalA + totalB;

        const correct = Math.abs(val - expectedAnswer) < 0.001;
        setTotalCount(prev => prev + 1);
        if (correct) {
            setCorrectCount(prev => prev + 1);
            setFeedback({ message: `✅ Benar! Jawaban: ${expectedAnswer}`, type: "correct" });
        } else {
            setWrongCount(prev => prev + 1);
            setFeedback({ message: `❌ Salah! Jawaban: ${expectedAnswer}`, type: "wrong" });
        }
        setIsAnswered(true);
        setTimeout(() => {
            setIsNumberDisco(false);
            resetPracticeState();
            setScreen("results");
        }, 2000);
    };

    // === QUIT ===
    const handleQuit = () => {
        if (isFinished || isAnswered) {
            setShowConfirm(true);
        } else {
            if (timerRef.current) clearTimeout(timerRef.current);
            setIsNumberDisco(false);
            resetPracticeState();
            setScreen("menu");
        }
    };

    const confirmQuit = () => {
        setShowConfirm(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsNumberDisco(false);
        resetPracticeState();
        setScreen("menu");
    };

    const cancelQuit = () => {
        setShowConfirm(false);
    };

    // === LOADING ===
    if (isLoading) {
        return (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 18, marginBottom: 20 }}>⏳ Memuat Number Disco...</div>
                <div style={{ fontSize: 14, color: "#64748b" }}>Mohon tunggu sebentar</div>
            </div>
        );
    }

    // === ERROR ===
    if (errorMsg) {
        return (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 18, marginBottom: 20, color: "#f87171" }}>⚠️ {errorMsg}</div>
                <button
                    className="btn btn-outline"
                    onClick={() => {
                        setIsNumberDisco(false);
                        setScreen("menu");
                    }}
                >
                    Kembali ke Menu
                </button>
            </div>
        );
    }

    // === GUARD: KALO ANGKA NULL ===
    if (currentA === null) {
        return (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 18, marginBottom: 20, color: "#f87171" }}>⚠️ Gagal memuat angka, coba lagi.</div>
                <button
                    className="btn btn-outline"
                    onClick={() => {
                        setIsNumberDisco(false);
                        setScreen("menu");
                    }}
                >
                    Kembali ke Menu
                </button>
            </div>
        );
    }

    // === RENDER ===
    return (
        <>
            <ConfirmModal
                isOpen={showConfirm}
                onConfirm={confirmQuit}
                onCancel={cancelQuit}
                title="Keluar?"
                message="Yakin ingin keluar dari Number Disco?"
                confirmText="Ya, Keluar"
                cancelText="Batalkan"
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
                        {Math.min(currentIndex + 1, numbersA.length + numbersB.length)} / {numbersA.length + numbersB.length}
                    </div>
                )}
            </div>

            <div className="question-box" style={{
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                justifyContent: 'center',
                alignItems: 'center',
                padding: '24px 16px'
            }}>
                {!isFinished ? (
                    <>
                        {/* Zona A */}
                        <div style={{
                            width: '100%',
                            padding: '16px 20px',
                            borderRadius: 16,
                            background: `${colorA}20`,
                            border: `3px solid ${colorA}`,
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            opacity: activeZone === 'A' ? 1 : 0.4,
                            transform: activeZone === 'A' ? 'scale(1.02)' : 'scale(1)',
                        }}>
                            <div style={{ fontSize: 14, color: colorA, fontWeight: 600, marginBottom: 4 }}>ZONA A</div>
                            <div style={{
                                fontSize: 56,
                                fontWeight: 700,
                                color: colorA,
                                transform: `scale(${scaleA})`,
                                transition: 'transform 0.15s ease-out',
                                textShadow: activeZone === 'A' ? `0 0 40px ${colorA}40` : 'none',
                            }}>
                                {currentA !== null ? currentA : '?'}
                            </div>
                        </div>

                        {/* Zona B */}
                        <div style={{
                            width: '100%',
                            padding: '16px 20px',
                            borderRadius: 16,
                            background: `${colorB}20`,
                            border: `3px solid ${colorB}`,
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            opacity: activeZone === 'B' ? 1 : 0.4,
                            transform: activeZone === 'B' ? 'scale(1.02)' : 'scale(1)',
                        }}>
                            <div style={{ fontSize: 14, color: colorB, fontWeight: 600, marginBottom: 4 }}>ZONA B</div>
                            <div style={{
                                fontSize: 56,
                                fontWeight: 700,
                                color: colorB,
                                transform: `scale(${scaleB})`,
                                transition: 'transform 0.15s ease-out',
                                textShadow: activeZone === 'B' ? `0 0 40px ${colorB}40` : 'none',
                            }}>
                                {currentB !== null ? currentB : '?'}
                            </div>
                        </div>

                        {/* Indikator progress */}
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                            {activeZone === 'A' ? '⬆️ Zona A aktif' : '⬇️ Zona B aktif'}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="question-number" style={{ fontSize: 18 }}>📝 Jumlahkan semua angka!</div>
                        <div className="question-text" style={{ fontSize: 20, color: "#94a3b8", textAlign: 'center' }}>
                            <div style={{ color: colorA }}>Zona A: {numbersA.join(' + ')}</div>
                            <div style={{ color: colorB, marginTop: 4 }}>Zona B: {numbersB.join(' + ')}</div>
                            <div style={{ marginTop: 8, fontWeight: 600, color: '#fbbf24' }}>
                                Total = ?
                            </div>
                        </div>
                        <div className="answer-area" style={{ marginTop: 16, width: '100%', maxWidth: 400, display: 'flex', gap: 12 }}>
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
                                style={{ flex: 1, padding: '12px 16px', fontSize: 18, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff' }}
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