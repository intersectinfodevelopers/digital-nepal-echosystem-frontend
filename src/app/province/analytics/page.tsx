"use client";

import { useState, type ReactNode } from "react";

type Tab =
  | "Demographics"
  | "Employment"
  | "Household & Poverty"
  | "Education"
  | "Health"
  | "Disability"
  | "Digital Access"
  | "Consent & Compliance"
  | "ID Cards & Grievances";

type BarItem = { label: string; value: number };
type Segment = { label: string; percentage: number; color: string };

const tabs: Tab[] = [
  "Demographics",
  "Employment",
  "Household & Poverty",
  "Education",
  "Health",
  "Disability",
  "Digital Access",
  "Consent & Compliance",
  "ID Cards & Grievances",
];

const ageData: BarItem[] = [
  { label: "0–17", value: 15800 },
  { label: "18–30", value: 13500 },
  { label: "31–45", value: 12200 },
  { label: "46–60", value: 10200 },
  { label: "60+", value: 9800 },
];

const sexData: BarItem[] = [
  { label: "Male", value: 24800 },
  { label: "Female", value: 22800 },
  { label: "Other", value: 638 },
];

const employmentData: BarItem[] = [
  { label: "Agriculture", value: 42 },
  { label: "Services", value: 39 },
  { label: "Manufacturing", value: 40 },
  { label: "Self-employed", value: 41 },
  { label: "Other", value: 39 },
];

const educationData: BarItem[] = [
  { label: "Basic (1–8)", value: 15200 },
  { label: "Basic (9–10)", value: 11300 },
  { label: "Secondary (11–12)", value: 7200 },
  { label: "Higher Secondary", value: 4800 },
  { label: "Bachelor", value: 3500 },
  { label: "Master", value: 2800 },
  { label: "Technical/Voc.", value: 2100 },
];

const healthData: BarItem[] = [
  { label: "Doctors", value: 46 },
  { label: "Nurses", value: 91 },
  { label: "Health Assistants", value: 78 },
];

const disabilityData: BarItem[] = [
  { label: "Physical", value: 920 },
  { label: "Vision", value: 700 },
  { label: "Hearing", value: 540 },
  { label: "Intellectual", value: 390 },
  { label: "Psychosocial", value: 250 },
  { label: "Multiple", value: 180 },
];

const digitalData: BarItem[] = [
  { label: "Basic", value: 11500 },
  { label: "Intermediate", value: 8500 },
  { label: "Advanced", value: 8300 },
  { label: "None", value: 4800 },
];

function Icon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
      {children}
    </span>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
      <path d="M4 5v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2" />
      <path d="M20 19v-4h-4" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function KpiCard({
  label,
  value,
  accent = "border-[#155EEF]",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-200 border-t-[3px] ${accent} bg-white px-4 py-3 shadow-sm`}
    >
      <p className="text-[11px] font-medium text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-bold leading-none text-gray-900">
        {value}
      </p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#F04438]" />
        <h3 className="text-[13px] font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function BarChart({
  data,
  horizontal = false,
}: {
  data: BarItem[];
  horizontal?: boolean;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  if (horizontal) {
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-[10px] text-gray-500 sm:text-[11px]">
              {item.label}
            </span>
            <div className="h-3 flex-1 rounded-sm bg-gray-100">
              <div
                className="h-full rounded-sm bg-[#123B78]"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
            <span className="w-12 text-right text-[10px] font-semibold text-gray-400">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-52 items-end gap-2 border-b border-gray-100 px-1 pb-6 sm:gap-4">
      {data.map((item) => (
        <div
          key={item.label}
          className="flex h-full flex-1 flex-col items-center justify-end gap-2"
        >
          <div
            className="w-6 rounded-t-md bg-[#123B78] sm:w-8"
            style={{ height: `${Math.max(5, (item.value / max) * 100)}%` }}
          />
          <span className="text-[9px] text-gray-400 sm:text-[10px]">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  segments,
  size = 132,
}: {
  segments: Segment[];
  size?: number;
}) {
  const gradient = segments
    .reduce<{ parts: string[]; current: number }>(
      (acc, segment) => {
        const start = acc.current;
        const end = start + segment.percentage;

        acc.parts.push(`${segment.color} ${start}% ${end}%`);
        acc.current = end;

        return acc;
      },
      { parts: [], current: 0 },
    )
    .parts.join(", ");

  return (
    <div className="flex justify-center py-1">
      <div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${gradient})`,
        }}
      >
        <div className="absolute inset-[25%] rounded-full bg-white" />
      </div>
    </div>
  );
}

