"use client";

import { ApplyLoan } from "@/components/ApplyLoan";
import { useRouter } from "next/navigation";

export default function ApplyLoanPage() {
    const router = useRouter();

    // Props from MainApp:
    // isOpen={showApplyLoan}
    // onClose={() => setShowApplyLoan(false)}
    // eligibleGold={10.547}
    // maxLoanAmount={47463}
    // interestRate={9.5}

    return (
        <ApplyLoan
            isOpen={true} // Since it's a page, it's open
            onClose={() => router.back()}
            eligibleGold={10.547}
            maxLoanAmount={47463}
            interestRate={9.5}
        />
    );
}
