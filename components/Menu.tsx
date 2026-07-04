"use client";

import { usePractice } from "@/contexts/PracticeContext";

const operations = [
    {
        id: 1,
        label: "Penjumlahan",
        symbol: "+",
        color: "#34d399",
        bg: "rgba(52, 211, 153, 0.15)"
    },
    {
        id: 2,
        label: "Pengurangan",
        symbol: "−",
        color: "#60a5fa",
        bg: "rgba(96, 165, 250, 0.15)"
    },
    {
        id: 3,
        label: "Perkalian",
        symbol: "×",
        color: "#fbbf24",
        bg: "rgba(251, 191, 36, 0.15)"
    },
    {
        id: 4,
        label: "Pembagian",
        symbol: "÷",
        color: "#f87171",
        bg: "rgba(248, 113, 113, 0.15)"
    },
    {
        id: 5,
        label: "Akar",
        symbol: "√",
        color: "#a78bfa",
        bg: "rgba(167, 139, 250, 0.15)"
    },
    {
        id: 6,
        label: "Perpangkatan",
        symbol: "x²",
        color: "#f472b6",
        bg: "rgba(244, 114, 182, 0.15)"
    },
];

export default function Menu() {
    const { setScreen, setOperation } = usePractice();

    const handleSelect = (op: number) => {
        setOperation(op);
        if (op >= 1 && op <= 4) {
            setScreen("setupOps");
        } else {
            setScreen("setupRootPow");
        }
    };

    return (
        <>
            <div className="app-header">
                <h1>🧮 Latihan Matematika</h1>
                <p>Pilih operasi yang ingin kamu latih</p>
            </div>
            <div className="menu-grid">
                {operations.map((op) => (
                    <button
                        key={op.id}
                        className="menu-btn"
                        onClick={() => handleSelect(op.id)}
                        style={{
                            background: op.bg,
                            borderColor: op.color,
                        }}
                    >
                        <div
                            className="menu-icon"
                            style={{
                                color: op.color,
                                background: `radial-gradient(circle at 30% 30%, ${op.color}15, transparent 70%)`
                            }}
                        >
                            {op.symbol}
                        </div>
                        <span className="menu-label">{op.label}</span>
                    </button>
                ))}
            </div>

            {/* ===== TOMBOL LIBRARY ===== */}
            <div style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
                <button
                    className="btn-library"
                    onClick={() => setScreen("library")}
                >
                    <span className="library-icon">📚</span>
                    <span className="library-label">Library Hafalan</span>
                    <span className="library-badge">Perkalian • Pangkat • Akar</span>
                </button>
            </div>
        </>
    );
}