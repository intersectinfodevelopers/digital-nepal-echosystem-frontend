"use client";

import { useMemo, useState } from "react";

import citizens from "../../../../data/citizens.json";
import wards from "../../../../data/wards.json";
import idCards from "../../../../data/id-cards.json";

export default function ReportsPage() {

  const [visibleCount, setVisibleCount] = useState(10);

  const getAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };



  const population = useMemo(() => {
    return wards.map((ward) => {
      const wardCitizens = citizens.filter(
        (c) => c.ward_id === ward.id
      );

      const total = wardCitizens.length;

      const male = wardCitizens.filter(
        (c) => c.sex === "MALE"
      ).length;

      const female = wardCitizens.filter(
        (c) => c.sex === "FEMALE"
      ).length;

      const other = wardCitizens.filter(
        (c) => c.sex === "OTHER"
      ).length;

      const verified = wardCitizens.filter(
        (c) => c.nid_verified
      ).length;

      const avgAge =
        total > 0
          ? (
            wardCitizens.reduce(
              (sum, citizen) =>
                sum + getAge(citizen.dob),
              0
            ) / total
          ).toFixed(1)
          : "0";

      return {
        ward: ward.name_en,
        total,
        male,
        female,
        other,
        verified:
          total > 0
            ? ((verified / total) * 100).toFixed(1)
            : "0",
        avgAge,
      };
    });
  }, []);



  const employment = useMemo(() => {
    return citizens.reduce(
      (acc, citizen) => {
        const key =
          citizen.employment_category || "OTHER";

        acc[key] = (acc[key] || 0) + 1;

        return acc;
      },
      {} as Record<string, number>
    );
  }, []);



  const backlog = useMemo(() => {
    return idCards.reduce(
      (acc, card) => {
        const status = card.status;

        if (!acc[status]) {
          acc[status] = 0;
        }

        acc[status]++;

        return acc;
      },
      {} as Record<string, number>
    );
  }, []);



  const totalPopulation = population.reduce(
    (sum, ward) => sum + ward.total,
    0
  );

  const totalMale = population.reduce(
    (sum, ward) => sum + ward.male,
    0
  );

  const totalFemale = population.reduce(
    (sum, ward) => sum + ward.female,
    0
  );

  const totalVerified = citizens.filter(
    (citizen) => citizen.nid_verified
  ).length;

  const verificationRate =
    totalPopulation > 0
      ? ((totalVerified / totalPopulation) * 100).toFixed(1)
      : "0";

  const totalBacklog = Object.values(backlog).reduce(
    (sum, value) => sum + value,
    0
  );

  const visiblePopulation = population.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-8">



      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--primary)" }}
          >
            Municipality Portal
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Reports & Analytics
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Overview of population, employment and citizen
            service statistics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          style={{
            backgroundColor: "var(--primary)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9V2h12v7" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <path d="M6 14h12v8H6z" />
          </svg>

          Print Report
        </button>
      </div>



      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">


        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Total Population
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalPopulation.toLocaleString()}
              </p>

              <p className="mt-1 text-xs text-green-600">
                Registered citizens
              </p>
            </div>

            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "rgba(15, 45, 109, 0.08)",
                color: "var(--primary)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
        </div>


        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Male Citizens
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalMale.toLocaleString()}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {totalPopulation > 0
                  ? (
                    (totalMale / totalPopulation) *
                    100
                  ).toFixed(1)
                  : 0}
                % of population
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <span className="text-lg">♂</span>
            </div>
          </div>
        </div>


        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Female Citizens
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalFemale.toLocaleString()}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {totalPopulation > 0
                  ? (
                    (totalFemale / totalPopulation) *
                    100
                  ).toFixed(1)
                  : 0}
                % of population
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
              <span className="text-lg">♀</span>
            </div>
          </div>
        </div>


        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">
                NID Verification
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {verificationRate}%
              </p>

              <p className="mt-1 text-xs text-green-600">
                {totalVerified.toLocaleString()} verified
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
        </div>
      </div>



      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="mb-5 flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">
            Population Overview
          </h2>

          <p className="text-sm text-gray-500">
            Demographic distribution across municipality wards.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">



          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">

            <p className="text-sm font-semibold text-gray-700">
              Gender Distribution
            </p>

            <div className="mt-4 space-y-4">

              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-gray-500">
                    Male
                  </span>

                  <span className="font-medium text-gray-700">
                    {totalMale.toLocaleString()}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${totalPopulation
                        ? (totalMale / totalPopulation) * 100
                        : 0
                        }%`,
                      backgroundColor: "var(--primary)",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-gray-500">
                    Female
                  </span>

                  <span className="font-medium text-gray-700">
                    {totalFemale.toLocaleString()}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-pink-500"
                    style={{
                      width: `${totalPopulation
                        ? (totalFemale / totalPopulation) * 100
                        : 0
                        }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>



          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">

            <p className="text-sm font-semibold text-gray-700">
              NID Verification
            </p>

            <div className="mt-4 flex items-center gap-4">

              <div
                className="flex h-20 w-20 items-center justify-center rounded-full border-8"
                style={{
                  borderColor: "rgba(22, 163, 74, 0.18)",
                }}
              >
                <span className="text-lg font-bold text-gray-900">
                  {verificationRate}%
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Verification Rate
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {totalVerified.toLocaleString()} of{" "}
                  {totalPopulation.toLocaleString()} citizens
                  verified.
                </p>
              </div>
            </div>
          </div>



          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">

            <p className="text-sm font-semibold text-gray-700">
              Ward Coverage
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {wards.length}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Total wards included in this report
            </p>
          </div>

        </div>
      </section>


      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Population by Ward
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Detailed population and NID statistics for each ward.
            </p>
          </div>

          <span className="text-xs text-gray-500">
            Showing {visiblePopulation.length} of {population.length} wards
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">

            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Ward
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Male
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Female
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Other
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  NID %
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Avg. Age
                </th>
              </tr>
            </thead>

            <tbody>
              {visiblePopulation.map((row) => (
                <tr
                  key={row.ward}
                  className="border-b border-gray-100 transition hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {row.ward}
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {row.total.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {row.male.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {row.female.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {row.other.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${Number(row.verified) >= 80
                        ? "bg-green-50 text-green-700"
                        : Number(row.verified) >= 50
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                        }`}
                    >
                      {row.verified}%
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {row.avgAge}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex justify-center gap-3">
         
          {visibleCount > 10 && (
            <button
              type="button"
              onClick={() =>
                setVisibleCount((prev) => Math.max(10, prev - 10))
              }
              className="rounded-lg border px-5 py-2 text-sm font-semibold transition hover:bg-gray-50"
              style={{
                borderColor: "var(--border)",
                color: "var(--primary)",
              }}
            >
              Show Less
            </button>
          )}

          
          {visibleCount < population.length && (
            <button
              type="button"
              onClick={() =>
                setVisibleCount((prev) => prev + 10)
              }
              className="rounded-lg border px-5 py-2 text-sm font-semibold transition hover:bg-gray-50"
              style={{
                borderColor: "var(--border)",
                color: "var(--primary)",
              }}
            >
              Show More
            </button>
          )}
        </div>
      </section>


      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">



        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Employment Distribution
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Citizen distribution by employment category.
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(employment).map(
              ([category, count]) => {
                const percentage =
                  totalPopulation > 0
                    ? (count / totalPopulation) * 100
                    : 0;

                return (
                  <div key={category}>

                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {category}
                      </span>

                      <span className="text-xs font-semibold text-gray-500">
                        {count.toLocaleString()}{" "}
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: "var(--primary)",
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>


        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-start justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                ID Card Backlog
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current status of identity card processing.
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {totalBacklog.toLocaleString()}
              </p>

              <p className="text-xs text-gray-500">
                Total records
              </p>
            </div>

          </div>

          <div className="space-y-3">
            {Object.entries(backlog).map(
              ([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                >
                  <div className="flex items-center gap-3">

                    <span
                      className={`h-2.5 w-2.5 rounded-full ${status.toLowerCase().includes("pending")
                        ? "bg-yellow-500"
                        : status.toLowerCase().includes("complete")
                          ? "bg-green-500"
                          : "bg-gray-400"
                        }`}
                    />

                    <span className="text-sm font-medium text-gray-700">
                      {status}
                    </span>
                  </div>

                  <span className="text-sm font-bold text-gray-900">
                    {count.toLocaleString()}
                  </span>
                </div>
              )
            )}
          </div>
        </section>

      </div>

      <div className="mt-6 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
        Report generated from the Municipality Citizen Information System
      </div>

    </div>
  );
}