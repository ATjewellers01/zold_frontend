"use client";
import {
  TrendingUp,
  TrendingDown,
  Coins,
  ShoppingBag,
  Truck,
  Repeat,
  MapPin,
  Gift,
  Bell,
  BarChart3,
  Clock,
  Users,
  Calculator,
  Calendar,
  Star,
  Sparkles,
  Target,
  ChevronRight,
} from "lucide-react";
import { ZoldLogo } from "../ZoldLogo";
import { NotificationsPage } from "@/components/NotificationsPage";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { HomeTabSkeleton } from "@/components/skeletons/HomeTabSkeleton";
import { CoinPortfolio } from "@/components/CoinPortfolio";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

/*
 * ZOLD GOLD SHOP - Premium Color Palette
 * Primary Gold: #FCDE5B (Bright Gold)
 * Dark Accent: #1a1a2e (Deep Navy)
 * Secondary Dark: #16213e (Navy Blue)
 * Warm Dark: #2d2d2d (Charcoal)
 * Text: #1a1a1a (Near Black)
 */

interface HomeTabProps {
  isLoading: boolean;
  onLoadingComplete: () => void;
  onBuyGold: () => void;
  onSellGold: () => void;
  onJewellery: () => void;
  onOpenSIPCalculator?: () => void;
  onOpenReferral?: () => void;
  onOpenGiftGold?: () => void;
  onOpenAuspiciousDays?: () => void;
  onOpenGoldGoals?: () => void;
  onOpenWalletDetails?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export function HomeTab({
  isLoading,
  onLoadingComplete,
  onBuyGold,
  onSellGold,
  onJewellery,
  onOpenSIPCalculator,
  onOpenReferral,
  onOpenGiftGold,
  onOpenAuspiciousDays,
  onOpenGoldGoals,
  onOpenWalletDetails,
}: HomeTabProps) {
  const [isInternalLoading, setIsInternalLoading] = useState(true);
  const [goldBuyPrice, setGoldBuyPrice] = useState(6245.5);
  const [goldSellPrice, setGoldSellPrice] = useState(6198.2);
  const priceChange = 1.2;
  const [userGoldGrams, setUserGoldGrams] = useState(0);
  const [userGoldValue, setUserGoldValue] = useState(0);
  const [profitToday, setProfitToday] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const fetchWalletData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setIsInternalLoading(false);
        return;
      }

      try {
        const ratesRes = await fetch(`${API_URL}/gold/rates/current`);
        const ratesData = await ratesRes.json();
        if (ratesData.success) {
          setGoldBuyPrice(parseFloat(ratesData.data.buyRate) || 6245.5);
          setGoldSellPrice(parseFloat(ratesData.data.sellRate) || 6198.2);
        }
      } catch (error) {
        console.error("Error fetching gold rates:", error);
      }

