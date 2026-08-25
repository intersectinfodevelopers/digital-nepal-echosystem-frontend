"use client";

import Link from "next/link";
import { useMemo } from "react";

import provinceData from "../../../../data/province-dashboard.json";

type ProvinceDashboardData = (typeof provinceData)[number];
type Accent = "navy" | "blue" | "purple" | "orange" | "teal" | "green" | "red";

const accentStyles: Record<Accent, { line: string; icon: string; iconBg: string }> = {
  navy: { line: "#0B3067", icon: "#0B3067", iconBg: "#EAF0FB" },
  blue: { line: "#4565E8", icon: "#4565E8", iconBg: "#EAF0FB" },
  purple: { line: "#A100F2", icon: "#A100F2", iconBg: "#F1E8FD" },
  orange: { line: "#EC7600", icon: "#EC7600", iconBg: "#FDF0E4" },
  teal: { line: "#009B8E", icon: "#009B8E", iconBg: "#E6F7F5" },
  green: { line: "#00B86B", icon: "#00B86B", iconBg: "#E7F8EF" },
  red: { line: "#F0002E", icon: "#F0002E", iconBg: "#FDEDEC" },
};

function getProvinceId(): string {
  if (typeof document === "undefined") return "prov-1";
  const token = document.cookie.split("; ").find((row) => row.startsWith("auth_token="))?.split("=")[1];
  try {
    const payload = token ? JSON.parse(atob(token)) : null;
    return typeof payload?.jurisdiction_id === "string" ? payload.jurisdiction_id : "prov-1";
  } catch {
    return "prov-1";
  }
}

const number = (value: number) => value.toLocaleString("en-US");

