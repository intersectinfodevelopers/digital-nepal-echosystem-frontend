"use client";

import employment from "../../../../data/employment.json";
import disability from "../../../../data/disability.json";
import households from "../../../../data/households.json";
import wards from "../../../../data/wards.json";
import grievances from "../../../../data/grievances.json";
import municipalities from "../../../../data/municipalities.json";
import citizens from "../../../../data/citizens.json";

interface Employment {
  citizen_id: string;
  category: string;
  sub_fields?: {
    country_code?: string;
  };
  income_band: string;
}

interface Disability {
  citizen_id: string;
  disability_type: string | null;
  severity_body: number;
  severity_activity: number;
  severity_participation: number;
  certificate_no: string | null;
  certificate_expiry?: string;
}

interface Household {
  id: string;
  ward_id: string;
  poverty_class: string;
}

interface Ward {
  id: string;
  municipality_id: string;
  ward_no: number;
  name_np: string;
  name_en: string;
}

interface Municipality {
  id: string;
  district_id: string;
  name_np: string;
  name_en: string;
  type: string;
}

const municipalitiesData = municipalities as Municipality[];
const wardsData = wards as Ward[];
const citizensData = citizens as {
  id: string;
  ward_id: string;
}[];

const grievancesData = grievances as {
  citizen_id: string;
  status: string;
  filed_at: string;
}[];

