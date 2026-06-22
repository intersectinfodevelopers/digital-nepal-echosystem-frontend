"use client";

import { useParams } from "next/navigation";
import citizensData from "../../../../../../data/citizens.json";

export default function InitiatePage() {
  const params = useParams();

  const id = typeof params?.id === "string" ? params.id : "";

  const citizens = citizensData as any[];

  const citizen = citizens.find((c) => c.id === id);

  if (!citizen) {
    return <div>Citizen not found</div>;
  }

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Initiate ID Card</h1>

      <div className="border p-4 rounded">
        <p><b>Name:</b> {citizen.name_en}</p>
        <p><b>Ward:</b> {citizen.ward_id}</p>
        <p><b>Age:</b> {getAge(citizen.dob)}</p>
      </div>

      <select className="mt-4 border p-2 rounded">
        <option>SENIOR CITIZEN</option>
        <option>DISABILITY</option>
        <option>UNEMPLOYMENT</option>
      </select>

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => alert("ID Card Initiated")}
      >
        Initiate
      </button>
    </div>
  );
}