import { Clock3 } from "lucide-react";
import { LAST_SYNCED, WARD_MUNICIPALITY, WARD_NAME } from "@/data/dashboard";

export default function Header() {
  return (
    <div>
      <h1 className="text-[36px] font-bold leading-tight text-[#0A3E9E]">
        {WARD_NAME}
      </h1>
      <p className="mt-1 text-[26px] font-bold leading-tight text-[#374151]">
        {WARD_MUNICIPALITY}
      </p>
      <p className="mt-3 flex items-center gap-2 text-[14px] text-[#6B7280]">
        <Clock3 size={16} className="text-[#6B7280]" />
        <span>Last synced: {LAST_SYNCED}</span>
      </p>
      <div className="mt-6 border-t border-[#d9d9d9]" />
    </div>
  );
}
