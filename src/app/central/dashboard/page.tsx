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
  WarningAmberOutlined,
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
      MY: { name: "Malaysia Gen. Peninsula", visa: "Work Standard Permit", count: 0 },
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

      return {
        id: province.id,
        numStr: `0${idx + 1}`,
        name: `${province.name_en} Province`,
        citizens: cCount,
        municipalities: mCount,
        pendingBags: pBags,
        activeCases: aCases,
        idIssuances: cIssued,
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
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
            <span>Central Portal</span>
            <span>&gt;</span>
            <span className="text-slate-900 font-bold">Dashboard</span>
          </div>
          <div className="mt-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
            CENTRAL_ADMIN
          </div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            National Dashboard
          </h1>
          <p className="mt-1.5 text-sm font-medium text-slate-600 max-w-3xl">
            National overview of citizens, administrative divisions, ID cards, and grievances — aggregated across all 7 provinces.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/central/national-map"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600/40 bg-white px-3.5 py-2 text-sm font-bold text-blue-600 shadow-xs hover:bg-blue-50 transition-colors"
          >
            <MapOutlined sx={{ fontSize: 18 }} />
            <span>View Map</span>
          </Link>

          <Link
            href="/central/analytics"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <AnalyticsOutlined sx={{ fontSize: 18 }} />
            <span>Open Analytics</span>
          </Link>

          <button className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50">
            <NotificationsNone sx={{ fontSize: 20 }} />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white shadow-xs">
            GO
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Total Citizens Nationally</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <PeopleOutlined sx={{ fontSize: 20 }} />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              {dataMetrics.totalCitizens > 0 ? numberFormat.format(dataMetrics.totalCitizens) : "Not Available"}
            </span>
          </div>
          <div className="mt-3.5 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">Imported from records</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Total Federal Provinces</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <AccountBalanceOutlined sx={{ fontSize: 20 }} />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              {dataMetrics.totalProvinces > 0 ? dataMetrics.totalProvinces : "Not Available"}
            </span>
            {dataMetrics.totalProvinces > 0 && <span className="text-sm font-bold text-slate-600">active</span>}
          </div>
          <div className="mt-3.5 flex items-center text-xs font-semibold text-indigo-600">
            <span>{dataMetrics.totalProvinces > 0 ? `✓ All ${dataMetrics.totalProvinces} Verified` : "Not Available"}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Total Municipalities</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <LocationCityOutlined sx={{ fontSize: 20 }} />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              {dataMetrics.totalMunicipalities > 0 ? numberFormat.format(dataMetrics.totalMunicipalities) : "Not Available"}
            </span>
            {dataMetrics.totalMunicipalities > 0 && <span className="text-sm font-bold text-slate-600">captured</span>}
          </div>
          <div className="mt-3.5 flex items-center text-xs font-semibold text-sky-600">
            <span>{dataMetrics.totalMunicipalities > 0 ? `● Active ${dataMetrics.totalMunicipalities} Local Bodies` : "Not Available"}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">National Wards Synced</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <SyncOutlined sx={{ fontSize: 20 }} />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              {dataMetrics.syncedWards > 0 ? numberFormat.format(dataMetrics.syncedWards) : "Not Available"}
            </span>
          </div>
          <div className="mt-3.5 flex items-center text-xs font-semibold text-emerald-600">
            <span>{dataMetrics.syncedWards > 0 ? `★ ${dataMetrics.syncedWards} Wards Synced` : "Not Available"}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">ID Cards Issued</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <BadgeOutlined sx={{ fontSize: 20 }} />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              {dataMetrics.issuedCardsCount > 0 ? numberFormat.format(dataMetrics.issuedCardsCount) : "Not Available"}
            </span>
            {dataMetrics.issuedCardsCount > 0 && <span className="text-sm font-semibold text-slate-500">Total Cards</span>}
          </div>
          <div className="mt-3.5 flex items-center text-xs font-semibold text-teal-600">
            <span>{dataMetrics.issuedCardsCount > 0 ? "Verified Issued Cards" : "Not Available"}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Active Grievances Open</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
              <ReportProblemOutlined sx={{ fontSize: 20 }} />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-rose-600">
              {dataMetrics.activeGrievancesCount > 0 ? numberFormat.format(dataMetrics.activeGrievancesCount) : "0"}
            </span>
          </div>
          <div className="mt-3.5 flex items-center text-xs font-semibold text-rose-600">
            <span>{dataMetrics.activeGrievancesCount > 0 ? `${dataMetrics.activeGrievancesCount} Active Open Cases` : "No Open Grievances"}</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold tracking-tight text-slate-900">
          Social Registration Profiles
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-600">Registered Households</div>
              <div className="mt-1 text-3xl font-black text-slate-900">
                {dataMetrics.registeredHouseholds > 0 ? numberFormat.format(dataMetrics.registeredHouseholds) : "Not Available"}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {dataMetrics.registeredHouseholds > 0 ? `${dataMetrics.registeredHouseholds} Records` : "Not Available"}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-600">Employment Profiles</div>
              <div className="mt-1 text-3xl font-black text-slate-900">
                {dataMetrics.employmentProfiles > 0 ? numberFormat.format(dataMetrics.employmentProfiles) : "Not Available"}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {dataMetrics.employmentProfiles > 0 ? `${dataMetrics.employmentProfiles} Records` : "Not Available"}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-600">Education & Demographic</div>
              <div className="mt-1 text-3xl font-black text-slate-900">
                {dataMetrics.educationProfiles > 0 ? numberFormat.format(dataMetrics.educationProfiles) : "Not Available"}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {dataMetrics.educationProfiles > 0 ? `${dataMetrics.educationProfiles} Records` : "Not Available"}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-600">Disability Medical Profile</div>
              <div className="mt-1 text-3xl font-black text-slate-900">
                {dataMetrics.disabilityProfiles > 0 ? numberFormat.format(dataMetrics.disabilityProfiles) : "Not Available"}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {dataMetrics.disabilityProfiles > 0 ? `${dataMetrics.disabilityProfiles} Active Records` : "Not Available"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Live Policy Recommendations & Engine Output
          </h2>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4.5 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                  <WarningAmberOutlined sx={{ fontSize: 18 }} />
                </div>
                <h3 className="text-sm font-bold text-amber-950">
                  Provincial Remittance Risk Policy Desk
                </h3>
              </div>
              <span className="rounded bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                Action Required →
              </span>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-amber-900/90">
              {dataMetrics.employmentProfiles > 0
                ? `Foreign employment records loaded. Monitor provincial insurance provisions.`
                : "Not Available"}
            </p>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4.5 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 text-indigo-700">
                  <SyncOutlined sx={{ fontSize: 18 }} />
                </div>
                <h3 className="text-sm font-bold text-indigo-950">
                  National Benefit Eligibility Recalculation Engine
                </h3>
              </div>
              <span className="rounded bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-800">
                System Broadcast →
              </span>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-indigo-900/90">
              {dataMetrics.disabilityProfiles > 0
                ? `Automated rule logic synced ${dataMetrics.disabilityProfiles} verified disability records across active local health gateways.`
                : "Not Available"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold tracking-tight text-slate-900">
          Federal Sub-Division Breakdown Data Matrix
        </h2>

        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 font-bold text-slate-600">
              <tr>
                <th className="px-4.5 py-3.5">Provincial Name Block</th>
                <th className="px-4.5 py-3.5">Net Citizens</th>
                <th className="px-4.5 py-3.5">Municipalities</th>
                <th className="px-4.5 py-3.5">Pending Bags</th>
                <th className="px-4.5 py-3.5">Active Cases</th>
                <th className="px-4.5 py-3.5">ID Issuances</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-sm">
              {dataMetrics.provinceRows.map((prov) => (
                <tr key={prov.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4.5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                    <span className="text-slate-400 mr-2">{prov.numStr}</span>
                    {prov.name}
                  </td>
                  <td className="px-4.5 py-3.5 text-slate-700">
                    {prov.citizens > 0 ? numberFormat.format(prov.citizens) : "Not Available"}
                  </td>
                  <td className="px-4.5 py-3.5 text-slate-600">
                    {prov.municipalities > 0 ? `${prov.municipalities} Gov. Centers` : "Not Available"}
                  </td>
                  <td className="px-4.5 py-3.5">
                    {prov.pendingBags > 0 ? (
                      <span className="font-bold text-amber-600">{prov.pendingBags} Pending</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-4.5 py-3.5">
                    {prov.activeCases > 0 ? (
                      <span className="font-bold text-rose-600">{prov.activeCases} Active</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-4.5 py-3.5 text-slate-700">
                    {prov.idIssuances > 0 ? numberFormat.format(prov.idIssuances) : "0"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-4 text-center text-xs font-semibold tracking-wider text-slate-400 uppercase">
        AUTHERIZED SECURE LATTICE ALL AUDITS APPEND-ONLY LEDGER THREE WAY VERIFIED.
      </div>
    </div>
  );
}

