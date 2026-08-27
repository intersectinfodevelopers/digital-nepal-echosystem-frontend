"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import citizensData from "../../../data/citizens.json";
import districtsData from "../../../data/district.json";
import educationData from "../../../data/education.json";
import disabilityData from "../../../data/disability.json";
import employmentData from "../../../data/employment.json";
import householdsData from "../../../data/households.json";
import municipalitiesData from "../../../data/municipalities.json";
import provincesData from "../../../data/provinces.json";
import wardsData from "../../../data/wards.json";
import idCardsData from "../../../data/id-cards.json";
import grievancesData from "../../../data/grievances.json";
import fiscalYearTrends from "../../../data/fiscal-year-trends.json";
import { getCurrentSession } from "@/services/auth.service";
import { AnalyticsAreaChart, AnalyticsBarChart, AnalyticsDonut, AnalyticsTrend } from "./AnalyticsCharts";

type Tab = "Demographics" | "Employment" | "Household & Poverty" | "Education" | "Health" | "Disability" | "Digital Access" | "Consent & Compliance" | "ID Cards & Grievances";
type ScopeType = "national" | "province" | "district" | "municipality" | "ward";
type Option = { id: string; label: string; type: ScopeType; parentId?: string };
type BarItem = { label: string; value: number };
type FiscalYearId = (typeof fiscalYearTrends)[number]["id"];

const tabs: Tab[] = ["Demographics", "Employment", "Household & Poverty", "Education", "Health", "Disability", "Digital Access", "Consent & Compliance", "ID Cards & Grievances"];
const number = (value: number) => value.toLocaleString("en-US");
const titleCase = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const countBy = (values: Array<string | null | undefined>): BarItem[] => Object.entries(values.filter((value): value is string => Boolean(value)).reduce<Record<string, number>>((result, value) => { result[value] = (result[value] ?? 0) + 1; return result; }, {})).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label: titleCase(label), value }));

function getScopeType(id: string | undefined): ScopeType {
  if (!id) return "national";
  if (id.startsWith("prov-")) return "province";
  if (id.startsWith("dist-")) return "district";
  if (id.startsWith("mun-")) return "municipality";
  return "ward";
}

function AnalyticsPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-[10px] border border-[#DDE2EA] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.08)]"><div className="mb-5"><h3 className="text-[15px] font-bold text-[#101828]">{title}</h3><p className="mt-1 text-[12px] text-[#98A2B3]">{subtitle}</p></div>{children}</section>;
}

