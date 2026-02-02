"use client";

import { ApplyLoanPage as ApplyLoanComponent } from "@/components/ApplyLoanPage";
import { useRouter } from "next/navigation";

export default function ApplyLoanFlowPage() {
    const router = useRouter();

    // Props from MainApp:
    // isOpen={showApplyLoan}
    // onClose={() => setShowApplyLoan(false)}
    // eligibleGold={10.547}
    // maxLoanAmount={47463}
    // interestRate={9.5}

    return (
        <ApplyLoanComponent
            onBack={() => router.back()}
            loanAmount={47463}
            goldPledged={10.547}
            interestRate={9.5}
            tenureMonths={12}
        />
    );
}