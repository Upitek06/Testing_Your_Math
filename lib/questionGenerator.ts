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
    const answer = nums.reduce((a, b) => a + b, 0);
    return { display: `${nums.join(" + ")} = ?`, answer };
}

function generateSubtraction(numOps: number, diff: string) {
    let rangeMin: number, rangeMax: number, decimals: number = 0;
    switch (diff) {
        case "mudah": rangeMin = 10; rangeMax = 99; break;
        case "sedang": rangeMin = 10; rangeMax = 999; break;
        case "sulit": rangeMin = 100; rangeMax = 999; break;
        case "ekstrem": rangeMin = 100; rangeMax = 9999; decimals = 2; break;
        default: rangeMin = 10; rangeMax = 99;
    }

    // Helper: generate angka
    const randNum = (min: number, max: number): number => {
        if (decimals > 0) {
            return randFloat(min, max, decimals);
        } else {
            return rand(Math.ceil(min), Math.floor(max));
        }
    };

    // 1. Generate FIRST (positif, besar)
    let first = randNum(rangeMin, rangeMax);

    // 2. Tentukan total pengurang: antara (numOps-1)*1 dan first - 1 (agar hasil minimal 1)
    const minPart = decimals > 0 ? 0.1 : 1;
    const minTotal = (numOps - 1) * minPart;
    const maxTotal = Math.max(first - minPart, minTotal); // biar gak negatif

    let totalSubtract: number;
    if (maxTotal < minTotal) {
        // Jika range tidak valid, naikkan first
        first = randNum(rangeMin * 2, rangeMax * 2);
        totalSubtract = randNum(minTotal, Math.max(first - minPart, minTotal));
    } else {
        totalSubtract = randNum(minTotal, Math.min(maxTotal, first - minPart));
    }

    // 3. Bagi totalSubtract menjadi (numOps-1) bagian (semua > 0)
    let parts: number[] = [];
    let remaining = totalSubtract;
    for (let i = 0; i < numOps - 1; i++) {
        let maxPart = remaining - (numOps - 2 - i) * minPart;
        if (maxPart < minPart) maxPart = minPart;
        let part = randNum(minPart, maxPart);
        if (part > remaining) part = remaining;
        parts.push(part);
        remaining -= part;
    }
    // Jika ada sisa (karena pembulatan), tambahkan ke bagian terakhir
    if (remaining > 0) {
        parts[parts.length - 1] += remaining;
    }

    // 4. Susun nums
    const nums = [first, ...parts];
    // Hitung jawaban
    const answer = nums.reduce((a, b) => a - b, 0);

    // 5. Pastikan answer > 0, jika tidak, tambah first
    if (answer <= 0) {
        first += Math.abs(answer) + 10;
        nums[0] = first;
        const newAnswer = nums.reduce((a, b) => a - b, 0);
        // Rekursi sekali (aman)
        return generateSubtraction(numOps, diff);
    }

    // 6. Format display
    const display = nums.map(n => {
        if (Number.isInteger(n)) return n.toString();
        return n.toFixed(decimals);
    }).join(" − ");

    // 7. Log untuk debugging
    console.log("✅ Pengurangan:", nums, "jawaban:", answer);

    return { display: `${display} = ?`, answer };
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