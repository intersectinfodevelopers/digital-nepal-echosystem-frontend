import citizens from "../../../../data/citizens.json";
import idCards from "../../../../data/id-cards.json";
import municipalities from "../../../../data/municipalities.json";
import provinces from "../../../../data/provinces.json";
import wards from "../../../../data/wards.json";
import grievances from "../../../../data/grievances.json";
import ScopeDashboard, { type ScopeMetric, type ScopeAction } from "@/components/dashboard/ScopeDashboard";

const number = (value: number) => value.toLocaleString("en-US");
const metrics: ScopeMetric[] = [
  { label: "Total Citizens Nationally", value: number(citizens.length), foot: "▲ 8 this week", accent: "navy", icon: "♙" },
  { label: "Total Provinces", value: provinces.length, foot: "All onboarded", accent: "blue", icon: "⌖" },
  { label: "Total Municipalities", value: municipalities.length, foot: "Local bodies", accent: "purple", icon: "▥" },
  { label: "Total Wards", value: number(wards.length), foot: "Official ward count", accent: "orange", icon: "▤" },
  { label: "ID Cards Issued", value: idCards.filter((card) => card.issued_at !== null).length, foot: "Issued platform cards", accent: "green", icon: "▣" },
  { label: "Active Grievances", value: grievances.filter((grievance) => grievance.status !== "CLOSED").length, foot: "Requires attention", accent: "red", icon: "⚑" },
];
const coverage: ScopeMetric[] = [
  { label: "Households Registered", value: 138, foot: "26.1% below poverty line", accent: "orange", icon: "⌂" },
  { label: "Employment Profiles", value: citizens.length, foot: "100% coverage", accent: "blue", icon: "▣" },
  { label: "Education Records", value: 393, foot: "2.3% dropout rate", accent: "purple", icon: "◇" },
  { label: "Disability Profiles", value: 28, foot: "6.8% of population", accent: "red", icon: "♿" },
];
const actions: ScopeAction[] = [
  { href: "/central/citizen-lookup", title: "Citizen Lookup", description: "Search masked national records by NID, citizenship number, or name.", cta: "Open Lookup →", accent: "navy", icon: "♙" },
  { href: "/central/investigation", title: "Investigation Requests", description: "Open a case to unlock a full citizen record for authorized review.", cta: "View Requests →", accent: "red", icon: "◇" },
  { href: "/central/policy-cards", title: "Policy Actions", description: "Review policy signals and recommendations from national data.", cta: "Open Policies →", accent: "orange", icon: "⚑" },
  { href: "/central/province-admins", title: "Province Admins", description: "Manage province-level administrator accounts and access.", cta: "7 active admins →", accent: "purple", icon: "♙" },
];

export default function CentralDashboardPage() {
  return <ScopeDashboard scope="Central Administration" title="National Dashboard" description="National overview of citizens, administrative divisions, ID cards, and grievances aggregated across all 7 provinces." metrics={metrics} coverageTitle="Registration Coverage" coverageSubtitle="What Ward Admins have captured, aggregated nationally" coverage={coverage} actions={actions} table={{ title: "Province Breakdown", subtitle: "Live platform figures across every province", headers: ["Province", "Citizens", "Municipalities", "ID Cards Issued"], rows: provinces.map((province) => [province.name_en, "—", "—", "—"]) }} />;
}
