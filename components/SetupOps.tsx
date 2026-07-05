"use client";

import { usePractice } from "@/contexts/PracticeContext";
import { useState, useRef, useEffect } from "react";

export default function SetupOps() {
    const {
        setScreen,
        operation,
        numOperands,
        setNumOperands,
        timeLimit,
        setTimeLimit,
        difficulty,
        setDifficulty,
        resetPracticeState,
        isSequential,
        setIsSequential,
        sequenceCount,
        setSequenceCount,
    } = usePractice();

    const [customTime, setCustomTime] = useState<number>(20);
    const [showCustom, setShowCustom] = useState<boolean>(false);
    const [showOperandOptions, setShowOperandOptions] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const opNames = ["", "Penjumlahan", "Pengurangan", "Perkalian", "Pembagian"];
    const operandOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    const sequenceOptions = [3, 5, 10, 15, 20, 25, 30];

    const opColors = {
        1: "#34d399",
        2: "#60a5fa",
        3: "#fbbf24",
        4: "#f87171",
    };
    const activeColor = opColors[operation as keyof typeof opColors] || "#fbbf24";

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowOperandOptions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (showCustom && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [showCustom]);

    const handleTimeSelect = (seconds: number | "custom") => {
        if (seconds === "custom") {
            setShowCustom(true);
            const validTime = Math.min(Math.max(customTime, 1), 999);
            setTimeLimit(validTime);
        } else {
            setShowCustom(false);
            setTimeLimit(seconds);
        }
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        if (rawValue === "") {
            setCustomTime(0);
            return;
        }
        const numValue = parseInt(rawValue);
        if (!isNaN(numValue)) {
            const clamped = Math.min(Math.max(numValue, 1), 999);
            setCustomTime(clamped);
            setTimeLimit(clamped);
        }
    };

    const handleStart = () => {
        if (showCustom) {
            const finalTime = Math.min(Math.max(customTime, 1), 999);
            setCustomTime(finalTime);
            setTimeLimit(finalTime);
        }
        resetPracticeState();
        setScreen("practice");
    };

    const selectOperand = (num: number) => {
        setNumOperands(num);
        setShowOperandOptions(false);
    };

    return (
        <>
            <button className="back-btn" onClick={() => setScreen("menu")}>
                <span className="back-icon">←</span> Kembali
            </button>
            <div
                className="app-header"
                style={{ borderBottom: "none", paddingBottom: 8, marginBottom: 12 }}
            >
                <h1 style={{ fontSize: 22 }}>{opNames[operation || 0] || "Operasi"}</h1>
            </div>

            {/* DROPDOWN JUMLAH ANGKA */}
            <div className="form-group" ref={dropdownRef}>
                <label>
                    Jumlah angka operasi <span className="sub-label">(2 – 10)</span>
                </label>
                <button
                    className="dropdown-trigger"
                    onClick={() => setShowOperandOptions(!showOperandOptions)}
                    style={{
                        borderColor: showOperandOptions ? activeColor : "rgba(255,255,255,0.08)",
                    }}
                >
                    <span>{numOperands} angka</span>
                    <span className={`dropdown-arrow ${showOperandOptions ? "open" : ""}`}>▾</span>
                </button>
                <div className={`dropdown-menu ${showOperandOptions ? "open" : ""}`}>
                    <div className="operand-grid">
                        {operandOptions.map((num) => (
                            <button
                                key={num}
                                className={`operand-btn ${numOperands === num ? "active" : ""}`}
                                onClick={() => selectOperand(num)}
                                style={
                                    numOperands === num
                                        ? {
                                            borderColor: activeColor,
                                            color: activeColor,
                                            background: `${activeColor}20`,
                                            boxShadow: `0 0 20px ${activeColor}30`,
                                        }
                                        : {}
                                }
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== MODE TAMPILAN (SEQUENTIAL) ===== */}
            {(operation === 1 || operation === 2) && (
                <div className="form-group">
                    <label>Mode tampilan</label>
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
                        <div className="mt-8" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <label style={{ fontSize: 14, color: "#94a3b8" }}>Jumlah angka yang ditampilkan:</label>
                            <select
                                value={sequenceCount}
                                onChange={(e) => setSequenceCount(parseInt(e.target.value))}
                                className="library-select"
                                style={{ width: 80 }}
                            >
                                {[3, 5, 10, 15, 20, 25, 30].map((num) => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                            <span style={{ color: "#64748b", fontSize: 12 }}>(setiap angka 2 detik)</span>
                        </div>
                    )}
                </div>
            )}

            {/* WAKTU */}
            <div className="form-group">
                <label>Waktu latihan</label>
                <div className="time-options">
                    {[5, 10, 15].map((sec) => (
                        <button
                            key={sec}
                            className={`btn btn-sm ${!showCustom && timeLimit === sec ? "active" : ""}`}
                            onClick={() => handleTimeSelect(sec)}
                        >
                            {sec}s
                        </button>
                    ))}
                    <button
                        className={`btn btn-sm ${showCustom ? "active" : ""}`}
                        onClick={() => handleTimeSelect("custom")}
                    >
                        Custom
                    </button>
                </div>
                {showCustom && (
                    <div className="mt-8" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                            ref={inputRef}
                            type="number"
                            value={customTime}
                            onChange={handleCustomChange}
                            min={1}
                            max={999}
                            style={{
                                width: 120,
                                padding: "12px 16px",
                                background: "rgba(0,0,0,0.35)",
                                border: "1.5px solid rgba(255,255,255,0.08)",
                                borderRadius: 16,
                                color: "#e8edf5",
                                fontSize: 16,
                                fontWeight: 500,
                                outline: "none",
                            }}
                        />
                        <span style={{ color: "#94a3b8", fontSize: 15 }}>detik</span>
                        <span style={{ color: "#64748b", fontSize: 12, marginLeft: 4 }}>
                            (max 999)
                        </span>
                    </div>
                )}
            </div>

            {/* LEVEL */}
            <div className="form-group">
                <label>Level kesulitan</label>
                <div className="difficulty-options">
                    {["mudah", "sedang", "sulit", "ekstrem"].map((level) => (
                        <button
                            key={level}
                            className={`btn btn-sm level-btn ${level} ${difficulty === level ? "active" : ""}`}
                            onClick={() => setDifficulty(level as any)}
                        >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                    ))}
                </div>
                <div className={`level-aura ${difficulty}`} />
            </div>

            <button className="btn-start mt-12" onClick={handleStart}>
                <span className="icon">🚀</span> Mulai Latihan
            </button>
        </>
    );
}