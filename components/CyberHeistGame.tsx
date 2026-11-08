"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { chooseRandomGroup, fetchQuestionGroups } from "@/lib/question-groups";
import type { Question, QuestionGroup } from "@/types/game";

const sections = [
    { id: "password", label: "PASSWORD SECURITY" },
    { id: "phishing", label: "PHISHING DETECTION" },
    { id: "network", label: "NETWORK DEFENCE" },
    { id: "forensics", label: "DIGITAL FORENSICS" },
];

const VAULT_CODE = "4729";
const TOTAL_QUESTIONS = 8;
const PASS_MARK = 6;

type Screen = "welcome" | "briefing" | "playing" | "vault" | "results";

export default function CyberHeistGame() {
    const [screen, setScreen] = useState<Screen>("welcome");
    const [groups, setGroups] = useState<QuestionGroup[]>([]);
    const [group, setGroup] = useState<QuestionGroup | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [index, setIndex] = useState(0);
    const [choice, setChoice] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [lives, setLives] = useState(3);
    const [seconds, setSeconds] = useState(480);

    const [feedback, setFeedback] = useState("");
    const [bad, setBad] = useState(false);
    const [answered, setAnswered] = useState(false);

    const [vault, setVault] = useState("");
    const [vaultError, setVaultError] = useState("");
    const [vaultAttempts, setVaultAttempts] = useState(3);

    const [won, setWon] = useState(false);
    const [result, setResult] = useState("");

    const questions = group?.questions ?? [];
    const question: Question | undefined = questions[index];

    const section = question
        ? sections.find((s) => s.id === question.sectionId)
        : undefined;

    // Recover one vault digit for every two correct answers.
    const recoveredDigitCount = Math.min(
        4,
        Math.floor(correctAnswers / 2)
    );

    const recoveredDigits = VAULT_CODE.slice(0, recoveredDigitCount);
    const hasFullCode = correctAnswers === TOTAL_QUESTIONS;
    const quizSectionRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (screen !== "playing") return;

        quizSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, [index, screen]);

    // Load the question groups from Firebase.
    useEffect(() => {
        let alive = true;

        fetchQuestionGroups()
            .then((g) => {
                if (alive) setGroups(g);
            })
            .catch((e) => {
                if (alive) {
                    setError(
                        e instanceof Error
                            ? e.message
                            : "Could not load Firebase question bank"
                    );
                }
            })
            .finally(() => {
                if (alive) setLoading(false);
            });

        return () => {
            alive = false;
        };
    }, []);

    // The eight-minute timer runs during both the questions and vault.
    useEffect(() => {
        if (screen !== "playing" && screen !== "vault") return;

        const timer = window.setInterval(() => {
            setSeconds((old) => {
                if (old <= 1) {
                    window.clearInterval(timer);
                    setWon(false);
                    setResult(
                        "TIME EXPIRED — The security system sealed the vault before you could escape."
                    );
                    setScreen("results");
                    return 0;
                }

                return old - 1;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [screen]);

    const time = useMemo(
        () =>
            `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
                seconds % 60
            ).padStart(2, "0")}`,
        [seconds]
    );

    function start() {
        const selected = chooseRandomGroup(groups);

        setGroup(selected);
        setIndex(0);
        setChoice(null);
        setScore(0);
        setCorrectAnswers(0);
        setLives(3);
        setSeconds(480);

        setFeedback("");
        setBad(false);
        setAnswered(false);

        setVault("");
        setVaultError("");
        setVaultAttempts(3);

        setWon(false);
        setResult("");

        setScreen("playing");
    }

    function finish(success: boolean, message: string) {
        setWon(success);
        setResult(message);
        setScreen("results");
    }

    function submit() {
        if (!question || choice === null || answered) return;

        setAnswered(true);

        const correct = choice === question.answerIndex;

        // Work out the correct-answer total including this answer.
        const nextCorrectAnswers = correct
            ? correctAnswers + 1
            : correctAnswers;

        if (correct) {
            setCorrectAnswers(nextCorrectAnswers);
            setScore((s) => s + 100);
            setFeedback(`CORRECT — ${question.explanation}`);
            setBad(false);
        } else {
            setLives((l) => l - 1);
            setFeedback(`INCORRECT — ${question.explanation}`);
            setBad(true);

            // Three incorrect answers use all three lives.
            if (lives <= 1) {
                window.setTimeout(() => {
                    finish(
                        false,
                        "ALL SYSTEM LIVES LOST — The network detected your intrusion. The vault remains locked. Try again."
                    );
                }, 1000);

                return;
            }
        }

        window.setTimeout(() => {
            if (index === TOTAL_QUESTIONS - 1) {
                // The player must answer at least six questions correctly.
                if (nextCorrectAnswers >= PASS_MARK) {
                    setVault("");
                    setVaultError("");
                    setVaultAttempts(3);
                    setScreen("vault");
                } else {
                    finish(
                        false,
                        `ACCESS DENIED — You answered ${nextCorrectAnswers} out of 8 questions correctly and scored ${nextCorrectAnswers * 100}/800. You failed to recover enough vault credentials. Try again.`
                    );
                }

                return;
            }

            setIndex((i) => i + 1);
            setChoice(null);
            setFeedback("");
            setBad(false);
            setAnswered(false);
        }, 1000);
    }

    function unlock() {
        const expectedCode = hasFullCode ? VAULT_CODE : VAULT_CODE.slice(3);

        if (vault.length !== (hasFullCode ? 4 : 1)) return;

        if (vault === expectedCode) {
            finish(
                true,
                "VAULT UNLOCKED — You recovered the access credentials, defeated the security system and successfully completed the Cyber Heist."
            );
            return;
        }

        const remainingAttempts = vaultAttempts - 1;

        setVaultAttempts(remainingAttempts);
        setVault("");

        if (remainingAttempts <= 0) {
            finish(
                false,
                "VAULT ACCESS DENIED — You used all three unlocking attempts. The vault has entered permanent lockdown. Try again."
            );
        } else {
            setVaultError(
                `ACCESS DENIED — Incorrect code. ${remainingAttempts} ${remainingAttempts === 1 ? "attempt" : "attempts"
                } remaining.`
            );
        }
    }

    return (
        <main className="app-shell">
            <header className="flex items-center justify-between border-b border-cyan-300/15 py-6">
                <div className="font-display text-sm font-bold tracking-[.18em]">
                    <span className="mr-2 text-cyber-purple">⬡</span> CYBER
                    <span className="text-cyber-cyan">HEIST</span>
                </div>

                <div className="hidden font-display text-[10px] tracking-[.18em] text-slate-500 sm:block">
                    CYBERSECURITY ESCAPE ROOM
                </div>
            </header>

            {/* WELCOME SCREEN */}
            {screen === "welcome" && (
                <section className="mx-auto flex w-full max-w-3xl flex-col items-center py-12 text-center sm:py-20">
                    <p className="eyebrow">SYSTEM BREACH DETECTED</p>

                    <h1 className="mt-4 font-display text-5xl font-extrabold tracking-[.12em] sm:text-7xl">
                        CYBER <span className="text-cyber-cyan">HEIST</span>
                    </h1>

                    <p className="mt-6 max-w-xl text-xl text-slate-300 sm:text-2xl">
                        Eight challenges. Five security layers. One vault. Can you
                        outsmart the system before time runs out?
                    </p>

                    <div className="my-10 grid w-full max-w-xl grid-cols-3 gap-3 sm:gap-8">
                        <Stat value="08:00" label="TIME LIMIT" />
                        <Stat value="03" label="SYSTEM LIVES" />
                        <Stat value="08" label="QUESTIONS" />
                    </div>

                    <button
                        className="primary-button"
                        onClick={() => setScreen("briefing")}
                    >
                        INITIALISE HEIST <span>→</span>
                    </button>

                    <p className="mt-6 font-display text-[10px] tracking-[.2em] text-slate-500">
                        SINGLE PLAYER · SECURITY CLEARANCE REQUIRED
                    </p>

                    {/* <p className="mt-8 text-xs text-slate-500">
                        {loading
                            ? "CONNECTING TO SECURE QUESTION BANK..."
                            : `QUESTION BANK ONLINE · ${groups.length} SETS AVAILABLE`}
                    </p> */}

                    {error && (
                        <div className="mt-5 max-w-xl border border-cyber-danger/40 bg-cyber-danger/10 p-4 text-left text-sm text-rose-200">
                            <b>QUESTION BANK CONNECTION ERROR</b>
                            <p className="mt-2">{error}</p>
                            <p className="mt-2">
                                Configure Firebase and seed the question groups before
                                starting a mission.
                            </p>
                        </div>
                    )}
                </section>
            )}

            {/* MISSION BRIEFING */}
            {screen === "briefing" && (
                <section className="panel mx-auto my-auto w-full max-w-2xl">
                    <p className="eyebrow">MISSION BRIEFING // 01</p>

                    <h2 className="section-title mt-3">
                        Welcome, <span>Operator.</span>
                    </h2>

                    <p className="text-lg leading-relaxed text-slate-300">
                        NEXUS CORPORATION has detected an intrusion. Its internal
                        systems are locked and sensitive company data is at risk.
                        You are the cybersecurity analyst. Investigate the clues,
                        make security decisions and restore the company&apos;s
                        security.
                    </p>

                    <div className="my-8 space-y-4 border-l-2 border-cyber-purple pl-5 text-slate-200">
                        <p>
                            <b className="text-cyber-cyan">01</b> Answer eight
                            questions across four cybersecurity sections.
                        </p>

                        <p>
                            <b className="text-cyber-cyan">02</b> Each incorrect
                            answer costs one system life. You have three lives.
                        </p>

                        <p>
                            <b className="text-cyber-cyan">03</b> Earn up to 800
                            points. You need at least six correct answers to reach
                            the vault.
                        </p>

                        <p>
                            <b className="text-cyber-cyan">04</b> Recover the
                            four-digit vault code. With six or seven correct
                            answers, you must guess the final digit using three
                            attempts.
                        </p>

                        <p>
                            <b className="text-cyber-cyan">05</b> Complete the
                            mission within eight minutes.
                        </p>
                    </div>

                    <button
                        className="primary-button"
                        disabled={loading || groups.length !== 3}
                        onClick={start}
                    >
                        {loading
                            ? "CONNECTING..."
                            : groups.length === 3
                                ? "BEGIN OPERATION"
                                : "QUESTION BANK UNAVAILABLE"}{" "}
                        <span>→</span>
                    </button>
                </section>
            )}

            {/* QUESTION SCREEN */}
            {screen === "playing" && question && (
                <section
                    ref={quizSectionRef}
                    className="w-full py-7 sm:py-12"
                    style={{ scrollMarginTop: "16px" }}
                >
                    <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
                        <Hud label="TIME REMAINING" value={time} />

                        <Hud
                            label="SYSTEM LIVES"
                            value={"♥ ".repeat(lives).trim() || "—"}
                            danger
                        />

                        <Hud
                            label="POINTS"
                            value={String(score).padStart(3, "0")}
                        />
                    </div>

                    <div className="mb-5 h-1 overflow-hidden bg-slate-800">
                        <div
                            className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-purple transition-all"
                            style={{
                                width: `${(index / TOTAL_QUESTIONS) * 100}%`,
                            }}
                        />
                    </div>

                    <div className="mb-4 flex justify-between font-display text-[10px] tracking-[.16em] text-slate-400">
                        <span>
                            QUESTION {String(index + 1).padStart(2, "0")} / 08
                        </span>
                        <span className="text-cyber-purple">
                            {question.difficulty}
                        </span>
                    </div>

                    <article className="panel">
                        <p className="eyebrow">
                            {question.category} · {section?.label}
                        </p>

                        <h2 className="mt-4 font-display text-xl font-bold leading-relaxed sm:text-3xl">
                            {question.title}
                        </h2>

                        <p className="mt-3 text-lg text-slate-400">
                            {question.description}
                        </p>

                        <div className="my-7 grid gap-3">
                            {question.options.map((option, i) => (
                                <button
                                    key={`${question.id}-${i}`}
                                    disabled={answered}
                                    onClick={() => setChoice(i)}
                                    className={`answer-option text-left ${choice === i ? "answer-selected" : ""
                                        }`}
                                >
                                    <span className="mr-3 font-display text-xs text-cyber-cyan">
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    {option}
                                </button>
                            ))}
                        </div>

                        <p
                            aria-live="polite"
                            className={`min-h-12 text-base font-semibold ${bad
                                ? "text-cyber-danger"
                                : "text-cyber-green"
                                }`}
                        >
                            {feedback}
                        </p>

                        <button
                            className="primary-button"
                            disabled={choice === null || answered}
                            onClick={submit}
                        >
                            SUBMIT ANSWER <span>→</span>
                        </button>
                    </article>

                    {/* VAULT DIGIT PROGRESS */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <span className="font-display text-[10px] tracking-[.16em] text-slate-500">
                            RECOVERED VAULT DIGITS
                        </span>

                        <div className="flex gap-3">
                            {VAULT_CODE.split("").map((digit, i) => (
                                <span
                                    key={i}
                                    className={`font-display text-xl ${i < recoveredDigitCount
                                        ? "text-cyber-cyan"
                                        : "text-slate-600"
                                        }`}
                                >
                                    {i < recoveredDigitCount ? digit : "_"}
                                </span>
                            ))}
                        </div>

                        {/* <span className="font-display text-[10px] tracking-[.16em] text-slate-500">
                            SET {group?.name}
                        </span> */}
                    </div>

                    <p className="mt-3 text-center text-xs text-slate-500">
                        Every two correct answers unlock one vault digit.
                    </p>
                </section>
            )}

            {/* STAGE 05 — FINAL VAULT */}
            {screen === "vault" && (
                <section className="vault-room mx-auto my-auto w-full max-w-2xl">
                    <div className="vault-door">
                        <div className="vault-topline">
                            <span>STAGE 05 // FINAL SECURITY LAYER</span>
                            <span className="vault-status">
                                <span className="vault-status-dot" />
                                SECURITY ACTIVE
                            </span>
                        </div>

                        <div className="vault-emblem">
                            <div className="vault-outer-ring">
                                <div className="vault-inner-ring">
                                    <span className="vault-lock-icon">⬡</span>
                                </div>
                            </div>
                        </div>

                        <p className="eyebrow text-center">
                            NEXUS CORPORATION // RESTRICTED ACCESS
                        </p>

                        <h2 className="vault-heading">
                            THE <span>FINAL VAULT</span>
                        </h2>

                        <p className="vault-description">
                            {hasFullCode
                                ? "Outstanding work, Operator. All four access digits have been recovered. Enter the complete code to release the vault."
                                : "Three access digits recovered. The final digit is still encrypted. You have three attempts to guess it and unlock the vault."}
                        </p>

                        <div className="vault-code-panel">
                            <p className="vault-label">RECOVERED ACCESS CODE</p>

                            <div className="vault-slots">
                                {VAULT_CODE.split("").map((digit, i) => (
                                    <div
                                        className={`vault-slot ${i < recoveredDigitCount
                                            ? "vault-slot-open"
                                            : "vault-slot-locked"
                                            }`}
                                        key={i}
                                    >
                                        {i < recoveredDigitCount ? digit : "?"}
                                    </div>
                                ))}
                            </div>

                            <p className="vault-hint">
                                {hasFullCode
                                    ? "ALL FOUR DIGITS RECOVERED"
                                    : "FINAL DIGIT ENCRYPTED — GUESS TO COMPLETE"}
                            </p>
                        </div>

                        <div className="vault-input-area">
                            <label htmlFor="vault" className="vault-label">
                                {hasFullCode
                                    ? "ENTER THE FOUR-DIGIT ACCESS CODE"
                                    : "ENTER THE MISSING FINAL DIGIT"}
                            </label>

                            <input
                                id="vault"
                                value={vault}
                                onChange={(e) =>
                                    setVault(
                                        e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, hasFullCode ? 4 : 1)
                                    )
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") unlock();
                                }}
                                inputMode="numeric"
                                autoComplete="off"
                                maxLength={hasFullCode ? 4 : 1}
                                placeholder={hasFullCode ? "• • • •" : "•"}
                                className="vault-input vault-input-enhanced"
                                aria-label={
                                    hasFullCode
                                        ? "Four digit vault code"
                                        : "Final vault digit"
                                }
                            />

                            <div className="vault-attempts">
                                <span>UNLOCK ATTEMPTS</span>

                                <div className="flex gap-2">
                                    {[0, 1, 2].map((i) => (
                                        <span
                                            key={i}
                                            className={`attempt-indicator ${i < vaultAttempts
                                                ? "attempt-active"
                                                : "attempt-used"
                                                }`}
                                        />
                                    ))}
                                </div>

                                <strong>{vaultAttempts} / 3</strong>
                            </div>
                        </div>

                        <p
                            aria-live="polite"
                            className="vault-error"
                        >
                            {vaultError}
                        </p>

                        <button
                            className="primary-button vault-unlock-button"
                            disabled={
                                vault.length !== (hasFullCode ? 4 : 1)
                            }
                            onClick={unlock}
                        >
                            <span className="mr-2">⬡</span>
                            ENGAGE VAULT LOCK
                            <span>→</span>
                        </button>

                        <div className="vault-bottomline">
                            <span>AUTHORISED OPERATOR ONLY</span>
                            <span>TIME REMAINING: {time}</span>
                        </div>
                    </div>
                </section>
            )}

            {/* RESULTS SCREEN */}
            {screen === "results" && (
                <section className="panel mx-auto my-auto w-full max-w-2xl">
                    <p className="eyebrow">MISSION REPORT</p>

                    <h2 className="section-title mt-3">
                        {won ? "MISSION ACCOMPLISHED" : "MISSION FAILED"}
                    </h2>

                    <p className="text-lg text-slate-300">{result}</p>

                    <div className="my-8">
                        <strong className="font-display text-6xl text-cyber-cyan">
                            {String(score).padStart(3, "0")}
                        </strong>

                        <p className="eyebrow mt-2">FINAL SCORE / 800</p>
                    </div>

                    <p className="mb-7 text-slate-400">
                        Correct answers: {correctAnswers} / 8 · Lives remaining:{" "}
                        {lives} · Time remaining: {time}
                    </p>

                    <button
                        className="primary-button"
                        onClick={() => {
                            setGroup(null);
                            setScreen("welcome");
                        }}
                    >
                        REPLAY MISSION <span>↻</span>
                    </button>
                </section>
            )}

            <footer className="mt-auto py-6 text-center font-display text-[9px] tracking-[.2em] text-slate-600">
                CYBER HEIST{" "}
                <span className="text-cyber-purple">//</span> TRAINING
                SIMULATION
            </footer>
        </main>
    );
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div className="grid gap-2">
            <strong className="font-display text-xl text-cyber-cyan sm:text-2xl">
                {value}
            </strong>

            <span className="font-display text-[9px] tracking-[.16em] text-slate-500">
                {label}
            </span>
        </div>
    );
}

function Hud({
    label,
    value,
    danger = false,
}: {
    label: string;
    value: string;
    danger?: boolean;
}) {
    return (
        <div className="grid gap-2 border border-cyan-300/15 bg-cyber-panel/80 p-3 sm:p-4">
            <span className="font-display text-[8px] tracking-[.12em] text-slate-500 sm:text-[10px]">
                {label}
            </span>

            <strong
                className={`font-display text-sm sm:text-xl ${danger ? "text-cyber-danger" : "text-cyber-cyan"
                    }`}
            >
                {value}
            </strong>
        </div>
    );
}