export default function ProvinceDashboard() {
  const province = useMemo<ProvinceDashboardData>(() => {
    const id = getProvinceId();
    return provinceData.find((item) => item.id === id) ?? provinceData[0];
  }, []);
  const idCoverage = Math.round((province.summary.id_cards_issued / province.summary.citizens) * 100);
  const structureRows = [
    ["Districts", province.structure.districts],
    ["Metropolitan City", province.structure.metropolitan_cities],
    ["Sub-Metropolitan City", province.structure.sub_metropolitan_cities],
    ["Municipality", province.structure.municipalities],
    ["Rural Municipality", province.structure.rural_municipalities],
  ] as const;
  const totalLocalLevels = province.structure.total_local_levels;

  return (
    <main className="mx-auto w-full max-w-380 px-0 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#F0002E]"><span className="h-2 w-2 rounded-sm bg-[#F0002E]" />Province Administration</p>
          <h1 className="mt-2 text-[29px] font-extrabold tracking-tight text-[#101828]">{province.name_en} Dashboard</h1>
          <p className="mt-1.5 max-w-180 text-sm leading-relaxed text-[#667085]">Province overview of citizens, administrative divisions, ID cards, and grievances across {province.structure.districts} districts.</p>
        </div>
        <div className="flex gap-2.5 pb-0.5">
          <Link href="/province/map" className="inline-flex items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#101828] hover:bg-[#FAFBFC]"><MapIcon />View Map</Link>
          <Link href="/province/analytics" className="inline-flex items-center gap-2 rounded-lg bg-[#281078] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1D0B5D]"><ChartIcon />Open Full Analytics</Link>
        </div>
      </header>

      <Section title="Province Statistics" subtitle="Official administrative structure + live platform counts" />
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Total Citizens" value={number(province.summary.citizens)} foot="▲ 6.4% this month" accent="navy" icon={<PersonIcon />} />
        <Metric label="Total Districts" value={province.structure.districts} foot="Official district count" accent="blue" icon={<DistrictIcon />} />
        <Metric label="Total Local Levels" value={totalLocalLevels} foot={`${province.structure.municipalities} municipalities`} accent="purple" icon={<BuildingIcon />} />
        <Metric label="Total Wards" value={number(province.structure.wards)} foot="Official ward count" accent="orange" icon={<WardIcon />} />
        <Metric label="ID Cards Issued" value={number(province.summary.id_cards_issued)} foot={`${idCoverage}% of citizens`} accent="green" icon={<CardIcon />} />
        <Metric label="Open Grievances" value={province.summary.grievances_open} foot={`${number(province.summary.grievances_resolved)} resolved`} accent="red" icon={<FlagIcon />} />
      </div>

      <Section title="Local Level Structure" subtitle="स्थानीय तहको संरचना — official Government of Nepal classification" />
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel>
          <table className="w-full border-collapse text-[13px]"><thead><tr><th className="header-cell text-left">Type of Local Level</th><th className="header-cell text-left">Number</th></tr></thead><tbody>
            {structureRows.map(([label, value]) => <tr key={label}><td className="table-cell font-semibold">{label}</td><td className="table-cell font-bold">{number(value)}</td></tr>)}
            <tr className="bg-[#FAFBFC]"><td className="table-cell font-extrabold">Total Local Levels</td><td className="table-cell font-extrabold">{number(totalLocalLevels)}</td></tr>
            <tr className="bg-[#FAFBFC]"><td className="table-cell font-extrabold">Total Wards</td><td className="table-cell font-extrabold">{number(province.structure.wards)}</td></tr>
          </tbody></table>
        </Panel>
        <Panel className="p-5"><p className="text-[12px] font-bold uppercase tracking-wide text-[#98A2B3]">Composition</p><div className="mt-5 space-y-4">
          {[["Metropolitan City", province.structure.metropolitan_cities, "#0B3067"], ["Sub-Metropolitan City", province.structure.sub_metropolitan_cities, "#4565E8"], ["Municipality", province.structure.municipalities, "#A100F2"], ["Rural Municipality", province.structure.rural_municipalities, "#00B86B"]].map(([label, value, color]) => <div key={label as string} className="flex items-center gap-3"><div className="w-33 shrink-0 text-[12px] font-semibold text-[#101828]">{label}</div><div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#EAECF0]"><div className="h-full rounded-full" style={{ width: `${Math.max(1, Math.round(((value as number) / totalLocalLevels) * 100))}%`, backgroundColor: color as string }} /></div><div className="w-9 text-right text-[12px] font-bold text-[#101828]">{Math.round(((value as number) / totalLocalLevels) * 100)}%</div></div>)}
        </div></Panel>
      </div>

      <Section title="Registration Coverage" subtitle={`What municipalities have captured across ${province.name_en}`} />
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Households Registered" value={number(province.summary.households)} foot="Province household records" accent="orange" icon={<HomeIcon />} />
        <Metric label="Active Municipalities" value={province.summary.active_municipalities} foot="Reporting in this cycle" accent="blue" icon={<BuildingIcon />} />
        <Metric label="ID Cards Pending" value={number(province.summary.id_cards_pending)} foot="Requires processing" accent="purple" icon={<CardIcon />} />
        <Metric label="Resolved Grievances" value={number(province.summary.grievances_resolved)} foot="Province total" accent="green" icon={<CheckIcon />} />
      </div>

      <Section title="Quick Actions" subtitle="Frequently used Province tools" />
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Action href="/province/municipalities" title="Municipality Directory" desc="Review municipalities, local levels, wards, and reporting status." cta="Open Directory →" accent="navy" icon={<BuildingIcon />} />
        <Action href="/province/analytics" title="Province Analytics" desc="Compare citizen registration, ID cards, and coverage trends." cta="Open Analytics →" accent="purple" icon={<ChartIcon />} />
        <Action href="/province/reports" title="Province Reports" desc="Generate province-level population and service reports." cta="View Reports →" accent="orange" icon={<ReportIcon />} />
        <Action href="/province/municipalities" title="Sync Monitoring" desc="Monitor municipality sync health and resolve conflicts." cta="Check Sync Status →" accent="red" icon={<SyncIcon />} />
      </div>

      <Section title="Municipality Breakdown" subtitle="Live platform figures and sync health within this province" />
      <Panel className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-190 border-collapse text-[13px]"><thead><tr>{["Municipality", "Type", "Wards", "Citizens", "ID Cards Issued", "Sync Status"].map((head) => <th key={head} className="header-cell text-left">{head}</th>)}</tr></thead><tbody>{province.municipalities.map((municipality) => <tr key={municipality.id} className="hover:bg-[#FAFBFC]"><td className="table-cell font-bold">{municipality.name}</td><td className="table-cell text-[#667085]">{municipality.type}</td><td className="table-cell font-semibold">{municipality.wards}</td><td className="table-cell font-semibold">{number(municipality.citizens)}</td><td className="table-cell font-semibold">{number(municipality.id_cards_issued)}</td><td className="table-cell"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${municipality.sync_status === "SYNCED" ? "bg-[#E7F8EF] text-[#087443]" : municipality.sync_status === "CONFLICT" ? "bg-[#FDEDEC] text-[#C01F38]" : "bg-[#FEF3E2] text-[#B54708]"}`}>{municipality.sync_status}</span></td></tr>)}</tbody></table></div></Panel>

      <footer className="mt-5 flex flex-wrap justify-between gap-2 border-t border-[#EAECF0] pt-4 text-[11.5px] text-[#98A2B3]"><span>{province.name_en} Province Portal · Data refreshed every 15 minutes</span><span>Analytical view only · No write access to citizen records</span></footer>
    </main>
  );
}

function Section({ title, subtitle }: { title: string; subtitle: string }) { return <div className="mb-3 mt-7"><h2 className="flex items-center gap-2 text-lg font-bold text-[#101828]"><span className="h-2 w-2 rounded-sm bg-[#F0002E]" />{title}</h2><p className="mt-1 text-sm text-[#98A2B3]">{subtitle}</p></div>; }
function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <div className={`rounded-[10px] border border-[#DDE2EA] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.08)] ${className}`}>{children}</div>; }
function Metric({ label, value, foot, accent, icon }: { label: string; value: string | number; foot: string; accent: Accent; icon: React.ReactNode }) { const style = accentStyles[accent]; return <div className="relative min-h-31 rounded-[10px] border border-[#DDE2EA] bg-white px-4.5 py-4 shadow-[0_1px_3px_rgba(16,24,40,0.08)]"><div className="absolute inset-x-0 top-0 h-0.75 rounded-t-[10px]" style={{ backgroundColor: style.line }} /><div className="flex items-start justify-between gap-2"><p className="max-w-31.25 text-[12px] font-semibold leading-5 text-[#667085]">{label}</p><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg font-bold" style={{ backgroundColor: style.iconBg, color: style.icon }}>{icon}</span></div><p className="mt-3 text-[28px] font-extrabold leading-none tracking-tight text-[#101828]">{value}</p><p className="mt-3 text-[11.5px] font-medium text-[#98A2B3]">{foot}</p></div>; }
function Action({ href, title, desc, cta, accent, icon }: { href: string; title: string; desc: string; cta: string; accent: Accent; icon: React.ReactNode }) { const style = accentStyles[accent]; return <Link href={href} className="flex min-h-43.5 flex-col rounded-[10px] border border-[#DDE2EA] bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.08)] transition hover:-translate-y-0.5 hover:shadow-md"><span className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold" style={{ backgroundColor: style.iconBg, color: style.icon }}>{icon}</span><p className="mt-3 text-[13.5px] font-bold text-[#101828]">{title}</p><p className="mt-2 text-[11.5px] leading-snug text-[#98A2B3]">{desc}</p><p className="mt-auto pt-4 text-[11.5px] font-bold text-[#F0002E]">{cta}</p></Link>; }
function PersonIcon() { return <span aria-hidden="true">♙</span>; }
function HomeIcon() { return <span aria-hidden="true">⌂</span>; }
function CardIcon() { return <span aria-hidden="true">▣</span>; }
function FlagIcon() { return <span aria-hidden="true">⚑</span>; }
function BuildingIcon() { return <span aria-hidden="true">▥</span>; }
function WardIcon() { return <span aria-hidden="true">▤</span>; }
function CheckIcon() { return <span aria-hidden="true">✓</span>; }
function ReportIcon() { return <span aria-hidden="true">▤</span>; }
function SyncIcon() { return <span aria-hidden="true">↻</span>; }
function DistrictIcon() { return <span aria-hidden="true">⌘</span>; }
function MapIcon() { return <span aria-hidden="true">⌖</span>; }
function ChartIcon() { return <span aria-hidden="true">▥</span>; }