function Legend({ items }: { items: Segment[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[10px] text-gray-500">{item.label}</span>
          <span className="ml-auto text-[10px] font-semibold text-gray-600">
            {item.percentage}%
          </span>
        </div>
      ))}
    </div>
  );
}

function Trend() {
  return (
    <div className="relative h-52 w-full">
      <svg
        viewBox="0 0 800 220"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {[40, 80, 120, 160, 200].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="800"
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        <polyline
          fill="none"
          stroke="#123b78"
          strokeWidth="3"
          points="20,185 150,170 280,150 410,120 540,95 670,65 790,35"
        />
        <polyline
          fill="none"
          stroke="#ef234c"
          strokeWidth="2"
          points="20,190 150,193 280,192 410,193 540,191 670,192 790,190"
        />
        <polyline
          fill="none"
          stroke="#20a36a"
          strokeWidth="2"
          points="20,210 150,218 280,215 410,214 540,215 670,214 790,215"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-gray-400 sm:text-[10px]">
        <span>Mar &apos;25</span>
        <span>Apr &apos;25</span>
        <span>May &apos;25</span>
        <span>Jun &apos;25</span>
        <span>Jul &apos;25</span>
        <span>Aug &apos;25</span>
      </div>
      <div className="absolute -bottom-7 left-1/2 flex -translate-x-1/2 gap-3 whitespace-nowrap text-[9px] sm:gap-4 sm:text-[10px]">
        <span className="text-blue-700">● Citizens registered</span>
        <span className="text-red-500">● Female</span>
        <span className="text-green-600">● Youth</span>
      </div>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2.5 text-center text-[10px] text-purple-600">
      ⓘ &nbsp;{children}
    </div>
  );
}

function Demographics() {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Age Distribution — Bar">
          <BarChart data={ageData} />
        </Card>
        <Card title="Age Distribution — Share">
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_1fr]">
            <DonutChart
              segments={[
                { label: "0–17", percentage: 32, color: "#123b78" },
                { label: "18–30", percentage: 20, color: "#f59e0b" },
                { label: "31–45", percentage: 18, color: "#22c55e" },
                { label: "46–60", percentage: 12, color: "#06b6d4" },
                { label: "60+", percentage: 18, color: "#ef234c" },
              ]}
            />
            <Legend
              items={[
                { label: "0–17", percentage: 32, color: "#123b78" },
                { label: "18–30", percentage: 20, color: "#f59e0b" },
                { label: "31–45", percentage: 18, color: "#22c55e" },
                { label: "46–60", percentage: 12, color: "#06b6d4" },
                { label: "60+", percentage: 18, color: "#ef234c" },
              ]}
            />
          </div>
        </Card>
        <Card title="Sex Distribution — Bar">
          <BarChart data={sexData} />
        </Card>
        <Card title="Sex Distribution — Share">
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_1fr]">
            <DonutChart
              segments={[
                { label: "Female", percentage: 51, color: "#ef234c" },
                { label: "Male", percentage: 47, color: "#123b78" },
                { label: "Other", percentage: 2, color: "#f59e0b" },
              ]}
            />
            <Legend
              items={[
                { label: "Female", percentage: 51, color: "#ef234c" },
                { label: "Male", percentage: 47, color: "#123b78" },
                { label: "Other", percentage: 2, color: "#f59e0b" },
              ]}
            />
          </div>
        </Card>
      </div>
      <div className="mt-4">
        <Card title="Registration & Sex Ratio — Live Trend (06 months)">
          <Trend />
        </Card>
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <Card title="Ethnicity — Major Groups">
          <DonutChart
            segments={[
              { label: "Group 1", percentage: 35, color: "#123b78" },
              { label: "Group 2", percentage: 20, color: "#ef234c" },
              { label: "Group 3", percentage: 15, color: "#f59e0b" },
              { label: "Group 4", percentage: 12, color: "#22c55e" },
              { label: "Other", percentage: 18, color: "#8b5cf6" },
            ]}
          />
        </Card>
        <Card title="Janajati — Subgroups">
          <BarChart
            horizontal
            data={[
              { label: "Rai", value: 3000 },
              { label: "Tamang", value: 2700 },
              { label: "Magar", value: 2600 },
              { label: "Limbu", value: 2100 },
              { label: "Newar", value: 1800 },
              { label: "Gurung", value: 1800 },
            ]}
          />
        </Card>
      </div>
    </>
  );
}