export default function ScopedAnalytics({ scope: requestedScope }: { scope: Exclude<ScopeType, "national"> | "national" }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const session = getCurrentSession();
  const [tab, setTab] = useState<Tab>("Demographics");
  const [fiscalYear, setFiscalYear] = useState<FiscalYearId>("fy-2083-84");
  const queryScope = params.get("scope") ?? undefined;
  const initialScope = queryScope ?? (requestedScope === "national" ? undefined : requestedScope === "province" ? session?.province_id ?? "prov-1" : requestedScope === "municipality" ? session?.municipality_id ?? "mun-01" : requestedScope === "ward" ? session?.ward_id ?? "ward-004" : "dist-01");
  const [selectedId, setSelectedId] = useState(initialScope);
  const effectiveSelectedId = queryScope ?? selectedId;
  const scopeType = getScopeType(effectiveSelectedId);

  const options = useMemo(() => {
    const all: Option[] = [
      { id: "national", label: "National (All Provinces)", type: "national" },
      ...provincesData.map((item) => ({ id: item.id, label: item.name_en, type: "province" as const })),
      ...districtsData.map((item) => ({ id: item.id, label: item.name_en, type: "district" as const, parentId: item.province_id })),
      ...municipalitiesData.map((item) => ({ id: item.id, label: item.name_en, type: "municipality" as const, parentId: item.district_id })),
      ...wardsData.map((item) => ({ id: item.id, label: item.name_en, type: "ward" as const, parentId: item.municipality_id })),
    ];
    if (requestedScope === "national") return all;
    const rootId = requestedScope === "province" ? session?.province_id : requestedScope === "municipality" ? session?.municipality_id : requestedScope === "ward" ? session?.ward_id : effectiveSelectedId;
    if (requestedScope === "ward") return all.filter((item) => item.id === rootId);
    if (requestedScope === "municipality") return all.filter((item) => item.id === rootId || (item.type === "ward" && item.parentId === rootId));
    if (requestedScope === "province") {
      const districtIds = new Set(districtsData.filter((district) => district.province_id === rootId).map((district) => district.id));
      const municipalityIds = new Set(municipalitiesData.filter((municipality) => districtIds.has(municipality.district_id)).map((municipality) => municipality.id));
      return all.filter((item) => item.id === rootId || (item.type === "district" && item.parentId === rootId) || (item.type === "municipality" && districtIds.has(item.parentId ?? "")) || (item.type === "ward" && municipalityIds.has(item.parentId ?? "")));
    }
    return all;
  }, [effectiveSelectedId, requestedScope]);

  const scope = useMemo(() => {
    const selected = options.find((item) => item.id === effectiveSelectedId) ?? options[0];
    const selectedWardIds = new Set<string>();
    if (selected?.type === "ward") selectedWardIds.add(selected.id);
    if (selected?.type === "municipality") wardsData.filter((ward) => ward.municipality_id === selected.id).forEach((ward) => selectedWardIds.add(ward.id));
    if (selected?.type === "district") { const municipalityIds = new Set(municipalitiesData.filter((municipality) => municipality.district_id === selected.id).map((municipality) => municipality.id)); wardsData.filter((ward) => municipalityIds.has(ward.municipality_id)).forEach((ward) => selectedWardIds.add(ward.id)); }
    if (selected?.type === "province") { const districtIds = new Set(districtsData.filter((district) => district.province_id === selected.id).map((district) => district.id)); const municipalityIds = new Set(municipalitiesData.filter((municipality) => districtIds.has(municipality.district_id)).map((municipality) => municipality.id)); wardsData.filter((ward) => municipalityIds.has(ward.municipality_id)).forEach((ward) => selectedWardIds.add(ward.id)); }
    if (selected?.type === "national") wardsData.forEach((ward) => selectedWardIds.add(ward.id));
    const citizens = citizensData.filter((citizen) => selectedWardIds.has(citizen.ward_id));
    const citizenIds = new Set(citizens.map((citizen) => citizen.id));
    return { selected, citizens, citizenIds, households: householdsData.filter((household) => selectedWardIds.has(household.ward_id)), employment: employmentData.filter((item) => citizenIds.has(item.citizen_id)), education: educationData.filter((item) => citizenIds.has(item.citizen_id)), disability: disabilityData.filter((item) => citizenIds.has(item.citizen_id)), cards: idCardsData.filter((item) => citizenIds.has(item.citizen_id)), grievances: grievancesData.filter((item) => citizenIds.has(item.citizen_id)) };
  }, [effectiveSelectedId, options]);

  const stats = useMemo(() => {
    const count = (values: Array<string | null | undefined>) => countBy(values);
    const ageGroups = scope.citizens.map((citizen) => { const age = new Date().getFullYear() - new Date(citizen.dob).getFullYear(); return age <= 18 ? "0-18" : age <= 35 ? "19-35" : age <= 60 ? "36-60" : "60+"; });
    const sex = count(scope.citizens.map((citizen) => citizen.sex));
    const foreignCountries = count(scope.employment.filter((item) => item.category === "FOREIGN_ABROAD").map((item) => String(item.sub_fields?.country_code ?? "Not Specified")));
    const ethnicityMajor = count(scope.citizens.map((citizen) => (citizen as { ethnicity?: string }).ethnicity).filter((ethnicity): ethnicity is string => Boolean(ethnicity)).map((ethnicity) => ["Chhetri", "Hill Brahmin"].includes(ethnicity) ? ethnicity === "Hill Brahmin" ? "Brahmin" : "Chhetri" : ["Rai", "Limbu", "Tamang", "Magar", "Newar", "Gurung"].includes(ethnicity) ? "Janajati" : ethnicity));
    const janajatiSubgroups = count(scope.citizens.map((citizen) => (citizen as { ethnicity?: string }).ethnicity).filter((ethnicity): ethnicity is string => Boolean(ethnicity)).filter((ethnicity) => ["Rai", "Limbu", "Tamang", "Magar", "Newar", "Gurung"].includes(ethnicity)));
    const dropoutReasons = count(scope.education.filter((item) => item.is_dropout).map((item) => String(item.dropout_reason ?? "Not Specified")));
    const consent = count(scope.citizens.map((citizen) => citizen.consent_channel));
    const dropoutRate = scope.education.length ? Math.round(scope.education.filter((item) => item.is_dropout).length / scope.education.length * 1000) / 10 : 0;
    return { sex, age: count(ageGroups), ethnicityMajor, janajatiSubgroups, literacy: count(scope.citizens.map((citizen) => citizen.digital_literacy)), jobs: count(scope.employment.map((item) => item.category)), income: count(scope.employment.map((item) => item.income_band)), poverty: count(scope.households.map((household) => household.poverty_class)), construction: count(scope.households.map((household) => household.construction_type)), water: count(scope.households.map((household) => household.water_source)), education: count(scope.education.map((item) => item.level)), disability: count(scope.disability.map((item) => item.disability_type)), cards: count(scope.cards.map((item) => item.card_type)), grievances: count(scope.grievances.map((item) => item.status)), foreignCountries, dropoutReasons, consent, dropoutRate, dropout: scope.education.filter((item) => item.is_dropout).length, scholarships: scope.education.filter((item) => item.has_scholarship).length, bankAccounts: scope.households.filter((household) => household.has_bank_account).length, gridElectricity: scope.households.filter((household) => household.electricity === "GRID").length, smartphone: scope.citizens.filter((citizen) => citizen.has_smartphone).length, verified: scope.citizens.filter((citizen) => citizen.nid_verified).length };
  }, [scope]);

  const selectedLabel = scope.selected?.label ?? "National";
  const changeScope = (value: string) => { setSelectedId(value); router.replace(`${pathname}?scope=${value}`); };
  const selectedFiscalYear = fiscalYearTrends.find((period) => period.id === fiscalYear) ?? fiscalYearTrends[fiscalYearTrends.length - 1];
  const trend = selectedFiscalYear.points.map((point) => ({ month: point.label, citizens: Math.round(scope.citizens.length * point.factor) }));
  const educationTrend = selectedFiscalYear.points.map((point) => ({ month: point.label, enrolled: Math.round(scope.education.length * point.factor), dropouts: Math.round(scope.education.length * point.factor * stats.dropoutRate / 100) }));
  const ratioTrend = trend.map((item) => ({ ...item, femalePct: scope.citizens.length ? Math.round(scope.citizens.filter((citizen) => citizen.sex === "FEMALE").length / scope.citizens.length * 1000) / 10 : 0, malePct: scope.citizens.length ? Math.round(scope.citizens.filter((citizen) => citizen.sex === "MALE").length / scope.citizens.length * 1000) / 10 : 0, youthPct: scope.citizens.length ? Math.round(scope.citizens.filter((citizen) => { const age = new Date().getFullYear() - new Date(citizen.dob).getFullYear(); return age >= 18 && age <= 30; }).length / scope.citizens.length * 1000) / 10 : 0 }));

  const scopeTitle = requestedScope === "national" ? "National Analytics" : `${titleCase(scopeType)} Analytics`;
  return <div className="flex flex-col gap-5">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#F0002E]">{requestedScope === "national" ? "Central Administration" : `${titleCase(scopeType)} Administration`}</p><h1 className="mt-1.5 text-[29px] font-extrabold tracking-tight text-[#101828]">{scopeTitle}</h1><p className="mt-1.5 max-w-180 text-sm leading-relaxed text-[#667085]">Complete demographic, economic, and social insights for the selected administrative scope.</p></div><div className="flex gap-2"><button type="button" onClick={() => window.print()} className="rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2.5 text-[13px] font-semibold text-[#344054]">Export Report</button><button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-[#0B3067] px-3.5 py-2.5 text-[13px] font-semibold text-white">Refresh Data</button></div></header>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#DDE2EA] bg-white p-3.5 shadow-[0_1px_3px_rgba(16,24,40,0.06)]"><div><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#98A2B3]">Analytics Scope</p><p className="mt-1 text-[14px] font-bold text-[#101828]">{selectedLabel}</p></div><div className="flex flex-wrap gap-2"><select value={selectedId} onChange={(event) => changeScope(event.target.value)} aria-label="Analytics scope" className="h-10 min-w-64 rounded-lg border border-[#D0D5DD] bg-white px-3 text-[13px] font-semibold text-[#344054] outline-none focus:border-[#0B3067]"><optgroup label="Provinces">{options.filter((item) => item.type === "national" || item.type === "province").map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup><optgroup label="Districts and local levels">{options.filter((item) => !["national", "province"].includes(item.type)).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup></select><select value={fiscalYear} onChange={(event) => setFiscalYear(event.target.value as FiscalYearId)} aria-label="Fiscal year" className="h-10 min-w-36 rounded-lg border border-[#D0D5DD] bg-white px-3 text-[13px] font-semibold text-[#344054] outline-none focus:border-[#0B3067]">{fiscalYearTrends.map((period) => <option key={period.id} value={period.id}>{period.label}</option>)}</select></div></div>
    <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#667085]"><span className="rounded-lg bg-[#0B3067] px-3 py-2 text-white">National</span><span>›</span><span className="rounded-lg bg-[#F5F7FA] px-3 py-2 text-[#344054]">{selectedLabel}</span><span className="ml-auto text-[#98A2B3]">{number(scope.citizens.length)} citizens in scope</span></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Metric label="Registered Citizens" value={scope.citizens.length} /><Metric label="Households" value={scope.households.length} /><Metric label="NID Verified" value={`${scope.citizens.length ? Math.round((stats.verified / scope.citizens.length) * 100) : 0}%`} /><Metric label="ID Cards" value={scope.cards.length} /><Metric label="Active Grievances" value={scope.grievances.filter((item) => item.status !== "CLOSED").length} /></div>
    <div className="analytics-tabs-scroll flex gap-1 overflow-x-auto border-b border-[#DDE2EA]">{tabs.map((item) => <button type="button" key={item} onClick={() => setTab(item)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-[13px] font-semibold ${tab === item ? "border-[#F0002E] text-[#F0002E]" : "border-transparent text-[#667085] hover:text-[#101828]"}`}>{item}</button>)}</div>
    {tab === "Demographics" ? <div className="flex flex-col gap-7"><div className="grid gap-5 lg:grid-cols-2"><AnalyticsPanel title="Age Distribution — Bar" subtitle="Registered citizens by age group"><AnalyticsBarChart data={stats.age} color="#281078" horizontal={false} /></AnalyticsPanel><AnalyticsPanel title="Age Distribution — Share" subtitle="Share of registered citizens by age group"><AnalyticsDonut data={stats.age} /></AnalyticsPanel></div><div className="grid gap-5 lg:grid-cols-2"><AnalyticsPanel title="Sex Distribution — Bar" subtitle="Citizen records by sex"><AnalyticsBarChart data={stats.sex} color="#F0002E" horizontal={false} /></AnalyticsPanel><AnalyticsPanel title="Sex Distribution — Share" subtitle="Share of registered citizens by sex"><AnalyticsDonut data={stats.sex} /></AnalyticsPanel></div><AnalyticsPanel title="Registration & Sex Ratio — Fiscal Year Trend" subtitle={`${selectedFiscalYear.label} · Shrawan to Ashadh`}><AnalyticsTrend data={trend} /><AnalyticsTrend data={ratioTrend} lines={[{ key: "femalePct", name: "Female %", color: "#F0002E" }, { key: "malePct", name: "Male %", color: "#281078" }, { key: "youthPct", name: "Youth (18–30) %", color: "#00B86B" }]} /></AnalyticsPanel><div className="grid gap-5 lg:grid-cols-2"><AnalyticsPanel title="Ethnicity — Major Groups" subtitle="Major ethnicity groups represented in this scope"><AnalyticsDonut data={stats.ethnicityMajor} /></AnalyticsPanel><AnalyticsPanel title="Janajati — Subgroups" subtitle="Recorded Janajati subgroup distribution"><AnalyticsBarChart data={stats.janajatiSubgroups} color="#009B8E" /></AnalyticsPanel></div></div> : null}
    {tab === "Employment" ? <div className="flex flex-col gap-5"><div className="grid gap-5 lg:grid-cols-2"><AnalyticsPanel title="Employment Category — Bar" subtitle="Citizens grouped by recorded employment"><AnalyticsBarChart data={stats.jobs} color="#17B26A" /></AnalyticsPanel><AnalyticsPanel title="Income Band — Share" subtitle="Employment income distribution"><AnalyticsDonut data={stats.income} /></AnalyticsPanel></div><AnalyticsPanel title="Foreign Employment — By Destination Country" subtitle="Citizens recorded as working abroad"><AnalyticsBarChart data={stats.foreignCountries} color="#4565E8" /></AnalyticsPanel><AnalyticsPanel title="Employment Coverage" subtitle="Records available in the selected scope"><div className="grid gap-3 sm:grid-cols-3"><Metric label="Employment Records" value={scope.employment.length} /><Metric label="Foreign Workers" value={stats.foreignCountries.reduce((total, item) => total + item.value, 0)} /><Metric label="Unemployed" value={stats.jobs.find((item) => item.label === "Unemployed")?.value ?? 0} /></div></AnalyticsPanel></div> : null}
    {tab === "Household & Poverty" ? <div className="flex flex-col gap-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Below Poverty" value={`${scope.households.length ? Math.round((stats.poverty.find((item) => item.label === "Below")?.value ?? 0) / scope.households.length * 100) : 0}%`} /><Metric label="Near Poverty" value={`${scope.households.length ? Math.round((stats.poverty.find((item) => item.label === "Near")?.value ?? 0) / scope.households.length * 100) : 0}%`} /><Metric label="Bank Account" value={`${scope.households.length ? Math.round(stats.bankAccounts / scope.households.length * 100) : 0}%`} /><Metric label="Grid Electricity" value={`${scope.households.length ? Math.round(stats.gridElectricity / scope.households.length * 100) : 0}%`} /></div><div className="grid gap-5 lg:grid-cols-2"><AnalyticsPanel title="Poverty Distribution — Share" subtitle="Households grouped by poverty classification"><AnalyticsDonut data={stats.poverty} /></AnalyticsPanel><AnalyticsPanel title="House Construction Type — Bar" subtitle="Households by construction material"><AnalyticsBarChart data={stats.construction} color="#4565E8" /></AnalyticsPanel><AnalyticsPanel title="Water Source — Bar" subtitle="Households by primary water source"><AnalyticsBarChart data={stats.water} color="#0D9488" /></AnalyticsPanel></div></div> : null}
    {tab === "Education" ? <div className="flex flex-col gap-5"><div className="grid gap-5 lg:grid-cols-2"><AnalyticsPanel title="Education Level — Bar" subtitle="Recorded education distribution"><AnalyticsBarChart data={stats.education} color="#805AD5" /></AnalyticsPanel><AnalyticsPanel title="Education Level — Share" subtitle="Share of education records"><AnalyticsDonut data={stats.education} /></AnalyticsPanel></div><AnalyticsPanel title="Enrollment & Dropout Rate — Fiscal Year Trend" subtitle={`${selectedFiscalYear.label} · Shrawan to Ashadh`}><AnalyticsAreaChart data={educationTrend} dataKey="enrolled" color="#805AD5" name="Enrolled" /></AnalyticsPanel><div className="grid gap-5 lg:grid-cols-2"><AnalyticsPanel title="Dropout Reasons — Bar" subtitle="Reasons recorded for education dropouts"><AnalyticsBarChart data={stats.dropoutReasons} color="#F04438" /></AnalyticsPanel><AnalyticsPanel title="Education Outcomes" subtitle="Completion and support indicators"><div className="grid grid-cols-2 gap-3"><Metric label="Education Records" value={scope.education.length} /><Metric label="Dropouts" value={stats.dropout} /><Metric label="Scholarships" value={stats.scholarships} /></div></AnalyticsPanel></div></div> : null}
    {tab === "Health" ? <div className="flex flex-col gap-5"><AnalyticsPanel title="Health Records" subtitle="Health and disability data available in this scope"><div className="grid gap-3 sm:grid-cols-3"><Metric label="Disability Profiles" value={scope.disability.length} /><Metric label="Citizens in Scope" value={scope.citizens.length} /><Metric label="Coverage" value={`${scope.citizens.length ? Math.round(scope.disability.length / scope.citizens.length * 1000) / 10 : 0}%`} /></div></AnalyticsPanel><div className="grid gap-5 lg:grid-cols-2"><AnalyticsPanel title="Health Coverage — Bar" subtitle="Recorded disability types"><AnalyticsBarChart data={stats.disability} color="#E51C44" /></AnalyticsPanel><AnalyticsPanel title="Disability Distribution — Share" subtitle="Share of health profiles"><AnalyticsDonut data={stats.disability} /></AnalyticsPanel></div></div> : null}
    {tab === "Disability" ? <div className="flex flex-col gap-5"><div className="grid gap-3 sm:grid-cols-3"><Metric label="Registered Profiles" value={scope.disability.length} /><Metric label="Prevalence" value={`${scope.citizens.length ? Math.round(scope.disability.length / scope.citizens.length * 1000) / 10 : 0}%`} /><Metric label="Certificates" value={scope.disability.filter((item) => item.certificate_no).length} /></div><div className="grid gap-5 lg:grid-cols-2"><AnalyticsPanel title="Disability Type — Bar" subtitle="Registered disability profiles"><AnalyticsBarChart data={stats.disability} color="#E51C44" /></AnalyticsPanel><AnalyticsPanel title="Disability Type — Share" subtitle="Distribution of disability profiles"><AnalyticsDonut data={stats.disability} /></AnalyticsPanel></div></div> : null}
    {tab === "Digital Access" ? <div className="grid gap-5 lg:grid-cols-2"><AnalyticsPanel title="Digital Literacy — Bar" subtitle="Recorded literacy levels"><AnalyticsBarChart data={stats.literacy} color="#0099FF" /></AnalyticsPanel><AnalyticsPanel title="Smartphone Ownership — Share" subtitle="Technology access among registered citizens"><AnalyticsDonut data={[{ label: "Has smartphone", value: stats.smartphone }, { label: "No smartphone recorded", value: scope.citizens.length - stats.smartphone }]} /></AnalyticsPanel></div> : null}
    {tab === "Consent & Compliance" ? <div className="grid gap-5 lg:grid-cols-2"><AnalyticsPanel title="NID Verification — Share" subtitle="Identity verification coverage"><AnalyticsDonut data={[{ label: "NID verified", value: stats.verified }, { label: "Needs verification", value: scope.citizens.length - stats.verified }]} /></AnalyticsPanel><AnalyticsPanel title="Consent Channel — Bar" subtitle="How citizen consent was recorded"><AnalyticsBarChart data={countBy(scope.citizens.map((citizen) => citizen.consent_channel))} color="#0D9488" /></AnalyticsPanel></div> : null}
    {tab === "ID Cards & Grievances" ? <div className="grid gap-5 lg:grid-cols-2"><AnalyticsPanel title="ID Cards by Type — Share" subtitle="Cards associated with citizens in scope"><AnalyticsDonut data={stats.cards} /></AnalyticsPanel><AnalyticsPanel title="Grievance Status — Bar" subtitle="Reported issues by current status"><AnalyticsBarChart data={stats.grievances} color="#F04438" /></AnalyticsPanel></div> : null}
  </div>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg border border-[#EAECF0] bg-[#FAFBFC] px-3.5 py-3"><p className="text-[11px] font-semibold text-[#667085]">{label}</p><p className="mt-1 text-[21px] font-extrabold text-[#101828]">{typeof value === "number" ? number(value) : value}</p></div>;
}
