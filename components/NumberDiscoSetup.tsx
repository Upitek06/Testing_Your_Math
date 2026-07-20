"use client";

import { usePractice } from "@/contexts/PracticeContext";
import { useState } from "react";

const operationNames = {
    1: "➕ Penjumlahan",
    2: "➖ Pengurangan",
    3: "✖️ Perkalian",
    4: "➗ Pembagian",
};

export default function NumberDiscoSetup() {
    const { setScreen, numberDiscoSettings, setNumberDiscoSettings, setIsNumberDisco, resetPracticeState } = usePractice();
    const [tempOps, setTempOps] = useState(numberDiscoSettings.operations);
    const [tempCount, setTempCount] = useState(numberDiscoSettings.count);
    const [tempDelay, setTempDelay] = useState(numberDiscoSettings.delay);
    const [tempDiff, setTempDiff] = useState(numberDiscoSettings.difficulty);
    const [tempColorA, setTempColorA] = useState(numberDiscoSettings.colorA || '#f472b6');
    const [tempColorB, setTempColorB] = useState(numberDiscoSettings.colorB || '#60a5fa');

    const toggleOp = (op: number) => {
        if (tempOps.includes(op)) setTempOps(tempOps.filter(o => o !== op));
        else setTempOps([...tempOps, op]);
    };

    const handleStart = () => {
        setNumberDiscoSettings({
            operations: tempOps,
            count: tempCount,
            delay: tempDelay,
            difficulty: tempDiff,
            colorA: tempColorA,
            colorB: tempColorB,
        });
        setIsNumberDisco(true);
        resetPracticeState();
        setScreen("numberDiscoPractice");
    };

    return (
        <>
            <button className="back-btn" onClick={() => setScreen("menu")}>
                <span className="back-icon">←</span> Kembali
            </button>
            <div className="app-header" style={{ borderBottom: "none", paddingBottom: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 22 }}>💃 Number Disco</h1>
                <p style={{ color: "#94a3b8", fontSize: 14 }}>2 zona angka berbeda, 2 kotak jawaban!</p>
            </div>

            {/* Pilih Operasi */}
            <div className="form-group">
                <label>Pilih operasi:</label>
                <div className="custom-ops-grid">
                    {Object.entries(operationNames).map(([key, label]) => {
                        const op = parseInt(key);
                        const isActive = tempOps.includes(op);
                        return (
                            <button
                                key={op}
                                className={`custom-op-btn ${isActive ? "active" : ""}`}
                                onClick={() => toggleOp(op)}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Jumlah Angka per Zona */}
            <div className="form-group">
                <label>Jumlah angka per zona:</label>
                <select value={tempCount} onChange={(e) => setTempCount(parseInt(e.target.value))} className="library-select" style={{ width: 100 }}>
                    {[3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
            </div>

            {/* Kecepatan */}
            <div className="form-group">
                <label>Kecepatan muncul (detik):</label>
                <select value={tempDelay} onChange={(e) => setTempDelay(parseFloat(e.target.value))} className="library-select" style={{ width: 100 }}>
                    {[0.5, 1, 1.5, 2, 2.5, 3].map(n => <option key={n} value={n}>{n}s</option>)}
                </select>
            </div>

            {/* Level */}
            <div className="form-group">
                <label>Level:</label>
                <div className="difficulty-options">
                    {["mudah", "sedang", "sulit", "ekstrem"].map(level => (
                        <button
                            key={level}
                            className={`btn btn-sm level-btn ${level} ${tempDiff === level ? "active" : ""}`}
                            onClick={() => setTempDiff(level)}
                        >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Warna Zona A (dengan color picker) */}
            <div className="form-group">
                <label>Warna Zona A (atas):</label>
                <div className="color-picker-simple">
                    <input
                        type="color"
                        value={tempColorA}
                        onChange={(e) => setTempColorA(e.target.value)}
                        className="color-picker-input"
                    />
                    <span className="color-hex">{tempColorA}</span>
                </div>
            </div>

            {/* Warna Zona B (dengan color picker) */}
            <div className="form-group">
                <label>Warna Zona B (bawah):</label>
                <div className="color-picker-simple">
                    <input
                        type="color"
                        value={tempColorB}
                        onChange={(e) => setTempColorB(e.target.value)}
                        className="color-picker-input"
                    />
                    <span className="color-hex">{tempColorB}</span>
                </div>
            </div>

            <button className="btn-start mt-12" onClick={handleStart}>
                <span className="icon">💃</span> Mulai Number Disco
            </button>
        </>
    );
}