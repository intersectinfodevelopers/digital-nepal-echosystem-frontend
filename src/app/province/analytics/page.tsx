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

interface MunicipalityRef {
  id: string;
  name: string;
}

interface IncomeGroup {
  name: string;
  classes: Record<string, number>;
}

interface Grievance {
  citizen_id: string;
  status: string;
  filed_at: string;
}

const municipalitiesData = municipalities as Municipality[];
const wardsData = wards as Ward[];
const citizensData = citizens as {
  id: string;
  ward_id: string;
}[];

const grievancesData = grievances as Grievance[];

const countryMap: Record<string, string> = {
  AE: "United Arab Emirates",
  QA: "Qatar",
  MY: "Malaysia",
  JP: "Japan",
  KR: "South Korea",
};

const getPercentage = (value: number, total: number): number => {
  if (total === 0) {
    return 0;
  }

  return Number(((value / total) * 100).toFixed(1));
};

const formatLabel = (value: string): string => {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export default function ProvinceAnalytics() {
  /*
   * ---------------------------------------------------------
   * Employment
   * ---------------------------------------------------------
   */

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
      percentage: getPercentage(count, employment.length),
    }))
    .sort((a, b) => b.count - a.count);

  /*
   * ---------------------------------------------------------
   * Disability
   * ---------------------------------------------------------
   */

  const disabilityStats = (disability as Disability[]).reduce(
    (acc: Record<string, number>, item: Disability) => {
      if (!item.disability_type) {
        return acc;
      }

      acc[item.disability_type] = (acc[item.disability_type] || 0) + 1;

      return acc;
    },
    {},
  );

  const disabilityData = Object.entries(disabilityStats).sort(
    ([, a], [, b]) => b - a,
  );

  /*
   * ---------------------------------------------------------
   * Foreign Employment
   * ---------------------------------------------------------
   */

  const foreignStats = (employment as Employment[]).reduce(
    (acc: Record<string, number>, item: Employment) => {
      if (item.category !== "FOREIGN_ABROAD") {
        return acc;
      }

      const code = item.sub_fields?.country_code ?? "Unknown";
      const country = countryMap[code] || code;

      acc[country] = (acc[country] || 0) + 1;

      return acc;
    },
    {},
  );

  const foreignData = Object.entries(foreignStats).sort(
    ([, a], [, b]) => b - a,
  );

  /*
   * ---------------------------------------------------------
   * Municipality / Ward mapping
   * ---------------------------------------------------------
   */

  const wardToMunicipality = wardsData.reduce(
    (acc: Record<string, MunicipalityRef>, ward: Ward) => {
      const municipality = municipalitiesData.find(
        (item) => item.id === ward.municipality_id,
      );

      acc[ward.id] = {
        id: ward.municipality_id,
        name: municipality?.name_en ?? "Unknown",
      };

      return acc;
    },
    {},
  );

  /*
   * ---------------------------------------------------------
   * Income Distribution
   * ---------------------------------------------------------
   */

  const incomeByMunicipality = (households as Household[]).reduce(
    (acc: Record<string, IncomeGroup>, item: Household) => {
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

  /*
   * ---------------------------------------------------------
   * Grievance Monitoring
   * ---------------------------------------------------------
   */

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

    const resolutionRate = getPercentage(resolved, total);

    const slaBreached = municipalityGrievances.filter((grievance) => {
      const filedDate = new Date(grievance.filed_at);

      const days = (Date.now() - filedDate.getTime()) / (1000 * 60 * 60 * 24);

      return days > 15;
    }).length;

    const slaRate = getPercentage(slaBreached, total);

    return {
      id: municipality.id,
      municipality: municipality.name_en,
      total,
      resolutionRate,
      slaRate,
    };
  });

  /*
   * ---------------------------------------------------------
   * Summary
   * ---------------------------------------------------------
   */

  const citizenCount = citizens.length;

  const totalForeignWorkers = foreignData.reduce(
    (total, [, count]) => total + count,
    0,
  );

  return (
    <main className="min-h-screen bg-background px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-secondary md:text-3xl">
            Province Analytics
          </h1>

          <p className="mt-1 text-sm text-muted md:text-base">
            Province-level employment, disability, income and grievance insights
          </p>
        </header>

        {/* Summary Cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
            <p className="text-sm font-medium text-muted">Total Citizens</p>

            <p className="mt-2 text-2xl font-bold text-secondary md:text-3xl">
              {citizenCount}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
            <p className="text-sm font-medium text-muted">
              Employment Categories
            </p>

            <p className="mt-2 text-2xl font-bold text-secondary md:text-3xl">
              {employmentData.length}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
            <p className="text-sm font-medium text-muted">Disability Types</p>

            <p className="mt-2 text-2xl font-bold text-secondary md:text-3xl">
              {disabilityData.length}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
            <p className="text-sm font-medium text-muted">Citizens Abroad</p>

            <p className="mt-2 text-2xl font-bold text-secondary md:text-3xl">
              {totalForeignWorkers}
            </p>
          </div>
        </section>

        {/* Employment Distribution */}
        <section className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-card md:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-secondary md:text-xl">
              Employment Distribution
            </h2>

            <p className="mt-1 text-sm text-muted">
              Distribution of citizens by employment category
            </p>
          </div>

          {employmentData.length > 0 ? (
            <div className="space-y-5">
              {employmentData.map((item) => (
                <div key={item.category}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-secondary">
                      {formatLabel(item.category)}
                    </span>

                    <span className="shrink-0 text-muted">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>

                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted">
              No employment data available.
            </p>
          )}
        </section>

        {/* Foreign Employment */}
        <section className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-card md:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-secondary md:text-xl">
              Foreign Employment
            </h2>

            <p className="mt-1 text-sm text-muted">
              Citizens currently recorded as working abroad
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr className="bg-background">
                  <th className="border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Country
                  </th>

                  <th className="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                    Citizens Abroad
                  </th>
                </tr>
              </thead>

              <tbody>
                {foreignData.length > 0 ? (
                  foreignData.map(([country, count]) => (
                    <tr
                      key={country}
                      className="border-b border-border last:border-0 hover:bg-background/50"
                    >
                      <td className="px-4 py-3 font-medium text-secondary">
                        {country}
                      </td>

                      <td className="px-4 py-3 text-right text-secondary">
                        {count}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-6 text-center text-muted"
                    >
                      No foreign employment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Disability Summary */}
        <section className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-card md:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-secondary md:text-xl">
              Disability Summary
            </h2>

            <p className="mt-1 text-sm text-muted">
              Citizens grouped by recorded disability type
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr className="bg-background">
                  <th className="border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Disability Type
                  </th>

                  <th className="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                    Count
                  </th>
                </tr>
              </thead>

              <tbody>
                {disabilityData.length > 0 ? (
                  disabilityData.map(([type, count]) => (
                    <tr
                      key={type}
                      className="border-b border-border last:border-0 hover:bg-background/50"
                    >
                      <td className="px-4 py-3 font-medium text-secondary">
                        {formatLabel(type)}
                      </td>

                      <td className="px-4 py-3 text-right text-secondary">
                        {count}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-6 text-center text-muted"
                    >
                      No disability data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Income Distribution */}
        <section className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-card md:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-secondary md:text-xl">
              Income Distribution by Municipality
            </h2>

            <p className="mt-1 text-sm text-muted">
              Household distribution by poverty classification
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[650px] border-collapse text-sm">
              <thead>
                <tr className="bg-background">
                  <th className="border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Municipality
                  </th>

                  <th className="border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Poverty Class
                  </th>

                  <th className="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                    Households
                  </th>
                </tr>
              </thead>

              <tbody>
                {incomeData.length > 0 ? (
                  incomeData.flatMap(([municipalityId, group]) =>
                    Object.entries(group.classes).map(
                      ([povertyClass, count]) => (
                        <tr
                          key={`${municipalityId}-${povertyClass}`}
                          className="border-b border-border last:border-0 hover:bg-background/50"
                        >
                          <td className="px-4 py-3 font-medium text-secondary">
                            {group.name}
                          </td>

                          <td className="px-4 py-3 text-secondary">
                            {formatLabel(povertyClass)}
                          </td>

                          <td className="px-4 py-3 text-right text-secondary">
                            {count}
                          </td>
                        </tr>
                      ),
                    ),
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-muted"
                    >
                      No income distribution data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Grievance Monitoring */}
        <section className="rounded-xl border border-border bg-surface p-5 shadow-card md:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-secondary md:text-xl">
              Grievance Monitoring
            </h2>

            <p className="mt-1 text-sm text-muted">
              Resolution and SLA performance by municipality
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[750px] border-collapse text-sm">
              <thead>
                <tr className="bg-background">
                  <th className="border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Municipality
                  </th>

                  <th className="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                    Total Grievances
                  </th>

                  <th className="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                    Resolution Rate
                  </th>

                  <th className="border-b border-border px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                    SLA Breach Rate
                  </th>
                </tr>
              </thead>

              <tbody>
                {grievanceStats.length > 0 ? (
                  grievanceStats.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border last:border-0 hover:bg-background/50"
                    >
                      <td className="px-4 py-3 font-medium text-secondary">
                        {item.municipality}
                      </td>

                      <td className="px-4 py-3 text-right text-secondary">
                        {item.total}
                      </td>

                      <td className="px-4 py-3 text-right font-medium text-success">
                        {item.resolutionRate}%
                      </td>

                      <td className="px-4 py-3 text-right font-medium text-danger">
                        {item.slaRate}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-muted"
                    >
                      No grievance data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
