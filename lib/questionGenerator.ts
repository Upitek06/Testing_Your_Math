// lib/questionGenerator.ts

function rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals: number = 1): number {
    const v = Math.random() * (max - min) + min;
    return Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function generateAddition(numOps: number, diff: string) {
    let nums: number[] = [];
    let rangeMin: number, rangeMax: number, decimals: number = 0;
    switch (diff) {
        case "mudah": rangeMin = 10; rangeMax = 99; break;
        case "sedang": rangeMin = 10; rangeMax = 999; break;
        case "sulit": rangeMin = 100; rangeMax = 999; break;
        case "ekstrem": rangeMin = 100; rangeMax = 9999; decimals = 2; break;
        default: rangeMin = 10; rangeMax = 99;
    }
    for (let i = 0; i < numOps; i++) {
        if (decimals > 0) nums.push(randFloat(rangeMin, rangeMax, decimals));
        else nums.push(rand(rangeMin, rangeMax));
    }
    return {
        display: `${nums.join(" + ")} = ?`,
        answer: nums.reduce((a, b) => a + b, 0),
        nums: nums, // <-- HARUS ADA INI
    };
}

function generateSubtraction(numOps: number, diff: string) {
    let rangeMin: number, rangeMax: number;
    switch (diff) {
        case "mudah": rangeMin = 10; rangeMax = 99; break;
        case "sedang": rangeMin = 10; rangeMax = 999; break;
        case "sulit": rangeMin = 100; rangeMax = 999; break;
        case "ekstrem": rangeMin = 100; rangeMax = 9999; break;
        default: rangeMin = 10; rangeMax = 99;
    }

    const first = rand(rangeMin, rangeMax);
    const maxSubtract = Math.max(first - 1, 1);
    const totalSubtract = rand(1, maxSubtract);

    let parts: number[] = [];
    let remaining = totalSubtract;
    for (let i = 0; i < numOps - 1; i++) {
        if (i === numOps - 2) {
            parts.push(remaining);
        } else {
            const maxPart = Math.max(remaining - (numOps - 2 - i), 1);
            const part = rand(1, maxPart);
            parts.push(part);
            remaining -= part;
        }
    }

    if (parts.reduce((a, b) => a + b, 0) !== totalSubtract) {
        parts[parts.length - 1] += totalSubtract - parts.reduce((a, b) => a + b, 0);
    }

    const nums = [first, ...parts];
    const answer = nums.reduce((a, b) => a - b);

    console.log("🔢 generateSubtraction result:", { nums, answer }); // <-- LOG INI

    return {
        display: `${nums.join(" − ")} = ?`,
        answer: answer,
        nums: nums, // <-- PASTIKAN INI ADA
    };
}

function generateMultiplication(numOps: number, diff: string) {
    let nums: number[] = [];
    let rangeMin: number, rangeMax: number, decimals: number = 0;
    switch (diff) {
        case "mudah": rangeMin = 1; rangeMax = 99; break;
        case "sedang": rangeMin = 10; rangeMax = 999; break;
        case "sulit": rangeMin = 100; rangeMax = 999; break;
        case "ekstrem": rangeMin = 10; rangeMax = 9999; decimals = 1; break;
        default: rangeMin = 1; rangeMax = 99;
    }
    for (let i = 0; i < numOps; i++) {
        if (diff === "ekstrem" && Math.random() < 0.4) {
            nums.push(randFloat(1, 100, 1));
        } else if (decimals > 0) {
            nums.push(randFloat(rangeMin, rangeMax, decimals));
        } else {
            nums.push(rand(rangeMin, rangeMax));
        }
    }
    const answer = nums.reduce((a, b) => a * b, 1);
    return { display: `${nums.join(" × ")} = ?`, answer };
}

function generateDivision(numOps: number, diff: string) {
    let nums: number[] = [];
    let rangeMin: number, rangeMax: number, decimals: number = 0;
    switch (diff) {
        case "mudah": rangeMin = 1; rangeMax = 99; break;
        case "sedang": rangeMin = 10; rangeMax = 999; break;
        case "sulit": rangeMin = 100; rangeMax = 999; break;
        case "ekstrem": rangeMin = 10; rangeMax = 9999; decimals = 1; break;
        default: rangeMin = 1; rangeMax = 99;
    }
    let result: number, divisors: number[] = [];
    let attempts = 0;
    while (attempts < 200) {
        if (decimals > 0) result = randFloat(1, 100, 1);
        else result = rand(1, 100);
        divisors = [];
        let ok = true;
        for (let i = 0; i < numOps - 1; i++) {
            let d: number;
            if (decimals > 0 && Math.random() < 0.3) d = randFloat(1, 50, 1);
            else if (decimals > 0) d = randFloat(1, 100, 1);
            else d = rand(1, 99);
            if (d === 0) { ok = false; break; }
            divisors.push(d);
        }
        if (!ok) { attempts++; continue; }
        const prod = divisors.reduce((a, b) => a * b, 1);
        let dividend = result * prod;
        if (dividend > 1e8 || dividend < 0.001) { attempts++; continue; }
        if (decimals > 0) dividend = Math.round(dividend * 100) / 100;
        else dividend = Math.round(dividend);
        if (dividend === 0) { attempts++; continue; }
        nums = [dividend, ...divisors];
        break;
    }
    if (nums.length < 2) nums = [10, 2, 5];
    const answer = nums.reduce((a, b) => a / b, 1);
    return { display: `${nums.join(" ÷ ")} = ?`, answer };
}

// ============ AKAR ============
function generateRoot(rootVal: number, diff: string) {
    let rangeMin: number, rangeMax: number;
    switch (diff) {
        case "mudah": rangeMin = 1; rangeMax = 10; break;
        case "sedang": rangeMin = 1; rangeMax = 25; break;
        case "sulit": rangeMin = 1; rangeMax = 50; break;
        case "ekstrem": rangeMin = 1; rangeMax = 100; break;
        default: rangeMin = 1; rangeMax = 10;
    }
    const base = rand(rangeMin, rangeMax);
    const radicand = Math.pow(base, rootVal);

    // Format tampilan akar yang lebih jelas
    let display: string;
    if (rootVal === 2) {
        display = `√${radicand} = ?`;  // akar kuadrat
    } else {
        display = `√[${rootVal}]{${radicand}} = ?`;  // akar pangkat n
    }

    return { display, answer: base };
}

// ============ PERPANGKATAN ============
function generatePower(powerVal: number, diff: string) {
    let rangeMin: number, rangeMax: number;
    switch (diff) {
        case "mudah": rangeMin = 1; rangeMax = 10; break;
        case "sedang": rangeMin = 1; rangeMax = 25; break;
        case "sulit": rangeMin = 1; rangeMax = 50; break;
        case "ekstrem": rangeMin = 1; rangeMax = 100; break;
        default: rangeMin = 1; rangeMax = 10;
    }
    const base = rand(rangeMin, rangeMax);
    const result = Math.pow(base, powerVal);

    // Format pangkat dengan Unicode superscript
    const superscriptMap: Record<string, string> = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    const powerStr = String(powerVal).split('').map(d => superscriptMap[d] || d).join('');

    return { display: `${base}${powerStr} = ?`, answer: result };
}
function generateMixedExpression(ops: number[], numOps: number, diff: string) {
    // Hanya support +, -, ×, ÷ (1-4)
    const allowedOps = ops.filter(o => o >= 1 && o <= 4);
    if (allowedOps.length === 0) return { display: "1 + 1 = ?", answer: 2, nums: [1, 1] };

    let rangeMin: number, rangeMax: number;
    switch (diff) {
        case "mudah": rangeMin = 1; rangeMax = 10; break;
        case "sedang": rangeMin = 1; rangeMax = 50; break;
        case "sulit": rangeMin = 1; rangeMax = 100; break;
        case "ekstrem": rangeMin = 1; rangeMax = 500; break;
        default: rangeMin = 1; rangeMax = 10;
    }

    // Generate angka pertama
    let nums: number[] = [rand(rangeMin, rangeMax)];
    let result = nums[0];
    const opSymbols: string[] = [];

    for (let i = 1; i < numOps; i++) {
        const op = allowedOps[Math.floor(Math.random() * allowedOps.length)];
        let nextNum = rand(rangeMin, rangeMax);

        // Logika untuk memastikan hasil tidak negatif / pembagian bulat
        if (op === 2) { // pengurangan
            if (result - nextNum < 0) {
                // jika result < nextNum, kita kecilkan nextNum
                nextNum = rand(1, Math.max(result, 1));
            }
        } else if (op === 4) { // pembagian
            // Pastikan pembagian bulat dan tidak nol
            if (result === 0) {
                nextNum = rand(1, rangeMax);
            } else {
                // cari pembagi yang membagi result bulat
                const divisors = [];
                for (let d = 1; d <= Math.min(result, rangeMax); d++) {
                    if (result % d === 0) divisors.push(d);
                }
                if (divisors.length > 0) {
                    nextNum = divisors[Math.floor(Math.random() * divisors.length)];
                } else {
                    nextNum = 1;
                }
            }
        }

        nums.push(nextNum);
        // Simpan simbol operasi
        if (op === 1) { result += nextNum; opSymbols.push("+"); }
        else if (op === 2) { result -= nextNum; opSymbols.push("−"); }
        else if (op === 3) { result *= nextNum; opSymbols.push("×"); }
        else if (op === 4) {
            if (nextNum !== 0) result = result / nextNum;
            else result = 0;
            opSymbols.push("÷");
        }
    }

    // Build display
    let display = String(nums[0]);
    for (let i = 0; i < opSymbols.length; i++) {
        display += ` ${opSymbols[i]} ${nums[i + 1]}`;
    }
    display += " = ?";

    // Bulatkan hasil jika desimal
    const finalAnswer = Math.round(result * 1000) / 1000;

    return {
        display,
        answer: finalAnswer,
        nums: nums,
    };
}
export function generateCustomQuestions(
    operations: number[],
    order: number[], // tidak dipakai lagi, kita random
    numOps: number,
    diff: string,
    rootVal: number,
    totalQuestions: number
) {
    const questions = [];
    for (let i = 0; i < totalQuestions; i++) {
        // Untuk akar/pangkat, kita buat soal terpisah (tidak mixed)
        const hasRoot = operations.includes(5);
        const hasPower = operations.includes(6);
        let q;
        if (hasRoot || hasPower) {
            // Untuk akar/pangkat, tetap buat soal sendiri-sendiri
            const op = operations[Math.floor(Math.random() * operations.length)];
            if (op === 5) q = generateRoot(rootVal, diff);
            else if (op === 6) q = generatePower(rootVal, diff);
            else q = generateMixedExpression(operations, numOps, diff);
        } else {
            // Mixed expression untuk +, -, ×, ÷
            q = generateMixedExpression(operations, numOps, diff);
        }
        questions.push(q);
    }
    return questions;
}

export function generateQuestions(
    op: number,
    numOps: number,
    diff: string,
    rootVal: number,
    count: number = 50
) {
    const questions = [];
    for (let i = 0; i < count; i++) {
        let q;
        switch (op) {
            case 1: q = generateAddition(numOps, diff); break;
            case 2: q = generateSubtraction(numOps, diff); break;
            case 3: q = generateMultiplication(numOps, diff); break;
            case 4: q = generateDivision(numOps, diff); break;
            case 5: q = generateRoot(rootVal, diff); break;
            case 6: q = generatePower(rootVal, diff); break;
            default: q = { display: "1 + 1 = ?", answer: 2 };
        }
        questions.push(q);
    }
    return questions;
}
