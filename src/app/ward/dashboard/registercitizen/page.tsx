"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PersonalStep } from "@/components/PersonalStep";

export default function WardRegisterCitizenPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ward/dashboard/registercitizen");
  }, [router]);

  return <PersonalStep />;
}
