import Link from "next/link";

import citizens from "../../../../data/citizens.json";
import districts from "../../../../data/district.json";
import editApprovals from "../../../../data/edit-approvals.json";
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
