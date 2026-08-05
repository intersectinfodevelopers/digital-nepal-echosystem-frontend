import Link from "next/link";

import citizens from "../../../../data/citizens.json";
import districts from "../../../../data/district.json";
import editApprovals from "../../../../data/edit-approvals.json";
import employment from "../../../../data/employment.json";
import grievances from "../../../../data/grievances.json";
import idCards from "../../../../data/id-cards.json";
import municipalities from "../../../../data/municipalities.json";
import provinces from "../../../../data/provinces.json";
import wards from "../../../../data/wards.json";

const numberFormat = new Intl.NumberFormat("en-NP");

const districtProvince = new Map(
  districts.map((item) => [item.id, item.province_id]),
);
const municipalityProvince = new Map(
  municipalities.map((item) => [
    item.id,
    districtProvince.get(item.district_id),
  ]),
);
const wardProvince = new Map(
  wards.map((item) => [
    item.id,
    municipalityProvince.get(item.municipality_id),
  ]),
);
const citizenProvince = new Map(
  citizens.map((item) => [item.id, wardProvince.get(item.ward_id)]),
);
const wardMunicipality = new Map(
  wards.map((item) => [item.id, item.municipality_id]),
);

const categoryLabels: Record<string, string> = {
  FARMER: "Farmer",
  GOVERNMENT: "Government",
  PRIVATE: "Private sector",
  BUSINESS: "Business / self-employed",
  STUDENT: "Student",
  UNEMPLOYED: "Unemployed",
  FOREIGN_ABROAD: "Foreign employment",
  HOMEMAKER: "Homemaker",
  RETIRED: "Retired",
  OTHER: "Other",
};
const countryLabels: Record<string, string> = {
  AE: "United Arab Emirates",
  QA: "Qatar",
  SA: "Saudi Arabia",
  MY: "Malaysia",
  KR: "South Korea",
  JP: "Japan",
};
const visaLabels: Record<string, string> = {
  WORK_PERMIT: "Work Permit",
  STUDENT_VISA: "Student Visa",
  DEPENDENT_VISA: "Dependent Visa",
  OTHER: "Other",
};
const bandLabels: Record<string, string> = {
  UNDER_5K: "Under NPR 5,000",
  "5K_10K": "NPR 5,000–10,000",
  "10K_25K": "NPR 10,000–25,000",
  "25K_50K": "NPR 25,000–50,000",
  "50K_100K": "NPR 50,000–100,000",
  OVER_100K: "Over NPR 100,000",
};

const employmentDistribution = Object.entries(
  citizens.reduce<Record<string, number>>((totals, citizen) => {
    totals[citizen.employment_category] =
      (totals[citizen.employment_category] ?? 0) + 1;
    return totals;
  }, {}),
)
  .map(([category, count]) => ({
    category,
    count,
    percentage: (count / Math.max(citizens.length, 1)) * 100,
  }))
  .sort((a, b) => b.count - a.count);

const foreignEmployment = employment
  .filter((item) => item.category === "FOREIGN_ABROAD")
  .reduce<Record<string, { count: number; visa: string; band: string }>>(
    (totals, item) => {
      const country = item.sub_fields.country_code ?? "UNKNOWN";
      const current = totals[country] ?? {
        count: 0,
        visa: item.sub_fields.visa_type ?? "OTHER",
        band: item.income_band,
      };
      current.count += 1;
      totals[country] = current;
      return totals;
    },
    {},
  );

const foreignEmploymentRows = Object.entries(foreignEmployment)
  .map(([country, summary]) => ({ country, ...summary }))
  .sort((a, b) => b.count - a.count);

const provinceForeignRows = provinces
  .map((province) => {
    const residents = citizens.filter(
      (citizen) => wardProvince.get(citizen.ward_id) === province.id,
    );
    const abroad = residents.filter(
      (citizen) => citizen.employment_category === "FOREIGN_ABROAD",
    ).length;
    return {
      name: province.name_en,
      abroad,
      percentage: (abroad / Math.max(residents.length, 1)) * 100,
    };
  })
  .sort((a, b) => b.percentage - a.percentage);

const nationalForeignPercentage =
  (provinceForeignRows.reduce((total, row) => total + row.abroad, 0) /
    Math.max(citizens.length, 1)) *
  100;

const unemploymentHotspots = municipalities
  .map((municipality) => {
    const residentIds = new Set(
      citizens
        .filter(
          (citizen) =>
            wardMunicipality.get(citizen.ward_id) === municipality.id,
        )
        .map((citizen) => citizen.id),
    );
    const records = employment.filter((item) =>
      residentIds.has(item.citizen_id),
    );
    const unemployed = records.filter(
      (item) => item.category === "UNEMPLOYED",
    ).length;
    return {
      name: municipality.name_en,
      unemployed,
      total: records.length,
      percentage: (unemployed / Math.max(records.length, 1)) * 100,
    };
  })
  .filter((row) => row.total > 0)
  .sort((a, b) => b.percentage - a.percentage)
  .slice(0, 5);

const issuedCards = idCards.filter((card) => card.issued_at !== null);
const activeGrievances = grievances.filter(
  (grievance) =>
    grievance.status !== "CLOSED",
);

const nationalStats = [
  ["Total Citizens Nationally", citizens.length],
  ["Total Provinces", provinces.length],
  ["Total Municipalities", municipalities.length],
  ["Total Wards", wards.length],
  ["ID Cards Issued", issuedCards.length],
  ["Active Grievances", activeGrievances.length],
] as const;

