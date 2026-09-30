"use client";

import { Suspense } from "react";
import { UnifiedCitizenRegistration } from "@/components/UnifiedCitizenRegistration";

export default function WardRegisterCitizenPage() {
  return (
    <Suspense fallback={null}>
      <UnifiedCitizenRegistration />
    </Suspense>
  );
}
