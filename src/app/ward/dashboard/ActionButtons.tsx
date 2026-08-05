"use client";
import { useRouter } from "next/navigation";
import { ClipboardList, RefreshCw, UserRoundPlus } from "lucide-react";

export default function ActionButtons() {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        aria-label="Register citizen"
        onClick={() => router.push("/portal/personal")}
        className="flex h-12.5 w-full items-center justify-center gap-2 rounded-[10px] bg-[#0A3E9E] text-[15px] font-medium text-white transition-all duration-150 hover:scale-[1.02] hover:bg-[#083078] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3E9E] focus-visible:ring-offset-2 md:w-61.25"
      >
        <UserRoundPlus size={18} />
        Register citizen
      </button>
      <button
        type="button"
        aria-label="View queue"
        className="flex h-12.5 w-full items-center justify-center gap-2 rounded-[10px] border border-[#0A3E9E] bg-white text-[15px] font-medium text-[#0A3E9E] transition-all duration-150 hover:scale-[1.02] hover:bg-[#F0F4FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3E9E] focus-visible:ring-offset-2 md:w-61.25"
      >
        <ClipboardList size={18} />
        View Queue
      </button>
      <button
        type="button"
        aria-label="Force sync"
        className="flex h-12.5 w-full items-center justify-center gap-2 rounded-[10px] border border-[#ef4444] bg-white text-[15px] font-medium text-[#ef4444] transition-all duration-150 hover:scale-[1.02] hover:bg-[#FEF2F2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444] focus-visible:ring-offset-2 md:ml-auto md:w-61.25"
      >
        <RefreshCw size={18} />
        Force Sync
      </button>
    </div>
  );
}
