import { Panel, Section } from "./ScopeDashboard";

export type LocalLevelStructureData = {
  metropolitan_cities: number;
  sub_metropolitan_cities: number;
  municipalities: number;
  rural_municipalities: number;
  total_local_levels: number;
  wards: number;
};

const number = (value: number) => value.toLocaleString("en-US");

const levels = [
  ["Metropolitan City", "महानगरपालिका", "metropolitan_cities", "#0B3067"],
  ["Sub-Metropolitan City", "उपमहानगरपालिका", "sub_metropolitan_cities", "#4565E8"],
  ["Municipality", "नगरपालिका", "municipalities", "#A100F2"],
  ["Rural Municipality", "गाउँपालिका", "rural_municipalities", "#00B86B"],
] as const;

export default function LocalLevelStructure({ structure }: { structure: LocalLevelStructureData }) {
  return <>
    <Section title="Local Level Structure" subtitle="स्थानीय तहको संरचना — official Government of Nepal classification" />
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <Panel className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-140 border-collapse text-[13px]"><thead><tr><th className="header-cell text-left">Type of Local Level</th><th className="header-cell text-left">Nepali Name</th><th className="header-cell text-left">Number</th></tr></thead><tbody>{levels.map(([label, nepali, key]) => <tr key={key}><td className="table-cell font-semibold">{label}</td><td className="table-cell text-[#667085]">{nepali}</td><td className="table-cell font-bold">{number(structure[key])}</td></tr>)}<tr className="bg-[#FAFBFC]"><td className="table-cell font-extrabold">Total Local Levels</td><td className="table-cell font-semibold text-[#667085]">जम्मा स्थानीय तह</td><td className="table-cell font-extrabold">{number(structure.total_local_levels)}</td></tr><tr className="bg-[#FAFBFC]"><td className="table-cell font-extrabold">Total Wards</td><td className="table-cell font-semibold text-[#667085]">जम्मा वडा</td><td className="table-cell font-extrabold">{number(structure.wards)}</td></tr></tbody></table></div></Panel>
      <Panel className="p-5"><p className="text-[12px] font-bold uppercase tracking-wide text-[#98A2B3]">Composition</p><div className="mt-5 space-y-4">{levels.map(([label, , key, color]) => <div key={key} className="flex items-center gap-3"><div className="w-33 shrink-0 text-[12px] font-semibold leading-4 text-[#101828]">{label}</div><div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#EAECF0]"><div className="h-full rounded-full" style={{ width: `${Math.max(1, Math.round((structure[key] / structure.total_local_levels) * 100))}%`, backgroundColor: color }} /></div><div className="w-9 text-right text-[12px] font-bold text-[#101828]">{Math.round((structure[key] / structure.total_local_levels) * 100)}%</div></div>)}</div></Panel>
    </div>
  </>;
}
