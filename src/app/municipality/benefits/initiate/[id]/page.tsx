"use client";

import { useParams } from "next/navigation";
import citizensData from "../../../../../../data/citizens.json";

type Citizen = {
  id: string;
  name_en: string;
  ward_id: string;
  dob: string;
};

export default function InitiatePage() {
  const params = useParams();

  const id = typeof params?.id === "string" ? params.id : "";

  const citizens = citizensData as Citizen[];

  const citizen = citizens.find((c) => c.id === id);

  if (!citizen) {
    return (
      <div className="p-6 text-lg font-medium">
        Citizen not found
      </div>
    );
  }

  const getAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff =
      today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Initiate ID Card
      </h1>

      <div className="rounded border p-4">
        <p>
          <strong>Name:</strong> {citizen.name_en}
        </p>

        <p>
          <strong>Ward:</strong> {citizen.ward_id}
        </p>

        <p>
          <strong>Age:</strong> {getAge(citizen.dob)}
        </p>
      </div>

      <select className="mt-4 rounded border p-2">
        <option>SENIOR CITIZEN</option>
        <option>DISABILITY</option>
        <option>UNEMPLOYMENT</option>
      </select>

      <button
        type="button"
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
        onClick={() => alert("ID Card Initiated")}
      >
        Initiate
      </button>
    </div>
  );
}