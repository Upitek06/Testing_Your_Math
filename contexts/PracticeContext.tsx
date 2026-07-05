"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

type Screen = "menu" | "setupOps" | "setupRootPow" | "practice" | "results" | "library";
type Difficulty = "mudah" | "sedang" | "sulit" | "ekstrem";
type Feedback = { message: string; type: "" | "correct" | "wrong" };

interface PracticeContextType {
    screen: Screen;
    setScreen: (screen: Screen) => void;
    operation: number | null;
    setOperation: (op: number) => void;
    numOperands: number;
    setNumOperands: (n: number) => void;
    timeLimit: number;
    setTimeLimit: React.Dispatch<React.SetStateAction<number>>;
    difficulty: Difficulty;
    setDifficulty: (d: Difficulty) => void;
    rootValue: number;
    setRootValue: (r: number) => void;

    // Sequential addition
    isSequential: boolean;
    setIsSequential: (val: boolean) => void;
    sequenceCount: number; // jumlah angka yang mau ditampilkan
    setSequenceCount: (val: number) => void;

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
    resetPracticeState: () => void;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export const PracticeProvider = ({ children }: { children: ReactNode }) => {
    const [screen, setScreen] = useState<Screen>("menu");
    const [operation, setOperation] = useState<number | null>(null);
    const [numOperands, setNumOperands] = useState<number>(2);
    const [timeLimit, setTimeLimit] = useState<number>(10);
    const [difficulty, setDifficulty] = useState<Difficulty>("mudah");
    const [rootValue, setRootValue] = useState<number>(2);

    // Sequential addition
    const [isSequential, setIsSequential] = useState<boolean>(false);
    const [sequenceCount, setSequenceCount] = useState<number>(5); // default 5 angka

    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [correctCount, setCorrectCount] = useState<number>(0);
    const [wrongCount, setWrongCount] = useState<number>(0);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(10);
    const [isAnswered, setIsAnswered] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<Feedback>({ message: "", type: "" });

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