function Employment() {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Employment Category — Bar">
          <BarChart data={employmentData} />
        </Card>
        <Card title="Income Quintile — Share">
          <DonutChart
            segments={[
              { label: "100K+", percentage: 30, color: "#123b78" },
              { label: "100K–200K", percentage: 25, color: "#ef234c" },
              { label: "200K–300K", percentage: 20, color: "#22c55e" },
              { label: "300K–500K", percentage: 15, color: "#f59e0b" },
              { label: "500K+", percentage: 10, color: "#8b5cf6" },
            ]}
          />
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Foreign Employment — By Destination Country">
          <BarChart
            horizontal
            data={[
              { label: "Australia", value: 44 },
              { label: "Saudi Arabia", value: 40 },
              { label: "UAE", value: 31 },
              { label: "Qatar", value: 27 },
              { label: "Japan", value: 18 },
              { label: "Other", value: 12 },
            ]}
          />
        </Card>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
          <p className="text-sm font-bold text-orange-600">
            Employment Insight
          </p>
          <p className="mt-3 text-xs leading-6 text-gray-600">
            3,578 citizens are currently recorded under foreign employment.
            Australia, Saudi Arabia and UAE represent the largest destination
            groups.
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Card title="Migration Report">
          <div className="overflow-x-auto">
            <table className="w-full min-w-650px text-left text-[10px]">
              <thead className="bg-gray-50 text-gray-400">
                <tr>
                  {["Citizen", "Type", "From", "To", "Reason", "Date"].map(
                    (h) => (
                      <th key={h} className="px-3 py-3">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {[
                  "Hari",
                  "Panchthar",
                  "Ilam",
                  "Jhapa",
                  "Tehrathum",
                  "Dhankuta",
                  "Sunsari",
                ].map((name) => (
                  <tr key={name} className="border-t border-gray-100">
                    <td className="px-3 py-3">{name}</td>
                    <td className="px-3 py-3">Foreign</td>
                    <td className="px-3 py-3">Koshi</td>
                    <td className="px-3 py-3">UAE</td>
                    <td className="px-3 py-3">Employment</td>
                    <td className="px-3 py-3 text-gray-400">08/08/2026</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

function Education() {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Education Level — Bar">
          <BarChart horizontal data={educationData} />
        </Card>
        <Card title="Education Level — Share">
          <DonutChart
            segments={[
              { label: "Basic", percentage: 30, color: "#123b78" },
              { label: "Secondary", percentage: 23, color: "#ef234c" },
              { label: "Higher Secondary", percentage: 17, color: "#22c55e" },
              { label: "Bachelor", percentage: 10, color: "#f59e0b" },
              { label: "Master", percentage: 8, color: "#8b5cf6" },
              { label: "Technical", percentage: 7, color: "#06b6d4" },
              { label: "Other", percentage: 5, color: "#64748b" },
            ]}
          />
        </Card>
      </div>
      <div className="mt-4">
        <Card title="Enrollment & Dropout Rate — Live Trend">
          <Trend />
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Dropout Reasons">
          <BarChart
            horizontal
            data={[
              { label: "Economic", value: 460 },
              { label: "Migration", value: 390 },
              { label: "Family", value: 350 },
              { label: "Distance", value: 290 },
              { label: "Other", value: 210 },
            ]}
          />
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Total Students" value="5,910" />
          <KpiCard
            label="Total Graduates"
            value="45,347"
            accent="border-[#17B26A]"
          />
          <KpiCard
            label="Government Schools"
            value="95"
            accent="border-purple-500"
          />
          <KpiCard
            label="Private Schools"
            value="29"
            accent="border-[#F79009]"
          />
          <KpiCard label="Community Schools" value="4" />
          <KpiCard
            label="Total Schools"
            value="127"
            accent="border-[#F04438]"
          />
        </div>
      </div>
    </>
  );
}

function Health() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <KpiCard label="Government Hospitals" value="5" />
        <KpiCard label="Private Hospitals" value="3" />
        <KpiCard label="Health Posts" value="54" />
        <KpiCard label="Total Hospital Beds" value="271" />
        <KpiCard label="Government Hospital Beds" value="160" />
        <KpiCard label="Private Hospital Beds" value="111" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Hospitals — Government vs Private">
          <DonutChart
            segments={[
              { label: "Government", percentage: 72, color: "#123b78" },
              { label: "Private", percentage: 28, color: "#f59e0b" },
            ]}
          />
        </Card>
        <Card title="Health Workforce">
          <BarChart horizontal data={healthData} />
        </Card>
      </div>
      <Notice>
        Health profile — Phase 2 dataset. Some health-related records are
        currently aggregated at province level.
      </Notice>
    </>
  );
}

function Disability() {
  const segments = [
    { label: "Physical", percentage: 31, color: "#0ea5e9" },
    { label: "Vision", percentage: 23, color: "#2563eb" },
    { label: "Hearing", percentage: 18, color: "#06b6d4" },
    { label: "Intellectual", percentage: 12, color: "#22c55e" },
    { label: "Multiple", percentage: 9, color: "#f59e0b" },
    { label: "Other", percentage: 7, color: "#ef234c" },
  ];
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Disability Type — Bar">
          <BarChart horizontal data={disabilityData} />
        </Card>
        <Card title="Disability Type — Share">
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_1fr]">
            <DonutChart segments={segments} />
            <Legend items={segments} />
          </div>
        </Card>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <KpiCard label="Registered Profiles" value="3,182" />
        <KpiCard
          label="Verified Profiles"
          value="1,896"
          accent="border-[#F79009]"
        />
      </div>
      <Notice>
        Individual disability records are currently aggregated for
        province-level analytical reporting.
      </Notice>
    </>
  );
}

function DigitalAccess() {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Digital Literacy">
          <BarChart data={digitalData} />
        </Card>
        <Card title="Smartphone Ownership">
          <DonutChart
            segments={[
              { label: "Has smartphone", percentage: 62, color: "#65a982" },
              { label: "No smartphone", percentage: 38, color: "#e43c59" },
            ]}
          />
          <div className="mt-3 flex justify-center gap-5 text-[10px]">
            <span className="text-green-600">● Has smartphone</span>
            <span className="text-red-500">● No smartphone</span>
          </div>
        </Card>
      </div>
      <Notice>
        Digital access records are only available for citizens with completed
        digital-literacy profiles.
      </Notice>
    </>
  );
}

function Consent() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Consent Recorded" value="100%" />
        <KpiCard label="NID Verified" value="94.8%" accent="border-[#17B26A]" />
        <KpiCard label="Sync Pending" value="4.8%" accent="border-[#F79009]" />
        <KpiCard label="Sync Conflicts" value="22" accent="border-[#F04438]" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Consent Channel — Share">
          <DonutChart
            segments={[
              { label: "National ID", percentage: 57, color: "#123b78" },
              { label: "Card", percentage: 35, color: "#ef234c" },
              { label: "Portal", percentage: 5, color: "#22c55e" },
              { label: "Verbal", percentage: 3, color: "#8b5cf6" },
            ]}
          />
        </Card>
        <Card title="Consent Channel — Bar">
          <BarChart
            data={[
              { label: "National ID", value: 94 },
              { label: "Card", value: 62 },
              { label: "Portal", value: 21 },
              { label: "Verbal", value: 8 },
            ]}
          />
        </Card>
      </div>
      <Notice>
        Consent and compliance metrics are calculated from currently
        synchronized province records.
      </Notice>
    </>
  );
}

