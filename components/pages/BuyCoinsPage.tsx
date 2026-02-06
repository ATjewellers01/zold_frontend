"use client";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  CheckCircle,
  Coins as CoinsIcon,
  CreditCard,
  Heart,
  Home,
  Info,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Truck,
  UserCircle2,
  Wallet,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface CartItem {
  weight: number;
  quantity: number;
  price: number;
}

interface CoinProduct {
  weight: number;
  label: string;
  popular: boolean;
  displayName: string;
  description: string;
}

export default function BuyCoinsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"gold" | "silver">("gold");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinProduct | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [goldBuyPrice, setGoldBuyPrice] = useState(6245.5);
  const [selectedPayment, setSelectedPayment] = useState<"rupees" | "wallet_gold">("rupees");
  const [testWalletBalance, setTestWalletBalance] = useState(0);
  const [userGoldBalance, setUserGoldBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const gstRate = 3;
  const makingCharges = 0;

  const categories = ["All", "Coins", "Bars", "24K", "1g", "2g", "5g", "10g"];

  const coinProducts: CoinProduct[] = [
    { 
      weight: 1, 
      label: "1 Gram", 
      popular: true, 
      displayName: "ZG 1 Gram Gold Mint Bar 24k (99.9%)",
      description: "This ZOLD GOLD 24 Karat gold mint bar with a high-polished finish weighs 1 gram. The best-in-class quality and guaranteed purity of 99.9% gold are of a certified accuracy, the caliber you can never doubt. We offer quality products at the best-assured prices."
    },
    { 
      weight: 2, 
      label: "2 Grams", 
      popular: false, 
      displayName: "ZG 2 Gram Gold Mint Bar 24k (99.9%)",
      description: "This ZOLD GOLD 24 Karat gold mint bar with a high-polished finish weighs 2 grams. The best-in-class quality and guaranteed purity of 99.9% gold are of a certified accuracy, the caliber you can never doubt. We offer quality products at the best-assured prices."
    },
    { 
      weight: 5, 
      label: "5 Grams", 
      popular: false, 
      displayName: "ZG 5 Gram Gold Mint Bar 24k (99.9%)",
      description: "This ZOLD GOLD 24 Karat gold mint bar with a high-polished finish weighs 5 grams. The best-in-class quality and guaranteed purity of 99.9% gold are of a certified accuracy, the caliber you can never doubt. We offer quality products at the best-assured prices."
    },
    { 
      weight: 8, 
      label: "8 Grams", 
      popular: false, 
      displayName: "ZG 8 Gram Gold Mint Bar 24k (99.9%)",
      description: "This ZOLD GOLD 24 Karat gold mint bar with a high-polished finish weighs 8 grams. The best-in-class quality and guaranteed purity of 99.9% gold are of a certified accuracy, the caliber you can never doubt. We offer quality products at the best-assured prices."
    },
    { 
      weight: 10, 
      label: "10 Grams", 
      popular: false, 
      displayName: "ZG 10 Gram Gold Mint Bar 24k (99.9%)",
      description: "This ZOLD GOLD 24 Karat gold mint bar with a high-polished finish weighs 10 grams. The best-in-class quality and guaranteed purity of 99.9% gold are of a certified accuracy, the caliber you can never doubt. We offer quality products at the best-assured prices."
    },
  ];

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const fetchTestWallet = async () => {
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
  };

  const fetchGoldBalance = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/gold/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setUserGoldBalance(parseFloat(data.data.goldBalance) || 0);
      }
    } catch (error) {
      console.error("Error fetching gold balance:", error);
    }
  };

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

  useEffect(() => {
    fetchTestWallet();
    fetchGoldBalance();
    fetchGoldRate();

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
  }, []);

  const addToCart = (coin: CoinProduct, qty: number = 1) => {
    const existingItem = cart.find((item) => item.weight === coin.weight);
    const price = coin.weight * goldBuyPrice;

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.weight === coin.weight
            ? { ...item, quantity: item.quantity + qty }
            : item
        )
      );
    } else {
      setCart([...cart, { weight: coin.weight, quantity: qty, price }]);
    }
  };

  const updateQuantity = (weight: number, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.weight === weight
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (weight: number) => {
    setCart(cart.filter((item) => item.weight !== weight));
  };

  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
  };

  const toggleWishlist = (weight: number) => {
    setWishlist((prev) =>
      prev.includes(weight)
        ? prev.filter((w) => w !== weight)
        : [...prev, weight]
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartGst = cartTotal * (gstRate / 100);
  const cartFinalTotal = cartTotal + cartGst + makingCharges;
  const totalCoins = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartWeight = cart.reduce((sum, item) => sum + item.weight * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setLoading(true);

      const token = getAuthToken();

      if (selectedPayment === "wallet_gold") {
        for (const item of cart) {
          const response = await fetch(`${API_URL}/coins/convert`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              coinGrams: item.weight,
              quantity: item.quantity,
            }),
          });

          const data = await response.json();
          if (!data.success) {
            alert(data.message || "Failed to convert gold to coin");
            setLoading(false);
            return;
          }
        }
        await fetchGoldBalance();
      } else {
        for (const item of cart) {
          const response = await fetch(`${API_URL}/coins/buy`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              coinGrams: item.weight,
              quantity: item.quantity,
            }),
          });

          const data = await response.json();
          if (!data.success) {
            alert(data.message || "Failed to purchase coin");
            setLoading(false);
            return;
          }
        }
        await fetchTestWallet();
      }

      setPurchaseSuccess(true);
      setCart([]);
      setIsCartOpen(false);
      setSelectedCoin(null);
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Failed to complete purchase");
    } finally {
      setLoading(false);
    }
  };

  const getItemInCart = (weight: number) => {
    return cart.find((item) => item.weight === weight);
  };

  const getItemQuantity = (weight: number) => {
    const item = getItemInCart(weight);
    return item ? item.quantity : 0;
  };

  const canAffordCoins = () => {
    if (selectedPayment === "wallet_gold") {
      return userGoldBalance >= totalCartWeight;
    } else {
      return testWalletBalance >= cartFinalTotal;
    }
  };

  // Success modal
  if (purchaseSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-white/95 px-4 backdrop-blur-sm dark:bg-[#0a0a0a]/95">
        <div className="w-full max-w-md animate-[scale-in_0.3s_ease-out] rounded-[24px] border border-[#ECECEC] bg-white p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:border-[#2a2a2a] dark:bg-[#141414]">
          <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 animate-pulse rounded-full bg-green-100 dark:bg-green-900/30" />
            <CheckCircle className="relative h-16 w-16 text-green-600 dark:text-green-500" />
            <Sparkles className="absolute -right-2 -top-2 h-7 w-7 animate-bounce text-[#F5C542]" />
          </div>

          <h1 className="mb-3 text-2xl font-bold text-[#1a1a1a] dark:text-white">
            Order Successful! 🎉
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-[#888]">
            Your {totalCoins} gold coin{totalCoins > 1 ? "s" : ""} ({totalCartWeight}g) {selectedPayment === "wallet_gold" ? "have been converted" : "will be delivered"} successfully
          </p>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-[16px] bg-[#F6F6F6] p-4 dark:bg-[#1a1a1a]">
              <p className="mb-1 text-xs text-gray-600 dark:text-[#888]">Total Coins</p>
              <p className="text-xl font-bold text-[#1a1a1a] dark:text-white">
                {totalCoins}
              </p>
            </div>
            <div className="rounded-[16px] bg-[#F6F6F6] p-4 dark:bg-[#1a1a1a]">
              <p className="mb-1 text-xs text-gray-600 dark:text-[#888]">Total Weight</p>
              <p className="text-xl font-bold text-[#B8960C] dark:text-[#D4AF37]">
                {totalCartWeight}g
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full rounded-full bg-linear-to-r from-[#B8960C] to-[#D4AF37] py-4 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Product Detail View
  if (selectedCoin) {
    const coinPrice = selectedCoin.weight * goldBuyPrice;
    const coinGst = coinPrice * (gstRate / 100);
    const coinTotal = coinPrice + coinGst + makingCharges;
    const [detailQuantity, setDetailQuantity] = useState(1);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 px-4 py-3 backdrop-blur-md dark:bg-[#141414]/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCoin(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-[#F6F6F6] active:scale-95 dark:hover:bg-[#1a1a1a]"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="flex-1 text-sm font-medium text-[#B8960C] dark:text-[#D4AF37]">
              {selectedCoin.displayName}
            </h1>
            <button
              onClick={() => toggleWishlist(selectedCoin.weight)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-[#F6F6F6] active:scale-95 dark:hover:bg-[#1a1a1a]"
            >
              <Heart
                className={`h-5 w-5 transition-all ${
                  wishlist.includes(selectedCoin.weight)
                    ? "fill-[#FF3B30] stroke-[#FF3B30]"
                    : "stroke-gray-600 dark:stroke-gray-400"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pb-24">
          {/* Product Image Carousel */}
          <div className="mb-6 border-b-[3px] border-[#D4AF37] bg-gradient-to-br from-[#fffef5] via-white to-[#fef9e6] px-8 py-8 dark:from-[#1a1a1a] dark:via-[#0a0a0a] dark:to-[#2a2415]">
            <div className="mx-auto max-w-md">
              {/* Gold Bar/Coin Visual */}
              <div className="relative aspect-[3/2] overflow-hidden rounded-[20px] bg-linear-to-br from-[#f5e6a3] via-[#e8c84a] to-[#c9a432] p-8 shadow-[0_12px_40px_rgba(212,175,55,0.4)]">
                {/* Embossed Pattern Background */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="coin-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="20" cy="20" r="15" fill="none" stroke="#3d3015" strokeWidth="1.5" opacity="0.3"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#coin-pattern)" />
                  </svg>
                </div>

                {/* Main Content */}
                <div className="relative flex h-full flex-col items-center justify-center">
                  {/* Top Label */}
                  <div className="mb-4 flex flex-col items-center">
                    <span className="mb-1 text-xs font-bold tracking-[0.2em] text-[#3d3015]/70">
                      FINE GOLD
                    </span>
                    <span className="text-[11px] font-semibold text-[#3d3015]/60">
                      999.9
                    </span>
                  </div>

                  {/* Center Symbol */}
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 shadow-inner">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3d3015]/15">
                      <span className="text-5xl font-bold text-[#3d3015]/50">∞</span>
                    </div>
                  </div>

                  {/* Weight Badge */}
                  <div className="mb-2 rounded-xl bg-white/25 px-5 py-2 shadow-lg backdrop-blur-sm">
                    <span className="text-2xl font-bold tracking-wide text-[#3d3015]">
                      {selectedCoin.weight}gm
                    </span>
                  </div>

                  {/* Bottom Label */}
                  <div className="absolute bottom-4 left-0 right-0">
                    <div className="mx-auto w-fit rounded-full bg-[#3d3015]/10 px-4 py-1">
                      <span className="text-[10px] font-bold tracking-[0.15em] text-[#3d3015]/60">
                        ZOLD GOLD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shine/Gloss Effect */}
                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/30 to-transparent" />
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
              </div>

              {/* Image Carousel Indicators */}
              <div className="mt-5 flex justify-center gap-2">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`h-2 transition-all ${
                      activeImageIndex === index
                        ? "w-6 rounded-full bg-[#B8960C] dark:bg-[#D4AF37]"
                        : "w-2 rounded-full bg-gray-300 dark:bg-[#333]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="px-4">
            <div className="mx-auto max-w-2xl">
              {/* Title & Price */}
              <h2 className="mb-3 text-xl font-bold leading-tight text-[#B8960C] dark:text-[#D4AF37]">
                {selectedCoin.displayName}
              </h2>
              <p className="mb-1 text-[28px] font-bold text-[#B8960C] dark:text-[#D4AF37]">
                ₹ {coinPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
              <p className="mb-6 text-xs text-gray-500 dark:text-[#888]">
                Inclusive of making charges and all taxes*
              </p>

              {/* Weight & Purity Info */}
              <div className="mb-6 flex items-center gap-2">
                <div className="rounded-full bg-[#F6F6F6] px-3 py-1.5 dark:bg-[#1a1a1a]">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Weight: <span className="text-[#B8960C] dark:text-[#D4AF37]">{selectedCoin.weight.toFixed(2)} Gram</span>
                  </span>
                </div>
                <div className="rounded-full bg-[#F6F6F6] px-3 py-1.5 dark:bg-[#1a1a1a]">
                  <span className="text-xs font-semibold text-[#B8960C] dark:text-[#D4AF37]">
                    24K • 999.9
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6 flex items-center rounded-full border-2 border-[#B8960C] dark:border-[#D4AF37]" style={{ width: 'fit-content' }}>
                <button
                  onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}
                  className="flex h-12 w-12 items-center justify-center text-[#B8960C] transition-all hover:bg-[#B8960C]/5 active:scale-95 dark:text-[#D4AF37]"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  value={detailQuantity}
                  onChange={(e) => setDetailQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 border-x-2 border-[#B8960C] bg-white py-3 text-center text-base font-bold text-[#1a1a1a] focus:outline-none dark:border-[#D4AF37] dark:bg-[#0a0a0a] dark:text-white"
                />
                <button
                  onClick={() => setDetailQuantity(detailQuantity + 1)}
                  className="flex h-12 w-12 items-center justify-center text-[#B8960C] transition-all hover:bg-[#B8960C]/5 active:scale-95 dark:text-[#D4AF37]"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mb-8 grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    addToCart(selectedCoin, detailQuantity);
                    setSelectedCoin(null);
                  }}
                  className="rounded-full border-2 border-[#B8960C] bg-white py-4 text-sm font-bold text-[#B8960C] transition-all hover:bg-[#B8960C]/5 hover:shadow-md active:scale-[0.97] dark:border-[#D4AF37] dark:bg-[#0a0a0a] dark:text-[#D4AF37]"
                >
                  ADD TO CART
                </button>
                <button
                  onClick={() => {
                    addToCart(selectedCoin, detailQuantity);
                    setIsCartOpen(true);
                    setSelectedCoin(null);
                  }}
                  className="rounded-full bg-linear-to-r from-[#9c2c3c] to-[#c13a4a] py-4 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.97]"
                >
                  BUY NOW
                </button>
              </div>

              {/* Product Description */}
              <div className="mb-6 rounded-[20px] border border-[#ECECEC] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#141414]">
                <h3 className="mb-3 text-base font-bold text-[#B8960C] dark:text-[#D4AF37]">
                  Product Description
                </h3>
                <p className={`text-sm leading-relaxed text-gray-700 dark:text-gray-300 ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                  {selectedCoin.description}
                </p>
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2 text-xs font-semibold text-[#B8960C] hover:underline dark:text-[#D4AF37]"
                >
                  Read {showFullDescription ? 'less' : 'more'}
                </button>
              </div>

              {/* Delivery & Services */}
              <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#B8960C] dark:text-[#D4AF37]">
                    Check Delivery & Services
                  </h3>
                  <button className="text-xs font-semibold text-[#B8960C] hover:underline dark:text-[#D4AF37]">
                    Change
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="mb-5 grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center rounded-[16px] border border-[#ECECEC] bg-white p-4 text-center dark:border-[#2a2a2a] dark:bg-[#141414]">
                    <Award className="mb-2 h-8 w-8 text-[#B8960C] dark:text-[#D4AF37]" />
                    <p className="text-[10px] font-bold leading-tight text-gray-700 dark:text-gray-300">
                      24K<br/>PURITY
                    </p>
                  </div>
                  <div className="flex flex-col items-center rounded-[16px] border border-[#ECECEC] bg-white p-4 text-center dark:border-[#2a2a2a] dark:bg-[#141414]">
                    <Truck className="mb-2 h-8 w-8 text-[#B8960C] dark:text-[#D4AF37]" />
                    <p className="text-[10px] font-bold leading-tight text-gray-700 dark:text-gray-300">
                      PAN INDIA<br/>DELIVERY
                    </p>
                  </div>
                  <div className="flex flex-col items-center rounded-[16px] border border-[#ECECEC] bg-white p-4 text-center dark:border-[#2a2a2a] dark:bg-[#141414]">
                    <BadgeCheck className="mb-2 h-8 w-8 text-[#B8960C] dark:text-[#D4AF37]" />
                    <p className="text-[10px] font-bold leading-tight text-gray-700 dark:text-gray-300">
                      ASSAYER<br/>CERTIFICATE
                    </p>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="space-y-3 rounded-[16px] bg-[#F6F6F6] p-4 dark:bg-[#1a1a1a]">
                  <div className="flex items-start gap-3">
                    <Truck className="mt-0.5 h-5 w-5 shrink-0 text-[#B8960C] dark:text-[#D4AF37]" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Delivery within 7-10 days
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="mt-0.5 h-5 w-5 shrink-0 text-gray-500 dark:text-gray-400" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      No return , No exchange
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <X className="mt-0.5 h-5 w-5 shrink-0 text-gray-500 dark:text-gray-400" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      No cancellation
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="rounded-[20px] border-2 border-[#F5C542] bg-gradient-to-br from-[#fffef5] to-[#fef9e6] p-5 dark:from-[#1a1a1a]/50 dark:to-[#2a2415]/50">
                <div className="mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#B8960C] dark:text-[#D4AF37]" />
                  <h4 className="text-sm font-bold text-[#B8960C] dark:text-[#D4AF37]">
                    Price Breakdown
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Gold Value ({selectedCoin.weight * detailQuantity}g)
                    </span>
                    <span className="font-semibold text-[#1a1a1a] dark:text-white">
                      ₹{(coinPrice * detailQuantity).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      GST ({gstRate}%)
                    </span>
                    <span className="font-semibold text-[#1a1a1a] dark:text-white">
                      ₹{(coinGst * detailQuantity).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Making Charges
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      FREE
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#D4AF37]/30 pt-2">
                    <span className="font-bold text-[#1a1a1a] dark:text-white">
                      Total ({detailQuantity} coin{detailQuantity > 1 ? 's' : ''})
                    </span>
                    <span className="text-xl font-bold text-[#B8960C] dark:text-[#D4AF37]">
                      ₹{(coinTotal * detailQuantity).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-[#EDEDED] bg-white/95 px-4 py-4 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] backdrop-blur-md dark:border-[#2a2a2a] dark:bg-[#141414]/95">
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3">
            <button
              onClick={() => {
                addToCart(selectedCoin, detailQuantity);
                setSelectedCoin(null);
              }}
              className="rounded-full border-2 border-[#B8960C] bg-white py-4 text-sm font-bold text-[#B8960C] transition-all hover:bg-[#B8960C]/5 hover:shadow-md active:scale-[0.97] dark:border-[#D4AF37] dark:bg-[#0a0a0a] dark:text-[#D4AF37]"
            >
              ADD TO CART
            </button>
            <button
              onClick={() => {
                addToCart(selectedCoin, detailQuantity);
                setIsCartOpen(true);
                setSelectedCoin(null);
              }}
              className="rounded-full bg-linear-to-r from-[#9c2c3c] to-[#c13a4a] py-4 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.97]"
            >
              BUY NOW
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Product Listing
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32 dark:bg-[#0a0a0a]">
      {/* Header Row - Search + Icons */}
      <div className="sticky top-0 z-40 bg-white px-4 py-3 shadow-sm dark:bg-[#141414]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all hover:bg-[#F6F6F6] active:scale-95 dark:hover:bg-[#1a1a1a]"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gold coins..."
              className="h-12 w-full rounded-full border border-[#EAEAEA] bg-[#F6F6F6] py-3 pl-12 pr-4 text-sm text-[#1a1a1a] placeholder-gray-400 transition-all focus:border-[#B8960C] focus:bg-white focus:shadow-md focus:outline-none dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-white dark:placeholder-gray-500 dark:focus:border-[#D4AF37]"
            />
            <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>

          {/* Filter Button */}
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F6F6F6] transition-all hover:bg-[#ECECEC] active:scale-95 dark:bg-[#1a1a1a] dark:hover:bg-[#2a2a2a]">
            <SlidersHorizontal className="h-[18px] w-[18px] text-gray-700 dark:text-gray-300" />
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F6F6F6] transition-all hover:bg-[#ECECEC] active:scale-95 dark:bg-[#1a1a1a] dark:hover:bg-[#2a2a2a]"
          >
            <ShoppingCart className="h-[18px] w-[18px] text-gray-700 dark:text-gray-300" />
            {cart.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#F5C542] px-1 text-[11px] font-bold leading-none text-[#1a1a1a]">
                {totalCoins}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Chips Row */}
      <div className="bg-white px-4 py-3 shadow-sm dark:bg-[#141414]">
        <div className="no-scrollbar flex gap-[10px] overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-[18px] px-[14px] py-2 text-xs font-semibold transition-all active:scale-95 ${
                activeCategory === category
                  ? "bg-[#F5C542] text-[#1a1a1a] shadow-[0_2px_8px_rgba(245,197,66,0.3)]"
                  : "border border-[#E6E6E6] bg-white text-gray-600 hover:border-[#F5C542] hover:bg-[#F5C542]/5 dark:border-[#2a2a2a] dark:bg-[#0a0a0a] dark:text-gray-400 dark:hover:border-[#D4AF37]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Gold/Silver Tabs */}
      <div className="bg-white px-4 dark:bg-[#141414]">
        <div className="grid grid-cols-2">
          <button
            onClick={() => setActiveTab("gold")}
            className={`relative pb-3 text-sm font-semibold transition-colors ${
              activeTab === "gold"
                ? "text-[#B8960C] dark:text-[#D4AF37]"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Gold
            {activeTab === "gold" && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-[#B8960C] dark:bg-[#D4AF37]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("silver")}
            className={`relative pb-3 text-sm font-semibold transition-colors ${
              activeTab === "silver"
                ? "text-[#B8960C] dark:text-[#D4AF37]"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Silver
            {activeTab === "silver" && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-[#B8960C] dark:bg-[#D4AF37]" />
            )}
          </button>
        </div>
      </div>

      {/* Product Grid - Following 8px grid system, 16px gaps */}
      <div className="px-4 py-4">
        {activeTab === "gold" ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {coinProducts.map((coin) => {
              const itemInCart = getItemInCart(coin.weight);
              const itemQty = getItemQuantity(coin.weight);
              const coinPrice = coin.weight * goldBuyPrice;
              const coinGst = coinPrice * (gstRate / 100);
              const isWishlisted = wishlist.includes(coin.weight);

              return (
                <div
                  key={coin.weight}
                  className="overflow-hidden rounded-[20px] border border-[#ECECEC] bg-white p-3 shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px] active:scale-[0.98] dark:border-[#2a2a2a] dark:bg-[#141414]"
                >
                  {/* Image Block */}
                  <div
                    onClick={() => setSelectedCoin(coin)}
                    className="relative mb-3 cursor-pointer overflow-hidden rounded-[16px] bg-linear-to-br from-[#F5F1E8] to-[#F8F4ED] p-4 dark:from-[#1a1a1a] dark:to-[#2a2a2a]"
                    style={{ height: '130px' }}
                  >
                    {/* Wishlist Heart - Top Right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(coin.weight);
                      }}
                      className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white active:scale-95 dark:bg-[#1a1a1a]/90"
                    >
                      <Heart
                        className={`h-[18px] w-[18px] transition-all ${
                          isWishlisted
                            ? "fill-[#FF3B30] stroke-[#FF3B30]"
                            : "stroke-gray-600 hover:stroke-[#FF3B30] dark:stroke-gray-400"
                        }`}
                      />
                    </button>

                    {/* Gold Bar Visual */}
                    <div className="relative flex h-full items-center justify-center">
                      <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-linear-to-br from-[#f5e6a3] via-[#e8c84a] to-[#c9a432] p-4 shadow-[0_8px_20px_rgba(212,175,55,0.3)]">
                        {/* Embossed Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                            <pattern id={`pattern-${coin.weight}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                              <circle cx="15" cy="15" r="12" fill="none" stroke="#3d3015" strokeWidth="1.5" opacity="0.3"/>
                            </pattern>
                            <rect width="100%" height="100%" fill={`url(#pattern-${coin.weight})`} />
                          </svg>
                        </div>

                        {/* Content */}
                        <div className="relative flex h-full flex-col items-center justify-center">
                          <span className="mb-1 text-[9px] font-bold tracking-[0.15em] text-[#3d3015]/70">
                            FINE GOLD
                          </span>
                          <span className="mb-2 text-[8px] font-semibold text-[#3d3015]/60">
                            999.9
                          </span>
                          
                          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 shadow-inner">
                            <span className="text-2xl font-bold text-[#3d3015]/50">∞</span>
                          </div>

                          <div className="rounded-lg bg-white/30 px-3 py-1 shadow-md backdrop-blur-sm">
                            <span className="text-base font-bold text-[#3d3015]">
                              {coin.weight}gm
                            </span>
                          </div>

                          <span className="mt-2 text-[8px] font-bold tracking-[0.12em] text-[#3d3015]/60">
                            ZOLD GOLD
                          </span>
                        </div>

                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/30 to-transparent" />
                        <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-white/25 blur-2xl" />
                      </div>
                    </div>

                    {/* Popular Badge */}
                    {coin.popular && (
                      <div className="absolute left-2 top-2 z-10 rounded-full bg-[#F5C542] px-2 py-1 text-[9px] font-bold text-[#1a1a1a] shadow-md">
                        POPULAR
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div onClick={() => setSelectedCoin(coin)} className="cursor-pointer">
                    {/* Title - Professional typography */}
                    <p className="mb-2 line-clamp-2 text-[13px] font-medium leading-tight text-[#1a1a1a] dark:text-white">
                      {coin.displayName}
                    </p>

                    {/* Rating Row */}
                    <div className="mb-2 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-[#F5C542] stroke-[#F5C542]" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">4.8</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">(2.1k)</span>
                    </div>

                    {/* Price - Bold and prominent */}
                    <p className="mb-3 text-lg font-bold text-[#B8960C] dark:text-[#D4AF37]">
                      ₹ {coinPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Quantity Controls or Add Button */}
                  {itemInCart ? (
                    <div className="flex items-center justify-between rounded-full border-2 border-[#B8960C] bg-gradient-to-r from-[#fffef5] to-[#fef9e6] px-3 py-2 shadow-sm dark:border-[#D4AF37] dark:from-[#D4AF37]/10 dark:to-[#D4AF37]/5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(coin.weight, -1);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#B8960C] transition-all hover:bg-[#B8960C] hover:text-white active:scale-90 dark:bg-[#0a0a0a] dark:text-[#D4AF37] dark:hover:bg-[#D4AF37] dark:hover:text-[#1a1a1a]"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[28px] text-center text-base font-bold text-[#B8960C] dark:text-[#D4AF37]">
                        {itemQty}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(coin.weight, 1);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#B8960C] text-white transition-all hover:bg-[#96780a] hover:scale-110 active:scale-90 dark:bg-[#D4AF37] dark:text-[#1a1a1a] dark:hover:bg-[#c9a432]"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(coin, 1);
                      }}
                      className="w-full rounded-full border-2 border-[#B8960C] bg-white py-2.5 text-xs font-bold text-[#B8960C] transition-all hover:bg-[#B8960C] hover:text-white hover:shadow-md active:scale-[0.97] dark:border-[#D4AF37] dark:bg-[#0a0a0a] dark:text-[#D4AF37] dark:hover:bg-[#D4AF37] dark:hover:text-[#1a1a1a]"
                    >
                      ADD TO CART
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F6F6F6] dark:bg-[#1a1a1a]">
              <CoinsIcon className="h-10 w-10 text-gray-300 dark:text-[#333]" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Silver coins coming soon...
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#EDEDED] bg-white/95 backdrop-blur-md dark:border-[#2a2a2a] dark:bg-[#141414]/95 md:hidden">
        <div className="grid grid-cols-5">
          <button
            onClick={() => router.push("/")}
            className="flex flex-col items-center justify-center gap-1 py-3 transition-all hover:bg-[#F6F6F6] active:scale-95 dark:hover:bg-[#1a1a1a]"
          >
            <Home className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Home</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 py-3 transition-all hover:bg-[#F6F6F6] active:scale-95 dark:hover:bg-[#1a1a1a]">
            <CoinsIcon className="h-6 w-6 fill-[#B8960C] stroke-[#B8960C] dark:fill-[#D4AF37] dark:stroke-[#D4AF37]" />
            <span className="text-[10px] font-bold text-[#B8960C] dark:text-[#D4AF37]">Coins</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 py-3 transition-all hover:bg-[#F6F6F6] active:scale-95 dark:hover:bg-[#1a1a1a]">
            <TrendingUp className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Buy/Sell</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 py-3 transition-all hover:bg-[#F6F6F6] active:scale-95 dark:hover:bg-[#1a1a1a]">
            <Wallet className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Wallet</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 py-3 transition-all hover:bg-[#F6F6F6] active:scale-95 dark:hover:bg-[#1a1a1a]">
            <UserCircle2 className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Profile</span>
          </button>
        </div>
      </div>

      {/* Cart Drawer - Improved Design */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm sm:items-center sm:justify-center sm:px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px] dark:bg-[#141414]">
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-[#ECECEC] px-6 py-5 dark:border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5C542]">
                  <ShoppingCart className="h-5 w-5 text-[#1a1a1a]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1a1a1a] dark:text-white">
                    Shopping Cart
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-[#888]">
                    {totalCoins} item{totalCoins > 1 ? "s" : ""} • {totalCartWeight}g
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-[#F6F6F6] active:scale-95 dark:hover:bg-[#1a1a1a]"
              >
                <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-[400px] overflow-y-auto px-6 py-4">
              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F6F6F6] dark:bg-[#1a1a1a]">
                    <ShoppingCart className="h-8 w-8 text-gray-300 dark:text-[#333]" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-[#888]">
                    Your cart is empty
                  </p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-[#666]">
                    Add some gold coins to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const coinProduct = coinProducts.find((c) => c.weight === item.weight);
                    const itemPrice = item.price * item.quantity;
                    const itemGst = itemPrice * (gstRate / 100);
                    const itemTotal = itemPrice + itemGst;

                    return (
                      <div
                        key={item.weight}
                        className="flex items-center gap-4 rounded-[18px] border border-[#ECECEC] bg-white p-4 transition-all hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
                      >
                        {/* Coin Icon */}
                        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-linear-to-br from-[#f5e6a3] via-[#e8c84a] to-[#c9a432] shadow-md">
                          <div className="absolute inset-0 opacity-10">
                            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                              <pattern id={`cart-pattern-${item.weight}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="10" cy="10" r="8" fill="none" stroke="#3d3015" strokeWidth="1" opacity="0.3"/>
                              </pattern>
                              <rect width="100%" height="100%" fill={`url(#cart-pattern-${item.weight})`} />
                            </svg>
                          </div>
                          <div className="relative text-center">
                            <span className="block text-base font-bold text-[#3d3015]">
                              {item.weight}
                            </span>
                            <span className="text-[9px] font-semibold text-[#5a4a1a]/70">
                              GM
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/30 to-transparent" />
                        </div>

                        {/* Item Info */}
                        <div className="flex-1">
                          <p className="mb-1.5 line-clamp-1 text-[13px] font-semibold text-[#1a1a1a] dark:text-white">
                            {coinProduct?.label} Gold Coin
                          </p>
                          <p className="mb-0.5 text-base font-bold text-[#B8960C] dark:text-[#D4AF37]">
                            ₹{Math.round(itemTotal).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-[#888]">
                            {item.quantity} × ₹{Math.round(item.price).toLocaleString()}
                          </p>
                        </div>

                        {/* Quantity Control */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.weight, -1);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#B8960C] bg-white transition-all hover:bg-[#B8960C] hover:text-white active:scale-90 dark:border-[#D4AF37] dark:bg-[#0a0a0a] dark:hover:bg-[#D4AF37]"
                          >
                            <Minus className="h-4 w-4 text-[#B8960C] dark:text-[#D4AF37]" />
                          </button>
                          <span className="min-w-[28px] text-center text-base font-bold text-[#1a1a1a] dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.weight, 1);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B8960C] text-white transition-all hover:scale-110 hover:bg-[#96780a] active:scale-90 dark:bg-[#D4AF37] dark:text-[#1a1a1a] dark:hover:bg-[#c9a432]"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.weight);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-red-50 active:scale-90 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <>
                {/* Payment Method Selection */}
                <div className="border-t border-[#ECECEC] bg-[#FAFAFA] px-6 py-5 dark:border-[#2a2a2a] dark:bg-[#0a0a0a]">
                  <h3 className="mb-3 text-sm font-bold text-[#1a1a1a] dark:text-white">
                    Select Payment Method
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedPayment("rupees")}
                      className={`group rounded-[16px] border-2 p-4 text-left transition-all active:scale-95 ${
                        selectedPayment === "rupees"
                          ? "border-[#B8960C] bg-gradient-to-br from-[#fffef5] to-[#fef9e6] shadow-lg shadow-[#B8960C]/20 dark:border-[#D4AF37] dark:from-[#D4AF37]/15 dark:to-[#D4AF37]/5"
                          : "border-[#E6E6E6] bg-white hover:border-[#B8960C] hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#141414] dark:hover:border-[#D4AF37]"
                      }`}
                    >
                      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                        selectedPayment === "rupees"
                          ? "bg-[#B8960C] dark:bg-[#D4AF37]"
                          : "bg-[#F6F6F6] group-hover:bg-[#B8960C]/10 dark:bg-[#1a1a1a]"
                      }`}>
                        <CreditCard className={`h-5 w-5 ${
                          selectedPayment === "rupees"
                            ? "text-white dark:text-[#1a1a1a]"
                            : "text-gray-600 dark:text-gray-400"
                        }`} />
                      </div>
                      <p className="mb-1 text-sm font-bold text-[#1a1a1a] dark:text-white">
                        Rupees
                      </p>
                      <p className="text-xs text-gray-600 dark:text-[#888]">
                        ₹{testWalletBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </p>
                      {selectedPayment === "rupees" && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle className="h-5 w-5 fill-[#B8960C] text-white dark:fill-[#D4AF37]" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setSelectedPayment("wallet_gold")}
                      className={`group rounded-[16px] border-2 p-4 text-left transition-all active:scale-95 ${
                        selectedPayment === "wallet_gold"
                          ? "border-[#B8960C] bg-gradient-to-br from-[#fffef5] to-[#fef9e6] shadow-lg shadow-[#B8960C]/20 dark:border-[#D4AF37] dark:from-[#D4AF37]/15 dark:to-[#D4AF37]/5"
                          : "border-[#E6E6E6] bg-white hover:border-[#B8960C] hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#141414] dark:hover:border-[#D4AF37]"
                      }`}
                    >
                      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                        selectedPayment === "wallet_gold"
                          ? "bg-[#B8960C] dark:bg-[#D4AF37]"
                          : "bg-[#F6F6F6] group-hover:bg-[#B8960C]/10 dark:bg-[#1a1a1a]"
                      }`}>
                        <Wallet className={`h-5 w-5 ${
                          selectedPayment === "wallet_gold"
                            ? "text-white dark:text-[#1a1a1a]"
                            : "text-gray-600 dark:text-gray-400"
                        }`} />
                      </div>
                      <p className="mb-1 text-sm font-bold text-[#1a1a1a] dark:text-white">
                        Wallet Gold
                      </p>
                      <p className="text-xs text-gray-600 dark:text-[#888]">
                        {userGoldBalance.toFixed(4)}g
                      </p>
                      {selectedPayment === "wallet_gold" && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle className="h-5 w-5 fill-[#B8960C] text-white dark:fill-[#D4AF37]" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="border-t border-[#ECECEC] px-6 py-5 dark:border-[#2a2a2a]">
                  <div className="mb-4 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-[#888]">
                        Subtotal ({totalCoins} coins, {totalCartWeight}g)
                      </span>
                      <span className="font-semibold text-[#1a1a1a] dark:text-white">
                        ₹{Math.round(cartTotal).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-[#888]">
                        GST ({gstRate}%)
                      </span>
                      <span className="font-semibold text-[#1a1a1a] dark:text-white">
                        ₹{Math.round(cartGst).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-[#888]">
                        Making Charges
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        FREE
                      </span>
                    </div>
                    <div className="flex justify-between rounded-[12px] bg-gradient-to-r from-[#fffef5] to-[#fef9e6] p-3 dark:from-[#D4AF37]/10 dark:to-[#D4AF37]/5">
                      <span className="font-bold text-[#1a1a1a] dark:text-white">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-[#B8960C] dark:text-[#D4AF37]">
                        ₹{Math.round(cartFinalTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!canAffordCoins() && (
                    <div className="mb-4 flex items-start gap-2 rounded-[14px] bg-red-50 p-3 dark:bg-red-900/20">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                      <p className="text-xs leading-relaxed text-red-600 dark:text-red-400">
                        {selectedPayment === "wallet_gold"
                          ? `Insufficient gold balance. Need ${(totalCartWeight - userGoldBalance).toFixed(4)}g more in your wallet.`
                          : `Insufficient balance. Need ₹${(cartFinalTotal - testWalletBalance).toFixed(2)} more in your test wallet.`}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={clearCart}
                      className="rounded-full border-2 border-[#E6E6E6] bg-white py-3.5 text-sm font-semibold text-gray-700 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-[0.97] dark:border-[#2a2a2a] dark:bg-[#0a0a0a] dark:text-gray-300 dark:hover:border-red-500/50 dark:hover:bg-red-900/20"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={handleCheckout}
                      disabled={loading || !canAffordCoins()}
                      className="rounded-full bg-linear-to-r from-[#9c2c3c] to-[#c13a4a] py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.97] disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 disabled:shadow-none dark:disabled:from-[#2a2a2a] dark:disabled:to-[#2a2a2a] dark:disabled:text-[#555]"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Processing...
                        </span>
                      ) : (
                        "PROCEED TO CHECKOUT"
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
