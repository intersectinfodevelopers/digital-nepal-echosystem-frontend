"use client";

import { useState } from "react";
import citizens from "../../../data/citizens.json";
import districts from "../../../data/district.json";
import idCards from "../../../data/id-cards.json";
import municipalities from "../../../data/municipalities.json";
import provinces from "../../../data/provinces.json";
import wards from "../../../data/wards.json";
import { Panel, Section } from "./ScopeDashboard";

type Level = "province" | "district" | "municipality" | "ward";
type Row = { id: string; level: Level; name: string; type?: string; parentId?: string };

const number = (value: number) => value.toLocaleString("en-US");

function getChildren(row: Row): Row[] {
  if (row.level === "province") {
    return districts.filter((district) => district.province_id === row.id).map((district) => ({ id: district.id, level: "district", name: district.name_en, parentId: row.id }));
  }
  if (row.level === "district") {
    return municipalities.filter((municipality) => municipality.district_id === row.id).map((municipality) => ({ id: municipality.id, level: "municipality", name: municipality.name_en, type: municipality.type, parentId: row.id }));
  }
  if (row.level === "municipality") {
    return wards.filter((ward) => ward.municipality_id === row.id).map((ward) => ({ id: ward.id, level: "ward", name: ward.name_en, parentId: row.id }));
  }
  return [];
}

function getWardIds(row: Row): Set<string> {
  if (row.level === "ward") return new Set([row.id]);
  if (row.level === "municipality") return new Set(wards.filter((ward) => ward.municipality_id === row.id).map((ward) => ward.id));
  if (row.level === "district") {
    const municipalityIds = new Set(municipalities.filter((municipality) => municipality.district_id === row.id).map((municipality) => municipality.id));
    return new Set(wards.filter((ward) => municipalityIds.has(ward.municipality_id)).map((ward) => ward.id));
  }
  const districtIds = new Set(districts.filter((district) => district.province_id === row.id).map((district) => district.id));
  const municipalityIds = new Set(municipalities.filter((municipality) => districtIds.has(municipality.district_id)).map((municipality) => municipality.id));
  return new Set(wards.filter((ward) => municipalityIds.has(ward.municipality_id)).map((ward) => ward.id));
}

function getMetrics(row: Row) {
  const wardIds = getWardIds(row);
  const citizenIds = new Set(citizens.filter((citizen) => wardIds.has(citizen.ward_id)).map((citizen) => citizen.id));
  return {
    citizens: citizenIds.size,
    cards: idCards.filter((card) => card.issued_at !== null && citizenIds.has(card.citizen_id)).length,
    municipalities: row.level === "province" ? municipalities.filter((municipality) => districts.some((district) => district.province_id === row.id && district.id === municipality.district_id)).length : row.level === "district" ? municipalities.filter((municipality) => municipality.district_id === row.id).length : 0,
    wards: wardIds.size,
  };
}

function labelFor(level: Level) {
  return level === "province" ? "Province" : level === "district" ? "District" : level === "municipality" ? "Local Body" : "Ward";
}

export default function CentralHierarchyTable() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const rootRows: Row[] = provinces.map((province) => ({ id: province.id, level: "province", name: province.name_en }));

  function toggle(row: Row) {
    const key = `${row.level}:${row.id}`;
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function renderRows(rows: Row[], depth = 0): React.ReactNode[] {
    return rows.flatMap((row) => {
      const children = getChildren(row);
      const isExpanded = expanded.has(`${row.level}:${row.id}`);
      const metrics = getMetrics(row);
      return [
        <tr key={`${row.level}:${row.id}`} className="hover:bg-[#FAFBFC]">
          <td className="table-cell">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 22}px` }}>
              {children.length > 0 ? <button type="button" aria-label={`${isExpanded ? "Collapse" : "Expand"} ${row.name}`} onClick={() => toggle(row)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#D0D5DD] bg-white text-sm font-bold text-[#344054] hover:bg-[#F2F4F7]">{isExpanded ? "−" : "+"}</button> : <span className="h-6 w-6 shrink-0" />}
              <span className={depth === 0 ? "font-bold" : "font-semibold"}>{row.name}</span>
            </div>
          </td>
          <td className="table-cell text-[#667085]">{labelFor(row.level)}{row.type ? ` · ${row.type.replaceAll("_", " ")}` : ""}</td>
          <td className="table-cell font-semibold">{number(metrics.citizens)}</td>
          <td className="table-cell font-semibold">{number(metrics.wards)}</td>
          <td className="table-cell font-semibold">{number(metrics.cards)}</td>
        </tr>,
        ...(isExpanded ? renderRows(children, depth + 1) : []),
      ];
    });
  }

  return <>
    <Section title="Administrative Breakdown" subtitle="Expand any province to inspect its districts, local bodies, and wards" />
    <Panel className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-190 border-collapse text-[13px]">
          <thead><tr>{["Administrative Area", "Level", "Citizens", "Wards", "ID Cards Issued"].map((header) => <th key={header} className="header-cell text-left">{header}</th>)}</tr></thead>
          <tbody>{renderRows(rootRows)}</tbody>
        </table>
      </div>
    </Panel>
  </>;
}
