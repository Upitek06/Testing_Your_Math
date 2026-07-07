"use client";

import { usePractice } from "@/contexts/PracticeContext";
import { useState } from "react";

const operationNames = {
    1: "➕ Penjumlahan",
    2: "➖ Pengurangan",
    3: "✖️ Perkalian",
    4: "➗ Pembagian",
    5: "√ Akar",
    6: "⬆️ Perpangkatan",
};

export default function CustomBuilder() {
    const {
        setScreen,
        isSequential,
        setIsSequential,
        sequenceDelay,
        setSequenceDelay,
        customOperations,
        setCustomOperations,
        customOrder,
        setCustomOrder,
        customTotalQuestions,
        setCustomTotalQuestions,
        numOperands,
        setNumOperands,
        timeLimit,
        setTimeLimit,
        setIsCustom,
        setOperation,
        resetPracticeState,
    } = usePractice();

    const [showCustomTime, setShowCustomTime] = useState(false);
    const [customTime, setCustomTime] = useState(20);

    // Toggle operasi
    const toggleOperation = (op: number) => {
        if (customOperations.includes(op)) {
            const newOps = customOperations.filter((o) => o !== op);
            setCustomOperations(newOps);
            // Reset order
            setCustomOrder(newOps.map((_, i) => i));
        } else {
            const newOps = [...customOperations, op];
            setCustomOperations(newOps);
            setCustomOrder(newOps.map((_, i) => i));
        }
    };

    // Pindah urutan (drag sederhana via tombol)
    const moveOrder = (index: number, direction: "up" | "down") => {
        const newOrder = [...customOrder];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newOrder.length) return;
        [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
        setCustomOrder(newOrder);
    };

    const handleStart = () => {
        setIsCustom(true);
        setOperation(1); // <-- INI YANG BENAR
        resetPracticeState();
        setScreen("practice");
    };

    return (
        <>
            <button className="back-btn" onClick={() => setScreen("menu")}>
                <span className="back-icon">←</span> Kembali
            </button>

            <div className="app-header" style={{ borderBottom: "none", paddingBottom: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 22 }}>🎨 Custom Latihan</h1>
                <p style={{ color: "#94a3b8", fontSize: 14 }}>
                    Bebas kombinasi operasi, urutan, dan mode!
                </p>
            </div>

            {/* Pilih Operasi */}
            <div className="form-group">
                <label>Pilih operasi yang mau dilibatkan:</label>
                <div className="custom-ops-grid">
                    {Object.entries(operationNames).map(([key, label]) => {
                        const op = parseInt(key);
                        const isActive = customOperations.includes(op);
                        return (
                            <button
                                key={op}
                                className={`custom-op-btn ${isActive ? "active" : ""}`}
                                onClick={() => toggleOperation(op)}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Urutan Operasi */}
            {customOperations.length > 0 && (
                <div className="form-group">
                    <label>Urutan operasi (atas ke bawah):</label>
                    <div className="custom-order-list">
                        {customOrder.map((idx, i) => {
                            const op = customOperations[idx];
                            return (
                                <div key={i} className="custom-order-item">
                                    <span>{i + 1}. {operationNames[op as keyof typeof operationNames]}</span>
                                    <div className="order-controls">
                                        <button
                                            className="order-btn"
                                            onClick={() => moveOrder(i, "up")}
                                            disabled={i === 0}
                                        >
                                            ↑
                                        </button>
                                        <button
                                            className="order-btn"
                                            onClick={() => moveOrder(i, "down")}
                                            disabled={i === customOrder.length - 1}
                                        >
                                            ↓
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Jumlah Soal */}
            <div className="form-group">
                <label>Jumlah soal:</label>
                <select
                    value={customTotalQuestions}
                    onChange={(e) => setCustomTotalQuestions(parseInt(e.target.value))}
                    className="library-select"
                    style={{ width: 120 }}
                >
                    {[5, 10, 15, 20, 25, 30].map((n) => (
                        <option key={n} value={n}>{n} soal</option>
                    ))}
                </select>
            </div>

            {/* Jumlah Angka per Soal */}
            <div className="form-group">
                <label>Jumlah angka per soal:</label>
                <select
                    value={numOperands}
                    onChange={(e) => setNumOperands(parseInt(e.target.value))}
                    className="library-select"
                    style={{ width: 100 }}
                >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n} angka</option>
                    ))}
                </select>
            </div>

            {/* Mode Tampilan */}
            <div className="form-group">
                <label>Mode tampilan:</label>
                <div className="mode-options">
                    <button
                        className={`btn btn-sm ${!isSequential ? "active" : ""}`}
                        onClick={() => setIsSequential(false)}
                    >
                        Langsung
                    </button>
                    <button
                        className={`btn btn-sm ${isSequential ? "active" : ""}`}
                        onClick={() => setIsSequential(true)}
                    >
                        Bertahap
                    </button>
                </div>
                {isSequential && (
                    <div className="mt-8">
                        <label style={{ fontSize: 14, color: "#94a3b8" }}>Kecepatan muncul angka:</label>
                        <select
                            value={sequenceDelay}
                            onChange={(e) => setSequenceDelay(parseInt(e.target.value))}
                            className="library-select"
                            style={{ width: 100, marginTop: 4 }}
                        >
                            {[1, 2, 3, 4, 5].map((n) => (
                                <option key={n} value={n}>{n} detik</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Waktu (hanya untuk mode langsung) */}
            {!isSequential && (
                <div className="form-group">
                    <label>Waktu latihan:</label>
                    <div className="time-options">
                        {[5, 10, 15].map((sec) => (
                            <button
                                key={sec}
                                className={`btn btn-sm ${timeLimit === sec && !showCustomTime ? "active" : ""}`}
                                onClick={() => {
                                    setShowCustomTime(false);
                                    setTimeLimit(sec);
                                }}
                            >
                                {sec}s
                            </button>
                        ))}
                        <button
                            className={`btn btn-sm ${showCustomTime ? "active" : ""}`}
                            onClick={() => setShowCustomTime(true)}
                        >
                            Custom
                        </button>
                    </div>
                    {showCustomTime && (
                        <div className="mt-8" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                                type="number"
                                value={customTime}
                                onChange={(e) => setCustomTime(Math.max(1, parseInt(e.target.value) || 1))}
                                min={1}
                                max={999}
                                style={{
                                    width: 100,
                                    padding: "8px 12px",
                                    background: "rgba(0,0,0,0.35)",
                                    border: "1.5px solid rgba(255,255,255,0.08)",
                                    borderRadius: 12,
                                    color: "#e8edf5",
                                    fontSize: 16,
                                    outline: "none",
                                }}
                            />
                            <span style={{ color: "#94a3b8" }}>detik</span>
                        </div>
                    )}
                </div>
            )}

            <button className="btn-start mt-12" onClick={handleStart}>
                <span className="icon">🚀</span> Mulai Custom Latihan
            </button>
        </>
    );
}