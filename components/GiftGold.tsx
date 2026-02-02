import { useState, useEffect, useCallback } from "react";
import {
  Gift,
  User,
  Coins,
  Heart,
  Calendar,
  Send,
  X,
  ArrowRight,
  Minus,
  Plus,
  Wallet,
  Scale,
  CheckCircle,
  Loader2,
  UserCheck,
  UserPlus,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { getAuthHeaders } from "../lib/auth";

interface GiftGoldProps {
  onClose: () => void;
}

interface CoinInventory {
  coinGrams: number;
  quantity: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export function GiftGold({ onClose }: GiftGoldProps) {
  const [step, setStep] = useState<
    "amount" | "recipient" | "message" | "confirm"
  >("amount");

  // Gift type state
  const [giftType, setGiftType] = useState<"rupees" | "grams" | "coins">(
    "rupees",
  );

  // Rupees mode
  const [giftAmount, setGiftAmount] = useState(1000);

  // Grams mode
  const [gramsAmount, setGramsAmount] = useState(0.5);

  // Coins mode
  const [selectedCoin, setSelectedCoin] = useState<1 | 2 | 5 | 10>(1);
  const [coinQuantity, setCoinQuantity] = useState(1);
  const [coinInventory, setCoinInventory] = useState<CoinInventory[]>([]);

  // Common fields
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [occasion, setOccasion] = useState("birthday");
  const [isLoading, setIsLoading] = useState(false);

  // User lookup state
  const [lookupResult, setLookupResult] = useState<{
    found: boolean;
    name?: string;
    email?: string;
    id?: string;
    message?: string;
  } | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Gold price
  const [goldPrice, setGoldPrice] = useState(6245.5);

  // Fetch coin inventory and gold price
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch gold price
        const rateRes = await fetch(`${API_URL}/gold/rates/current`);
        const rateData = await rateRes.json();
        if (rateData.success) {
          setGoldPrice(parseFloat(rateData.data.buyRate));
        }

        // Fetch coin inventory
        const coinRes = await fetch(`${API_URL}/coins/inventory`, {
          headers: getAuthHeaders() as HeadersInit,
        });
        const coinData = await coinRes.json();
        if (coinData.success && coinData.data) {
          // API returns { inventory: [...], totalGrams, totalValue }
          setCoinInventory(coinData.data.inventory || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Calculate display values based on gift type
  const getDisplayValues = () => {
    if (giftType === "rupees") {
      const grams = giftAmount / goldPrice;
      return { amount: giftAmount, grams: grams.toFixed(4) };
    } else if (giftType === "grams") {
      const amount = gramsAmount * goldPrice;
      return { amount: amount.toFixed(2), grams: gramsAmount.toFixed(4) };
    } else {
      const totalGrams = selectedCoin * coinQuantity;
      const amount = totalGrams * goldPrice;
      return {
        amount: amount.toFixed(2),
        grams: totalGrams.toFixed(4),
        coins: `${coinQuantity}x ${selectedCoin}g`,
      };
    }
  };

  const displayValues = getDisplayValues();

  // Get coin balance
  const getCoinBalance = (grams: number) => {
    if (!Array.isArray(coinInventory)) return 0;
    const inv = coinInventory.find((c) => c.coinGrams === grams);
    return inv?.quantity || 0;
  };

  // Check if user has any coins at all
  const totalCoinBalance = () => {
    if (!Array.isArray(coinInventory)) return 0;
    return coinInventory.reduce((sum, c) => sum + (c.quantity || 0), 0);
  };

  const occasions = [
    {
      id: "birthday",
      label: "🎂 Birthday",
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "wedding",
      label: "💍 Wedding",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "anniversary",
      label: "❤️ Anniversary",
      color: "from-red-500 to-pink-500",
    },
    {
      id: "diwali",
      label: "🪔 Diwali",
      color: "from-orange-500 to-yellow-500",
    },
    {
      id: "general",
      label: "🎁 General",
      color: "from-blue-500 to-purple-500",
    },
  ];

  const presetAmounts = [500, 1000, 2000, 5000, 10000];
  const presetGrams = [0.1, 0.25, 0.5, 1, 2];
  const coinDenominations: (1 | 2 | 5 | 10)[] = [1, 2, 5, 10];

  const handleSendGift = async () => {
    setIsLoading(true);
    try {
      const payload: Record<string, unknown> = {
        recipientName,
        recipientPhone,
        message: personalMessage,
        occasion,
        giftType,
      };

      if (giftType === "rupees") {
        payload.amount = giftAmount;
      } else if (giftType === "grams") {
        payload.goldGrams = gramsAmount;
      } else {
        payload.coinGrams = selectedCoin;
        payload.coinQuantity = coinQuantity;
      }

      const response = await fetch(`${API_URL}/gold-gifts/send`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Gold gift sent successfully! 🎉");
        onClose();
      } else {
        toast.error(
          data.message || "Failed to send gift. Please check your balance.",
        );
      }
    } catch (error) {
      console.error("Error sending gift:", error);
      toast.error("An error occurred while sending the gift.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 dark:bg-black/70">
      <style>{`.zold-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .zold-hide-scrollbar::-webkit-scrollbar{ display:none; }`}</style>
      <div className="zold-hide-scrollbar max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white dark:bg-neutral-800">
        {/* Header */}
        <div className="sticky top-0 rounded-t-3xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Gift Gold</h2>
                <p className="text-sm text-white/80">
                  Send digital gold to loved ones
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Step Indicator */}
          <div className="mb-6 flex items-center justify-between">
            <div
              className={`flex items-center gap-2 ${step === "amount" ? "text-[#3D3066] dark:text-[#8B7FA8]" : "text-gray-400 dark:text-neutral-500"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "amount" ? "bg-[#3D3066] text-white dark:bg-[#4D3F7F]" : "bg-gray-200 dark:bg-neutral-700"}`}
              >
                1
              </div>
              <span className="text-sm">Amount</span>
            </div>
            <div className="mx-2 h-px flex-1 bg-gray-200 dark:bg-neutral-700"></div>
            <div
              className={`flex items-center gap-2 ${step === "recipient" ? "text-[#3D3066] dark:text-[#8B7FA8]" : "text-gray-400 dark:text-neutral-500"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "recipient" ? "bg-[#3D3066] text-white dark:bg-[#4D3F7F]" : "bg-gray-200 dark:bg-neutral-700"}`}
              >
                2
              </div>
              <span className="text-sm">Recipient</span>
            </div>
            <div className="mx-2 h-px flex-1 bg-gray-200 dark:bg-neutral-700"></div>
            <div
              className={`flex items-center gap-2 ${step === "message" || step === "confirm" ? "text-[#3D3066] dark:text-[#8B7FA8]" : "text-gray-400 dark:text-neutral-500"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "message" || step === "confirm" ? "bg-[#3D3066] text-white dark:bg-[#4D3F7F]" : "bg-gray-200 dark:bg-neutral-700"}`}
              >
                3
              </div>
              <span className="text-sm">Message</span>
            </div>
          </div>

          {/* Step 1: Amount Selection */}
          {step === "amount" && (
            <div>
              {/* Select Occasion */}
              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                  Select Occasion
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {occasions.map((occ) => (
                    <button
                      key={occ.id}
                      onClick={() => setOccasion(occ.id)}
                      className={`rounded-xl border-2 p-3 transition-all ${
                        occasion === occ.id
                          ? "border-[#3D3066] bg-purple-50 dark:border-[#8B7FA8] dark:bg-neutral-700"
                          : "border-gray-200 bg-white hover:border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600"
                      }`}
                    >
                      <p className="text-sm text-gray-900 dark:text-white">
                        {occ.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gift Type Selector */}
              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                  Gift Type
                </h3>
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-100 p-1 dark:bg-neutral-700">
                  <button
                    onClick={() => setGiftType("rupees")}
                    className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all ${
                      giftType === "rupees"
                        ? "bg-white text-[#3D3066] shadow dark:bg-neutral-600 dark:text-white"
                        : "text-gray-600 dark:text-neutral-400"
                    }`}
                  >
                    <Wallet className="h-4 w-4" />
                    Rupees
                  </button>
                  <button
                    onClick={() => setGiftType("grams")}
                    className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all ${
                      giftType === "grams"
                        ? "bg-white text-[#3D3066] shadow dark:bg-neutral-600 dark:text-white"
                        : "text-gray-600 dark:text-neutral-400"
                    }`}
                  >
                    <Scale className="h-4 w-4" />
                    Grams
                  </button>
                  <button
                    onClick={() => setGiftType("coins")}
                    className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all ${
                      giftType === "coins"
                        ? "bg-white text-[#3D3066] shadow dark:bg-neutral-600 dark:text-white"
                        : "text-gray-600 dark:text-neutral-400"
                    }`}
                  >
                    <Coins className="h-4 w-4" />
                    Coins
                  </button>
                </div>
              </div>

              {/* Gift Amount Based on Type */}
              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                  {giftType === "rupees"
                    ? "Gift Amount"
                    : giftType === "grams"
                      ? "Gold Weight"
                      : "Select Coins"}
                </h3>

                {/* By Rupees */}
                {giftType === "rupees" && (
                  <>
                    <div className="mb-4 rounded-2xl bg-linear-to-br from-[#3D3066] to-[#5C4E7F] p-6 text-white dark:from-[#4D3F7F] dark:to-[#5C4E7F]">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-white/80">Amount</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">₹</span>
                          <input
                            type="number"
                            value={giftAmount}
                            onChange={(e) =>
                              setGiftAmount(Number(e.target.value))
                            }
                            className="w-28 rounded-lg bg-white/20 px-3 py-2 text-right text-xl font-bold text-white outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80">Gold</span>
                        <span>{displayValues.grams} grams</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {presetAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setGiftAmount(amount)}
                          className={`rounded-lg border-2 py-3 transition-all ${
                            giftAmount === amount
                              ? "border-[#3D3066] bg-purple-50 text-[#3D3066] dark:border-[#8B7FA8] dark:bg-neutral-700 dark:text-white"
                              : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:border-neutral-600"
                          }`}
                        >
                          ₹{amount}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* By Grams */}
                {giftType === "grams" && (
                  <>
                    <div className="mb-4 rounded-2xl bg-linear-to-br from-amber-500 to-yellow-600 p-6 text-white">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-white/80">Weight</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={gramsAmount}
                            onChange={(e) =>
                              setGramsAmount(Number(e.target.value))
                            }
                            className="w-24 rounded-lg bg-white/20 px-3 py-2 text-right text-xl font-bold text-white outline-none"
                          />
                          <span className="text-lg font-medium">grams</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80">Value</span>
                        <span>₹{displayValues.amount}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {presetGrams.map((g) => (
                        <button
                          key={g}
                          onClick={() => setGramsAmount(g)}
                          className={`rounded-lg border-2 py-3 text-sm transition-all ${
                            gramsAmount === g
                              ? "border-amber-500 bg-amber-50 text-amber-600 dark:bg-neutral-700 dark:text-amber-400"
                              : "border-gray-200 bg-white text-gray-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                          }`}
                        >
                          {g}g
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* By Coins */}
                {giftType === "coins" && (
                  <>
                    {totalCoinBalance() === 0 ? (
                      /* No coins - show buy coins prompt */
                      <div className="py-8 text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-700">
                          <Coins className="h-10 w-10 text-gray-400 dark:text-neutral-500" />
                        </div>
                        <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                          No Coins Available
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-neutral-400">
                          You don't have any gold coins in your inventory. Buy
                          coins first to gift them.
                        </p>
                        <button
                          onClick={() => {
                            onClose();
                            window.location.href = "/coins";
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-3 font-semibold text-white transition-all hover:from-amber-600 hover:to-yellow-700"
                        >
                          <Coins className="h-5 w-5" />
                          Buy Coins
                        </button>
                      </div>
                    ) : (
                      /* Has coins - show coin selector */
                      <>
                        <div className="mb-4 grid grid-cols-2 gap-3">
                          {coinDenominations.map((coin) => {
                            const balance = getCoinBalance(coin);
                            return (
                              <button
                                key={coin}
                                onClick={() => {
                                  setSelectedCoin(coin);
                                  setCoinQuantity(Math.min(1, balance));
                                }}
                                disabled={balance === 0}
                                className={`relative rounded-xl border-2 p-4 transition-all ${
                                  selectedCoin === coin && balance > 0
                                    ? "border-[#3D3066] bg-purple-50 dark:border-[#8B7FA8] dark:bg-neutral-700"
                                    : balance === 0
                                      ? "cursor-not-allowed border-gray-200 bg-gray-100 opacity-50 dark:border-neutral-700 dark:bg-neutral-800"
                                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-neutral-700 dark:bg-neutral-800"
                                }`}
                              >
                                <div className="mb-2 flex items-center justify-center">
                                  <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                      selectedCoin === coin && balance > 0
                                        ? "bg-linear-to-br from-amber-400 to-yellow-600"
                                        : "bg-linear-to-br from-gray-300 to-gray-400 dark:from-neutral-500 dark:to-neutral-600"
                                    }`}
                                  >
                                    <span className="font-bold text-white">
                                      {coin}g
                                    </span>
                                  </div>
                                </div>
                                <p className="text-center font-semibold text-gray-900 dark:text-white">
                                  {coin} Gram Coin
                                </p>
                                <p
                                  className={`text-center text-xs ${balance === 0 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}
                                >
                                  {balance === 0
                                    ? "Not Available"
                                    : `${balance} Available`}
                                </p>
                              </button>
                            );
                          })}
                        </div>

                        {/* Quantity Selector - only show if selected coin has balance */}
                        {getCoinBalance(selectedCoin) > 0 && (
                          <div className="rounded-2xl bg-linear-to-br from-[#3D3066] to-[#5C4E7F] p-4 text-white">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-white/80">Quantity</span>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    setCoinQuantity(
                                      Math.max(1, coinQuantity - 1),
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-8 text-center text-2xl font-bold">
                                  {coinQuantity}
                                </span>
                                <button
                                  onClick={() =>
                                    setCoinQuantity(
                                      Math.min(
                                        getCoinBalance(selectedCoin),
                                        coinQuantity + 1,
                                      ),
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white/80">Total Gold</span>
                              <span>{displayValues.grams} grams</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-sm">
                              <span className="text-white/80">Value</span>
                              <span>₹{displayValues.amount}</span>
                            </div>
                          </div>
                        )}

                        {/* Message if selected coin has no balance */}
                        {getCoinBalance(selectedCoin) === 0 && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                              You don't have any {selectedCoin}g coins. Select a
                              different coin or buy more coins.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={() => setStep("recipient")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3D3066] py-4 font-semibold text-white transition-colors hover:bg-[#5C4E7F] dark:bg-[#4D3F7F] dark:hover:bg-[#5C4E9F]"
              >
                <span>Next</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Step 2: Recipient Details */}
          {step === "recipient" && (
            <div>
              <div className="mb-6">
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                  Recipient Details
                </h3>

                <div className="space-y-4">
                  {/* Mobile Number First - for lookup */}
                  <div>
                    <label className="mb-2 block text-sm text-gray-700 dark:text-neutral-300">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                      <input
                        type="tel"
                        value={recipientPhone}
                        onChange={(e) => {
                          const phone = e.target.value;
                          setRecipientPhone(phone);
                          setLookupResult(null);

                          // Lookup when phone is >= 10 digits
                          const cleanPhone = phone.replace(/[\s\-\+]/g, "");
                          if (cleanPhone.length >= 10) {
                            setIsLookingUp(true);
                            fetch(
                              `${API_URL}/gold-gifts/lookup?phone=${encodeURIComponent(phone)}`,
                              {
                                headers: getAuthHeaders() as HeadersInit,
                              },
                            )
                              .then((res) => res.json())
                              .then((data) => {
                                if (data.success) {
                                  setLookupResult({
                                    found: data.found,
                                    name: data.data?.name,
                                    email: data.data?.email,
                                    id: data.data?.id,
                                    message: data.message,
                                  });
                                  // Auto-fill name if found
                                  if (data.found && data.data?.name) {
                                    setRecipientName(data.data.name);
                                  }
                                }
                              })
                              .catch(console.error)
                              .finally(() => setIsLookingUp(false));
                          }
                        }}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full rounded-xl border border-gray-300 py-3 pr-12 pl-11 text-gray-900 focus:border-[#3D3066] focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:border-[#8B7FA8]"
                      />
                      {/* Loading/Found indicator */}
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        {isLookingUp && (
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        )}
                        {!isLookingUp && lookupResult?.found && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Found Card */}
                  {lookupResult?.found && (
                    <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-800/30">
                          <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-300">
                            {lookupResult.name}
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-400">
                            ZOLD User • {lookupResult.email || "Verified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* New User Card */}
                  {lookupResult && !lookupResult.found && (
                    <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-800/30">
                          <UserPlus className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-amber-900 dark:text-amber-300">
                            New User
                          </p>
                          <p className="text-sm text-amber-700 dark:text-amber-400">
                            {lookupResult.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recipient Name - editable or auto-filled */}
                  <div>
                    <label className="mb-2 block text-sm text-gray-700 dark:text-neutral-300">
                      Recipient Name{" "}
                      {lookupResult?.found && (
                        <span className="text-green-600">(Auto-filled)</span>
                      )}
                    </label>
                    <div className="relative">
                      <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Enter name"
                        readOnly={lookupResult?.found}
                        className={`w-full rounded-xl border py-3 pr-4 pl-11 focus:outline-none ${
                          lookupResult?.found
                            ? "border-green-300 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300"
                            : "border-gray-300 text-gray-800 focus:border-[#3D3066] dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:border-[#8B7FA8]"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    {lookupResult?.found
                      ? "This user is already on ZOLD. The gift will be credited directly to their wallet."
                      : "The recipient will receive an SMS with a link to claim their gold gift. If they don't have a ZOLD account, they'll be guided to create one."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("amount")}
                  className="flex-1 rounded-xl bg-gray-100 py-4 font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("message")}
                  disabled={!recipientName || !recipientPhone}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3D3066] py-4 font-semibold text-white transition-colors hover:bg-[#5C4E7F] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#4D3F7F] dark:hover:bg-[#5C4E9F]"
                >
                  <span>Next</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Personal Message */}
          {step === "message" && (
            <div>
              <div className="mb-6">
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                  Add Personal Message
                </h3>

                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Write your wishes... (optional)"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#3D3066] focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:focus:border-[#8B7FA8]"
                  maxLength={200}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-neutral-500">
                  {personalMessage.length}/200 characters
                </p>

                {/* Preview Card */}
                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                    Preview
                  </h4>
                  <div
                    className={`bg-gradient-to-br ${occasions.find((o) => o.id === occasion)?.color} rounded-2xl p-6 text-white`}
                  >
                    <div className="mb-4 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        {giftType === "coins" ? (
                          <Coins className="h-8 w-8 text-white" />
                        ) : (
                          <Gift className="h-8 w-8 text-white" />
                        )}
                      </div>
                    </div>
                    <h3 className="mb-2 text-center font-semibold">
                      You've received a gold gift!
                    </h3>
                    <p className="mb-4 text-center text-sm text-white/90">
                      {recipientName || "Someone"} gifted you{" "}
                      {giftType === "coins"
                        ? displayValues.coins
                        : `${displayValues.grams}g`}{" "}
                      of 24K gold (₹{displayValues.amount})
                    </p>
                    {personalMessage && (
                      <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                        <p className="text-sm text-white/90 italic">
                          "{personalMessage}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("recipient")}
                  className="flex-1 rounded-xl bg-gray-100 py-4 font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("confirm")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3D3066] py-4 font-semibold text-white transition-colors hover:bg-[#5C4E7F] dark:bg-[#4D3F7F] dark:hover:bg-[#5C4E9F]"
                >
                  <span>Review</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === "confirm" && (
            <div>
              <div className="mb-6">
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                  Confirm Gift Details
                </h3>

                <div className="mb-6 space-y-3">
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-neutral-700">
                    <p className="mb-1 text-sm text-gray-500 dark:text-neutral-400">
                      Gift Type
                    </p>
                    <p className="font-medium text-gray-900 capitalize dark:text-white">
                      {giftType === "coins"
                        ? `${displayValues.coins} Coins`
                        : giftType === "grams"
                          ? "Gold by Weight"
                          : "Gift by Amount"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-neutral-700">
                    <p className="mb-1 text-sm text-gray-500 dark:text-neutral-400">
                      Occasion
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {occasions.find((o) => o.id === occasion)?.label}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-neutral-700">
                    <p className="mb-1 text-sm text-gray-500 dark:text-neutral-400">
                      Recipient
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {recipientName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-neutral-500">
                      {recipientPhone}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-neutral-700">
                    <p className="mb-1 text-sm text-gray-500 dark:text-neutral-400">
                      Gift Amount
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{displayValues.amount} ({displayValues.grams}g gold)
                    </p>
                  </div>
                </div>

                <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <p className="text-xs text-yellow-800 dark:text-yellow-300">
                    {giftType === "coins"
                      ? "The coins will be debited from your coin inventory. The recipient will receive an SMS with instructions to claim their gift."
                      : "The gift amount will be debited from your gold wallet. The recipient will receive an SMS with instructions to claim their gift."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("message")}
                  className="flex-1 rounded-xl bg-gray-100 py-4 font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  onClick={handleSendGift}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3D3066] py-4 font-semibold text-white transition-colors hover:bg-[#5C4E7F] dark:bg-[#4D3F7F] dark:hover:bg-[#5C4E9F]"
                >
                  {isLoading ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Gift</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
