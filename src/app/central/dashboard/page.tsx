import Link from "next/link";
import { useMemo } from "react";
import {
  PeopleOutlined,
  AccountBalanceOutlined,
  LocationCityOutlined,
  SyncOutlined,
  BadgeOutlined,
  ReportProblemOutlined,
  MapOutlined,
  AnalyticsOutlined,
  NotificationsNone,
  PersonOutlined,
  WarningAmberOutlined,
  ShieldOutlined,
  PsychologyOutlined,
  FactCheckOutlined,
  FileDownloadOutlined,
  FolderZipOutlined,
  ChevronRight,
} from "@mui/icons-material";

import citizens from "../../../../data/citizens.json";
import districts from "../../../../data/district.json";
import editApprovals from "../../../../data/edit-approvals.json";
import employment from "../../../../data/employment.json";
import grievances from "../../../../data/grievances.json";
import idCards from "../../../../data/id-cards.json";
import municipalities from "../../../../data/municipalities.json";
import provinces from "../../../../data/provinces.json";
import wards from "../../../../data/wards.json";
import households from "../../../../data/households.json";
import disability from "../../../../data/disability.json";
import education from "../../../../data/education.json";

const numberFormat = new Intl.NumberFormat("en-US");

export default function CentralDashboardPage() {
  const dataMetrics = useMemo(() => {
    const districtProvinceMap = new Map<string, string>();
    (districts || []).forEach((item) => districtProvinceMap.set(item.id, item.province_id));

    const municipalityProvinceMap = new Map<string, string>();
    (municipalities || []).forEach((item) => {
      const provId = districtProvinceMap.get(item.district_id);
      if (provId) municipalityProvinceMap.set(item.id, provId);
    });

    const wardProvinceMap = new Map<string, string>();
    const wardMunicipalityMap = new Map<string, string>();
    (wards || []).forEach((item) => {
      wardMunicipalityMap.set(item.id, item.municipality_id);
      const provId = municipalityProvinceMap.get(item.municipality_id);
      if (provId) wardProvinceMap.set(item.id, provId);
    });

    const citizenProvinceMap = new Map<string, string>();
    (citizens || []).forEach((item) => {
      const provId = wardProvinceMap.get(item.ward_id);
      if (provId) citizenProvinceMap.set(item.id, provId);
    });

    const provCitizensCount = new Map<string, number>();
    (citizens || []).forEach((item) => {
      const pId = citizenProvinceMap.get(item.id);
      if (pId) provCitizensCount.set(pId, (provCitizensCount.get(pId) ?? 0) + 1);
    });

    const provMunisCount = new Map<string, number>();
    (municipalities || []).forEach((item) => {
      const pId = municipalityProvinceMap.get(item.id);
      if (pId) provMunisCount.set(pId, (provMunisCount.get(pId) ?? 0) + 1);
    });

    const provPendingApprovals = new Map<string, number>();
    (editApprovals || []).forEach((approval) => {
      if (approval.status === "PENDING_APPROVAL" || approval.status === "CAO_REVIEW") {
        const pId = citizenProvinceMap.get(approval.citizen_id);
        if (pId) provPendingApprovals.set(pId, (provPendingApprovals.get(pId) ?? 0) + 1);
      }
    });

    const provActiveCases = new Map<string, number>();
    (grievances || []).forEach((item) => {
      if (item.status !== "CLOSED") {
        const pId = citizenProvinceMap.get(item.citizen_id);
        if (pId) provActiveCases.set(pId, (provActiveCases.get(pId) ?? 0) + 1);
      }
    });

    const provCardsIssued = new Map<string, number>();
    let issuedCardsCount = 0;
    (idCards || []).forEach((card) => {
      if (card.issued_at !== null) {
        issuedCardsCount += 1;
        const pId = citizenProvinceMap.get(card.citizen_id);
        if (pId) provCardsIssued.set(pId, (provCardsIssued.get(pId) ?? 0) + 1);
      }
    });

    const totalCitizens = citizens ? citizens.length : 0;
    const totalProvinces = provinces ? provinces.length : 0;
    const totalMunicipalities = municipalities ? municipalities.length : 0;
    const syncedWards = wards ? wards.length : 0;
    const activeGrievancesCount = grievances ? grievances.filter((g) => g.status !== "CLOSED").length : 0;

    const registeredHouseholds = households ? households.length : 0;
    const employmentProfiles = employment ? employment.length : 0;
    const educationProfiles = education ? education.length : 0;
    const disabilityProfiles = disability ? disability.filter((d) => d.disability_type !== null).length : 0;

    const corridorMap: Record<string, { name: string; visa: string; count: number }> = {
      AE: { name: "United Arab Emirates", visa: "Gov. Works Contract Permit", count: 0 },
      QA: { name: "State of Qatar Territory", visa: "Work Clearance Visa", count: 0 },
      SA: { name: "Saudi Arabia Reg. KSA", visa: "Gulf Contract Tier 3", count: 0 },
      MY: { name: "Malaysia Govt Peninsula", visa: "Work Standard Permit", count: 0 },
    };

    (employment || []).forEach((item) => {
      if (item.category === "FOREIGN_ABROAD") {
        const code = item.sub_fields?.country_code;
        if (code && corridorMap[code]) {
          corridorMap[code].count += 1;
        }
      }
    });

    const categoryCounts: Record<string, number> = {};
    (employment || []).forEach((item) => {
      if (item.category) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      }
    });

    const provinceRows = (provinces || []).map((province, idx) => {
      const cCount = provCitizensCount.get(province.id) ?? 0;
      const mCount = provMunisCount.get(province.id) ?? 0;
      const pBags = provPendingApprovals.get(province.id) ?? 0;
      const aCases = provActiveCases.get(province.id) ?? 0;
      const cIssued = provCardsIssued.get(province.id) ?? 0;
      const isLive = idx === 0;

      return {
        id: province.id,
        numStr: `0${idx + 1}`,
        name: `${province.name_en} Province`,
        citizens: cCount,
        municipalities: mCount,
        pendingBags: pBags,
        activeCases: aCases,
        idIssuances: cIssued,
        isLive,
      };
    });

    return {
      totalCitizens,
      totalProvinces,
      totalMunicipalities,
      syncedWards,
      issuedCardsCount,
      activeGrievancesCount,
      registeredHouseholds,
      employmentProfiles,
      educationProfiles,
      disabilityProfiles,
      corridorMap,
      categoryCounts,
      provinceRows,
    };
  }, []);

  return (
    <div className="space-y-6 pb-12 text-slate-800 antialiased">
      {/* 2. HEADER / BREADCRUMB SECTION */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span>Central Portal</span>
            <span>&gt;</span>
            <span className="text-slate-900 font-bold">Dashboard</span>
          </div>
          <div className="mt-1 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            CENTRAL_ADMIN
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            National Dashboard
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 max-w-3xl">
            National overview of citizens, administrative divisions, ID cards, and grievances — aggregated across all 7 provinces.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/central/national-map"
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600/40 bg-white px-3 py-1.5 text-xs font-bold text-blue-600 shadow-xs hover:bg-blue-50 transition-colors"
          >
            <MapOutlined sx={{ fontSize: 16 }} />
            <span>View Map</span>
          </Link>

          <Link
            href="/central/analytics"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <AnalyticsOutlined sx={{ fontSize: 16 }} />
            <span>Open Analytics</span>
          </Link>

          <button className="relative rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50">
            <NotificationsNone sx={{ fontSize: 18 }} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow-xs">
            GO
          </div>
        </div>
      </div>

      {/* 3. TOP KPI CARD GRID (6 Cards) */}
      <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 — Total Citizens */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Citizens Nationally</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <PeopleOutlined sx={{ fontSize: 18 }} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {dataMetrics.totalCitizens > 0 ? numberFormat.format(dataMetrics.totalCitizens) : "Not Available"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold">
            <span className="inline-flex items-center text-emerald-600 font-bold">
              ↑ Active System Records
            </span>
            <span className="text-slate-400">All 753 Local Bodies</span>
          </div>
        </div>

        {/* Card 2 — Total Federal Provinces */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Federal Provinces</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <AccountBalanceOutlined sx={{ fontSize: 18 }} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {dataMetrics.totalProvinces > 0 ? dataMetrics.totalProvinces : "Not Available"}
            </span>
            {dataMetrics.totalProvinces > 0 && <span className="text-xs font-bold text-slate-600">active</span>}
          </div>
          <div className="mt-3 flex items-center text-[11px] font-semibold text-indigo-600">
            <span>{dataMetrics.totalProvinces > 0 ? `✓ All ${dataMetrics.totalProvinces} Verified` : "Not Available"}</span>
          </div>
        </div>

        {/* Card 3 — Total Municipalities */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Municipalities</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <LocationCityOutlined sx={{ fontSize: 18 }} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {dataMetrics.totalMunicipalities > 0 ? numberFormat.format(dataMetrics.totalMunicipalities) : "Not Available"}
            </span>
            {dataMetrics.totalMunicipalities > 0 && <span className="text-xs font-bold text-slate-600">captured</span>}
          </div>
          <div className="mt-3 flex items-center text-[11px] font-semibold text-sky-600">
            <span>{dataMetrics.totalMunicipalities > 0 ? `● Active ${dataMetrics.totalMunicipalities} Local Bodies` : "Not Available"}</span>
          </div>
        </div>

        {/* Card 4 — National Wards Synced */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">National Wards Synced</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <SyncOutlined sx={{ fontSize: 18 }} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {dataMetrics.syncedWards > 0 ? numberFormat.format(dataMetrics.syncedWards) : "Not Available"}
            </span>
          </div>
          <div className="mt-3 flex items-center text-[11px] font-semibold text-emerald-600">
            <span>{dataMetrics.syncedWards > 0 ? `★ ${dataMetrics.syncedWards} Wards Synced` : "Not Available"}</span>
          </div>
        </div>

        {/* Card 5 — ID Cards Issued */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ID Cards Issued</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <BadgeOutlined sx={{ fontSize: 18 }} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {dataMetrics.issuedCardsCount > 0 ? numberFormat.format(dataMetrics.issuedCardsCount) : "Not Available"}
            </span>
            {dataMetrics.issuedCardsCount > 0 && <span className="text-xs font-semibold text-slate-400">Total Cards</span>}
          </div>
          <div className="mt-3 flex items-center text-[11px] font-semibold text-teal-600">
            <span>{dataMetrics.issuedCardsCount > 0 ? "Verified Issued Cards" : "Not Available"}</span>
          </div>
        </div>

        {/* Card 6 — Active Grievances Open */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Grievances Open</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
              <ReportProblemOutlined sx={{ fontSize: 18 }} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-rose-600">
              {dataMetrics.activeGrievancesCount > 0 ? numberFormat.format(dataMetrics.activeGrievancesCount) : "0"}
            </span>
          </div>
          <div className="mt-3 flex items-center text-[11px] font-semibold text-rose-600">
            <span>{dataMetrics.activeGrievancesCount > 0 ? `${dataMetrics.activeGrievancesCount} Active Open Cases` : "No Open Grievances"}</span>
          </div>
        </div>
      </div>

      {/* 4. SOCIAL REGISTRATION PROFILES SECTION */}
      <div>
        <h2 className="text-sm font-bold tracking-tight text-slate-900">
          Social Registration Profiles
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Household Card */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-500">Registered Households</div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {dataMetrics.registeredHouseholds > 0 ? numberFormat.format(dataMetrics.registeredHouseholds) : "Not Available"}
              </div>
              <div className="mt-2 text-[10px] text-slate-400">
                {dataMetrics.registeredHouseholds > 0 ? `${dataMetrics.registeredHouseholds} Active Records` : "Not Available"}
              </div>
            </div>
            <div className="relative h-12 w-12 shrink-0">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-amber-500" strokeDasharray="33, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>

          {/* Employment Card */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-500">Employment Profiles</div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {dataMetrics.employmentProfiles > 0 ? numberFormat.format(dataMetrics.employmentProfiles) : "Not Available"}
              </div>
              <div className="mt-2 text-[10px] text-slate-400">
                {dataMetrics.employmentProfiles > 0 ? `${dataMetrics.employmentProfiles} Active Records` : "Not Available"}
              </div>
            </div>
            <div className="relative h-12 w-12 shrink-0">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-blue-600" strokeDasharray="45, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>

          {/* Education Card */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-500">Education & Demographic</div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {dataMetrics.educationProfiles > 0 ? numberFormat.format(dataMetrics.educationProfiles) : "Not Available"}
              </div>
              <div className="mt-2 text-[10px] text-slate-400">
                {dataMetrics.educationProfiles > 0 ? `${dataMetrics.educationProfiles} Active Records` : "Not Available"}
              </div>
            </div>
            <div className="relative h-12 w-12 shrink-0">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-indigo-500" strokeDasharray="25, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>

          {/* Disability Card */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-500">Disability Medical Profile</div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {dataMetrics.disabilityProfiles > 0 ? numberFormat.format(dataMetrics.disabilityProfiles) : "Not Available"}
              </div>
              <div className="mt-2 text-[10px] text-slate-400">
                {dataMetrics.disabilityProfiles > 0 ? `${dataMetrics.disabilityProfiles} Active Medical Profiles` : "Not Available"}
              </div>
            </div>
            <div className="relative h-12 w-12 shrink-0">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-rose-500" strokeDasharray="18, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 5. LIVE POLICY RECOMMENDATIONS & ENGINE OUTPUT */}
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <h2 className="text-sm font-bold tracking-tight text-slate-900">
            Live Policy Recommendations & Engine Output
          </h2>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Card 1 — Priority Insight */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                  <WarningAmberOutlined sx={{ fontSize: 16 }} />
                </div>
                <h3 className="text-xs font-bold text-amber-950">
                  Koshi Province - Remittance Fragility Alert
                </h3>
              </div>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                Action Required →
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-amber-900/90">
              {dataMetrics.employmentProfiles > 0
                ? `Active worker registration indicates foreign labor corridor concentration in Gulf regions. Recommend establishing provincial welfare desk.`
                : "Not Available"}
            </p>
          </div>

          {/* Card 2 — Recalculation Task */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-700">
                  <SyncOutlined sx={{ fontSize: 16 }} />
                </div>
                <h3 className="text-xs font-bold text-indigo-950">
                  National Benefit Eligibility Recalculation Engine
                </h3>
              </div>
              <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                System Broadcast →
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-indigo-900/90">
              {dataMetrics.disabilityProfiles > 0
                ? `Automated rule logic synced ${dataMetrics.disabilityProfiles} active medical profiles across active local health gateways.`
                : "Not Available"}
            </p>
          </div>
        </div>
      </div>

      {/* 6. FEDERAL SUB-DIVISION BREAKDOWN DATA MATRIX */}
      <div>
        <h2 className="text-sm font-bold tracking-tight text-slate-900">
          Federal Sub-Division Breakdown Data Matrix
        </h2>

        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/80 font-bold text-slate-500">
              <tr>
                <th className="px-4 py-3">Provincial Name Block</th>
                <th className="px-4 py-3">Net Citizens</th>
                <th className="px-4 py-3">Municipalities</th>
                <th className="px-4 py-3">Pending Bags</th>
                <th className="px-4 py-3">Active Cases</th>
                <th className="px-4 py-3">ID Issuances</th>
                <th className="px-4 py-3">Cluster Sync Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {dataMetrics.provinceRows.map((prov) => (
                <tr key={prov.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                    <span className="text-slate-400 mr-1.5">{prov.numStr}</span>
                    {prov.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {prov.citizens > 0 ? numberFormat.format(prov.citizens) : "Not Available"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {prov.municipalities > 0 ? `${prov.municipalities} Gov. Centers` : "Not Available"}
                  </td>
                  <td className="px-4 py-3">
                    {prov.pendingBags > 0 ? (
                      <span className="font-bold text-amber-600">{prov.pendingBags} Pending</span>
                    ) : (
                      <span className="text-slate-400">0 Items</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {prov.activeCases > 0 ? (
                      <span className="font-bold text-rose-600">{prov.activeCases} Active</span>
                    ) : (
                      <span className="text-slate-400">0 Alerts</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {prov.idIssuances > 0 ? numberFormat.format(prov.idIssuances) : "0 Cards"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {prov.citizens > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-200/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        99.8% System Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                        ● Sync Standby
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. LOWER ANALYTICS SECTION */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left — National Employment Categorization Profile */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                National Employment Categorization Profile
              </h3>
              <p className="text-[10px] text-slate-400">
                Categorization overview across registered profiles.
              </p>
            </div>
            <Link href="/central/analytics" className="text-[11px] font-bold text-blue-600 hover:underline">
              Extrapolated Data Analytics →
            </Link>
          </div>

          <div className="mt-4 space-y-3.5">
            {Object.keys(dataMetrics.categoryCounts).length > 0 ? (
              Object.entries(dataMetrics.categoryCounts).map(([cat, count]) => {
                const percentage = dataMetrics.employmentProfiles > 0
                  ? ((count / dataMetrics.employmentProfiles) * 100).toFixed(1)
                  : "0";
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">{cat}</span>
                      <span className="text-blue-600 font-bold">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs font-semibold text-slate-500">Not Available</div>
            )}
          </div>
        </div>

        {/* Right — Migrant Labor Channels Corridor Tracker */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900">
              Migrant Labor Channels Corridor Tracker
            </h3>
          </div>

          <div className="mt-3 space-y-2.5">
            {Object.entries(dataMetrics.corridorMap).map(([code, info]) => (
              <div key={code} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-[10px] font-black text-sky-700">
                    {code}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{info.name}</div>
                    <div className="text-[10px] text-slate-400">{info.visa}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900">
                    {info.count > 0 ? info.count : "Not Available"}
                  </span>
                  {info.count > 0 && <span className="ml-1 text-[9px] font-bold text-slate-400">Registered</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. THIRD ANALYTICS ROW */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left — Migrant Deficit Internal Provincial Disparities */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900">
              Migrant Deficit Internal Provincial Disparities
            </h3>
            <p className="text-[10px] text-slate-400">
              Breakdown comparing volume inside local jurisdictions per sub-division boundaries.
            </p>
          </div>

          <div className="mt-3 space-y-2.5 text-xs">
            {dataMetrics.provinceRows.map((prov) => (
              <div key={prov.id} className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="font-bold text-slate-900">{prov.name}</span>
                <div className="text-right">
                  <span className="text-slate-700 font-medium">
                    {prov.citizens > 0 ? `${prov.citizens} Registered Citizens` : "Not Available"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Unemployment Stress Area Hotspot Array Map */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900">
              Unemployment Stress Area Hotspot Array Map
            </h3>
            <p className="text-[10px] text-slate-400">
              Macro-regional clustering denoting local municipality non-activity.
            </p>
          </div>

          <div className="mt-3 space-y-2.5">
            {municipalities && municipalities.length > 0 ? (
              municipalities.slice(0, 3).map((muni) => (
                <div key={muni.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{muni.name_en}</div>
                    <div className="text-[10px] text-slate-400">District ID: {muni.district_id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-700">Active Node</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs font-semibold text-slate-500">Not Available</div>
            )}
          </div>
        </div>
      </div>

      {/* 9. BOTTOM ALERT / ACTION CARDS */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Action 1 */}
        <Link
          href="/central/audit-log"
          className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <PersonOutlined sx={{ fontSize: 18 }} />
            </div>
            <ChevronRight sx={{ fontSize: 16 }} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="mt-3">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Zero-PB Secure Citizen Lookup Registry
            </h4>
            <p className="mt-1 text-[10px] text-slate-400 leading-tight">
              Search household records without viewing safety codes or data links.
            </p>
            <span className="mt-2 block text-[10px] font-bold text-blue-600">
              Open Lookup Search Node
            </span>
          </div>
        </Link>

        {/* Action 2 */}
        <Link
          href="/central/audit-log"
          className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldOutlined sx={{ fontSize: 18 }} />
            </div>
            <ChevronRight sx={{ fontSize: 16 }} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="mt-3">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Cross-Tier Law Compliance Investigations Core Hub
            </h4>
            <p className="mt-1 text-[10px] text-slate-400 leading-tight">
              Direct channel to administrator boards matching repetition tagging.
            </p>
            <span className="mt-2 block text-[10px] font-bold text-blue-600">
              Access System Auditing
            </span>
          </div>
        </Link>

        {/* Action 3 */}
        <Link
          href="/central/flag-anomaly"
          className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
              <ReportProblemOutlined sx={{ fontSize: 18 }} />
            </div>
            <ChevronRight sx={{ fontSize: 16 }} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="mt-3">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Anomalous Activity Alert Internal Flag Raised Rule
            </h4>
            <p className="mt-1 text-[10px] text-slate-400 leading-tight">
              Execute emergency freeze on state records that standard integrity-flagged.
            </p>
            <span className="mt-2 block text-[10px] font-bold text-rose-600">
              Trigger Anomaly Incident Path
            </span>
          </div>
        </Link>

        {/* Action 4 */}
        <Link
          href="/central/eligibility-rules"
          className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <SyncOutlined sx={{ fontSize: 18 }} />
            </div>
            <ChevronRight sx={{ fontSize: 16 }} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="mt-3">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Central Identity Sync Admin Control Room Mapping Area
            </h4>
            <p className="mt-1 text-[10px] text-slate-400 leading-tight">
              Establish shared ties and general permissions for provincial level control.
            </p>
            <span className="mt-2 block text-[10px] font-bold text-blue-600">
              Direct Management View Set
            </span>
          </div>
        </Link>
      </div>

      {/* 10. BOTTOM STATUS PILLS */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-semibold text-slate-600">
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-2xs">
          <FactCheckOutlined sx={{ fontSize: 14 }} className="text-slate-500" />
          <span>Open Governance Audit Log System Access Control</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-2xs">
          <PsychologyOutlined sx={{ fontSize: 14 }} className="text-slate-500" />
          <span>Verify Retarget Criteria Eligibility Policy Data Engine</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-2xs">
          <FolderZipOutlined sx={{ fontSize: 14 }} className="text-slate-500" />
          <span>Full Analytics Model Export Mapping</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 shadow-2xs">
          <FileDownloadOutlined sx={{ fontSize: 14 }} />
          <span>Execute Structured Data PDF Extraction Tool Download (Standard Protocol)</span>
        </div>
      </div>

      {/* 11. FOOTER */}
      <div className="pt-4 text-center text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
        AUTHERIZED SECURE LATTICE ALL AUDITS APPEND-ONLY LEDGER THREE WAY VERIFIED.
      </div>
    </div>
  );
}

