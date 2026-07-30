"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMapSelection } from "@/contexts/MapSelectionContext";
import districtLocalBodies from "@/constants/districtLocalBodies.json";

// ── Nepal admin hierarchy data ────────────────────────────────────────────────


const PROVINCE_HIERARCHY = [
  {
    id: "1", label: "Koshi", color: "#E53E3E",
    districts: ["Bhojpur","Dhankuta","Ilam","Jhapa","Khotang","Morang","Okhaldhunga","Panchthar","Sankhuwasabha","Solukhumbu","Sunsari","Taplejung","Terhathum","Udayapur"],
  },
  {
    id: "2", label: "Madhesh", color: "#8D6E63",
    districts: ["Bara","Dhanusha","Mahottari","Parsa","Rautahat","Saptari","Sarlahi","Siraha"],
  },
  {
    id: "3", label: "Bagmati", color: "#3182CE",
    districts: ["Bhaktapur","Chitawan","Dhading","Dolakha","Kabhrepalanchok","Kathmandu","Lalitpur","Makawanpur","Nuwakot","Ramechhap","Rasuwa","Sindhuli","Sindhupalchok"],
  },
  {
    id: "4", label: "Gandaki", color: "#DD6B20",
    districts: ["Baglung","Gorkha","Kaski","Lamjung","Manang","Mustang","Myagdi","Nawalparasi (East)","Parbat","Syangja","Tanahu"],
  },
  {
    id: "5", label: "Lumbini", color: "#805AD5",
    districts: ["Arghakhanchi","Banke","Bardiya","Dang","Gulmi","Kapilbastu","Nawalparasi (West)","Palpa","Pyuthan","Rolpa","Rukum (East)","Rupandehi"],
  },
  {
    id: "6", label: "Karnali", color: "#38A169",
    districts: ["Dailekh","Dolpa","Humla","Jajarkot","Jumla","Kalikot","Mugu","Rukum (West)","Salyan","Surkhet"],
  },
  {
    id: "7", label: "Sudurpashchim", color: "#D53F8C",
    districts: ["Achham","Baitadi","Bajhang","Bajura","Dadeldhura","Darchula","Doti","Kailali","Kanchanpur"],
  },
];

export interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface SidebarProps {
  items?: SidebarItem[];
  collapsed?: boolean;
  variant?: "ward" | "municipality" | "province" | "central";
  userInfo?: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
}

