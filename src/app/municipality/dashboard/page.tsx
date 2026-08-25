"use client";

import { useMemo } from "react";
import citizens from "../../../../data/citizens.json";
import grievances from "../../../../data/grievances.json";
import idCards from "../../../../data/id-cards.json";
import municipalities from "../../../../data/municipalities.json";
import syncBatches from "../../../../data/sync-batches.json";
import wards from "../../../../data/wards.json";
import { getCurrentSession } from "@/services/auth.service";
import ScopeDashboard, { type ScopeAction, type ScopeMetric } from "@/components/dashboard/ScopeDashboard";

const number = (value: number) => value.toLocaleString("en-US");

export default function MunicipalityDashboardPage() {
  const session = getCurrentSession();
  const municipality = useMemo(() => municipalities.find((item) => item.id === session?.municipality_id) ?? municipalities[0], [session?.municipality_id]);
  const municipalityWardIds = new Set(wards.filter((ward) => ward.municipality_id === municipality.id).map((ward) => ward.id));
  const municipalityWards = wards.filter((ward) => municipalityWardIds.has(ward.id));
  const municipalityCitizens = citizens.filter((citizen) => municipalityWardIds.has(citizen.ward_id));
  const municipalityCitizenIds = new Set(municipalityCitizens.map((citizen) => citizen.id));
  const municipalityBatches = syncBatches.filter((batch) => municipalityWardIds.has(batch.ward_id));
  const conflicts = municipalityBatches.reduce((sum, batch) => sum + batch.conflict_count, 0);
  const activeGrievances = grievances.filter((grievance) => grievance.status !== "CLOSED" && municipalityCitizenIds.has(grievance.citizen_id)).length;
  const issuedCards = idCards.filter((card) => card.issued_at !== null && municipalityCitizenIds.has(card.citizen_id)).length;
  const metrics: ScopeMetric[] = [
    { label: "Total Citizens", value: number(municipalityCitizens.length), foot: "Registered citizen records", accent: "navy", icon: "♙" },
    { label: "Municipality Wards", value: municipalityWards.length, foot: "Official ward count", accent: "blue", icon: "▤" },
    { label: "Sync Conflicts", value: conflicts, foot: conflicts ? "Needs attention" : "No unresolved conflicts", accent: conflicts ? "red" : "green", icon: "⚑" },
    { label: "Active Grievances", value: activeGrievances, foot: "Open citizen issues", accent: "orange", icon: "◇" },
    { label: "Pending Approvals", value: 0, foot: "Requires administrative review", accent: "purple", icon: "◷" },
    { label: "ID Cards Issued", value: number(issuedCards), foot: "Municipal records", accent: "green", icon: "▣" },
  ];
  const coverage: ScopeMetric[] = [
    { label: "Registered Households", value: "—", foot: "Municipality records", accent: "orange", icon: "⌂" },
    { label: "Reporting Wards", value: municipalityBatches.length, foot: "Connected to municipality", accent: "blue", icon: "▤" },
    { label: "Pending Sync Records", value: municipalityBatches.filter((batch) => batch.status === "PENDING").length, foot: "Awaiting synchronization", accent: "purple", icon: "◷" },
    { label: "Resolved Issues", value: "—", foot: "Municipality total", accent: "green", icon: "✓" },
  ];
  const actions: ScopeAction[] = [
    { href: "/municipality/approvals", title: "Approval Queue", description: "Review and process citizen changes submitted by ward offices.", cta: "Open Queue →", accent: "navy", icon: "✓" },
    { href: "/municipality/reports", title: "Municipality Reports", description: "View service coverage, population, and ward performance reports.", cta: "View Reports →", accent: "purple", icon: "▤" },
    { href: "/municipality/dashboard/conflicts", title: "Sync Conflicts", description: "Resolve records that could not be synchronized from ward offices.", cta: "Review Conflicts →", accent: "red", icon: "⚑" },
    { href: "/municipality/ward-admin", title: "Ward Administration", description: "Manage ward access and monitor local reporting activity.", cta: "Manage Wards →", accent: "orange", icon: "♙" },
  ];
  return <ScopeDashboard scope="Municipality Portal" title={`${municipality?.name_en ?? "Municipality"} Dashboard`} description="Municipality overview of citizens, approvals, ward synchronization, and grievances." metrics={metrics} coverageTitle="Registration Coverage" coverageSubtitle={`What ward offices have captured across ${municipality?.name_en ?? "this municipality"}`} coverage={coverage} actions={actions} table={{ title: "Ward Performance", subtitle: "Ward-level reporting and synchronization status", headers: ["Ward", "Citizens", "Sync Status"], rows: municipalityWards.slice(0, 8).map((ward) => { const latestBatch = municipalityBatches.filter((batch) => batch.ward_id === ward.id).at(-1); return [ward.name_en, municipalityCitizens.filter((citizen) => citizen.ward_id === ward.id).length, latestBatch?.status ?? "NO DATA"]; }) }} />;
}
