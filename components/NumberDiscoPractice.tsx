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
    } = usePractice();

    const { operations, count, delay, difficulty, colorA, colorB } = numberDiscoSettings;

    // State untuk angka
    const [numbersA, setNumbersA] = useState<number[]>([]);
    const [numbersB, setNumbersB] = useState<number[]>([]);
    const [opSymbolsA, setOpSymbolsA] = useState<string[]>([]);
    const [opSymbolsB, setOpSymbolsB] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayA, setDisplayA] = useState<number | null>(null);
    const [displayB, setDisplayB] = useState<number | null>(null);
    const [showOpA, setShowOpA] = useState<string>("");
    const [showOpB, setShowOpB] = useState<string>("");
    const [activeZone, setActiveZone] = useState<'A' | 'B'>('A');
    const [isFinished, setIsFinished] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    // State untuk jawaban (2 kolom)
    const [answerA, setAnswerA] = useState("");
    const [answerB, setAnswerB] = useState("");
    const [isAnswered, setIsAnswered] = useState(false);
    const [feedback, setFeedback] = useState({ message: "", type: "" });

    // State untuk UI
    const [scaleA, setScaleA] = useState(1);
    const [scaleB, setScaleB] = useState(1);
    const [showConfirm, setShowConfirm] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputARef = useRef<HTMLInputElement>(null);
    const inputBRef = useRef<HTMLInputElement>(null);

    // === GENERATE SOAL ===
    useEffect(() => {
        setIsLoading(true);
        setErrorMsg("");

        try {
            const safeOps = operations.length > 0 ? operations : [1];
            const op = safeOps[Math.floor(Math.random() * safeOps.length)];

            const qsA = generateQuestions(op, count, difficulty, 2, 1);
            const qsB = generateQuestions(op, count, difficulty, 2, 1);

            if (!qsA || !qsB || qsA.length === 0 || qsB.length === 0) {
                throw new Error("Gagal generate soal");
            }

            const numsA = (qsA[0] as any)?.nums || [];
            const numsB = (qsB[0] as any)?.nums || [];
            const opsA = (qsA[0] as any)?.opSymbols || [];
            const opsB = (qsB[0] as any)?.opSymbols || [];

            if (numsA.length === 0 || numsB.length === 0) {
                throw new Error("Tidak ada angka yang digenerate");
            }

            setNumbersA(numsA);
            setNumbersB(numsB);
            setOpSymbolsA(opsA);
            setOpSymbolsB(opsB);
            setCurrentIndex(0);
            setDisplayA(numsA[0]);
            setDisplayB(null);
            setShowOpA("");
            setShowOpB("");
            setActiveZone('A');
            setIsFinished(false);
            setIsAnswered(false);
            setAnswerA("");
            setAnswerB("");
            setFeedback({ message: "", type: "" });
            setScaleA(1);
            setScaleB(1);
            setIsLoading(false);
        } catch (error) {
            console.error("Error generate:", error);
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
            setFeedback({ message: "📝 Masukkan jawaban untuk kedua zona!", type: "" });
            if (inputARef.current) inputARef.current.focus();
            return;
        }

        const timer = setTimeout(() => {
            const nextIdx = currentIndex + 1;
            const isEven = nextIdx % 2 === 0;

            if (isEven) {
                // Zona A
                const idxA = Math.floor(nextIdx / 2);
                if (idxA < numbersA.length) {
                    setDisplayA(numbersA[idxA]);
                    setShowOpA(opSymbolsA[idxA - 1] || "");
                    setActiveZone('A');
                    setScaleA(0.5);
                    setTimeout(() => setScaleA(1), 150);
                    // Sembunyikan zona B
                    setDisplayB(null);
                    setShowOpB("");
                }
            } else {
                // Zona B
                const idxB = Math.floor(nextIdx / 2);
                if (idxB < numbersB.length) {
                    setDisplayB(numbersB[idxB]);
                    setShowOpB(opSymbolsB[idxB - 1] || "");
                    setActiveZone('B');
                    setScaleB(0.5);
                    setTimeout(() => setScaleB(1), 150);
                    // Sembunyikan zona A
                    setDisplayA(null);
                    setShowOpA("");
                }
            }

            setCurrentIndex(nextIdx);
        }, delay * 1000);

        timerRef.current = timer;
        return () => clearTimeout(timer);
    }, [currentIndex, isLoading, isFinished, numbersA, numbersB, opSymbolsA, opSymbolsB, delay]);

    // === HANDLE ANSWER ===
    const handleAnswer = () => {
        if (!isFinished || isAnswered) return;

        const valA = parseFloat(answerA);
        const valB = parseFloat(answerB);

        if (isNaN(valA) || isNaN(valB)) {
            setFeedback({ message: "⚠️ Isi kedua kotak dengan angka!", type: "wrong" });
            return;
        }

        // Jawaban yang diharapkan: total A dan total B
        const totalA = numbersA.reduce((a, b) => a + b, 0);
        const totalB = numbersB.reduce((a, b) => a + b, 0);

        const correctA = Math.abs(valA - totalA) < 0.001;
        const correctB = Math.abs(valB - totalB) < 0.001;

        if (correctA && correctB) {
            setFeedback({ message: `✅ Benar semua! Zona A: ${totalA}, Zona B: ${totalB}`, type: "correct" });
        } else {
            let msg = "❌ ";
            if (!correctA && !correctB) msg += `Zona A: ${totalA}, Zona B: ${totalB}`;
            else if (!correctA) msg += `Zona A salah (jawaban: ${totalA}), Zona B benar ✅`;
            else msg += `Zona A benar ✅, Zona B salah (jawaban: ${totalB})`;
            setFeedback({ message: msg, type: "wrong" });
        }

        setIsAnswered(true);
        setTimeout(() => {
            setIsNumberDisco(false);
            resetPracticeState();
            setScreen("results");
        }, 3000);
    };

    // === QUIT ===
    const handleQuit = () => {
        if (isFinished || isAnswered) {
            setShowConfirm(true);
        } else {
            setIsNumberDisco(false);
            resetPracticeState();
            setScreen("menu");
        }
    };

    // === LOADING ===
    if (isLoading) {
        return (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 18, marginBottom: 20 }}>⏳ Memuat Number Disco...</div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 18, marginBottom: 20, color: "#f87171" }}>⚠️ {errorMsg}</div>
                <button className="btn btn-outline" onClick={() => { setIsNumberDisco(false); setScreen("menu"); }}>
                    Kembali
                </button>
            </div>
        );
    }

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
                </div>
                {!isFinished && (
                    <div style={{ fontSize: 14, color: "#94a3b8", background: "rgba(0,0,0,0.2)", padding: "4px 14px", borderRadius: 12 }}>
                        {currentIndex} / {numbersA.length + numbersB.length}
                    </div>
                )}
            </div>

            <div className="question-box" style={{ minHeight: 300, display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
                {!isFinished ? (
                    <>
                        {/* ZONA A */}
                        <div style={{
                            width: '100%',
                            padding: 20,
                            borderRadius: 16,
                            background: `${colorA}15`,
                            border: `3px solid ${colorA}`,
                            textAlign: 'center',
                            transition: 'all 0.3s',
                            opacity: activeZone === 'A' ? 1 : 0.3,
                            minHeight: 80,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            position: 'relative',
                        }}>
                            <div style={{ fontSize: 14, color: colorA, fontWeight: 600, position: 'absolute', top: 4, left: 12 }}>
                                ZONA A
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {/* 🔥 OPERASI DI KIRI (hanya muncul kalau ada operasi) */}
                                {showOpA && (
                                    <div style={{ fontSize: 40, color: colorA, fontWeight: 700 }}>
                                        {showOpA}
                                    </div>
                                )}
                                <div style={{
                                    fontSize: 48,
                                    fontWeight: 700,
                                    color: colorA,
                                    transform: `scale(${scaleA})`,
                                    transition: 'transform 0.15s',
                                }}>
                                    {displayA !== null ? displayA : '?'}
                                </div>
                            </div>
                        </div>

                        {/* ZONA B */}
                        <div style={{
                            width: '100%',
                            padding: 20,
                            borderRadius: 16,
                            background: `${colorB}15`,
                            border: `3px solid ${colorB}`,
                            textAlign: 'center',
                            transition: 'all 0.3s',
                            opacity: activeZone === 'B' ? 1 : 0.3,
                            minHeight: 80,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            position: 'relative',
                        }}>
                            <div style={{ fontSize: 14, color: colorB, fontWeight: 600, position: 'absolute', top: 4, left: 12 }}>
                                ZONA B
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {/* 🔥 OPERASI DI KIRI (hanya muncul kalau ada operasi) */}
                                {showOpB && (
                                    <div style={{ fontSize: 40, color: colorB, fontWeight: 700 }}>
                                        {showOpB}
                                    </div>
                                )}
                                <div style={{
                                    fontSize: 48,
                                    fontWeight: 700,
                                    color: colorB,
                                    transform: `scale(${scaleB})`,
                                    transition: 'transform 0.15s',
                                }}>
                                    {displayB !== null ? displayB : '?'}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // === FINISHED ===
                    <div style={{ width: '100%' }}>
                        <div className="question-number" style={{ textAlign: 'center', marginBottom: 16 }}>
                            📝 Masukkan jawaban untuk kedua zona!
                        </div>

                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {/* Kolom Jawaban Zona A */}
                            <div style={{ flex: 1, minWidth: 150 }}>
                                <div style={{ fontSize: 14, color: colorA, fontWeight: 600, marginBottom: 4 }}>
                                    Zona A:
                                </div>
                                <input
                                    ref={inputARef}
                                    type="text"
                                    inputMode="decimal"
                                    value={answerA}
                                    onChange={(e) => setAnswerA(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && inputBRef.current?.focus()}
                                    placeholder="Jawaban A"
                                    disabled={isAnswered}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        background: 'rgba(0,0,0,0.35)',
                                        border: `2px solid ${colorA}`,
                                        borderRadius: 12,
                                        color: '#e8edf5',
                                        fontSize: 20,
                                        fontWeight: 600,
                                        textAlign: 'center',
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            {/* Kolom Jawaban Zona B */}
                            <div style={{ flex: 1, minWidth: 150 }}>
                                <div style={{ fontSize: 14, color: colorB, fontWeight: 600, marginBottom: 4 }}>
                                    Zona B:
                                </div>
                                <input
                                    ref={inputBRef}
                                    type="text"
                                    inputMode="decimal"
                                    value={answerB}
                                    onChange={(e) => setAnswerB(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAnswer()}
                                    placeholder="Jawaban B"
                                    disabled={isAnswered}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        background: 'rgba(0,0,0,0.35)',
                                        border: `2px solid ${colorB}`,
                                        borderRadius: 12,
                                        color: '#e8edf5',
                                        fontSize: 20,
                                        fontWeight: 600,
                                        textAlign: 'center',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        <button className="btn btn-primary" onClick={handleAnswer} disabled={isAnswered} style={{ marginTop: 16, width: '100%' }}>
                            Kirim Jawaban
                        </button>
                    </div>
                )}
            </div>

            <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
        </>
    );
}