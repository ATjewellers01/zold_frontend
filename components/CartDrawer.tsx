"use client";

import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    removeFromCart,
    updateQuantity,
    toggleCart,
} from "./store/cartSlice";
import { RootState } from "./store/store";
import { CheckCircle, Minus, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";

// Reusing image logic from BuyCoinsPage if needed, or simply passing it
// Since images are static imports, we need a way to map them. 
// For now, let's assume images are passed or mapped inside.
import img1 from "./images/1gmZold.webp";
import img2 from "./images/2gmZold.webp";
import img5 from "./images/5gmZold.webp";
import img10 from "./images/10gmZold.webp";

const coinImages: Record<number, any> = {
    1: img1,
    2: img2,
    5: img5,
    10: img10,
};

export default function CartDrawer() {
    const dispatch = useDispatch();
    const { items: storeItems, isOpen: storeIsOpen } = useSelector((state: RootState) => state.cart);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const items = mounted ? storeItems : [];
    const isOpen = mounted ? storeIsOpen : false;

    // Constants (could be props or from store/env)
    const gstRate = 3;

    const totalPrice = useMemo(
        () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        [items]
    );

    const gstAmount = (totalPrice * gstRate) / 100;
    const grandTotal = totalPrice + gstAmount;

    return (
        <>
            <style jsx>{`
      .cart-drawer {
        position: fixed;
        top: 0;
        right: 0;
        height: 100%;
        width: 400px;
        background: white;
        box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
        z-index: 100;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
      }
      .cart-drawer.open {
        transform: translateX(0);
      }
      .cart-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 90;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
      }
      .cart-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }
      .cart-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fdfcf5;
      }
      .cart-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }
      .cart-footer {
        padding: 20px;
        border-top: 1px solid #eee;
        background: #fdfcf5;
      }
      .cart-item {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px dashed #eee;
      }
      .qty-badge {
         background: #f5f5f5;
         border-radius: 8px;
         display: flex;
         align-items: center;
         border: 1px solid #e5e5e5;
      }
    `}</style>

            <div
                className={`cart-overlay ${isOpen ? "open" : ""}`}
                onClick={() => dispatch(toggleCart(false))}
            />

            <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
                <div className="cart-header text-black">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Your Cart <span className="text-sm font-normal text-black">({items.length} items)</span>
                    </h2>
                    <button
                        onClick={() => dispatch(toggleCart(false))}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="cart-content">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                <X className="text-gray-300" size={32} />
                            </div>
                            <p>Your cart is empty</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div className="cart-item" key={item.weight}>
                                <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center p-2 border border-gray-100 relative">
                                    <Image src={coinImages[item.weight]} alt="Gold" width={60} height={60} className="object-contain" />
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm mb-1">{item.weight} Gram Gold Bar</h4>
                                    <p className="text-xs text-gray-500 mb-2">24K (999.9) Pure Gold</p>
                                    <div className="flex justify-between items-end">
                                        <div className="qty-badge">
                                            <button
                                                className="p-1.5    text-[#B8960C]"
                                                onClick={() => dispatch(updateQuantity({ weight: item.weight, quantity: -1 }))}
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-xs font-bold w-6 text-center text-black">{item.quantity}</span>
                                            <button
                                                className="p-1.5 text-[#B8960C]"
                                                onClick={() => dispatch(updateQuantity({ weight: item.weight, quantity: 1 }))}
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-[#B8960C]">₹ {(item.price * item.quantity).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => dispatch(removeFromCart(item.weight))}
                                    className="self-start text-gray-300 hover:text-red-400 p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="cart-footer">
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span>₹ {totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>GST ({gstRate}%)</span>
                                <span>₹ {gstAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-dashed">
                                <span>Total</span>
                                <span>₹ {grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <button className="w-full bg-gradient-to-r from-[#B8960C] to-[#D4AF37] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 transition-all flex items-center justify-center gap-2">
                            Proceed to Checkout <CheckCircle size={18} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
