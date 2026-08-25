import citizens from "../../../../data/citizens.json";
import provinces from "../../../../data/provinces.json";
import ScopeDashboard, { type ScopeMetric, type ScopeAction } from "@/components/dashboard/ScopeDashboard";
import CentralHierarchyTable from "@/components/dashboard/CentralHierarchyTable";
import LocalLevelStructure from "@/components/dashboard/LocalLevelStructure";
import { TOTAL_DISTRICTS_OFFICIAL, TOTAL_LOCAL_LEVELS_OFFICIAL, TOTAL_WARDS_OFFICIAL } from "@/constants/officialStats";

const number = (value: number) => value.toLocaleString("en-US");
const metrics: ScopeMetric[] = [
  { label: "Total Citizens Nationally", value: number(citizens.length), foot: "▲ 8 this week", accent: "navy", icon: "♙" },
  { label: "Total Provinces", value: provinces.length, foot: "All onboarded", accent: "blue", icon: "⌖" },
  { label: "Total Districts", value: TOTAL_DISTRICTS_OFFICIAL, foot: "Official district count", accent: "purple", icon: "▥" },
  { label: "Total Local Levels", value: TOTAL_LOCAL_LEVELS_OFFICIAL, foot: "6 metro · 11 sub-metro · 276 muni · 460 rural", accent: "orange", icon: "▤" },
  { label: "Total Wards", value: number(TOTAL_WARDS_OFFICIAL), foot: "Official ward count", accent: "teal", icon: "▤" },
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
  return <ScopeDashboard scope="Central Administration" title="National Dashboard" description="National overview of citizens, administrative divisions, ID cards, and grievances aggregated across all 7 provinces." metrics={metrics} coverageTitle="Registration Coverage" coverageSubtitle="What Ward Admins have captured, aggregated nationally" coverage={coverage} actions={actions}><LocalLevelStructure structure={{ metropolitan_cities: 6, sub_metropolitan_cities: 11, municipalities: 276, rural_municipalities: 460, total_local_levels: TOTAL_LOCAL_LEVELS_OFFICIAL, wards: TOTAL_WARDS_OFFICIAL }} /><CentralHierarchyTable /></ScopeDashboard>;
}

