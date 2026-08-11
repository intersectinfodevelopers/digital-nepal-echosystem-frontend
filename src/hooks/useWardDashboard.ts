import { useMemo } from "react";
import type { Citizen } from "@/types/citizen";
import type { StatItem } from "@/types/dashboard";
import citizensRaw from "../../data/citizens.json";
import idCardsRaw from "../../data/id-cards.json";

const citizens = citizensRaw as Citizen[];
const idCards = idCardsRaw as { citizen_id: string; status: string }[];

export function useWardDashboard(wardId: string): StatItem[] {
  return useMemo(() => {
    const wardCitizens = citizens.filter(
      (citizen) => citizen.ward_id === wardId,
    );

    const issuedCards = idCards.filter(
      (card) =>
        card.status !== "PENDING_APPROVAL" &&
        wardCitizens.some((citizen) => citizen.id === card.citizen_id),
    ).length;

    return [
      { label: "Total Citizens", value: wardCitizens.length, tone: "blue" },
      {
        label: "NID Verified",
        value: wardCitizens.filter((citizen) => citizen.nid_verified).length,
        tone: "blue",
      },
      { label: "ID Cards Issued", value: issuedCards, tone: "red" },
    ];
  }, [wardId]);
}