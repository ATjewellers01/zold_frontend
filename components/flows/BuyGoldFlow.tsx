import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  ChevronRight,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface BuyGoldFlowProps {
  onClose: () => void;
}

type Step = "amount" | "success";

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

export function BuyGoldFlow({ onClose }: BuyGoldFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("amount");
  const [inputMode, setInputMode] = useState<"rupees" | "grams">("rupees");
  const [amount, setAmount] = useState("");
  const [selectedStorage] = useState<"vault">("vault");
  const [timeLeft, setTimeLeft] = useState(300);

  const [testWalletBalance, setTestWalletBalance] = useState(0);
  const [goldBuyPrice, setGoldBuyPrice] = useState(6245.5);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const gstRate = 3;

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const fetchTestWallet = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/gold/test-wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTestWalletBalance(parseFloat(data.data.virtualBalance));
      }
    } catch (error) {
      console.error("Error fetching test wallet:", error);
    }
  }, []);

  const fetchGoldRate = async () => {
    try {
      const response = await fetch(`${API_URL}/gold/rates/current`);
      const data = await response.json();
      if (data.success) {
        setGoldBuyPrice(parseFloat(data.data.buyRate));
      }
    } catch (error) {
      console.error("Error fetching gold rate:", error);
    }
  };

  const fetchTransactions = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/gold/transactions?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, []);

  const addTestCredits = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/gold/test-wallet/add-credits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 10000 }),
      });
      const data = await response.json();
      if (data.success) {
        setTestWalletBalance(parseFloat(data.data.virtualBalance));
      }
    } catch (error) {
      console.error("Error adding credits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyGold = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      // Regular gold purchase (digital gold only)
      const response = await fetch(`${API_URL}/gold/buy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountInRupees: rupees,
          goldGrams: grams,
          storageType: selectedStorage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTestWallet();
        await fetchTransactions();
        setStep("success");
      } else {
        setError(data.message || "Failed to purchase gold");
      }
    } catch (error: unknown) {
      console.error("Error buying gold:", error);
      setError(error instanceof Error ? error.message : "Failed to purchase gold");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestWallet();
    fetchGoldRate();
    fetchTransactions();

    const socket: Socket = io(
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
        "http://localhost:5001",
      {
        transports: ["websocket", "polling"],
        reconnection: true,
      },
    );

    socket.on(
      "goldPriceUpdate",
      (data: { buyRate: number; sellRate: number }) => {
        setGoldBuyPrice(data.buyRate);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [fetchTestWallet, fetchTransactions]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const calculateGrams = (rupees: number) => rupees / goldBuyPrice;
  const calculateRupees = (grams: number) => grams * goldBuyPrice;

  const inputValue = parseFloat(amount) || 0;

  // Calculate grams and rupees based on input mode
  const grams = inputMode === "rupees" ? calculateGrams(inputValue) : inputValue;
  const rupees = inputMode === "grams" ? calculateRupees(inputValue) : inputValue;

  const gst = rupees * (gstRate / 100);
  const totalAmount = rupees + gst;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col overflow-y-auto bg-gray-50 dark:bg-neutral-900">
      {/* Header - Responsive */}
      <div className="sticky top-0 z-10 bg-linear-to-br from-[#FCDE5B] via-[#f5d347] to-[#edc830] px-4 py-3 shadow-lg sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="rounded-full p-1.5 transition-colors hover:bg-black/10 sm:p-2"
            >
              <X className="h-5 w-5 text-[#1a1a2e] sm:h-6 sm:w-6" />
            </button>
            <h2 className="text-lg font-bold text-[#1a1a2e] sm:text-xl">
              Buy Gold
            </h2>
          </div>
          <div className="rounded-full bg-[#1a1a2e]/10 px-2.5 py-1 sm:px-3">
            <span className="text-xs font-medium text-[#1a1a2e] sm:text-sm">
              Step {step === "amount" ? 1 : 2} of 2
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Container */}
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-4 pb-24 sm:px-6 sm:py-6 lg:px-8">
        {/* Test Wallet Banner - Responsive */}
        <div className="mb-4 rounded-xl bg-linear-to-r from-[#1a1a2e] to-[#16213e] p-4 shadow-xl sm:mb-6 sm:rounded-2xl sm:p-5">
          <div className="flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div>
              <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
                <WalletIcon className="h-4 w-4 text-[#FCDE5B] sm:h-5 sm:w-5" />
                <span className="text-xs font-medium text-[#FCDE5B] sm:text-sm">
                  🧪 TEST MODE
                </span>
              </div>
              <p className="text-2xl font-bold sm:text-3xl">
                ₹{testWalletBalance.toFixed(2)}
              </p>
              <p className="mt-0.5 text-[10px] text-white/70 sm:mt-1 sm:text-xs">
                Test Wallet Balance
              </p>
            </div>
            <button
              onClick={addTestCredits}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FCDE5B] px-3 py-2 text-sm font-semibold text-[#1a1a2e] transition-colors hover:bg-[#f5d347] disabled:opacity-50 sm:w-auto sm:rounded-xl sm:px-4 sm:py-2.5"
            >
              <Plus className="h-4 w-4" />
              Add ₹10,000
            </button>
          </div>
        </div>

        {/* Recent Transactions - Horizontal Scroll (Responsive) */}
        {transactions.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <p className="mb-2 text-xs font-medium text-gray-500 sm:mb-3 sm:text-sm dark:text-neutral-400">
              Recent Purchases
            </p>
            <div
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:gap-3"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {transactions.slice(0, 5).map((txn) => (
                <div
                  key={txn.id}
                  className="min-w-[110px] shrink-0 rounded-lg border border-gray-100 bg-white px-3 py-2.5 sm:min-w-[130px] sm:rounded-xl sm:px-4 sm:py-3 dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <Coins className="h-3 w-3 text-[#FCDE5B] sm:h-3.5 sm:w-3.5" />
                    <span className="text-xs font-bold text-gray-900 sm:text-sm dark:text-white">
                      {txn.goldGrams.toFixed(3)}g
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 sm:text-xs dark:text-neutral-400">
                    ₹{parseFloat(txn.finalAmount.toString()).toFixed(0)}
                  </p>
                  <p className="text-[10px] text-gray-400 sm:text-xs dark:text-neutral-500">
                    {formatDate(txn.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "amount" && (
          <div className="lg:grid lg:grid-cols-2 lg:gap-6">
            {/* Left Column - Rate & Input */}
            <div>
              {/* Live Rate Card - Responsive */}
              <div className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:mb-6 sm:rounded-2xl sm:p-5 dark:border-neutral-700 dark:bg-neutral-800">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                  <div>
                    <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500 sm:h-2.5 sm:w-2.5"></div>
                      <p className="text-xs font-medium text-gray-600 sm:text-sm dark:text-neutral-400">
                        Live Gold Rate (24K)
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                      ₹{goldBuyPrice.toFixed(2)}
                      <span className="text-sm font-normal text-gray-500 sm:text-base">
                        /gram
                      </span>
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

              {/* Input Mode Toggle - Responsive */}
              <div className="mb-4 grid grid-cols-2 gap-1.5 sm:mb-6 sm:gap-2">
                <button
                  onClick={() => {
                    setInputMode("rupees");
                    setAmount("");
                  }}
                  className={`rounded-lg py-2.5 text-xs font-semibold transition-all sm:rounded-xl sm:py-3 sm:text-sm ${
                    inputMode === "rupees"
                      ? "bg-[#FCDE5B] text-[#1a1a2e] shadow-md"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-[#FCDE5B] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                >
                  Buy in ₹
                </button>
                <button
                  onClick={() => {
                    setInputMode("grams");
                    setAmount("");
                  }}
                  className={`rounded-lg py-2.5 text-xs font-semibold transition-all sm:rounded-xl sm:py-3 sm:text-sm ${
                    inputMode === "grams"
                      ? "bg-[#FCDE5B] text-[#1a1a2e] shadow-md"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-[#FCDE5B] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                >
                  Buy in Grams
                </button>
              </div>

              {/* Buy Coins CTA - Navigate to separate page */}
              <button
                onClick={() => router.push("/buy-coins")}
                className="mb-4 flex w-full items-center justify-between rounded-xl border-2 border-[#D4AF37]/30 bg-linear-to-r from-[#fafafa] to-[#fef9e6] p-4 transition-all hover:border-[#D4AF37] hover:shadow-md active:scale-[0.99] sm:mb-6 sm:rounded-2xl sm:p-5 dark:from-[#1a1a1a] dark:to-[#2a2415] dark:border-[#D4AF37]/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-[#f5e6a3] to-[#d4af37] sm:h-12 sm:w-12">
                    <Coins className="h-5 w-5 text-[#5a4a1a] sm:h-6 sm:w-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-[#1a1a1a] sm:text-base dark:text-white">
                      Buy Gold Coins
                    </p>
                    <p className="text-[10px] text-[#888] sm:text-xs">
                      Physical coins • 1g, 2g, 5g, 10g
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#D4AF37]" />
              </button>

              {/* Amount Input - Digital Gold (Responsive) */}
              <div className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:mb-6 sm:rounded-2xl sm:p-6 dark:border-neutral-700 dark:bg-neutral-800">
                <label className="mb-2 block text-sm font-medium text-gray-700 sm:mb-3 dark:text-neutral-300">
                  {inputMode === "rupees"
                    ? "Enter Amount (₹)"
                    : "Enter Weight (grams)"}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={inputMode === "rupees" ? "1000" : "1.0"}
                  step={inputMode === "rupees" ? "100" : "0.1"}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-3 text-lg font-semibold text-gray-800 transition-all focus:border-transparent focus:ring-2 focus:ring-[#FCDE5B] focus:outline-none sm:rounded-xl sm:px-4 sm:py-4 sm:text-xl dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                />
                <p className="mt-1.5 text-xs text-gray-500 sm:mt-2 sm:text-sm dark:text-neutral-500">
                  Minimum: ₹100
                </p>

                {amount && (
                  <div className="mt-3 rounded-lg border border-[#FCDE5B]/30 bg-[#FCDE5B]/10 p-3 sm:mt-4 sm:rounded-xl sm:p-4">
                    <p className="mb-0.5 text-xs text-gray-600 sm:mb-1 sm:text-sm dark:text-neutral-400">
                      You will get
                    </p>
                    {inputMode === "rupees" ? (
                      <p className="text-xl font-bold text-[#1a1a2e] sm:text-2xl dark:text-[#FCDE5B]">
                        {grams.toFixed(4)} grams
                      </p>
                    ) : (
                      <p className="text-xl font-bold text-[#1a1a2e] sm:text-2xl dark:text-[#FCDE5B]">
                        ₹{rupees.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Amount Buttons - Responsive */}
              {inputMode === "rupees" && (
                <div className="mb-4 grid grid-cols-4 gap-1.5 sm:mb-6 sm:gap-3">
                  {[500, 1000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className={`rounded-lg py-2.5 text-xs font-semibold transition-all sm:rounded-xl sm:py-3 sm:text-sm ${
                        amount === amt.toString()
                          ? "bg-[#FCDE5B] text-[#1a1a2e] shadow-md"
                          : "border border-gray-200 bg-white text-gray-700 hover:border-[#FCDE5B] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      }`}
                    >
                      ₹{amt >= 1000 ? `${amt / 1000}K` : amt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Info & Breakdown */}
            <div>
              {/* Info Box - Responsive */}
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 sm:mb-6 sm:rounded-xl sm:p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />
                  <div className="text-xs sm:text-sm">
                    <p className="mb-0.5 font-medium text-blue-900 sm:mb-1 dark:text-blue-300">
                      Purity: 24K / 999
                    </p>
                    <p className="text-blue-700 dark:text-blue-400">
                      Stored securely in Zold Vault with AT Plus Jewellers
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown - Digital Gold (Responsive) */}
              {amount && (
                <div className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:mb-6 sm:rounded-2xl sm:p-6 dark:border-neutral-700 dark:bg-neutral-800">
                  <h3 className="mb-3 text-sm font-bold text-gray-900 sm:mb-4 sm:text-base dark:text-white">
                    Price Breakdown
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600 sm:text-sm dark:text-neutral-400">
                        Gold Value ({grams.toFixed(4)}g)
                      </span>
                      <span className="text-xs font-medium text-gray-900 sm:text-sm dark:text-white">
                        ₹{rupees.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600 sm:text-sm dark:text-neutral-400">
                        GST ({gstRate}%)
                      </span>
                      <span className="text-xs font-medium text-gray-900 sm:text-sm dark:text-white">
                        ₹{gst.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 sm:pt-3 dark:border-neutral-700">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        Total Amount
                      </span>
                      <span className="text-lg font-bold text-[#1a1a2e] sm:text-xl dark:text-[#FCDE5B]">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 sm:mb-6 sm:rounded-xl sm:p-4 dark:border-red-800 dark:bg-red-900/20">
                  <p className="text-xs font-medium text-red-800 sm:text-sm dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Buy Button - Responsive */}
              <button
                onClick={() => handleBuyGold()}
                disabled={
                  !amount || rupees < 100 || totalAmount > testWalletBalance || loading
                }
                className="w-full rounded-lg bg-[#FCDE5B] py-3.5 text-base font-bold text-[#1a1a2e] shadow-lg transition-all hover:bg-[#f5d347] hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 sm:rounded-xl sm:py-4 sm:text-lg dark:disabled:bg-neutral-700"
              >
                {loading
                  ? "Processing..."
                  : totalAmount > testWalletBalance
                    ? "Insufficient Balance"
                    : `Buy Gold • ₹${totalAmount.toFixed(0)}`}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="mx-auto max-w-md text-center">
            <div className="mb-4 rounded-xl border border-gray-100 bg-white p-6 shadow-xl sm:mb-6 sm:rounded-2xl sm:p-8 dark:border-neutral-700 dark:bg-neutral-800">
              <div className="relative mx-auto mb-4 h-20 w-20 rounded-full bg-green-100 p-5 sm:mb-6 sm:h-24 sm:w-24 sm:p-6 dark:bg-green-900/30">
                <CheckCircle className="absolute inset-0 m-auto h-10 w-10 text-green-600 sm:h-12 sm:w-12 dark:text-green-500" />
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 animate-pulse text-[#FCDE5B] sm:-top-2 sm:-right-2 sm:h-6 sm:w-6" />
              </div>

              <h1 className="mb-2 text-xl font-bold text-gray-900 sm:mb-3 sm:text-2xl dark:text-white">
                Purchase Successful!
              </h1>
              <p className="mb-4 text-sm text-gray-600 sm:mb-6 dark:text-neutral-400">
                You have successfully purchased{" "}
                <span className="font-bold text-[#FCDE5B]">
                  {grams.toFixed(4)} grams
                </span>{" "}
                of gold
              </p>

              <div className="mb-4 rounded-lg border border-[#FCDE5B]/30 bg-[#FCDE5B]/10 p-4 sm:mb-6 sm:rounded-xl sm:p-5">
                <p className="mb-0.5 text-xs text-gray-600 sm:mb-1 sm:text-sm dark:text-neutral-400">
                  Remaining wallet balance
                </p>
                <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                  ₹{testWalletBalance.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => {
                  onClose();
                  router.push("/wallet");
                }}
                className="w-full rounded-lg bg-[#FCDE5B] py-3.5 text-base font-bold text-[#1a1a2e] shadow-lg transition-all hover:bg-[#f5d347] sm:rounded-xl sm:py-4 sm:text-lg"
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
        )}
      </div>
    </div>
  );
}
