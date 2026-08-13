import { useState, useMemo } from "react";
import {
  AccountBalanceOutlined,
  Close,
  DashboardOutlined,
  GroupOutlined,
  MapOutlined,
  GridViewOutlined,
  PersonOutlined,
  ChecklistOutlined,
  BadgeOutlined,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import type { ReactNode } from "react";
import { useMapSelection } from "@/contexts/MapSelectionContext";
import {
  PROVINCE_HIERARCHY,
  getLocalBodies,
  type LocalBody,
} from "@/constants/provinceHierarchy";
import { WARD_NAV, type WardNavItem } from "./wardNav";

const ICONS: Record<string, ReactNode> = {
  dashboard: <DashboardOutlined sx={{ fontSize: 20 }} />,
  citizens: <GroupOutlined sx={{ fontSize: 20 }} />,
  map: <MapOutlined sx={{ fontSize: 20 }} />,
  "national-map": <MapOutlined sx={{ fontSize: 20 }} />,
  services: <GridViewOutlined sx={{ fontSize: 20 }} />,
  profile: <PersonOutlined sx={{ fontSize: 20 }} />,
  approvals: <ChecklistOutlined sx={{ fontSize: 20 }} />,
  idcards: <BadgeOutlined sx={{ fontSize: 20 }} />,
};

export interface AdminNavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  hasMapTree?: boolean;
  mapHref?: string;
}

export type AdminNavSection =
  { type: "group"; label: string; items: AdminNavItem[] } | { type: "divider" };

const districtKey = (provinceId: string, district: string) =>
  `${provinceId}::${district}`;


export function getNavItems(sections: AdminNavSection[]): AdminNavItem[] {
  return sections.flatMap((section) =>
    section.type === "group" ? section.items : [],
  );
}

interface WardSidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  wardId?: string;
  collapsed?: boolean;
  onClose?: () => void;
  navSections?: AdminNavSection[];
  headerTitle?: string;
  headerSubtitle?: string;
  entityMeta?: string;
  footerLabel?: string;
}

