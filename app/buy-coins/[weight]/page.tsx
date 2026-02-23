"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../components/store/cartSlice";
import { RootState } from "../../../components/store/store";

import {
    ArrowLeft,
    ShoppingCart,
    Heart,
    Truck,
    ShieldCheck,
    RefreshCcw,
    Star,
    ChevronDown,
    Minus,
    Plus,
    CreditCard,
    Facebook,
    Twitter,
    Instagram
} from "lucide-react";

import LumenHeader from "../../../components/LumenHeader";
import AnimatedBackground from "../../../components/AnimatedBackground";
import CartDrawer from "../../../components/CartDrawer";

// Import images
import img1 from "../../../components/images/1gmZold.webp";
import img2 from "../../../components/images/2gmZold.webp";
import img5 from "../../../components/images/5gmZold.webp";
import img10 from "../../../components/images/10gmZold.webp";

// Import Box images
import box1 from "../../../components/images/1gmZoldBox.jpg";
import box2 from "../../../components/images/2gmZoldBox.jpg";
import box5 from "../../../components/images/5gmZoldBox.jpg";
import box10 from "../../../components/images/10gmZoldBox.jpg";

const coinImages: Record<number, any> = {
    1: img1,
    2: img2,
    5: img5,
    10: img10,
};

const coinGallery: Record<number, any[]> = {
    1: [img1, box1],
    2: [img2, box2],
    5: [img5, box5],
    10: [img10, box10],
};


const coinDetails: any = {
    1: {
        weight: 1,
        displayName: "ZG 1 Gram Gold Mint Bar 24k (99.9%)",
        description: "This ZOLD GOLD 24 Karat gold mint bar with a high-polished finish weighs 1 gram. The best-in-class quality.",
        price: 6245.5
    },
    2: {
        weight: 2,
        displayName: "ZG 2 Gram Gold Mint Bar 24k (99.9%)",
        description: "This ZOLD GOLD 24 Karat gold mint bar with a high-polished finish weighs 2 grams. The best-in-class quality.",
        price: 12491.0
    },
    5: {
        weight: 5,
        displayName: "ZG 5 Gram Gold Mint Bar 24k (99.9%)",
        description: "This ZOLD GOLD 24 Karat gold mint bar with a high-polished finish weighs 5 grams. The best-in-class quality.",
        price: 31227.5
    },
    10: {
        weight: 10,
        displayName: "ZG 10 Gram Gold Mint Bar 24k (99.9%)",
        description: "This ZOLD GOLD 24 Karat gold mint bar with a high-polished finish weighs 10 grams. The best-in-class quality.",
        price: 62455.0
    }
};



