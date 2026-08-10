"use client";

import { useEffect, useState } from "react";
import { subscribeWardAdmin } from "@/services/mockWardAdmin";


export function useWardAdminStore(): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    return subscribeWardAdmin(() => setVersion((v) => v + 1));
  }, []);

  return version;
}