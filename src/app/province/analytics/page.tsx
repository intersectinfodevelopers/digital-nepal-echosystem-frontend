"use client";

import employment from "../../../../data/employment.json";
import disability from "../../../../data/disability.json";
import households from "../../../../data/households.json";
import wards from "../../../../data/wards.json";

export default function ProvinceAnalytics({
  citizenCount,
}: {
  citizenCount: number;
}) {
  const employmentStats = employment.reduce(
    (acc: Record<string, number>, item: any) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    {},
  );

  const employmentData = Object.entries(employmentStats)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Number(
        (((count as number) / employment.length) * 100).toFixed(1),
      ),
    }))
    .sort((a: any, b: any) => b.count - a.count);

  const disabilityStats = disability.reduce(
    (acc: Record<string, number>, item: any) => {
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

  const foreignStats = employment.reduce(
    (acc: Record<string, number>, item: any) => {
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
    wards as any[]
  ).reduce((acc: Record<string, { id: string; name: string }>, ward: any) => {
    const label = ward.name_en?.replace(/\s+Ward No\.\s*\d+$/, "").trim();
    acc[ward.id] = {
      id: ward.municipality_id,
      name: label || ward.municipality_id,
    };
    return acc;
  }, {});

  const incomeByMunicipality = households.reduce(
    (
      acc: Record<string, { name: string; classes: Record<string, number> }>,
      item: any,
    ) => {
      const muni = wardToMunicipality[item.ward_id] ?? {
        id: "unknown",
        name: "Unknown",
      };
      if (!acc[muni.id]) acc[muni.id] = { name: muni.name, classes: {} };
      acc[muni.id].classes[item.poverty_class] =
        (acc[muni.id].classes[item.poverty_class] || 0) + 1;
      return acc;
    },
    {},
  );

  const incomeData = Object.entries(incomeByMunicipality);

  return (
    <div className="p-4 space-y-8">
      <div className="p-4">
        <h1 className="text-3xl font-bold text-center">Province Analytics</h1>
      </div>

      <section className="bg-white border rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">Employment Distribution</h2>
        <div className="space-y-5">
          {employmentData.map((item: any) => (
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
        <div className="border rounded-lg p-4">
          <p>Citizens</p>
          <p className="text-2xl font-bold">{citizenCount}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p>Employment Categories</p>
          <p className="text-2xl font-bold">{employmentData.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p>Disability Types</p>
          <p className="text-2xl font-bold">{disabilityData.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p>Municipalities</p>
          <p className="text-2xl font-bold">{incomeData.length}</p>
        </div>
      </div>
    </div>
  );
}
