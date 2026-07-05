"use client";

import { usePractice } from "@/contexts/PracticeContext";

export default function Results() {
    const { correctCount, wrongCount, totalCount, resetPracticeState, setScreen } =
        usePractice();

    const { sequenceData } = usePractice();

    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    const handleRetry = () => {
        resetPracticeState();
        setScreen("practice");
    };

    const handleMenu = () => {
        resetPracticeState();
        setScreen("menu");
    };

    return (
        <>
            <div className="app-header" style={{ borderBottom: "none", paddingBottom: 8, marginBottom: 6 }}>
                <h1 style={{ fontSize: 26 }}>🏁 Selesai!</h1>
                <p style={{ color: "#94a3b8" }}>Bagaimana hasil latihanmu?</p>
            </div>

            {sequenceData && (
                <div className="sequence-result-box">
                    <div className="sequence-numbers">
                        {sequenceData.numbers.join(' + ')} = ?
                    </div>
                    <div className="sequence-answer">
                        Jawaban benar: <strong>{sequenceData.answer}</strong>
                    </div>
                </div>
            )}

            <div className="results-grid">
                <div className="result-card">
                    <div className="number">{totalCount}</div>
                    <div className="label">Total soal</div>
                </div>
                <div className="result-card">
                    <div className="number green">{correctCount}</div>
                    <div className="label">Benar</div>
                </div>
                <div className="result-card">
                    <div className="number red">{wrongCount}</div>
                    <div className="label">Salah</div>
                </div>
            </div>

            <div className="result-card" style={{ gridColumn: "1/-1", marginTop: -6 }}>
                <div className="number blue" style={{ fontSize: 28 }}>
                    {accuracy}%
                </div>
                <div className="label">Akurasi</div>
            </div>

            <div className="results-actions">
                <button className="btn btn-primary" onClick={handleRetry}>
                    🔄 Latihan Lagi
                </button>
                <button className="btn btn-outline" onClick={handleMenu}>
                    📋 Kembali ke Menu
                </button>
            </div>
        </>
    );
}