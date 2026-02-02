"use client";

import { LoansTab } from "@/components/tabs/LoansTab";
import { useRouter } from "next/navigation";

export default function LoansPage() {
    const router = useRouter();

    return <LoansTab isLoading={false} onOpenApplyLoan={() => router.push("/apply-loan")} onOpenApplyLoanpage={() => router.push("/applyloanpage")} onOpenPartners={() => router.push("/partners")} />;
}