const provinceBreakdown = provinces.map((province) => ({
  id: province.id,
  name: province.name_en,
  citizens: citizens.filter(
    (item) => wardProvince.get(item.ward_id) === province.id,
  ).length,
  municipalities: municipalities.filter(
    (item) => municipalityProvince.get(item.id) === province.id,
  ).length,
  pendingApprovals: editApprovals.filter(
    (approval) =>
      (approval.status === "PENDING_APPROVAL" ||
        approval.status === "CAO_REVIEW") &&
      citizenProvince.get(approval.citizen_id) === province.id,
  ).length,
  activeGrievances: activeGrievances.filter(
    (item) => citizenProvince.get(item.citizen_id) === province.id,
  ).length,
  idCardsIssued: issuedCards.filter(
    (item) => citizenProvince.get(item.citizen_id) === province.id,
  ).length,
}));

const quickLinks = [
  ["Audit Log", "/central/audit-log"],
  ["Eligibility Rules", "/central/eligibility-rules"],
  ["Analytics", "/central/analytics"],
] as const;

export default function CentralDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-sm font-medium text-blue-600">
            Central Administration
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            National Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            National overview of citizens, administrative divisions, ID cards,
            and grievances.
          </p>
        </header>

        <div
          className="mt-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
        >
          Central Admin — National Analytical View. Zero write access to citizen
          records.
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            National Statistics
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {nationalStats.map(([label, value]) => (
              <article
                key={label}
                className="rounded-lg border border-slate-200 bg-white p-5"
              >
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {numberFormat.format(value)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Province Breakdown
          </h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Province</th>
                  <th className="px-4 py-3 font-medium">Citizens</th>
                  <th className="px-4 py-3 font-medium">Municipalities</th>
                  <th className="px-4 py-3 font-medium">Pending Approvals</th>
                  <th className="px-4 py-3 font-medium">Active Grievances</th>
                  <th className="px-4 py-3 font-medium">ID Cards Issued</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {provinceBreakdown.map((province) => (
                  <tr key={province.id} className="hover:bg-slate-50">
                    <th
                      scope="row"
                      className="whitespace-nowrap px-4 py-3 font-medium text-slate-900"
                    >
                      {province.name}
                    </th>
                    <td className="px-4 py-3 text-slate-600">
                      {numberFormat.format(province.citizens)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {numberFormat.format(province.municipalities)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {numberFormat.format(province.pendingApprovals)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {numberFormat.format(province.activeGrievances)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {numberFormat.format(province.idCardsIssued)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Employment Analytics
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                National aggregates only. No personal records.
              </p>
            </div>
            <Link
              href="/central/analytics"
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              Detailed analytics →
            </Link>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <article className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="font-medium text-slate-900">
                National employment distribution
              </h3>
              <div className="mt-4 space-y-3">
                {employmentDistribution.map((row) => (
                  <div key={row.category}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-600">
                        {categoryLabels[row.category] ?? row.category}
                      </span>
                      <span className="font-medium text-slate-900">
                        {row.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <progress
                      max={100}
                      value={row.percentage}
                      className="h-2 w-full accent-blue-600"
                      aria-label={`${row.category}: ${row.percentage.toFixed(1)}%`}
                    />
                  </div>
                ))}
              </div>
            </article>

            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <h3 className="border-b border-slate-200 px-5 py-4 font-medium text-slate-900">
                Foreign employment
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Country</th>
                      <th className="px-4 py-3 font-medium">Citizens</th>
                      <th className="px-4 py-3 font-medium">Top visa</th>
                      <th className="px-4 py-3 font-medium">Avg. remittance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {foreignEmploymentRows.map((row) => (
                      <tr key={row.country}>
                        <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                          {countryLabels[row.country] ?? "Not specified"}
                        </th>
                        <td className="px-4 py-3 text-slate-600">{row.count}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {visaLabels[row.visa] ?? row.visa}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {bandLabels[row.band] ?? row.band}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <h3 className="border-b border-slate-200 px-5 py-4 font-medium text-slate-900">
                Foreign employment by province
              </h3>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Province</th>
                    <th className="px-4 py-3 font-medium">Abroad</th>
                    <th className="px-4 py-3 font-medium">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {provinceForeignRows.map((row) => (
                    <tr key={row.name}>
                      <th className="px-4 py-3 font-medium text-slate-900">
                        {row.name}
                        {row.abroad > 0 &&
                          row.percentage >= nationalForeignPercentage && (
                            <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                              Remittance dependent
                            </span>
                          )}
                      </th>
                      <td className="px-4 py-3 text-slate-600">{row.abroad}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <h3 className="border-b border-slate-200 px-5 py-4 font-medium text-slate-900">
                Unemployment hotspots
              </h3>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Municipality</th>
                    <th className="px-4 py-3 font-medium">Unemployed</th>
                    <th className="px-4 py-3 font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unemploymentHotspots.map((row) => (
                    <tr key={row.name}>
                      <th className="px-4 py-3 font-medium text-slate-900">
                        {row.name}
                      </th>
                      <td className="px-4 py-3 text-slate-600">
                        {row.unemployed}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </div>
        </section>

        <aside className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Quick Links</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {quickLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-50"
              >
                {label}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