// Default items used when no `items` prop is supplied
export const CENTRAL_NAV_ITEMS: SidebarItem[] = [
  {
    label: "Analytics",
    href: "/central/analytics",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6m2 0h2a2 2 0 002-2v-3a2 2 0 00-2-2h-3m-14 0H3a2 2 0 00-2 2v3a2 2 0 002 2h2m0 0h2a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
      </svg>
    ),
  },
  {
    label: "National Map",
    href: "/central/national-map",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  // ── Hierarchy spacer item (handled separately in the component) ──
  // Province / District / Municipality / Ward items are rendered inline
  {
    label: "Province Admins",
    href: "/central/province-admins",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: "Eligibility Rules",
    href: "/central/eligibility-rules",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    label: "Audit Log",
    href: "/central/audit-log",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Policy Cards",
    href: "/central/policy-cards",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Dashboard",
    href: "/central/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
];

export default function Sidebar({
  items = CENTRAL_NAV_ITEMS,
  collapsed = false,
  variant = "central",
  userInfo = { name: "Admin User", role: "Ministry of ICT" },
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { selectProvince, selectDistrict } = useMapSelection();
  
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [isPending, startTransition] = useTransition();

  // ── Map hierarchy state ───────────────────────────────────────────────────
  const [mapExpanded, setMapExpanded] = useState(false);
  const [expandedProvince, setExpandedProvince] = useState<string | null>(null);
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);

  // Active status color themes based on portal variant
  const activeStyles = {
    ward: "bg-green-600 text-white font-semibold shadow-md",
    municipality: "bg-orange-600 text-white font-semibold shadow-md",
    province: "bg-blue-600 text-white font-semibold shadow-md",
    central: "bg-[#E51C44] text-white font-semibold shadow-md", // Crimson Red
  };

  // Border accents for the sidebar
  const accentBorder = {
    ward: "border-l-4 border-green-500",
    municipality: "border-l-4 border-orange-500",
    province: "border-l-4 border-blue-500",
    central: "border-l-4 border-[#0099FF]", // Sky Blue
  };

  const handleLogout = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          router.push("/auth/login");
          router.refresh();
        }
      } catch (err) {
        console.error("Logout failed:", err);
      }
    });
  };

  return (
    <aside
      aria-label="Portal Navigation Sidebar"
      className={`
        relative
        h-screen
        sticky
        top-0
        flex
        flex-col
        justify-between
        p-4
        bg-[#0B3067]
        text-white
        ${accentBorder[variant]}
        ${isCollapsed ? "w-20" : "w-64"}
        transition-all
        duration-300
        select-none
      `}
    >
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-6 bg-[#0099FF] text-white p-1 rounded-full shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-white transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isCollapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          )}
        </svg>
      </button>

      {/* Top Header & Links */}
      <div className="flex flex-col gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-2 py-2 border-b border-white/10 pb-4">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-base font-bold text-white leading-tight truncate">
                Digital Nepal
              </h1>
              <span className="text-[10px] text-[#A0B3D6] font-semibold tracking-wider uppercase">
                {variant} Authority
              </span>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden">
            {userInfo.avatarUrl ? (
              <img src={userInfo.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              userInfo.name.charAt(0).toUpperCase()
            )}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white leading-tight truncate">{userInfo.name}</p>
              <p className="text-xs text-[#A0B3D6] truncate">{userInfo.role}</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav aria-label="Main Navigation" className="space-y-1 mt-2">
          {items.map((item) => {
            // Skip the comment-only spacer pseudo-item
            if (!item.href) return null;

            const active = pathname === item.href || (item.href !== '/central/dashboard' && pathname?.startsWith(`${item.href}/`));
            const isMapItem = item.href === "/central/national-map";

            return (
              <React.Fragment key={item.href}>
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => {
                    if (isMapItem) setMapExpanded((v) => !v);
                    router.push(item.href);
                  }}
                  className={`
                    w-full flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium
                    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-left
                    ${
                      active
                        ? activeStyles[variant]
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  {item.icon && <span className="shrink-0 text-lg">{item.icon}</span>}
                  {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {isMapItem && !isCollapsed && (
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      className={`shrink-0 transition-transform duration-200 ${mapExpanded ? "rotate-90" : ""}`}
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  )}
                </button>

                {/* ── Province / District / Municipality / Ward sub-nav ── */}
                {isMapItem && !isCollapsed && mapExpanded && (
                  <div className="ml-3 pl-3 border-l border-white/10 space-y-0.5 pb-1">
                    {/* Section label */}
                    <p className="px-3 pt-1.5 pb-0.5 text-[9.5px] font-bold uppercase tracking-widest text-white/30">
                      Provinces
                    </p>

                    {PROVINCE_HIERARCHY.map((prov) => (
                      <div key={prov.id}>
                        {/* Province row */}
                        <button
                          onClick={() => {
                            setExpandedProvince((cur) => (cur === prov.id ? null : prov.id));
                            selectProvince(prov.id, prov.label);
                            if (pathname !== "/central/national-map") {
                              router.push("/central/national-map");
                            }
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-3 py-1.5 text-left text-[12.5px] text-white/75 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: prov.color }}
                          />
                          <span className="flex-1 truncate">{prov.label}</span>
                          <svg
                            width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            className={`shrink-0 text-white/40 transition-transform duration-150 ${expandedProvince === prov.id ? "rotate-90" : ""}`}
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>

                        {/* Districts */}
                        {expandedProvince === prov.id && (
                          <div className="ml-3 pl-2 border-l border-white/10 space-y-0.5 py-0.5">
                            <p className="px-2 pt-1 pb-0.5 text-[9px] font-bold uppercase tracking-widest text-white/25">Districts</p>
                            {prov.districts.map((dist) => (
                              <div key={dist}>
                                <button
                                  onClick={() => {
                                    setExpandedDistrict((cur) => (cur === `${prov.id}:${dist}` ? null : `${prov.id}:${dist}`));
                                    selectDistrict(prov.id, prov.label, dist);
                                    if (pathname !== "/central/national-map") {
                                      router.push("/central/national-map");
                                    }
                                  }}
                                  className="w-full flex items-center gap-2 rounded-lg px-2 py-1 text-left text-[11.5px] text-white/65 hover:bg-white/8 hover:text-white transition-colors"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-white/25 shrink-0" />
                                  <span className="flex-1 truncate">{dist}</span>
                                  <svg
                                    width="11" height="11" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    className={`shrink-0 text-white/25 transition-transform duration-150 ${expandedDistrict === `${prov.id}:${dist}` ? "rotate-90" : ""}`}
                                  >
                                    <path d="M9 18l6-6-6-6" />
                                  </svg>
                                </button>

                                {/* Municipality / Rural Municipality list */}
                                {expandedDistrict === `${prov.id}:${dist}` && (() => {
                                  const key = dist.toLowerCase().replace(/[^a-z0-9]+/g, '');
                                  const lbs = (districtLocalBodies as Record<string, { name: string; type: string }[]>)[key] || [];

                                  return (
                                    <div className="ml-3 pl-2 border-l border-white/10 py-1 space-y-1">
                                      <p className="px-2 pt-0.5 pb-0.5 text-[9px] font-bold uppercase tracking-widest text-white/40">
                                        Local Bodies ({lbs.length})
                                      </p>
                                      {lbs.length > 0 ? (
                                        lbs.map((lb) => (
                                          <div
                                            key={lb.name}
                                            className="flex items-center gap-2 rounded px-2 py-1 text-[10.5px] text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                                          >
                                            <span
                                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                lb.type.includes("Nagarpalika")
                                                  ? "bg-blue-400"
                                                  : "bg-emerald-400"
                                              }`}
                                            />
                                            <span className="flex-1 truncate">{lb.name}</span>
                                            <span className="text-[9px] text-white/35 shrink-0">
                                              {lb.type.includes("Nagarpalika") ? "NP" : "GP"}
                                            </span>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="px-2 py-1 text-[10px] text-white/40 italic">
                                          No local bodies found
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                  </div>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout Button */}
      <div className="border-t border-white/10 pt-3">
        <button
          onClick={handleLogout}
          disabled={isPending}
          aria-label="Log out"
          title={isCollapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium text-white/80 hover:bg-red-500/20 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200 disabled:opacity-50"
        >
          <svg className={`w-5 h-5 shrink-0 ${isPending ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isPending ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8v8H4z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            )}
          </svg>
          {!isCollapsed && <span>{isPending ? "Logging out..." : "Logout"}</span>}
        </button>
      </div>
    </aside>
  );
}