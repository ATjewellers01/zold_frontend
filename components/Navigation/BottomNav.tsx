import {
    Home,
    Wallet,
    MapPin,
    Banknote,
    User,
    Plus,
    Coins,
    Target,
    Gift,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function BottomNav() {
    const pathname = usePathname();
    const [showQuickMenu, setShowQuickMenu] = useState(false);

    const isActive = (path: string) => pathname === path;

    return (
        <>
            {/* Quick Action Menu */}
            {showQuickMenu && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 lg:hidden"
                    onClick={() => setShowQuickMenu(false)}
                >
                    <div
                        className="absolute right-6 bottom-24 w-64 rounded-2xl bg-white p-2 shadow-2xl dark:bg-neutral-800 dark:shadow-neutral-900/50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Link
                            href="/buy-gold"
                            onClick={() => setShowQuickMenu(false)}
                            className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-neutral-700/50"
                        >
                            <div className="rounded-lg bg-[#3D3066] p-2 text-white dark:bg-[#4D3F7F]">
                                <Coins className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-gray-900 dark:text-white">Buy Gold</p>
                                <p className="text-xs text-gray-500 dark:text-neutral-400">
                                    Purchase at live rates
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/gold-goals"
                            onClick={() => setShowQuickMenu(false)}
                            className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-neutral-700/50"
                        >
                            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2 text-white dark:from-blue-600 dark:to-cyan-600">
                                <Target className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-gray-900 dark:text-white">Create Goal</p>
                                <p className="text-xs text-gray-500 dark:text-neutral-400">
                                    Set savings target
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/gift-gold"
                            onClick={() => setShowQuickMenu(false)}
                            className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-neutral-700/50"
                        >
                            <div className="rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 p-2 text-white dark:from-pink-600 dark:to-rose-600">
                                <Gift className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-gray-900 dark:text-white">Gift Gold</p>
                                <p className="text-xs text-gray-500 dark:text-neutral-400">
                                    Send to loved ones
                                </p>
                            </div>
                        </Link>

                        <div className="my-2 border-t border-gray-200 dark:border-neutral-700"></div>

                        <button
                            onClick={() => setShowQuickMenu(false)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl p-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:text-neutral-400 dark:hover:bg-neutral-700/50"
                        >
                            <X className="h-4 w-4" />
                            <span>Close</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                className={`fixed right-6 bottom-24 z-40 rounded-full bg-[#3D3066] p-4 text-white shadow-lg transition-all hover:scale-110 hover:bg-[#5C4E7F] dark:bg-[#4D3F7F] dark:shadow-neutral-900/50 dark:hover:bg-[#5C4E9F] lg:hidden ${showQuickMenu ? "rotate-45" : ""
                    }`}
            >
                <Plus className="h-6 w-6" />
            </button>

            {/* Bottom Navigation */}
            <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800 lg:hidden">
                <div className="w-full px-2 py-2">
                    <div className="flex items-center justify-around">
                        {[
                            { path: "/home", icon: Home, label: "Home" },
                            { path: "/wallet", icon: Wallet, label: "Wallet" },
                            { path: "/partners", icon: MapPin, label: "Partners" },
                            { path: "/loans", icon: Banknote, label: "Loans" },
                            { path: "/profile", icon: User, label: "Profile" },
                        ].map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors ${isActive(item.path)
                                        ? "bg-[#F3F1F7] text-[#3D3066] dark:bg-neutral-700 dark:text-white"
                                        : "text-gray-600 hover:bg-gray-50 dark:text-neutral-400 dark:hover:bg-neutral-700/50"
                                    }`}
                            >
                                <item.icon className="h-6 w-6" />
                                <span className="text-xs">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
