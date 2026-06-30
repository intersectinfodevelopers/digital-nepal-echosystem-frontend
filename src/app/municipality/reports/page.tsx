"use client";

import { useState } from "react";

import citizens from "../../../../data/citizens.json";
import wards from "../../../../data/wards.json";
import idCards from "../../../../data/id-cards.json";

export default function ReportsPage() {

  const [showAll, setShowAll] = useState(false);
  const getAge = (dob: string) => {
    return (
      new Date().getFullYear() -
      new Date(dob).getFullYear()
    );
  };

  const population = wards.map((ward) => {
    const wardCitizens =
      citizens.filter(
        (c) =>
          c.ward_id === ward.id
      );

    const total =
      wardCitizens.length;

    const male =
      wardCitizens.filter(
        (c) =>
          c.sex === "MALE"
      ).length;

    const female =
      wardCitizens.filter(
        (c) =>
          c.sex === "FEMALE"
      ).length;

    const other =
      wardCitizens.filter(
        (c) =>
          c.sex === "OTHER"
      ).length;

    const verified =
      wardCitizens.filter(
        (c) =>
          c.nid_verified
      ).length;

    const avgAge =
      total > 0
        ? (
          wardCitizens.reduce(
            (sum, c) =>
              sum +
              getAge(c.dob),
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
          ? (
            (verified /
              total) *
            100
          ).toFixed(1)
          : "0",
      avgAge,
    };
  });

  const employment =
    citizens.reduce(
      (
        acc,
        citizen
      ) => {

        const key =
          citizen.employment_category
          ||
          "OTHER";

        acc[key] =
          (
            acc[key]
            ||
            0
          ) + 1;

        return acc;

      },
      {} as Record<
        string,
        number
      >
    );
  const backlog = idCards.reduce(
    (
      acc,
      card
    ) => {

      const status =
        card.status;

      if (
        !acc[status]
      ) {
        acc[status] = 0;
      }

      acc[status]++;

      return acc;

    },

    {} as Record<
      string,
      number
    >
  );
  return (
    <>
      <button
        onClick={() =>
          window.print()
        }
        className="bg-blue-600 text-white px-4 py-2 mb-6"> Print</button>
      <section className="mb-10">

        <h2 className="text-2xl font-semibold mb-4">
          Population Summary
        </h2>

        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Ward</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Male</th>
              <th className="border p-2">Female</th>
              <th className="border p-2">Other</th>
              <th className="border p-2">NID %</th>
              <th className="border p-2">Avg Age</th>
            </tr>
          </thead>

          <tbody>
            {(showAll ? population : population.slice(0, 10)).map((row) => (
              <tr key={row.ward} className="hover:bg-gray-50">
                <td className="border p-2">{row.ward}</td>
                <td className="border p-2">{row.total}</td>
                <td className="border p-2">{row.male}</td>
                <td className="border p-2">{row.female}</td>
                <td className="border p-2">{row.other}</td>
                <td className="border p-2">{row.verified}%</td>
                <td className="border p-2">{row.avgAge}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {showAll ? "Show Less" : "Show More"}
          </button>
        </div>
      </section>

      <section>

        <h2 className="text-2xl font-semibold mb-4">
          Employment Distribution
        </h2>

        <table className="w-full border">

          <thead>
            <tr>
              <th className="border p-2">
                Category
              </th>

              <th className="border p-2">
                Count
              </th>
            </tr>
          </thead>

          <tbody>

            {
              Object.entries(employment)
                .map(([k, v]) => (
                  <tr key={k}>

                    <td className="border p-2">
                      {k}
                    </td>

                    <td className="border p-2">
                      {v}
                    </td>

                  </tr>
                ))
            }

          </tbody>

        </table>

      </section>
      <section className="mt-10">

        <h2 className="text-2xl font-semibold mb-4">
          ID Card Backlog
        </h2>

        <table className="w-full border">

          <thead>

            <tr>

              <th className="border p-2">
                Status
              </th>

              <th className="border p-2">
                Count
              </th>

            </tr>

          </thead>

          <tbody>

            {
              Object.entries(
                backlog
              ).map(
                ([status, count]) => (

                  <tr key={status}>

                    <td className="border p-2">
                      {status}
                    </td>

                    <td className="border p-2">
                      {count}
                    </td>

                  </tr>

                ))
            }

          </tbody>

        </table>

      </section>
    </>

  );
}