export default function ProvinceAnalytics() {
  const citizenCount = citizens.length;

  const employmentStats = (employment as Employment[]).reduce(
    (acc: Record<string, number>, item: Employment) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    {},
  );

  const employmentData = Object.entries(employmentStats)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Number(((count / employment.length) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count);

  const disabilityStats = (disability as Disability[]).reduce(
    (acc: Record<string, number>, item: Disability) => {
      if (!item.disability_type) return acc;

      acc[item.disability_type] = (acc[item.disability_type] || 0) + 1;

      return acc;
    },
    {},
  );

  const disabilityData = Object.entries(disabilityStats);

  const countryMap: Record<string, string> = {
    AE: "United Arab Emirates",
    QA: "Qatar",
    MY: "Malaysia",
    JP: "Japan",
    KR: "South Korea",
  };

  const foreignStats = (employment as Employment[]).reduce(
    (acc: Record<string, number>, item: Employment) => {
      if (item.category !== "FOREIGN_ABROAD") return acc;

      const code = item.sub_fields?.country_code ?? "Unknown";
      const country = countryMap[code] || code;

      acc[country] = (acc[country] || 0) + 1;

      return acc;
    },
    {},
  );

  const foreignData = Object.entries(foreignStats);

  const wardToMunicipality: Record<string, { id: string; name: string }> = (
    wards as Ward[]
  ).reduce((acc: Record<string, { id: string; name: string }>, ward: Ward) => {
    const municipality = (municipalities as Municipality[]).find(
      (municipality) => municipality.id === ward.municipality_id,
    );

    acc[ward.id] = {
      id: ward.municipality_id,
      name: municipality?.name_en ?? "Unknown",
    };

    return acc;
  }, {});

  const incomeByMunicipality = (households as Household[]).reduce(
    (
      acc: Record<
        string,
        {
          name: string;
          classes: Record<string, number>;
        }
      >,
      item: Household,
    ) => {
      const municipality = wardToMunicipality[item.ward_id] ?? {
        id: "unknown",
        name: "Unknown",
      };

      if (!acc[municipality.id]) {
        acc[municipality.id] = {
          name: municipality.name,
          classes: {},
        };
      }

      acc[municipality.id].classes[item.poverty_class] =
        (acc[municipality.id].classes[item.poverty_class] || 0) + 1;

      return acc;
    },
    {},
  );

  const incomeData = Object.entries(incomeByMunicipality);

  const grievanceStats = municipalitiesData.map((municipality) => {
    const wardIds = wardsData
      .filter((ward) => ward.municipality_id === municipality.id)
      .map((ward) => ward.id);

    const citizenIds = citizensData
      .filter((citizen) => wardIds.includes(citizen.ward_id))
      .map((citizen) => citizen.id);

    const municipalityGrievances = grievancesData.filter((grievance) =>
      citizenIds.includes(grievance.citizen_id),
    );

    const total = municipalityGrievances.length;

    const resolved = municipalityGrievances.filter((grievance) =>
      ["RESOLVED", "CLOSED", "COMPLETED"].includes(grievance.status),
    ).length;

    const resolutionRate =
      total === 0 ? 0 : ((resolved / total) * 100).toFixed(1);

    const slaBreached = municipalityGrievances.filter((grievance) => {
      const filedDate = new Date(grievance.filed_at);

      const days = (Date.now() - filedDate.getTime()) / (1000 * 60 * 60 * 24);

      return days > 15;
    }).length;

    const slaRate = total === 0 ? 0 : ((slaBreached / total) * 100).toFixed(1);

    return {
      id: municipality.id,
      municipality: municipality.name_en,
      total,
      resolutionRate,
      slaRate,
    };
  });

  return (
    <div className="p-4 space-y-8">
      <div className="p-4">
        <h1 className="text-3xl font-bold text-center">Province Analytics</h1>
      </div>

      <section className="bg-white border rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">Employment Distribution</h2>
        <div className="space-y-5">
          {employmentData.map((item) => (
            <div key={item.category}>
              <div className="flex justify-between mb-2">
                <span>{item.category}</span>
                <span>
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">Foreign Employment</h2>
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Country</th>
              <th className="border p-3 text-left">Citizens Abroad</th>
            </tr>
          </thead>
          <tbody>
            {foreignData.length ? (
              foreignData.map(([country, count]) => (
                <tr key={country}>
                  <td className="border p-3">{country}</td>
                  <td className="border p-3">{String(count)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="border p-4 text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="bg-white border rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">Disability Summary</h2>
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Disability Type</th>
              <th className="border p-3 text-left">Count</th>
            </tr>
          </thead>
          <tbody>
            {disabilityData.map(([type, count]) => (
              <tr key={type}>
                <td className="border p-3">{type}</td>
                <td className="border p-3">{String(count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white border rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">
          Income Distribution by Municipality
        </h2>
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Municipality</th>
              <th className="border p-3 text-left">Poverty Class</th>
              <th className="border p-3 text-left">Households</th>
            </tr>
          </thead>
          <tbody>
            {incomeData.length ? (
              incomeData.flatMap(([muniId, { name, classes }]) =>
                Object.entries(classes).map(([cls, count]) => (
                  <tr key={`${muniId}-${cls}`}>
                    <td className="border p-3">{name}</td>
                    <td className="border p-3">{cls}</td>
                    <td className="border p-3">{String(count)}</td>
                  </tr>
                )),
              )
            ) : (
              <tr>
                <td colSpan={3} className="border p-4 text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-white shadow">
          <p>Citizens</p>
          <p className="text-2xl font-bold">{citizenCount}</p>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow">
          <p>Employment Categories</p>
          <p className="text-2xl font-bold">{employmentData.length}</p>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow">
          <p>Disability Types</p>
          <p className="text-2xl font-bold">{disabilityData.length}</p>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow">
          <p>Municipalities</p>
          <p className="text-2xl font-bold">{municipalitiesData.length}</p>
        </div>
      </div>

      <section className="bg-white border rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">Grievance Monitoring</h2>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Municipality</th>
              <th className="border p-3 text-center">Total Grievances</th>
              <th className="border p-3 text-center">Resolution Rate</th>
              <th className="border p-3 text-center">SLA Breach Rate</th>
            </tr>
          </thead>

          <tbody>
            {grievanceStats.length > 0 ? (
              grievanceStats.map((item) => (
                <tr key={item.id}>
                  <td className="border p-3">{item.municipality}</td>

                  <td className="border p-3 text-center">{item.total}</td>

                  <td className="border p-3 text-center">
                    {item.resolutionRate}%
                  </td>

                  <td className="border p-3 text-center">{item.slaRate}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border p-4 text-center">
                  No grievance data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
