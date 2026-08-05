"use client";

import { useState, useMemo } from "react";
import citizens from "../../../../data/citizens.json";
import employment from "../../../../data/employment.json";
import disability from "../../../../data/disability.json";
import rules from "../../../../data/eligibility-rules.json";
import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";
import { Citizen } from "@/types/citizen";

export default function Page() {
  const tabs = [
    "UNEMPLOYMENT",
    "DISABILITY",
    "SENIOR CITIZEN",
    "SINGLE WOMAN",
    "FARMER",
    "POVERTY",
  ];

  const [activeTab, setActiveTab] = useState("UNEMPLOYMENT");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const getAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getEligibilityReason = (citizen: Citizen) => {
    const age = getAge(citizen.dob);

    const employmentInfo = employment.find(
      (emp) => emp.citizen_id === citizen.id,
    );

    const disabilityInfo = disability.find(
      (dis) => dis.citizen_id === citizen.id,
    );

    switch (activeTab) {
      case "UNEMPLOYMENT":
        return `Unemployed (Age: ${age})`;

      case "DISABILITY":
        return `Disability Severity: ${disabilityInfo?.severity_body ?? 0}`;

      case "SENIOR CITIZEN":
        return `Senior Citizen (${age} years old)`;

      case "SINGLE WOMAN":
        return "Female Citizen";

      case "FARMER":
        return "Employment Category: Farmer";

      case "POVERTY":
        return `Income Band: ${employmentInfo?.income_band ?? "Unknown"}`;

      default:
        return "-";
    }
  };

  const eligibleCitizens = citizens.filter((citizen) => {
    const age = getAge(citizen.dob);

    const employmentInfo = employment.find(
      (emp) => emp.citizen_id === citizen.id,
    );

    const disabilityInfo = disability.find(
      (dis) => dis.citizen_id === citizen.id,
    );

    switch (activeTab) {
      case "UNEMPLOYMENT":
        return employmentInfo?.category === "UNEMPLOYED" && age >= 18;

      case "DISABILITY":
        return (
          disabilityInfo?.severity_body !== undefined &&
          disabilityInfo.severity_body >= 2
        );

      case "SENIOR CITIZEN": {
        const seniorRule = rules.find(
          (rule) => rule.benefit_type === "SENIOR_CITIZEN_ALLOWANCE",
        );

        const minAge =
          typeof seniorRule?.condition_expression?.value === "number"
            ? seniorRule.condition_expression.value
            : 70;

        return age >= minAge;
      }

      case "SINGLE WOMAN":
        return citizen.sex === "FEMALE";

      case "FARMER":
        return employmentInfo?.category === "FARMER";

      case "POVERTY":
        return employmentInfo?.income_band === "UNDER_5K";

      default:
        return false;
    }
  });

  const totalPages = Math.ceil(eligibleCitizens.length / pageSize);

  const paginatedCitizens = useMemo(() => {
    const start = (page - 1) * pageSize;
    return eligibleCitizens.slice(start, start + pageSize);
  }, [eligibleCitizens, page]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Benefit Eligibility</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`px-4 py-2 rounded border ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-white text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="text-lg">
        <div className="mb-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            Export List
          </button>
        </div>
        <table className="w-full border border-collapse">
          <thead>
            <tr className="bg-gray-100 text-black">
              <th className="border p-2">Name</th>
              <th className="border p-2">Ward</th>
              <th className="border p-2">Eligibility Reason</th>
              <th className="border p-2">Current Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedCitizens.map((citizen) => (
              <tr key={citizen.id}>
                <td className="border p-2">{citizen.name_en}</td>
                <td className="border p-2">{citizen.ward_id}</td>
                <td className="border p-2">
                  {getEligibilityReason(citizen as Citizen)}
                </td>
                <td className="border p-2">
                  No Card
                </td>
                <td className="border p-2 text-center">
                  <Link
                    href={`/municipality/benefits/initiate/${citizen.id}`}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Initiate ID Card
                  </Link>

                  <Link
                    href={`/municipality/benefits/disbursement?citizen=${citizen.id}`}
                    className="inline-block bg-green-700 border-white text-white px-2 py-1 rounded"
                  >
                    Disburse
                  </Link>
                </td>
              </tr>
            ))}
            {paginatedCitizens.length === 0 && (
              <tr>
                <td colSpan={5} className="border p-4 text-center text-gray-500">
                  No eligible citizens found for this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages || 1}
          onPageChange={setPage}
          totalItems={eligibleCitizens.length}
        />
      </div>
    </div>
  );
}