function IdCards() {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="ID Cards by Type">
          <DonutChart
            segments={[
              { label: "Type 1", percentage: 48, color: "#123b78" },
              { label: "Type 2", percentage: 30, color: "#ef234c" },
              { label: "Type 3", percentage: 12, color: "#22c55e" },
              { label: "Type 4", percentage: 10, color: "#f59e0b" },
            ]}
          />
        </Card>
        <Card title="Grievance Status">
          <BarChart
            data={[
              { label: "Open", value: 210 },
              { label: "Pending", value: 220 },
              { label: "Resolved", value: 175 },
              { label: "Closed", value: 90 },
            ]}
          />
        </Card>
      </div>
      <Notice>
        ID card and grievance statistics are displayed using synchronized
        province-level records.
      </Notice>
    </>
  );
}

function Household() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Household Size">
        <BarChart
          data={[
            { label: "1–2 members", value: 20 },
            { label: "3–4 members", value: 38 },
            { label: "5–6 members", value: 29 },
            { label: "7+ members", value: 13 },
          ]}
        />
      </Card>
      <Card title="Poverty Distribution">
        <DonutChart
          segments={[
            { label: "Below poverty", percentage: 32, color: "#ef234c" },
            { label: "Above poverty", percentage: 68, color: "#123b78" },
          ]}
        />
      </Card>
    </div>
  );
}

