"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    X,
    Coins,
    CheckCircle,
    Info,
    Sparkles,
    Clock,
    Wallet as WalletIcon,
    Plus,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Shield,
    CreditCard,
    ArrowLeft
} from "lucide-react";
import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";

// ─────────────────────────────────────────
//  Types
// ─────────────────────────────────────────
type Metal = "gold" | "silver";
type Action = "buy" | "sell";
type BuyStep = "amount" | "success";
type SellStep = "amount" | "storage" | "payment" | "success";

interface Transaction {
    id: string;
    goldGrams: number;
    ratePerGram: number;
    totalAmount: number;
    gst: number;
    finalAmount: number;
    status: string;
    createdAt: string;
}

interface BuySellFlowProps {
    onClose: () => void;
    /** Which metal to open on by default */
    defaultMetal?: Metal;
    /** Which action (buy/sell) to open on by default */
    defaultAction?: Action;
}

// ─────────────────────────────────────────
//  Silver placeholder prices (mock)
// ─────────────────────────────────────────
const SILVER_BUY_PRICE = 89.5;
const SILVER_SELL_PRICE = 87.0;

// ─────────────────────────────────────────
//  Helper
// ─────────────────────────────────────────
function getAuthToken() {
    if (typeof window !== "undefined") return localStorage.getItem("token");
    return null;
}

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

