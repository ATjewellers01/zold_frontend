"use client";

import { HomeTab } from "@/components/tabs/HomeTab";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const router = useRouter();

    return (
        <HomeTab
            isLoading={false}
            onLoadingComplete={() => { }}
            onBuyGold={() => router.push("/buy-sell?metal=gold&action=buy")}
            onSellGold={() => router.push("/buy-sell?metal=gold&action=sell")}
            onBuySilver={() => router.push("/buy-sell?metal=silver&action=buy")}
            onSellSilver={() => router.push("/buy-sell?metal=silver&action=sell")}
            onJewellery={() => router.push("/jewellery")}
            onOpenSIPCalculator={() => router.push("/sip-calculator")}
            onOpenReferral={() => router.push("/referral")}
            onOpenGiftGold={() => router.push("/gift-gold")}
            onOpenSip={() => router.push("/manage-sip")}
            onOpenAuspiciousDays={() => router.push("/auspicious-days")}
            onOpenGoldGoals={() => router.push("/gold-goals")}
            onOpenWalletDetails={() => router.push("/wallet-details")}
        />
    );
}