export default function WardSidebar({
  active,
  onNavigate,
  wardId,
  collapsed = false,
  onClose,
  navSections,
  headerTitle = "Local Government Office",
  headerSubtitle = "Kummayak Rural Municipality",
  entityMeta,
  footerLabel = "Digital Nepal E-Governance System",
}: WardSidebarProps) {
  const defaultEntityMeta = wardId
    ? `Ward ${wardId.replace("ward-", "")} Administration`
    : "Administration";
  const sections = navSections ?? (WARD_NAV as unknown as AdminNavSection[]);

  const { selection, selectProvince, selectDistrict, selectLocalBody } =
    useMapSelection();

  // Override states — undefined means "derive from selection"
  const [mapExpandedOverride, setMapExpandedOverride] = useState<boolean | null>(null);
  const [expandedProvinceIdOverride, setExpandedProvinceIdOverride] = useState<string | null | undefined>(undefined);
  const [expandedDistrictKeyOverride, setExpandedDistrictKeyOverride] = useState<string | null | undefined>(undefined);

  // Derive expansion from selection context (no useEffect needed)
  const expandedProvinceId = useMemo(() => {
    if (expandedProvinceIdOverride !== undefined) return expandedProvinceIdOverride;
    return selection.provinceId ?? null;
  }, [expandedProvinceIdOverride, selection.provinceId]);

  const expandedDistrictKey = useMemo(() => {
    if (expandedDistrictKeyOverride !== undefined) return expandedDistrictKeyOverride;
    if (selection.provinceId && selection.districtName) {
      return districtKey(selection.provinceId, selection.districtName);
    }
    return null;
  }, [expandedDistrictKeyOverride, selection.provinceId, selection.districtName]);

  const derivedMapExpanded = useMemo(() => {
    if (mapExpandedOverride !== null) return mapExpandedOverride;
    return selection.level !== "country";
  }, [mapExpandedOverride, selection.level]);

  // Keep setExpandedMap for the toggle button (wraps the override)
  const setExpandedMapToggle = () =>
    setMapExpandedOverride((v) => !(v ?? selection.level !== "country"));


  const isMapItemActive = (item: AdminNavItem) => {
    const navItem = item as WardNavItem;
    if (!navItem.hasMapTree && item.id !== "national-map") return false;
    const href = navItem.mapHref ?? "/central/national-map";
    return (
      active === item.id ||
      active === "national-map" ||
      active === href ||
      active.startsWith(`${href}/`)
    );
  };

  const toggleMap = setExpandedMapToggle;

  const goToMap = (item: WardNavItem | AdminNavItem) => {
    const href = (item as WardNavItem).mapHref ?? "/central/national-map";
    onNavigate(href);
  };

  const handleProvinceClick =
    (item: WardNavItem | AdminNavItem) =>
    (provinceId: string, provinceLabel: string) => {
      setExpandedProvinceIdOverride((cur) => (cur === provinceId ? null : provinceId));
      setExpandedDistrictKeyOverride(null);
      selectProvince(provinceId, provinceLabel);
      goToMap(item);
    };

  const handleDistrictClick =
    (item: WardNavItem | AdminNavItem) =>
    (provinceId: string, provinceLabel: string, district: string) => {
      const key = districtKey(provinceId, district);
      setExpandedDistrictKeyOverride((cur) => (cur === key ? null : key));
      selectDistrict(provinceId, provinceLabel, district);
      goToMap(item);
    };

  const handleLocalBodyClick =
    (item: WardNavItem | AdminNavItem) =>
    (
      provinceId: string,
      provinceLabel: string,
      district: string,
      lb: LocalBody,
    ) => {
      setExpandedProvinceIdOverride(provinceId);
      setExpandedDistrictKeyOverride(districtKey(provinceId, district));
      selectLocalBody(provinceId, provinceLabel, district, lb.name, lb.type);
      goToMap(item);
    };

  return (
    <aside
      className={`flex h-full shrink-0 flex-col bg-[#0B3067] text-white shadow-lg ${collapsed ? "w-18" : "w-65"}`}
    >
      <div
        className={`flex items-center gap-3 border-b border-white/10 ${collapsed ? "justify-center px-3 py-4" : "justify-between px-5 py-5"}`}
      >
        <div
          className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white shadow-sm border border-white/10">
            <AccountBalanceOutlined sx={{ fontSize: 24 }} />
          </span>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white">{headerTitle}</p>
              <p className="truncate text-xs font-medium text-[#A0B3D6]">
                {headerSubtitle}
              </p>
              <p className="text-[11px] text-[#A0C8FF]">
                {entityMeta ?? defaultEntityMeta}
              </p>
            </div>
          ) : null}
        </div>
        {!collapsed && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            aria-label="Close sidebar"
          >
            <Close sx={{ fontSize: 18 }} />
            <span>Close</span>
          </button>
        ) : null}
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 overflow-y-auto ${collapsed ? "px-1 py-3" : "px-3 py-4"}`}
      >
        {sections.map((section, i) => {
          if (section.type === "divider") {
            return (
              <div
                key={`divider-${i}`}
                className="my-3 border-t border-white/10"
              />
            );
          }
          return (
            <div key={section.label} className={collapsed ? "mb-1" : "mb-4"}>
              {!collapsed ? (
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A0C8FF]">
                  {section.label}
                </p>
              ) : null}
              <div className={collapsed ? "space-y-1" : "space-y-0.5"}>
                {section.items.map((item) => {
                  const navItem = item as WardNavItem;
                  const isActive = item.id === active || isMapItemActive(item);
                  const hasTree = Boolean(navItem.hasMapTree);
                  const isTreeOpen = hasTree && derivedMapExpanded && !collapsed;

                  const button = (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigate(navItem.mapHref ?? item.id);
                      }}
                      aria-expanded={hasTree ? derivedMapExpanded : undefined}
                      className={`flex ${collapsed ? "w-full justify-center" : "w-full items-center gap-3"} rounded-2xl px-3 py-2.5 text-left text-[13.5px] font-medium transition-colors ${
                        isActive
                          ? "bg-white/15 text-white font-semibold shadow-sm"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span
                        className={isActive ? "text-white" : "text-white/70"}
                      >
                        {item.icon ?? ICONS[item.id]}
                      </span>
                      {!collapsed ? (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {hasTree ? (
                            <span
                              role="button"
                              tabIndex={0}
                              aria-label="Toggle map dropdown"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMap();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.stopPropagation();
                                  toggleMap();
                                }
                              }}
                              className="flex items-center justify-center p-1 rounded-lg hover:bg-white/20 transition-colors"
                            >
                              <KeyboardArrowRight
                                sx={{
                                  fontSize: 18,
                                  transition: "transform 150ms",
                                  transform: derivedMapExpanded
                                    ? "rotate(90deg)"
                                    : "rotate(0deg)",
                                }}
                              />
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </button>
                  );

                  const tree =
                    hasTree && isTreeOpen ? (
                      <NationalMapTree
                        item={navItem}
                        expandedProvinceId={expandedProvinceId}
                        expandedDistrictKey={expandedDistrictKey}
                        selection={selection}
                        onProvinceClick={handleProvinceClick(navItem)}
                        onDistrictClick={handleDistrictClick(navItem)}
                        onLocalBodyClick={handleLocalBodyClick(navItem)}
                      />
                    ) : null;

                  if (collapsed) {
                    return (
                      <Tooltip
                        key={item.id}
                        title={item.label}
                        placement="right"
                        arrow
                      >
                        {button}
                      </Tooltip>
                    );
                  }

                  return (
                    <div key={item.id}>
                      {button}
                      {tree}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={`border-t border-white/10 ${collapsed ? "px-2 py-2" : "px-5 py-3"}`}
      >
        {!collapsed ? (
          <p className="text-[11px] text-[#A0B3D6]">{footerLabel}</p>
        ) : (
          <div className="h-10 flex items-center justify-center">
            <span className="text-[11px] text-white/60">
              {headerTitle?.includes("Local Government")
                ? "Local Govt"
                : (headerTitle?.split(" ")[0] ?? "Admin")}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}

interface NationalMapTreeProps {
  item: WardNavItem;
  expandedProvinceId: string | null;
  expandedDistrictKey: string | null;
  selection: ReturnType<typeof useMapSelection>["selection"];
  onProvinceClick: (provinceId: string, provinceLabel: string) => void;
  onDistrictClick: (
    provinceId: string,
    provinceLabel: string,
    district: string,
  ) => void;
  onLocalBodyClick: (
    provinceId: string,
    provinceLabel: string,
    district: string,
    lb: LocalBody,
  ) => void;
}

function NationalMapTree({
  expandedProvinceId,
  expandedDistrictKey,
  selection,
  onProvinceClick,
  onDistrictClick,
  onLocalBodyClick,
}: NationalMapTreeProps) {
  return (
    <div className="ml-4 mt-1 mb-2 border-l border-white/10 pl-3 space-y-0.5 pb-1">
      <p className="px-2 pt-1 pb-0.5 text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#A0C8FF]">
        Provinces
      </p>
      {PROVINCE_HIERARCHY.map((province) => {
        const isProvinceOpen = expandedProvinceId === province.id;
        const isProvinceActive =
          selection.level === "province" &&
          selection.provinceId === province.id;

        return (
          <div key={province.id}>
            <button
              type="button"
              onClick={() => onProvinceClick(province.id, province.label)}
              className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[12.5px] transition-colors ${
                isProvinceActive
                  ? "bg-white/15 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: province.color }}
              />
              <span className="flex-1 truncate">{province.label}</span>
              <KeyboardArrowRight
                sx={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.45)",
                  transition: "transform 150ms",
                  transform: isProvinceOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {isProvinceOpen ? (
              <div className="ml-3 mt-0.5 border-l border-white/10 pl-2 space-y-0.5 py-1">
                <p className="px-2 pt-0.5 pb-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                  Districts
                </p>
                {province.districts.map((district) => {
                  const dKey = `${province.id}::${district}`;
                  const isDistrictOpen = expandedDistrictKey === dKey;
                  const isDistrictActive =
                    selection.level === "district" &&
                    selection.provinceId === province.id &&
                    selection.districtName === district;
                  const localBodies = getLocalBodies(district);

                  return (
                    <div key={district}>
                      <button
                        type="button"
                        onClick={() =>
                          onDistrictClick(province.id, province.label, district)
                        }
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-[11.5px] transition-colors ${
                          isDistrictActive
                            ? "bg-white/12 text-white"
                            : "text-white/65 hover:bg-white/8 hover:text-white"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                        <span className="flex-1 truncate">{district}</span>
                        <KeyboardArrowRight
                          sx={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.35)",
                            transition: "transform 150ms",
                            transform: isDistrictOpen
                              ? "rotate(90deg)"
                              : "rotate(0deg)",
                          }}
                        />
                      </button>

                      {isDistrictOpen ? (
                        <div className="ml-3 mt-0.5 border-l border-white/10 pl-2 space-y-0.5 py-1">
                          <p className="px-2 pt-0.5 pb-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                            Local Bodies ({localBodies.length})
                          </p>
                          {localBodies.length > 0 ? (
                            localBodies.map((lb) => {
                              const isLbActive =
                                selection.level === "localBody" &&
                                selection.provinceId === province.id &&
                                selection.districtName === district &&
                                selection.localBodyName === lb.name;
                              return (
                                <button
                                  key={lb.name}
                                  type="button"
                                  onClick={() =>
                                    onLocalBodyClick(
                                      province.id,
                                      province.label,
                                      district,
                                      lb,
                                    )
                                  }
                                  className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-[10.5px] transition-colors ${
                                    isLbActive
                                      ? "bg-white/15 text-white"
                                      : "text-white/55 hover:bg-white/5 hover:text-white"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                      lb.type.includes("Nagarpalika")
                                        ? "bg-sky-300"
                                        : "bg-emerald-300"
                                    }`}
                                  />
                                  <span className="flex-1 truncate">
                                    {lb.name}
                                  </span>
                                  <span className="text-[9px] text-white/40 shrink-0">
                                    {lb.type.includes("Nagarpalika")
                                      ? "NP"
                                      : "GP"}
                                  </span>
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-2 py-1 text-[10px] italic text-white/40">
                              No local bodies found
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
