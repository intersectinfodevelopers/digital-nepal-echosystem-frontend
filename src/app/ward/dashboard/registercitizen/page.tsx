"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WardRegisterCitizenPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portal/personal");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E8EEF7]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#06439D]" />
        <p className="text-[12px] font-medium text-[#687386]">
          Redirecting to personal details...
        </p>
      </div>
    </div>
  );
}
