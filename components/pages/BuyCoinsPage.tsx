"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Award,
  BadgeCheck,
  CheckCircle,
  CreditCard,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
  ArrowLeft,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { addToCart, updateQuantity } from "@/components/store/cartSlice";
import { RootState } from "@/components/store/store";

import LumenHeader from "../LumenHeader";
import AnimatedBackground from "../AnimatedBackground";
import CartDrawer from "../CartDrawer";

import img1 from "../images/1gmZold.webp";
import img2 from "../images/2gmZold.webp";
import img5 from "../images/5gmZold.webp";
import img10 from "../images/10gmZold.webp";

const coinImages: Record<number, any> = {
  1: img1,
  2: img2,
  5: img5,
  10: img10,
};

interface CoinProduct {
  weight: number;
  label: string;
  popular: boolean;
  displayName: string;
  description: string;
}

export default function BuyCoinsPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Use Redux for cart
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Local state for non-cart logic
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [goldBuyPrice, setGoldBuyPrice] = useState(6245.5);

  const coinProducts: CoinProduct[] = [
    {
      weight: 1,
      label: "1 Gram",
      popular: true,
      displayName: "ZG 1 Gram Gold Mint Bar 24k (99.9%)",
      description:
        "This ZOLD GOLD 24 Karat gold mint bar with a high-polished finish weighs 1 gram. The best-in-class quality.",
    },
    {
      weight: 2,
      label: "2 Grams",
      popular: false,
      displayName: "ZG 2 Gram Gold Mint Bar 24k (99.9%)",
      description:
        "This ZOLD GOLD 24 Karat gold mint bar with a high-polished finish weighs 2 grams. The best-in-class quality.",
    },
    {
      weight: 5,
      label: "5 Grams",
      popular: false,
      displayName: "ZG 5 Gram Gold Mint Bar 24k (99.9%)",
      description:
        "This ZOLD GOLD 24 Karat gold mint bar with a high-polished finish weighs 5 grams. The best-in-class quality.",
    },
    {
      weight: 10,
      label: "10 Grams",
      popular: false,
      displayName: "ZG 10 Gram Gold Mint Bar 24k (99.9%)",
      description:
        "This ZOLD GOLD 24 Karat gold mint bar with a high-polished finish weighs 10 grams. The best-in-class quality.",
    },
  ];

  /* ------------------------------------------------------------
     Helpers
  ------------------------------------------------------------ */
  const toggleWishlist = (w: number) => {
    setWishlist((prev) =>
      prev.includes(w) ? prev.filter((i) => i !== w) : [...prev, w]
    );
  };

  const getItemQuantity = (w: number) => {
    return cartItems.find((i) => i.weight === w)?.quantity || 0;
  };

  const getItemInCart = (w: number) => {
    return cartItems.some((i) => i.weight === w);
  };

  const handleAddToCart = (coin: CoinProduct, qty: number) => {
    dispatch(
      addToCart({
        weight: coin.weight,
        quantity: qty,
        price: coin.weight * goldBuyPrice,
        displayName: coin.displayName,
      })
    );
  };

  const handleUpdateQuantity = (w: number, q: number) => {
    dispatch(updateQuantity({ weight: w, quantity: q }));
  };

  return (
    <>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap");


        html, body {
  overflow: auto;
  scrollbar-width: none;       /* Firefox */
  -ms-overflow-style: none;     /* IE & old Edge */
}

html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;                /* Chrome, Safari, Edge */
}

        .wrapper-buy {
          position: relative;
          font-family: "Montserrat", sans-serif;
          background: linear-gradient(135deg, #fdfcf5 0%, #ffffff 100%);
          overflow-x: hidden;
          padding-top: 80px; /* Space for fixed header */
          overflow-y:hidden;
          ::-webkit-scrollbar {
  display: none;
}
        }

        /* Banner Text */
        .banner-text {
          position: relative;
          z-index: 10;
          padding: 5px 40px 20px;
          text-align: center;
          margin-top: 20px;
        }
        .banner-text h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #B8960C;
          margin-bottom: 10px;
          letter-spacing: -1px;
        }
        .banner-text p {
          font-size: 1.1rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Card Container */
        .main-cart {
          position: relative;
          z-index: 10;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 40px;
          padding: 5px 20px 100px;
          max-width: 1400px;
          margin: 0 auto;
          // min-height:max-content;
          min-height:80vh;
          overflow:hidden;
        }

        /* Card Styles */
        .card {
          position: relative;
          width: 280px;
          height: 380px;    
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid rgba(184, 150, 12, 0.1);
          cursor: pointer;
        }

        .card:hover {
          // transform: translateY(-10px);
          box-shadow: 0 20px 50px rgba(184, 150, 12, 0.15);
          height: 440px; /* Expand on hover */
        }

        .top-bar {
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #B8960C;
        }

        .img-container {
            width: 160px;
            height: 180px;
            margin:  auto;
            position: relative;
            transition: 0.4s;
        }
        .card:hover .img-container {
            magin-top:50vh;
            transform: scale(1.2) translateY(0px);
        }

        .details {
            padding: 20px;
            text-align: center;
            background: white;
            transition: 0.4s;
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 145px; /* Collapsed height */
        }
        
        .card:hover .details {
            padding-top: 5px;
            height: 200px; /* Expanded height */
        }

        .product-name {
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 5px;
            color: #333;
        }

        .product-price {
            font-size: 1.5rem;
            font-weight: 800;
            color: #B8960C;
            margin: 10px 0;
        }

        .add-btn {
            background: white;
            color: black;
            border: none;
            padding: 10px 24px;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 5px auto;
        }
        .add-btn:hover {
            // box-shadow: 0 5px 15px rgba(184, 150, 12, 0.4);
            transform: scale(1.05);
        }

        /* Wishlist Icon */
        .wishlist-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.2s;
        }
        .wishlist-btn:hover {
            background: #fff5f5;
        }
      `}</style>

      {/* Shared Components */}
      <LumenHeader />
      <CartDrawer />

      <div className="wrapper-buy overflow-hidden">
        <AnimatedBackground />

        <div className="banner-text">
          <h2>Purchase Gold Coins</h2>
          <p>Secure, 24K Certified Gold Delivered to Your Doorstep</p>
        </div>

        <div className="main-cart">
          {coinProducts.map((coin) => {
            const itemInCart = getItemInCart(coin.weight);
            const itemQty = getItemQuantity(coin.weight);
            const isWishlisted = wishlist.includes(coin.weight);

            return (
              <div
                className="card"
                key={coin.weight}
                onClick={() => router.push(`/buy-coins/${coin.weight}`)}
              >
                <div className="top-bar">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                    <Award size={16} /> 24K Gold
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">In Stock</span>
                </div>

                <div className="img-container">
                  <Image src={coinImages[coin.weight]} alt="Gold Coin" className="object-contain w-full h-full" />
                </div>

                <div className="details px-3 pb-4 flex flex-col h-full">

                  {/* TITLE + WISHLIST */}
                  <div className="flex justify-between items-start2">
                    <h3 className="text-base sm:text-lg font-semibold text-[#1a1a2e]">
                      {coin.weight} Gram
                    </h3>

                    <button
                      className="wishlist-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(coin.weight);
                      }}
                    >
                      <Heart
                        size={20}
                        className={
                          isWishlisted
                            ? "fill-red-500 text-red-500"
                            : "text-gray-300 hover:text-gray-400"
                        }
                      />
                    </button>
                  </div>

                  {/* DESCRIPTION */}
                  <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 text-left mb-3 leading-relaxed">
                    {coin.description}
                  </p>

                  {/* PRICE */}
                  <div className="mt-auto">
                    <div className="text-lg sm:text-xl font-bold text-[#B8960C] tracking-tight">
                      ₹ {(coin.weight * goldBuyPrice).toLocaleString()}
                    </div>

                    {/* subtle per gram */}
                    <p className="text-[11px] text-gray-400 mt-1">
                      {coin.weight}g 24K • Digital Gold
                    </p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
