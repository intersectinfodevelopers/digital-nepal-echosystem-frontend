"use client";

import { MapOutlined } from "@mui/icons-material";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import WardMap, { getWardMapContext } from "@/components/ward/WardMap";

export default function WardMapPage() {
  const { session, authorized } = useAuthGuard("WARD_ADMIN");
  const wardId = session?.ward_id ?? null;

  const context = wardId ? getWardMapContext(wardId) : null;

  if (!authorized || !session || !wardId) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3E9E]">Ward Map</h1>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">
            Administrative boundary for Ward {wardId.replace("ward-", "")} ·{" "}
            {context
              ? `${context.localBodyName} (${context.districtName})`
              : wardId}
          </p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8EFFC] text-[#0A3E9E]">
          <MapOutlined sx={{ fontSize: 22 }} />
        </span>
      </div>
      

      <div className="h-[560px] w-full">
        <WardMap height="100%" />
      </div>
    </div>
  );
}