      const balanceRes = await fetch(`${API_URL}/gold/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const balanceData = await balanceRes.json();

      if (balanceData.success) {
        setUserGoldGrams(parseFloat(balanceData.data.goldBalance) || 0);
        setUserGoldValue(parseFloat(balanceData.data.currentValue) || 0);
        setRecentTransactions(balanceData.data.recentTransactions || []);
      }

      const statsRes = await fetch(`${API_URL}/gold/wallet/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();

      if (statsData.success) {
        setProfitToday(parseFloat(statsData.data.profitLoss) || 0);
      }

      // Fetch coin inventory to get total coins
      try {
        const coinsRes = await fetch(`${API_URL}/coins/inventory`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const coinsData = await coinsRes.json();
        if (coinsData.success && coinsData.data?.inventory) {
          const total = coinsData.data.inventory.reduce(
            (sum: number, coin: { quantity: number }) => sum + coin.quantity,
            0,
          );
          setTotalCoins(total);
        }
      } catch (error) {
        console.error("Error fetching coin inventory:", error);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setIsInternalLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();

    const socket: Socket = io(
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
        "http://localhost:5001",
      {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      },
    );

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket for live gold prices");
    });

    socket.on(
      "goldPriceUpdate",
      (data: { buyRate: number; sellRate: number; timestamp: string }) => {
        console.log("📊 Live gold price update received:", data);
        setGoldBuyPrice(data.buyRate);
        setGoldSellPrice(data.sellRate);
      },
    );

    socket.on(
      "goldPriceError",
      (error: { error: string; timestamp: string }) => {
        console.error("❌ Gold price error:", error);
      },
    );

    socket.on("disconnect", () => {
      console.log("🔌 Disconnected from WebSocket");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const [chartTimeframe, setChartTimeframe] = useState<
    "1D" | "1W" | "1M" | "1Y"
  >("1D");
  const [showNotifications, setShowNotifications] = useState(false);

  const priceData = {
    "1D": [
      { time: "9:00", price: 6150 },
      { time: "10:00", price: 6175 },
      { time: "11:00", price: 6160 },
      { time: "12:00", price: 6190 },
      { time: "1:00", price: 6210 },
      { time: "2:00", price: 6195 },
      { time: "3:00", price: 6220 },
      { time: "4:00", price: 6245 },
    ],
    "1W": [
      { time: "Mon", price: 6100 },
      { time: "Tue", price: 6120 },
      { time: "Wed", price: 6090 },
      { time: "Thu", price: 6150 },
      { time: "Fri", price: 6180 },
      { time: "Sat", price: 6200 },
      { time: "Sun", price: 6245 },
    ],
    "1M": [
      { time: "Wk1", price: 6000 },
      { time: "Wk2", price: 6050 },
      { time: "Wk3", price: 6100 },
      { time: "Wk4", price: 6245 },
    ],
    "1Y": [
      { time: "Jan", price: 5800 },
      { time: "Mar", price: 5900 },
      { time: "May", price: 6000 },
      { time: "Jul", price: 5950 },
      { time: "Sep", price: 6100 },
      { time: "Nov", price: 6200 },
      { time: "Dec", price: 6245 },
    ],
  };

  useEffect(() => {
    if (showNotifications) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showNotifications]);

  if (isLoading || isInternalLoading) {
    return <HomeTabSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffef5] to-[#fff9e6] pb-6 dark:from-[#1a1a2e] dark:to-[#0f0f1a] dark:text-gray-100">
      {/* Header - Premium Dark with Gold Accent */}
      <div className="rounded-b-[32px] bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-6 pt-6 pb-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="01.jpg"
              alt="Zold Logo"
              className="h-16 rounded-2xl shadow-xl ring-2 ring-[#FCDE5B]/30"
            />
            <div className="flex items-center gap-1.5 rounded-full border border-[#FCDE5B]/30 bg-[#FCDE5B]/20 px-3 py-1 backdrop-blur-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#FCDE5B]" />
              <span className="text-xs font-semibold text-[#FCDE5B]">
                KYC Verified
              </span>
            </div>
            {/* Coin Badge */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#FCDE5B]/30 bg-[#FCDE5B] px-3 py-1">
              <Coins className="h-3.5 w-3.5 text-[#1a1a2e]" />
              <span className="text-xs font-bold text-[#1a1a2e]">
                {totalCoins} Coins
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowNotifications(true)}
            className="relative rounded-full border border-white/10 bg-white/10 p-2.5 backdrop-blur-sm transition-all hover:bg-white/20"
          >
            <Bell className="h-5 w-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#1a1a2e] bg-[#FCDE5B]"></span>
          </button>
        </div>

        {/* Live Gold Rates - Glassmorphism Card */}
        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-lg backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#FCDE5B] shadow-lg shadow-[#FCDE5B]/50"></div>
            <p className="text-sm font-semibold tracking-wide text-white/90">
              Live Gold Rate (24K)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="mb-1 text-xs tracking-widest text-white/60 uppercase">
                Buy Price
              </p>
              <p className="text-2xl font-bold text-white">
                ₹{goldBuyPrice.toFixed(2)}
                <span className="text-sm font-normal text-white/60">/gm</span>
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs tracking-widest text-white/60 uppercase">
                Sell Price
              </p>
              <p className="text-2xl font-bold text-white">
                ₹{goldSellPrice.toFixed(2)}
                <span className="text-sm font-normal text-white/60">/gm</span>
              </p>
            </div>
          </div>
          <div className="mt-4 flex w-fit items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">
              +{priceChange}% today
            </span>
          </div>
        </div>
      </div>

      <div className="-mt-4 px-5">
        {/* Wallet Summary - Clean White Card */}
        <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-[#2a2a40] dark:bg-[#1e1e32]">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-medium text-gray-600 dark:text-gray-400">
              Your Gold Balance
            </p>
            <div className="rounded-xl bg-[#FCDE5B]/15 p-2">
              <Coins className="h-5 w-5 text-[#d4a500]" />
            </div>
          </div>
          <div className="mb-3">
            <p className="mb-1 text-xs tracking-widest text-gray-400 uppercase">
              Total Gold
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {userGoldGrams.toFixed(3)}{" "}
              <span className="text-lg font-normal text-gray-400">grams</span>
            </p>
          </div>
          <div className="mb-5">
            <p className="mb-1 text-xs tracking-widest text-gray-400 uppercase">
              Current Value
            </p>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ₹{userGoldValue.toLocaleString()}
              </p>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-sm font-semibold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />₹{profitToday}
              </span>
            </div>
          </div>
          <button
            onClick={onOpenWalletDetails}
            className="w-full rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] py-3.5 font-semibold text-white transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]"
          >
            View Wallet Details
          </button>
        </div>

        {/* Gold Coins Portfolio */}
        <div className="mb-5">
          <CoinPortfolio />
        </div>

        {/* Price Chart */}
        <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-xl dark:border-[#2a2a40] dark:bg-[#1e1e32]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-[#FCDE5B]/15 p-2">
                <BarChart3 className="h-5 w-5 text-[#d4a500]" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Gold Price Chart
              </h3>
            </div>
            <button className="flex items-center gap-1.5 text-sm font-semibold text-[#d4a500] transition-colors hover:text-[#b8920a]">
              <Bell className="h-4 w-4" />
              Set Alert
            </button>
          </div>

          {/* Timeframe Buttons */}
          <div className="mb-4 flex gap-2 rounded-xl bg-gray-100 p-1 dark:bg-[#2a2a40]">
            {(["1D", "1W", "1M", "1Y"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setChartTimeframe(tf)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  chartTimeframe === tf
                    ? "bg-[#FCDE5B] text-[#1a1a2e] shadow-md"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height={192}>
              <AreaChart data={priceData[chartTimeframe]}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FCDE5B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FCDE5B" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  className="dark:stroke-[#2a2a40]"
                />
                <XAxis
                  dataKey="time"
                  stroke="#999"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#999"
                  style={{ fontSize: "12px" }}
                  domain={["dataMin - 50", "dataMax + 50"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    color: "#fff",
                    border: "1px solid #FCDE5B",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                  }}
                  formatter={(value) =>
                    typeof value === "number"
                      ? `₹${value.toLocaleString()}`
                      : ""
                  }
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#FCDE5B"
                  strokeWidth={2.5}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Market Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 dark:border-[#2a2a40]">
            <div className="text-center">
              <p className="mb-1 text-xs tracking-widest text-gray-400 uppercase">
                24h High
              </p>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                ₹6,280
              </p>
            </div>
            <div className="border-x border-gray-100 text-center dark:border-[#2a2a40]">
              <p className="mb-1 text-xs tracking-widest text-gray-400 uppercase">
                24h Low
              </p>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                ₹6,145
              </p>
            </div>
            <div className="text-center">
              <p className="mb-1 text-xs tracking-widest text-gray-400 uppercase">
                Volume
              </p>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                125 kg
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {/* Buy Gold - Hero Button */}
            <button
              onClick={onBuyGold}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#FCDE5B] p-5 text-[#1a1a2e] shadow-xl shadow-[#FCDE5B]/30 transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-[#FCDE5B]/40 active:scale-[0.99]"
            >
              <Coins className="h-6 w-6" />
              <span className="text-lg font-bold">Buy Gold</span>
            </button>

            {/* Create Goal */}
            <button
              onClick={onOpenGoldGoals}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] p-5 text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl active:scale-[0.99]"
            >
              <Target className="h-6 w-6 text-[#FCDE5B]" />
              <span className="text-lg font-semibold">Create Gold Goal</span>
            </button>

            {/* Action Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onSellGold}
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-100 bg-white p-4 text-gray-700 shadow-md transition-all hover:border-[#FCDE5B] hover:shadow-lg active:scale-[0.98] dark:border-[#2a2a40] dark:bg-[#1e1e32] dark:text-gray-300"
              >
                <TrendingDown className="h-6 w-6 text-gray-400" />
                <span className="font-semibold">Sell Gold</span>
              </button>
              <button
                onClick={onOpenGiftGold}
                className="flex flex-col items-center gap-2 rounded-xl bg-[#FCDE5B] p-4 text-[#1a1a2e] shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
              >
                <Gift className="h-6 w-6" />
                <span className="font-semibold">Gift Gold</span>
              </button>
              <button
                onClick={onOpenReferral}
                className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-4 text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
              >
                <Users className="h-6 w-6 text-[#FCDE5B]" />
                <span className="font-semibold">Refer</span>
              </button>
              <button
                onClick={onJewellery}
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-100 bg-white p-4 text-gray-700 shadow-md transition-all hover:border-[#FCDE5B] hover:shadow-lg active:scale-[0.98] dark:border-[#2a2a40] dark:bg-[#1e1e32] dark:text-gray-300"
              >
                <ShoppingBag className="h-6 w-6 text-gray-400" />
                <span className="font-semibold">Jewellery</span>
              </button>
            </div>
          </div>
        </div>

        {/* Auspicious Days - Premium Banner */}
        <button
          onClick={onOpenAuspiciousDays}
          className="mb-5 w-full rounded-2xl bg-gradient-to-r from-[#FCDE5B] via-[#f5d347] to-[#edc830] p-6 text-[#1a1a2e] shadow-xl shadow-[#FCDE5B]/20 transition-all hover:scale-[1.005] hover:shadow-2xl active:scale-[0.995]"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 text-left">
              <div className="mb-2 flex items-center gap-2">
                <Star className="h-5 w-5" />
                <p className="text-sm font-bold">
                  शुभ मुहूर्त • Monthly Muhurat
                </p>
              </div>
              <h3 className="mb-1 text-xl font-bold">
                Auspicious Days for Gold
              </h3>
              <p className="mb-3 text-sm font-medium text-[#1a1a2e]/70">
                Next: Pushya Nakshatra • Jan 13 • 5% OFF + Auto-buy
              </p>
              <div className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a2e]/10 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                <span>View all special days</span>
              </div>
            </div>
            <div className="ml-4 text-5xl">✨</div>
          </div>
        </button>

        {/* Gold Goals */}
        <div className="mb-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Your Gold Goals
            </h2>
            <button
              onClick={onOpenGoldGoals}
              className="flex items-center gap-1 text-sm font-semibold text-[#d4a500] transition-colors hover:text-[#b8920a]"
            >
              View All <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Goal Card 1 */}
            <button
              onClick={onOpenGoldGoals}
              className="relative w-full rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-lg transition-all hover:border-[#FCDE5B] hover:shadow-xl active:scale-[0.99] dark:border-[#2a2a40] dark:bg-[#1e1e32]"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-gradient-to-br from-[#FCDE5B] to-[#f5d347] p-3 text-2xl shadow-lg">
                  💍
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-start justify-between">
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      Wedding Jewellery
                    </h4>
                    <span className="rounded-full bg-[#FCDE5B]/20 px-2 py-0.5 text-xs font-bold text-[#d4a500]">
                      25%
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                    Wedding Goal
                  </p>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-[#2a2a40]">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#FCDE5B] to-[#f5d347] transition-all"
                      style={{ width: "25%" }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      ₹1,25,000 / ₹5,00,000
                    </span>
                    <span className="text-gray-400">425 days left</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex w-fit items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" />
                Auto-allocate active
              </div>
            </button>

            {/* Goal Card 2 */}
            <button
              onClick={onOpenGoldGoals}
              className="w-full rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-lg transition-all hover:border-[#FCDE5B] hover:shadow-xl active:scale-[0.99] dark:border-[#2a2a40] dark:bg-[#1e1e32]"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-3 text-2xl shadow-lg">
                  🪔
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-start justify-between">
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      Diwali Gold Purchase
                    </h4>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-[#1a1a2e] dark:bg-[#2a2a40] dark:text-white">
                      45%
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                    Festival Goal
                  </p>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-[#2a2a40]">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#1a1a2e] to-[#16213e] transition-all"
                      style={{ width: "45%" }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      ₹45,000 / ₹1,00,000
                    </span>
                    <span className="text-gray-400">325 days left</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mb-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Transactions
            </h2>
            <button
              onClick={onOpenWalletDetails}
              className="flex items-center gap-1 text-sm font-semibold text-[#d4a500] transition-colors hover:text-[#b8920a]"
            >
              See All <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xl dark:border-[#2a2a40] dark:bg-[#1e1e32]">
            {recentTransactions.slice(0, 3).map((tx, idx) => (
              <div
                key={tx.id}
                className={`flex items-center justify-between py-3 ${idx < 2 ? "border-b border-gray-100 dark:border-[#2a2a40]" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-xl p-2.5 ${tx.type === "BUY" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-rose-50 text-rose-600 dark:bg-rose-900/20"}`}
                  >
                    {tx.type === "SELL" ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {tx.type === "BUY" ? "Bought Gold" : "Sold Gold"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${tx.type === "SELL" ? "text-rose-600" : "text-emerald-600"}`}
                  >
                    +{parseFloat(tx.goldGrams).toFixed(3)} gm
                  </p>
                  <p className="text-xs text-gray-400">
                    ₹{parseFloat(tx.finalAmount).toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promotions */}
        <div className="mb-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            Offers & Promotions
          </h2>
          <div className="space-y-3">
            <div className="rounded-2xl bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6 text-white shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-2 text-xl font-bold">
                    Akshaya Tritiya Special
                  </p>
                  <p className="mb-4 text-sm text-white/70">
                    0% making charges on jewellery conversion up to 10 grams
                  </p>
                  <button
                    onClick={onOpenGiftGold}
                    className="rounded-lg bg-[#FCDE5B] px-5 py-2.5 text-sm font-bold text-[#1a1a2e] transition-all hover:shadow-lg active:scale-[0.98]"
                  >
                    Explore Offers
                  </button>
                </div>
                <Gift className="h-14 w-14 text-[#FCDE5B]/40" />
              </div>
            </div>

            <div className="rounded-2xl bg-[#FCDE5B] p-6 text-[#1a1a2e] shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-2 text-xl font-bold">Launch Offer</p>
                  <p className="mb-4 text-sm text-[#1a1a2e]/70">
                    Refer friends and earn ₹100 gold credit for each successful
                    referral
                  </p>
                  <button
                    onClick={onOpenReferral}
                    className="rounded-lg bg-[#1a1a2e] px-5 py-2.5 text-sm font-bold text-[#FCDE5B] transition-all hover:shadow-lg active:scale-[0.98]"
                  >
                    Refer Now
                  </button>
                </div>
                <Coins className="h-14 w-14 text-[#1a1a2e]/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {showNotifications && (
        <NotificationsPage
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}
