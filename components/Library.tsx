"use client";

import { usePractice } from "@/contexts/PracticeContext";
import { useState } from "react";

type TabType = "perkalian" | "perpangkatan" | "akar";

// Map angka ke superscript Unicode
const superscriptMap: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
};

function toSuperscript(num: number): string {
    return String(num).split('').map(d => superscriptMap[d] || d).join('');
}

export default function Library() {
    const { setScreen } = usePractice();
    const [activeTab, setActiveTab] = useState<TabType>("perkalian");
    const [pangkatValue, setPangkatValue] = useState<number>(2);
    const [jumlahDataPangkat, setJumlahDataPangkat] = useState<number>(10);
    const [akarValue, setAkarValue] = useState<number>(2);

    // ===== DATA PERKALIAN =====
    const perkalianData = () => {
        const rows = [];
        for (let i = 1; i <= 10; i++) {
            const cols = [];
            for (let j = 1; j <= 10; j++) {
                cols.push(i * j);
            }
            rows.push(cols);
        }
        return rows;
    };

    // ===== DATA PERPANGKATAN (grid) =====
    const perpangkatanData = () => {
        const data = [];
        const limit = jumlahDataPangkat;
        for (let i = 1; i <= limit; i++) {
            data.push({
                base: i,
                exponent: pangkatValue,
                result: Math.pow(i, pangkatValue),
                display: `${i}${toSuperscript(pangkatValue)} = ${Math.pow(i, pangkatValue)}`,
            });
        }
        return data;
    };

    // ===== DATA AKAR =====
    const akarData = () => {
        const data = [];
        for (let i = 1; i <= 20; i++) {
            const radicand = Math.pow(i, akarValue);
            let display: string;
            if (akarValue === 2) {
                display = `√${radicand}`;
            } else {
                display = `${akarValue}√${radicand}`;
            }
            data.push({
                number: i,
                radicand: radicand,
                result: i,
                display: display,
            });
        }
        return data;
    };

    const perkalian = perkalianData();
    const pangkat = perpangkatanData();
    const akar = akarData();

    // Tentukan jumlah kolom berdasarkan jumlah data
    const getPangkatCols = () => {
        if (jumlahDataPangkat <= 25) return 5;
        return 10;
    };

    return (
        <>
            <button className="back-btn" onClick={() => setScreen("menu")}>
                <span className="back-icon">←</span> Kembali
            </button>

            <div className="app-header" style={{ borderBottom: "none", paddingBottom: 8, marginBottom: 12 }}>
                <h1 style={{ fontSize: 22 }}>📚 Library Hafalan</h1>
                <p style={{ color: "#94a3b8", fontSize: 14 }}>
                    Pelajari dan hafalkan perkalian, perpangkatan, dan akar
                </p>
            </div>

            {/* ===== TAB ===== */}
            <div className="library-tabs">
                {["perkalian", "perpangkatan", "akar"].map((tab) => (
                    <button
                        key={tab}
                        className={`library-tab ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab as TabType)}
                    >
                        {tab === "perkalian" && "✖️ Perkalian"}
                        {tab === "perpangkatan" && "⬆️ Perpangkatan"}
                        {tab === "akar" && "√ Akar"}
                    </button>
                ))}
            </div>

            {/* ===== KONTEN TAB ===== */}
            <div className="library-content">
                {/* === PERKALIAN === */}
                {activeTab === "perkalian" && (
                    <div className="library-table-wrap">
                        <div className="library-table-header">
                            <span>Tabel Perkalian 1–10</span>
                        </div>
                        <div className="table-scroll">
                            <table className="library-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        {Array.from({ length: 10 }, (_, i) => (
                                            <th key={i}>{i + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {perkalian.map((row, i) => (
                                        <tr key={i}>
                                            <th>{i + 1}</th>
                                            {row.map((val, j) => (
                                                <td key={j}>{val}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* === PERPANGKATAN (GRID) === */}
                {activeTab === "perpangkatan" && (
                    <div className="library-table-wrap">
                        <div className="library-table-header">
                            <span>Perpangkatan </span>
                            <select
                                value={pangkatValue}
                                onChange={(e) => setPangkatValue(parseInt(e.target.value))}
                                className="library-select"
                            >
                                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <span style={{ marginLeft: 8, color: "#64748b" }}>•</span>
                            <select
                                value={jumlahDataPangkat}
                                onChange={(e) => setJumlahDataPangkat(parseInt(e.target.value))}
                                className="library-select"
                            >
                                {[10, 25, 50, 100].map((n) => (
                                    <option key={n} value={n}>{n} data</option>
                                ))}
                            </select>
                        </div>

                        <div
                            className="library-grid-power"
                            style={{
                                gridTemplateColumns: `repeat(${getPangkatCols()}, 1fr)`,
                            }}
                        >
                            {pangkat.map((item, idx) => (
                                <div key={idx} className="library-card-power">
                                    <span className="power-base">{item.base}</span>
                                    <span className="power-exponent">{toSuperscript(item.exponent)}</span>
                                    <span className="power-equals">=</span>
                                    <span className="power-result">{item.result}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* === AKAR === */}
                {activeTab === "akar" && (
                    <div className="library-table-wrap">
                        <div className="library-table-header">
                            <span>Akar pangkat </span>
                            <select
                                value={akarValue}
                                onChange={(e) => setAkarValue(parseInt(e.target.value))}
                                className="library-select"
                            >
                                {[2, 3, 4, 5].map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div className="table-scroll">
                            <table className="library-table library-table-root">
                                <thead>
                                    <tr>
                                        <th>Bentuk Akar</th>
                                        <th>Hasil</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {akar.map((item) => (
                                        <tr key={item.number}>
                                            <td className="root-cell">{item.display}</td>
                                            <td className="result-cell">{item.result}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}