export default function ProvinceAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Demographics");

  const content = {
    Demographics: <Demographics />,
    Employment: <Employment />,
    "Household & Poverty": <Household />,
    Education: <Education />,
    Health: <Health />,
    Disability: <Disability />,
    "Digital Access": <DigitalAccess />,
    "Consent & Compliance": <Consent />,
    "ID Cards & Grievances": <IdCards />,
  }[activeTab];

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-5 md:px-6 lg:px-8">
      <header className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-gray-400">Province Portal</span>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-[#F04438]">Analytics</span>
          </div>
          <p className="mt-2 text-xs font-medium text-gray-400">
            Province Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-[28px]">
            Koshi Province Analytics
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-gray-500">
            Complete demographic, economic and social data for the selected
            province.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 shadow-sm"
          >
            <DownloadIcon />
            Export Report
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-[#092E68] px-4 py-2.5 text-xs font-semibold text-white shadow-sm"
          >
            <RefreshIcon />
            Refresh Data
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard label="Registered" value="48,236" />
        <KpiCard label="NID Verified" value="94.8%" accent="border-[#17B26A]" />
        <KpiCard
          label="Active Grievances"
          value="287"
          accent="border-[#F04438]"
        />
        <KpiCard
          label="ID Cards Issued"
          value="4,836"
          accent="border-[#F79009]"
        />
      </section>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-[10px] text-gray-500"
        >
          <CalendarIcon />
          Dashboard Range: Aug 2025 – Aug 2026
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg bg-[#092E68] px-4 py-2 text-[10px] font-semibold text-white"
        >
          <DownloadIcon />
          Download Report
        </button>
      </div>

      <div className="mt-4 overflow-x-auto border-b border-gray-200">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-3 py-3 text-[11px] font-medium transition ${activeTab === tab ? "border-[#F04438] text-[#F04438]" : "border-transparent text-gray-500 hover:text-gray-800"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-4">{content}</section>

      <footer className="mt-8 border-t border-gray-200 py-4 text-center text-[10px] text-gray-400">
        Digital Nepal E-Governance System
      </footer>
    </main>
  );
}