// ══════════════════════════════════════════════════════
//  BUY panel (shared for Gold & Silver)
// ══════════════════════════════════════════════════════
function BuyPanel({
    metal,
    buyPrice,
    walletBalance,
    onAddCredits,
    loading,
    transactions,
    onBuy,
    onClose,
    onViewWallet,
}: {
    metal: Metal;
    buyPrice: number;
    walletBalance: number;
    onAddCredits: () => void;
    loading: boolean;
    transactions: Transaction[];
    onBuy: (inr: number, grams: number) => Promise<boolean>;
    onClose: () => void;
    onViewWallet: () => void;
}) {
    const [step, setStep] = useState<BuyStep>("amount");
    const [amountInr, setAmountInr] = useState("");
    const [amountGm, setAmountGm] = useState("");
    const [timeLeft, setTimeLeft] = useState(300);
    const [buying, setBuying] = useState(false);
    const [error, setError] = useState("");

    const isGold = metal === "gold";
    const accentColor = isGold ? "#EEC762" : "#9EA8B7";
    const accentDark = isGold ? "#C89E3D" : "#6B7280";
    const labelColor = isGold ? "text-[#1a1a2e]" : "text-gray-800";
    const gstRate = 3;

    useEffect(() => {
        if (timeLeft > 0) {
            const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
            return () => clearInterval(t);
        }
    }, [timeLeft]);

    const onInrChange = (v: string) => {
        if (Number(v) < 0) return;
        setAmountInr(v);
        setAmountGm(v ? (Number(v) / buyPrice).toFixed(4) : "");
    };

    const onGmChange = (v: string) => {
        if (Number(v) < 0) return;
        setAmountGm(v);
        setAmountInr(v ? (Number(v) * buyPrice).toFixed(2) : "");
    };

    const rupees = parseFloat(amountInr) || 0;
    const grams = parseFloat(amountGm) || 0;
    const gst = rupees * (gstRate / 100);
    const totalAmount = rupees + gst;
    const isInsufficient = rupees > walletBalance;

    const handleBuy = async () => {
        setBuying(true);
        setError("");
        const ok = await onBuy(rupees, grams);
        setBuying(false);
        if (ok) setStep("success");
        else setError("Purchase failed. Please try again.");
    };

    if (step === "success") {
        return (
            <div className="mx-auto max-w-md text-center">
                <div className="mb-4 rounded-xl border border-gray-100 bg-white p-6 shadow-xl sm:mb-6 sm:rounded-2xl sm:p-8 dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="relative mx-auto mb-4 h-20 w-20 rounded-full bg-green-100 p-5 sm:mb-6 sm:h-24 sm:w-24 sm:p-6 dark:bg-green-900/30">
                        <CheckCircle className="absolute inset-0 m-auto h-10 w-10 text-green-600 sm:h-12 sm:w-12 dark:text-green-500" />
                        <Sparkles className="absolute -top-1 -right-1 h-5 w-5 animate-pulse sm:-top-2 sm:-right-2 sm:h-6 sm:w-6" style={{ color: accentColor }} />
                    </div>
                    <h1 className="mb-2 text-xl font-bold text-gray-900 sm:mb-3 sm:text-2xl dark:text-white">
                        Purchase Successful!
                    </h1>
                    <p className="mb-4 text-sm text-gray-600 sm:mb-6 dark:text-neutral-400">
                        You have successfully purchased{" "}
                        <span className="font-bold" style={{ color: accentColor }}>
                            {grams.toFixed(4)} grams
                        </span>{" "}
                        of {isGold ? "Gold" : "Silver"}
                    </p>
                    <div className="mb-4 rounded-lg p-4 sm:mb-6 sm:rounded-xl sm:p-5" style={{ backgroundColor: `${accentColor}18`, border: `1px solid ${accentColor}40` }}>
                        <p className="mb-0.5 text-xs text-gray-600 sm:mb-1 sm:text-sm dark:text-neutral-400">
                            Remaining wallet balance
                        </p>
                        <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                            ₹{walletBalance.toFixed(2)}
                        </p>
                    </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                    <button
                        onClick={onViewWallet}
                        className="w-full rounded-lg py-3.5 text-base font-bold text-[#1a1a2e] shadow-lg transition-all sm:rounded-xl sm:py-4 sm:text-lg"
                        style={{ backgroundColor: accentColor }}
                    >
                        View Wallet
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:rounded-xl sm:py-4 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Test Wallet Banner ------------ Test Mode is removed from buy sell flow */}
            {/* <div className="mb-4 rounded-xl p-4 shadow-xl sm:mb-6 sm:rounded-2xl sm:p-5" style={{ background: "linear-gradient(to right, #1a1a2e, #16213e)" }}>
                <div className="flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                    <div>
                        <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
                            <WalletIcon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: accentColor }} />
                            <span className="text-xs font-medium sm:text-sm" style={{ color: accentColor }}>
                                🧪 TEST MODE
                            </span>
                        </div>
                        <p className="text-2xl font-bold sm:text-3xl">₹{walletBalance.toFixed(2)}</p>
                        <p className="mt-0.5 text-[10px] text-white/70 sm:mt-1 sm:text-xs">Test Wallet Balance</p>
                    </div>
                    <button
                        onClick={onAddCredits}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#1a1a2e] transition-colors disabled:opacity-50 sm:w-auto sm:rounded-xl sm:px-4 sm:py-2.5"
                        style={{ backgroundColor: accentColor }}
                    >
                        <Plus className="h-4 w-4" />
                        Add ₹10,000
                    </button>
                </div>
            </div> */}


            {/* Live Rate */}
            <div className="mb-4 rounded-xl shadow-lg bg-white p-4 sm:mb-6 sm:rounded-2xl sm:p-5 dark:border-neutral-700 dark:bg-neutral-800">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                    <div>
                        <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500 sm:h-2.5 sm:w-2.5" />
                            <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-neutral-400">
                                Live {isGold ? "Gold" : "Silver"} Rate {isGold ? "(24K)" : "(999)"}
                            </p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                            ₹{buyPrice.toFixed(2)}
                            <span className="text-sm font-normal text-gray-500 sm:text-base">/gram</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-0">
                        <div className="flex items-center gap-1.5 text-green-600 sm:mb-1 dark:text-green-400">
                            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="text-sm font-semibold">+1.2%</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-2 py-1 text-[10px] text-orange-700 sm:px-3 sm:py-1.5 sm:text-xs dark:bg-orange-900/30 dark:text-orange-400">
                            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span>Valid for {formatTime(timeLeft)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Amount Inputs */}
            <div className="mb-4 shadow-lg bg-white p-4 sm:mb-6 sm:rounded-2xl sm:p-6 dark:border-neutral-700 dark:bg-neutral-800">
                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-neutral-300">
                    Enter Amount
                </label>
                <div className="flex items-center gap-3">
                    {/* INR */}
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-gray-500">₹</span>
                        <input
                            type="number"
                            min="0"
                            value={amountInr}
                            onChange={(e) => onInrChange(e.target.value)}
                            placeholder="100"
                            className="w-full rounded-xl border px-8 py-3 font-semibold text-gray-700 dark:bg-neutral-900 dark:text-white"
                        />
                    </div>
                    {/* Swap */}
                    <button
                        onClick={() => {
                            const tmpInr = amountInr;
                            const tmpGm = amountGm;
                            setAmountInr(tmpInr);
                            setAmountGm(tmpGm);
                        }}
                        className="flex h-12 w-12 items-center justify-center rounded-full font-bold shadow"
                        style={{ backgroundColor: accentColor }}
                    >
                        ⇆
                    </button>
                    {/* Grams */}
                    <div className="relative flex-1">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-gray-500">gm</span>
                        <input
                            type="number"
                            min="0"
                            value={amountGm}
                            onChange={(e) => onGmChange(e.target.value)}
                            placeholder="0.00"
                            step="0.0001"
                            className="w-full rounded-xl border px-4 py-3 pr-12 font-semibold text-gray-700 dark:bg-neutral-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Insufficient balance */}
            {isInsufficient && (
                <div className="mb-6 mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                    Insufficient wallet balance. Available: ₹{walletBalance.toFixed(2)}
                </div>
            )}

            {/* Info Box */}
            <div className="mb-4 rounded-lg bg-blue-50 p-3 sm:mb-6 sm:rounded-xl sm:p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-start gap-2 sm:gap-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />
                    <div className="text-xs sm:text-sm">
                        <p className="mb-0.5 font-medium text-blue-900 sm:mb-1 dark:text-blue-300">
                            {isGold ? "Purity: 24K / 999" : "Purity: 999 Fine Silver"}
                        </p>
                        <p className="text-blue-700 dark:text-blue-400">
                            Stored securely in Zold Vault with AT Plus Jewellers
                        </p>
                    </div>
                </div>
            </div>

            {/* Price Breakdown */}
            {amountInr && (
                <div className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:mb-6 sm:rounded-2xl sm:p-6 dark:border-neutral-700 dark:bg-neutral-800">
                    <h3 className="mb-3 text-sm font-bold text-gray-900 sm:mb-4 sm:text-base dark:text-white">
                        Price Breakdown
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-neutral-400">
                                {isGold ? "Gold" : "Silver"} Value ({grams.toFixed(4)}g)
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">₹{rupees.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-neutral-400">GST ({gstRate}%)</span>
                            <span className="font-medium text-gray-900 dark:text-white">₹{gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-3 dark:border-neutral-700">
                            <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                            <span className="text-xl font-bold text-[#1a1a2e] dark:text-[#FCDE5B]">
                                ₹{totalAmount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            {/* Buy Button */}
            <button
                onClick={handleBuy}
                disabled={!amountInr || rupees < 100 || totalAmount > walletBalance || loading || buying}
                className="w-full rounded-lg py-4 text-lg font-bold text-[#1a1a2e] shadow-lg transition-all hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                style={{ backgroundColor: accentColor }}
            >
                {buying
                    ? "Processing..."
                    : totalAmount > walletBalance
                        ? "Insufficient Balance"
                        : `Buy ${isGold ? "Gold" : "Silver"} • ₹${totalAmount.toFixed(0)}`}
            </button>
        </div>
    );
}

// ══════════════════════════════════════════════════════
//  SELL panel (shared for Gold & Silver)
// ══════════════════════════════════════════════════════
function SellPanel({
    metal,
    sellPrice,
    buyPrice,
    goldBalance,
    onClose,
    onSell,
    onViewWallet,
}: {
    metal: Metal;
    sellPrice: number;
    buyPrice: number;
    goldBalance: number;
    onClose: () => void;
    onSell: (grams: number) => Promise<boolean>;
    onViewWallet: () => void;
}) {
    const isGold = metal === "gold";
    const accentColor = isGold ? "#FCDE5B" : "#9EA8B7";
    const gstRate = 3;
    const [step, setStep] = useState<SellStep>("amount");
    const [gramsValue, setGramsValue] = useState("");
    const [rupeesValue, setRupeesValue] = useState("");
    const [isProceedChecked, setIsProceedChecked] = useState(false);
    const [selling, setSelling] = useState(false);
    const [error, setError] = useState("");
    const [timeLeft, setTimeLeft] = useState(300);

    const priceDifference = buyPrice - sellPrice;
    const spreadPercentage = ((priceDifference / buyPrice) * 100).toFixed(2);

    useEffect(() => {
        if (timeLeft > 0) {
            const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
            return () => clearInterval(t);
        }
    }, [timeLeft]);

    const handleGramsChange = (val: string) => {
        setGramsValue(val);
        const g = parseFloat(val || "0");
        setRupeesValue(val ? (g * sellPrice).toFixed(2) : "");
    };

    const handleRupeesChange = (val: string) => {
        setRupeesValue(val);
        const r = parseFloat(val || "0");
        setGramsValue(val ? (r / sellPrice).toFixed(4) : "");
    };

    const grams = parseFloat(gramsValue || "0");
    const rupees = parseFloat(rupeesValue || "0");
    const gst = rupees * (gstRate / 100);
    const netAmount = rupees - gst;
    const isValidAmount = grams > 0 && grams <= goldBalance && grams >= 0.01;
    const isInsufficientGold = grams > goldBalance;

    const handleSell = async () => {
        setSelling(true);
        setError("");
        const ok = await onSell(grams);
        setSelling(false);
        if (ok) setStep("success");
        else setError("Sale failed. Please try again.");
    };

    if (step === "success") {
        return (
            <div className="mx-auto max-w-md text-center">
                <div className="mb-4 rounded-xl border border-gray-100 bg-white p-6 shadow-xl sm:mb-6 sm:rounded-2xl sm:p-8 dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="relative mx-auto mb-4 h-20 w-20 rounded-full bg-green-100 p-5 sm:mb-6 sm:h-24 sm:w-24 sm:p-6 dark:bg-green-900/30">
                        <CheckCircle className="absolute inset-0 m-auto h-10 w-10 text-green-600 sm:h-12 sm:w-12 dark:text-green-500" />
                        <Sparkles className="absolute -top-1 -right-1 h-5 w-5 animate-pulse sm:-top-2 sm:-right-2 sm:h-6 sm:w-6" style={{ color: accentColor }} />
                    </div>
                    <h1 className="mb-2 text-xl font-bold text-gray-900 sm:mb-3 sm:text-2xl dark:text-white">Sale Successful!</h1>
                    <p className="mb-4 text-sm text-gray-600 sm:mb-6 dark:text-neutral-400">
                        You sold{" "}
                        <span className="font-bold" style={{ color: accentColor }}>
                            {grams.toFixed(4)} grams
                        </span>{" "}
                        of {isGold ? "Gold" : "Silver"}
                    </p>
                    <div className="mb-4 rounded-lg p-4 sm:mb-6" style={{ backgroundColor: `${accentColor}18`, border: `1px solid ${accentColor}40` }}>
                        <p className="text-xs text-gray-600 mb-1 dark:text-neutral-400">Net Amount Received</p>
                        <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">₹{netAmount.toFixed(2)}</p>
                    </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                    <button
                        onClick={onViewWallet}
                        className="w-full rounded-lg py-3.5 text-base font-bold text-[#1a1a2e] shadow-lg transition-all sm:rounded-xl sm:py-4 sm:text-lg"
                        style={{ backgroundColor: accentColor }}
                    >
                        View Wallet
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:rounded-xl sm:py-4 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Live Rate */}
            <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
                            <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">
                                Live Sell Rate {isGold ? "(24K)" : "(999 Silver)"}
                            </p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            ₹{sellPrice.toFixed(2)}
                            <span className="text-base font-normal text-gray-500">/gram</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                            <TrendingDown className="h-4 w-4" />
                            <span className="text-sm font-semibold">-{spreadPercentage}%</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-xs text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Valid for {formatTime(timeLeft)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gold/Silver Balance */}
            <div className="mb-4 rounded-xl p-4 shadow-xl sm:mb-6 sm:rounded-2xl sm:p-5" style={{ background: "linear-gradient(to right, #1a1a2e, #16213e)" }}>
                <div className="flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                    <div>
                        <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
                            <Coins className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: accentColor }} />
                            <span className="text-xs font-medium sm:text-sm" style={{ color: accentColor }}>
                                Available to Sell
                            </span>
                        </div>
                        <p className="text-2xl font-bold sm:text-3xl">{goldBalance.toFixed(4)}g</p>
                        <p className="mt-0.5 text-[10px] text-white/70 sm:mt-1 sm:text-xs">
                            ≈ ₹{(goldBalance * sellPrice).toFixed(2)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2 sm:px-4" style={{ backgroundColor: `${accentColor}30` }}>
                        <Shield className="h-4 w-4" style={{ color: accentColor }} />
                        <span className="text-xs font-medium sm:text-sm" style={{ color: accentColor }}>
                            Zold Vault
                        </span>
                    </div>
                </div>
            </div>

            {/* Amount Inputs */}
            <div className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6 dark:border-neutral-700 dark:bg-neutral-800">
                <div className="flex items-center gap-3">
                    {/* Grams */}
                    <div className="relative flex-1">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-gray-500">gm</span>
                        <input
                            type="number"
                            min="0"
                            step="0.0001"
                            value={gramsValue}
                            onChange={(e) => handleGramsChange(e.target.value)}
                            placeholder="100"
                            className="w-full rounded-xl border px-4 py-3 pr-12 font-semibold text-black"
                        />
                    </div>
                    {/* Swap (decorative) */}
                    <button className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold shadow" style={{ backgroundColor: accentColor }}>
                        ⇆
                    </button>
                    {/* Rupees */}
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-gray-500">₹</span>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={rupeesValue}
                            onChange={(e) => handleRupeesChange(e.target.value)}
                            placeholder="1000"
                            className="w-full rounded-xl border px-8 py-3 font-semibold text-black"
                        />
                    </div>
                </div>
                {isInsufficientGold && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                        Insufficient {isGold ? "Gold" : "Silver"}. Available: {goldBalance.toFixed(4)}g
                    </div>
                )}
            </div>

            {/* Quick amounts */}
            <div className="mb-4 grid grid-cols-4 gap-2 sm:mb-6 sm:gap-3">
                {[0.5, 1.0, 2.0, 5.0].map((g) => (
                    <button
                        key={g}
                        onClick={() => handleGramsChange(g.toString())}
                        className="rounded-lg border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-700 transition-all hover:shadow-sm sm:rounded-xl sm:py-3 sm:text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                        {g}g
                    </button>
                ))}
            </div>

            {/* Price Breakdown */}
            {gramsValue && isValidAmount && (
                <div className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:mb-6 sm:rounded-2xl sm:p-6 dark:border-neutral-700 dark:bg-neutral-800">
                    <h3 className="mb-3 text-sm font-bold text-gray-900 sm:mb-4 sm:text-base dark:text-white">Estimated Proceeds</h3>
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-600 dark:text-neutral-400">{isGold ? "Gold" : "Silver"} Value ({grams.toFixed(4)}g)</span>
                            <span className="font-medium text-gray-900 dark:text-white">₹{rupees.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-600 dark:text-neutral-400">GST ({gstRate}%)</span>
                            <span className="font-medium text-red-600 dark:text-red-400">- ₹{gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-2 sm:pt-3 dark:border-neutral-700">
                            <span className="text-sm font-bold text-gray-900 sm:text-base dark:text-white">Net Amount</span>
                            <span className="text-sm font-bold text-green-600 sm:text-base dark:text-green-400">₹{netAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Important Notes */}
            <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 p-3 sm:mb-6 sm:rounded-2xl sm:p-4 dark:border-orange-800 dark:bg-orange-900/20">
                <div className="flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-orange-600 sm:h-5 sm:w-5 dark:text-orange-400" />
                    <div className="text-xs sm:text-sm">
                        <p className="mb-1 font-semibold text-orange-900 dark:text-orange-300">Important Notes</p>
                        <ul className="space-y-0.5 text-orange-800 sm:space-y-1 dark:text-orange-400">
                            <li>• GST @{gstRate}% will be deducted from the proceeds</li>
                            <li>• Final amount subject to purity verification</li>
                            <li>• Processing time varies by settlement method</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Proceed checkbox (only show on storage step — simplified here) */}
            {step === "amount" && isValidAmount && (
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="proceedConfirm"
                            checked={isProceedChecked}
                            onChange={(e) => setIsProceedChecked(e.target.checked)}
                            className="mt-1"
                        />
                        <div>
                            <label htmlFor="proceedConfirm" className="text-gray-900 dark:text-white text-sm">
                                I understand that by proceeding, I am selling {grams.toFixed(4)} grams of {isGold ? "gold" : "silver"}
                            </label>
                            <p className="mt-1 text-xs text-gray-600 dark:text-neutral-400">
                                This action is irreversible. Your {isGold ? "gold" : "silver"} will be deducted from your vault balance.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                </div>
            )}

            {/* Sell Button */}
            <button
                onClick={handleSell}
                disabled={!isValidAmount || !isProceedChecked || selling}
                className="w-full rounded-xl py-3.5 text-base font-bold text-[#1a1a2e] shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 sm:rounded-2xl sm:py-4 sm:text-lg"
                style={{ backgroundColor: isValidAmount && isProceedChecked ? accentColor : undefined }}
            >
                {selling
                    ? "Processing..."
                    : `Sell ${isGold ? "Gold" : "Silver"} • ₹${netAmount.toFixed(0)}`}
            </button>
        </div>
    );
}

// ══════════════════════════════════════════════════════
//  MAIN: BuySellFlow
// ══════════════════════════════════════════════════════
export function BuySellFlow({ onClose, defaultMetal = "gold", defaultAction = "buy" }: BuySellFlowProps) {
    const router = useRouter();
    const [metal, setMetal] = useState<Metal>(defaultMetal);
    const [action, setAction] = useState<Action>(defaultAction);

    // ── Gold state ──
    const [goldBuyPrice, setGoldBuyPrice] = useState(6245.5);
    const [goldSellPrice, setGoldSellPrice] = useState(6180.75);
    const [walletBalance, setWalletBalance] = useState(0);
    const [goldBalance, setGoldBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    // ── Silver state (mock prices — replace with API when ready) ──
    const [silverBuyPrice] = useState(SILVER_BUY_PRICE);
    const [silverSellPrice] = useState(SILVER_SELL_PRICE);
    const [silverBalance] = useState(0);

    const isGold = metal === "gold";

    const fetchTestWallet = useCallback(async () => {
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/gold/test-wallet`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setWalletBalance(parseFloat(data.data.virtualBalance));
        } catch (e) { console.error(e); }
    }, []);

    const fetchGoldData = useCallback(async () => {
        try {
            const token = getAuthToken();
            const [ratesRes, balanceRes, txRes] = await Promise.allSettled([
                fetch(`${API_URL}/gold/rates/current`).then(r => r.json()),
                fetch(`${API_URL}/gold/wallet/balance`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
                fetch(`${API_URL}/gold/transactions?limit=10`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            ]);
            if (ratesRes.status === "fulfilled" && ratesRes.value.success) {
                setGoldBuyPrice(parseFloat(ratesRes.value.data.buyRate));
                setGoldSellPrice(parseFloat(ratesRes.value.data.sellRate));
            }
            if (balanceRes.status === "fulfilled" && balanceRes.value.success) {
                setGoldBalance(parseFloat(balanceRes.value.data.goldBalance) || 0);
            }
            if (txRes.status === "fulfilled" && txRes.value.success) {
                setTransactions(txRes.value.data);
            }
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        fetchTestWallet();
        fetchGoldData();

        const socket: Socket = io(
            process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3005",
            { transports: ["websocket", "polling"], reconnection: true }
        );
        socket.on("goldPriceUpdate", (data: { buyRate: number; sellRate: number }) => {
            setGoldBuyPrice(data.buyRate);
            setGoldSellPrice(data.sellRate);
        });
        return () => { socket.disconnect(); };
    }, [fetchTestWallet, fetchGoldData]);

    const addTestCredits = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/gold/test-wallet/add-credits`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ amount: 10000 }),
            });
            const data = await res.json();
            if (data.success) setWalletBalance(parseFloat(data.data.virtualBalance));
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleBuyGold = async (inr: number, grams: number): Promise<boolean> => {
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/gold/buy`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ amountInRupees: inr, goldGrams: grams, storageType: "vault" }),
            });
            const data = await res.json();
            if (data.success) { await fetchTestWallet(); await fetchGoldData(); return true; }
        } catch (e) { console.error(e); }
        return false;
    };

    const handleSellGold = async (grams: number): Promise<boolean> => {
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/gold/sell`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ goldGrams: grams }),
            });
            const data = await res.json();
            if (data.success) { await fetchGoldData(); return true; }
        } catch (e) { console.error(e); }
        return false;
    };

    // Silver: mock handlers (show alert for now)
    const handleBuySilver = async (_inr: number, _grams: number): Promise<boolean> => {
        await new Promise(r => setTimeout(r, 1000));
        return true; // mock success
    };
    const handleSellSilver = async (_grams: number): Promise<boolean> => {
        await new Promise(r => setTimeout(r, 1000));
        return true; // mock success
    };

    const currentBuyPrice = isGold ? goldBuyPrice : silverBuyPrice;
    const currentSellPrice = isGold ? goldSellPrice : silverSellPrice;
    const currentBalance = isGold ? goldBalance : silverBalance;

    // ── Gradient colours per metal ──
    const headerGradient = isGold
        ? "from-[#f6e8bd] to-[#f1dda5]"
        : "from-[#d7dde6] to-[#b0b8c6]";
    const actionActiveGold = "bg-[#EEC762] text-[#1a1a2e]";
    const actionActiveSilver = "bg-[#9EA8B7] text-white";
    const actionActive = isGold ? actionActiveGold : actionActiveSilver;

    return (
        <div className="fixed inset-0 z-50 flex min-h-screen flex-col overflow-y-auto bg-gray-50 dark:bg-neutral-900">
            {/* ── Header ── */}
            <div
                className={`sticky top-0 z-10 bg-gradient-to-r ${headerGradient} px-4 py-4 sm:px-6 sm:py-5 relative rounded-b-[50px]`}
            >
                {/* TOP ROW */}
                <div className="mx-auto flex max-w-4xl items-center justify-between relative">

                    {/* BACK BUTTON */}
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 transition-colors hover:bg-black/10 sm:p-2"
                    >
                        <ArrowLeft className="h-5 w-5 text-[#1a1a2e] sm:h-6 sm:w-6" />
                    </button>

                    {/* GOLD | SILVER CENTER BIG */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-10 mb-4">

                        {/* GOLD */}
                        <button
                            onClick={() => setMetal("gold")}
                            className={`relative px-2 py-2 text-xl sm:text-2xl font-extrabold tracking-wide transition-all ${metal === "gold"
                                ? "text-[#1a1a2e]/80"
                                : "text-[#1a1a2e]/60 hover:text-[#1a1a2e]/80"
                                }`}
                        >
                            GOLD
                            {metal === "gold" && (
                                <motion.div
                                    layoutId="metalUnderline"
                                    className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#1a1a2e] rounded-full"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>

                        {/* SILVER */}
                        <button
                            onClick={() => setMetal("silver")}
                            className={`relative px-2 py-2 text-xl sm:text-2xl font-extrabold tracking-wide transition-all ${metal === "silver"
                                ? "text-[#1a1a2e]"
                                : "text-[#1a1a2e]/60 hover:text-[#1a1a2e]/80"
                                }`}
                        >
                            SILVER
                            {metal === "silver" && (
                                <motion.div
                                    layoutId="metalUnderline"
                                    className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#1a1a2e] rounded-full"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>

                    </div>
                </div>

                {/* BUY | SELL action tabs */}
                <div className="mx-auto mt-5 flex max-w-md justify-center gap-3">
                    <button
                        onClick={() => setAction("buy")}
                        className={`flex-1 max-w-[120px] rounded-lg py-2.5 text-sm font-bold transition-all ${action === "buy"
                            ? actionActive
                            : "bg-[#1a1a2e]/10 text-[#1a1a2e]/70 hover:bg-[#1a1a2e]/20"
                            }`}
                    >
                        Buy
                    </button>

                    <button
                        onClick={() => setAction("sell")}
                        className={`flex-1 max-w-[120px] rounded-lg py-2.5 text-sm font-bold transition-all ${action === "sell"
                            ? actionActive
                            : "bg-[#1a1a2e]/10 text-[#1a1a2e]/70 hover:bg-[#1a1a2e]/20"
                            }`}
                    >
                        Sell
                    </button>
                </div>
            </div>
            {/* ── Content ── */}
            <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-4 pb-24 sm:px-6 sm:py-6">
                {action === "buy" ? (
                    <BuyPanel
                        metal={metal}
                        buyPrice={currentBuyPrice}
                        walletBalance={walletBalance}
                        onAddCredits={addTestCredits}
                        loading={loading}
                        transactions={transactions}
                        onBuy={isGold ? handleBuyGold : handleBuySilver}
                        onClose={onClose}
                        onViewWallet={() => { onClose(); router.push("/wallet"); }}
                    />
                ) : (
                    <SellPanel
                        metal={metal}
                        sellPrice={currentSellPrice}
                        buyPrice={currentBuyPrice}
                        goldBalance={currentBalance}
                        onClose={onClose}
                        onSell={isGold ? handleSellGold : handleSellSilver}
                        onViewWallet={() => { onClose(); router.push("/wallet"); }}
                    />
                )}
            </div>
        </div>
    );
}