export default function ProductDetailPage() {
    useEffect(() => {
        document.documentElement.classList.add("hide-scrollbar");

        return () => {
            document.documentElement.classList.remove("hide-scrollbar");
        };
    }, []);

    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch();

    const weight = Number(params?.weight);
    const coin = coinDetails[weight];

    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState("description");
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);

    // Reset selected image when weight changes
    if (selectedImage && !coinGallery[weight]?.includes(selectedImage)) {
        setSelectedImage(null);
    }

    const currentImages = coinGallery[weight] || [];
    const displayImage = selectedImage || currentImages[0];

    // Directly inject styles for this page content primarily
    const styles = `
    .main-content {
      position: relative;
      z-index: 10;
      padding-top: 100px; /* Header override */
      max-width: 1160px;
      margin: 0 auto;   
      padding-bottom: 60px;
      padding-left: 20px;
      padding-right: 20px;

    }

    .gallery-card {
        background: white;
        border-radius: 24px;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        border: 1px solid rgba(184, 150, 12, 0.1);
    }
    .gallery-card:hover{
          box-shadow: 0 20px 50px rgba(184, 150, 12, 0.15);
         
    }
  `;

    if (!coin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Coin Not Found</h1>
                    <button onClick={() => router.back()} className="text-blue-600 underline">Go Back</button>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        dispatch(addToCart({
            weight: coin.weight,
            quantity: qty,
            price: coin.price,
            displayName: coin.displayName
        }));
    };

    return (
        <>
            <style jsx>{styles}</style>

            {/* Shared Components */}
            <LumenHeader />
            <CartDrawer />
            <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(135deg,#fdfcf5_0%,#ffffff_100%)]">
                <AnimatedBackground />
            </div>

            {/* Main Content */}
            <main className="main-content">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start bg-opacity-0">



                    {/* Left Column: Gallery */}
                    <div className="gallery-section">
                        <div className="gallery-card relative shadow-none transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(184,150,12,0.15)]">
                            <div className="relative aspect-square rounded-2xl  flex items-center justify-center p-8 mb-6 border border-gray-100">
                                <Image src={displayImage} alt="Gold Coin" className="w-[80%] h-[80%] object-contain transition-transform duration-200 hover:scale-125" />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm border border-gray-200">
                                    <ShieldCheck size={14} className="text-[#B8960C]" /> 24K HALLMARK
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                {currentImages.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedImage(img)}
                                        className={`rounded-xl border border-gray-100 p-2 cursor-pointer hover:border-[#B8960C] transition-all bg-white ${displayImage === img ? 'border-[#B8960C] ring-1 ring-[#B8960C]/20' : ''}`}
                                    >
                                        <Image src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Product Description Accordion */}
                        <div className="mt-6 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="border-b border-gray-100">
                                <button className="w-full px-6 py-4 flex justify-between items-center text-left font-bold text-gray-800 hover:bg-gray-50 transition-colors" onClick={() => setActiveTab(activeTab === 'desc' ? '' : 'desc')}>
                                    <span>Product Description</span>
                                    <ChevronDown className={`transition-transform text-gray-400 ${activeTab === 'desc' ? 'rotate-180' : ''}`} size={18} />
                                </button>
                                {activeTab === 'desc' && (
                                    <div className="px-6 pb-6 text-gray-500 text-sm leading-relaxed animate-in slide-in-from-top-2">
                                        <p>{coin.description}</p>
                                        <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-[#B8960C]">
                                            <li>24 Karat (999.9 Purity)</li>
                                            <li>High Polish Finish</li>
                                            <li>Tamper-proof Packaging</li>
                                            <li>Certificate of Authenticity Included</li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div>
                                <button className="w-full px-6 py-4 flex justify-between items-center text-left font-bold text-gray-800 hover:bg-gray-50 transition-colors" onClick={() => setActiveTab(activeTab === 'specs' ? '' : 'specs')}>
                                    <span>Specifications</span>
                                    <ChevronDown className={`transition-transform text-gray-400 ${activeTab === 'specs' ? 'rotate-180' : ''}`} size={18} />
                                </button>
                                {activeTab === 'specs' && (
                                    <div className="px-6 pb-6 animate-in slide-in-from-top-2">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <span className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Weight</span>
                                                <span className="font-bold text-gray-800">{coin.weight} Grams</span>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <span className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Purity</span>
                                                <span className="font-bold text-gray-800">999.9 (24K)</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Panel */}
                    <div className="relative h-ful l relative top-0 left-0 w-full">
                        <div className="sticky top-28 space-y-6">
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-100/50">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h1 className="text-3xl font-semibold text-gray-900 mb-1">{coin.weight} Gram</h1>
                                        <span className="text-md font-medium text-[#B8960C]">Gold Mint Bar (24K)</span>
                                    </div>
                                    <button
                                        onClick={() => setIsWishlisted(!isWishlisted)}
                                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${isWishlisted ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        <Heart className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-300"} size={22} />
                                    </button>
                                </div>

                                <div className="flex gap-2 mb-6">
                                    <div className="flex text-yellow-400">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="fill-current" />)}
                                    </div>
                                    <span className="text-sm text-gray-400 font-medium">(120 Reviews)</span>
                                </div>

                                <div className="pb-6 mb-6 border-b border-gray-100">
                                    <div className="text-3xl font-bold text-gray-800 mb-1">₹ {(coin.price * qty).toLocaleString()}</div>
                                    <div className="text-sm text-gray-500 font-medium">Inclusive of all taxes & making charges</div>
                                </div>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-3 gap-3 mb-8">
                                    {[
                                        { icon: ShieldCheck, label: "100% Secure" },
                                        { icon: Truck, label: "Free Delivery" },
                                        { icon: RefreshCcw, label: "Easy Buyback" }
                                    ].map((badge, idx) => (
                                        <div key={idx} className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 border border-gray-100 text-center gap-2">
                                            <badge.icon size={22} className="text-[#B8960C]" />
                                            <span className="text-xs font-bold text-gray-700">{badge.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 px-2 h-14">
                                        <button className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-[#B8960C] transition-colors" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={18} /></button>
                                        <div className="w-10 text-center font-bold text-lg text-gray-800">{qty}</div>
                                        <button className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-[#B8960C] transition-colors" onClick={() => setQty(qty + 1)}><Plus size={18} /></button>
                                    </div>

                                    <button
                                        className="flex-1 h-14 bg-[#B8960C] font-bold text-white font-bold rounded-2xl shadow-lg hover:shadow-gray-400/50 transition-all flex items-center justify-center gap-3 text-lg"
                                        onClick={handleAddToCart}
                                    >
                                        Add to Cart <ShoppingCart size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-[#fdfcf5] to-white rounded-2xl p-5 border border-[#faeeb1] flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full bg-[#faeeb1] flex items-center justify-center text-[#B8960C] shrink-0">
                                    <Truck size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Fast & Insured Delivery</h4>
                                    <p className="text-xs text-gray-500 mt-1">Order now and get it delivered by <span className="font-bold text-[#B8960C]">2 Days</span> via secure logistics.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white py-12 mt-12 relative z-10 opacity-85">
                <div className="max-w-[1160px] mx-auto px-5 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#B8960C] flex items-center justify-center text-white font-bold">Z</div>
                            <span className="font-bold text-xl text-[#B8960C]">ZOLD GOLD</span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Premium digital gold platform offering certified 24K gold with secure storage and instant liquidity.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-gray-900">Navigation</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-[#B8960C]">Buy Coins</a></li>
                            <li><a href="#" className="hover:text-[#B8960C]">Sell Gold</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-gray-900">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-[#B8960C]">FAQ</a></li>
                            <li><a href="#" className="hover:text-[#B8960C]">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-gray-900">Follow Us</h4>
                        <div className="flex gap-4">
                            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#B8960C] hover:text-white transition-colors">
                                <Facebook size={18} />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#B8960C] hover:text-white transition-colors">
                                <Twitter size={18} />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#B8960C] hover:text-white transition-colors">
                                <Instagram size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
