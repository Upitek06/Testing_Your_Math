"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

type Screen = "menu" | "setupOps" | "setupRootPow" | "practice" | "results" | "library" | "custom" | "numberDiscoPractice" | "numberDiscoSetup";
type Difficulty = "mudah" | "sedang" | "sulit" | "ekstrem";
type Feedback = { message: string; type: "" | "correct" | "wrong" };

interface PracticeContextType {
    // Navigation
    screen: Screen;
    setScreen: (screen: Screen) => void;
    operation: number | null;
    setOperation: (op: number) => void;

    // Setup
    numOperands: number;
    setNumOperands: (n: number) => void;
    timeLimit: number;
    setTimeLimit: React.Dispatch<React.SetStateAction<number>>;
    difficulty: Difficulty;
    setDifficulty: (d: Difficulty) => void;
    rootValue: number;
    setRootValue: (r: number) => void;

    // Sequential mode
    isSequential: boolean;
    setIsSequential: (val: boolean) => void;
    sequenceCount: number;
    setSequenceCount: (val: number) => void;
    sequenceDelay: number;
    setSequenceDelay: (val: number) => void;

    // Custom mode
    isCustom: boolean;
    setIsCustom: (val: boolean) => void;
    customOperations: number[];
    setCustomOperations: (ops: number[]) => void;
    customOrder: number[];
    setCustomOrder: (order: number[]) => void;
    customTotalQuestions: number;
    setCustomTotalQuestions: (n: number) => void;

    // Practice state
    questions: any[];
    setQuestions: React.Dispatch<React.SetStateAction<any[]>>;
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    correctCount: number;
    setCorrectCount: React.Dispatch<React.SetStateAction<number>>;
    wrongCount: number;
    setWrongCount: React.Dispatch<React.SetStateAction<number>>;
    totalCount: number;
    setTotalCount: React.Dispatch<React.SetStateAction<number>>;
    isRunning: boolean;
    setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
    timeLeft: number;
    setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
    isAnswered: boolean;
    setIsAnswered: React.Dispatch<React.SetStateAction<boolean>>;
    feedback: Feedback;
    setFeedback: (f: Feedback) => void;
    sequenceData: { numbers: number[]; answer: number; opSymbols?: string[] } | null;
    setSequenceData: (data: { numbers: number[]; answer: number; opSymbols?: string[] } | null) => void;
    resetPracticeState: () => void;
    isNumberDisco: boolean;
    setIsNumberDisco: (val: boolean) => void;
    numberDiscoSettings: {
        operations: number[];
        count: number;
        delay: number;
        difficulty: string;
    };
    setNumberDiscoSettings: (settings: any) => void;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export const PracticeProvider = ({ children }: { children: ReactNode }) => {
    // Navigation
    const [screen, setScreen] = useState<Screen>("menu");
    const [operation, setOperation] = useState<number | null>(null);

    // Setup
    const [numOperands, setNumOperands] = useState<number>(2);
    const [timeLimit, setTimeLimit] = useState<number>(10);
    const [difficulty, setDifficulty] = useState<Difficulty>("mudah");
    const [rootValue, setRootValue] = useState<number>(2);

    // Sequential mode
    const [isSequential, setIsSequential] = useState<boolean>(false);
    const [sequenceCount, setSequenceCount] = useState<number>(5);
    const [sequenceDelay, setSequenceDelay] = useState<number>(2);

    // Custom mode
    const [isCustom, setIsCustom] = useState<boolean>(false);
    const [customOperations, setCustomOperations] = useState<number[]>([1, 2, 3]);
    const [customOrder, setCustomOrder] = useState<number[]>([0, 1, 2]);
    const [customTotalQuestions, setCustomTotalQuestions] = useState<number>(10);

    // Practice state
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [correctCount, setCorrectCount] = useState<number>(0);
    const [wrongCount, setWrongCount] = useState<number>(0);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(10);
    const [isAnswered, setIsAnswered] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<Feedback>({ message: "", type: "" });
    const [sequenceData, setSequenceData] = useState<{ numbers: number[]; answer: number } | null>(null);
    const [isNumberDisco, setIsNumberDisco] = useState<boolean>(false);
    const [numberDiscoSettings, setNumberDiscoSettings] = useState({
        operations: [1, 2, 3],
        count: 10,
        delay: 1.5,
        difficulty: 'mudah',
    });

    const resetPracticeState = () => {
        setQuestions([]);
        setCurrentIndex(0);
        setCorrectCount(0);
        setWrongCount(0);
        setTotalCount(0);
        setIsRunning(false);
        setTimeLeft(timeLimit);
        setIsAnswered(false);
        setFeedback({ message: "", type: "" });
        setSequenceData(null);
    };

    return (
        <PracticeContext.Provider
            value={{
                screen,
                setScreen,
                operation,
                setOperation,
                numOperands,
                setNumOperands,
                timeLimit,
                setTimeLimit,
                difficulty,
                setDifficulty,
                rootValue,
                setRootValue,
                isSequential,
                setIsSequential,
                sequenceCount,
                setSequenceCount,
                sequenceDelay,
                setSequenceDelay,
                isCustom,
                setIsCustom,
                customOperations,
                setCustomOperations,
                customOrder,
                setCustomOrder,
                customTotalQuestions,
                setCustomTotalQuestions,
                questions,
                setQuestions,
                currentIndex,
                setCurrentIndex,
                correctCount,
                setCorrectCount,
                wrongCount,
                setWrongCount,
                totalCount,
                setTotalCount,
                isRunning,
                setIsRunning,
                timeLeft,
                setTimeLeft,
                isAnswered,
                setIsAnswered,
                feedback,
                setFeedback,
                sequenceData,
                setSequenceData,
                isNumberDisco,
                setIsNumberDisco,
                numberDiscoSettings,
                setNumberDiscoSettings,

                resetPracticeState,
            }}
        >
            {children}
        </PracticeContext.Provider>
    );
};

export const usePractice = () => {
    const context = useContext(PracticeContext);
    if (!context) throw new Error("usePractice must be used within PracticeProvider");
    return context;
};