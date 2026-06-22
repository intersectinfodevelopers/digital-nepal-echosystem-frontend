"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import syncBatches from "../../../../../../data/sync-batches.json";
import wards from "../../../../../../data/wards.json";
type SyncBatch = {
  batch_id: string;
  ward_id: string;
  submitted_at: string;
  record_count: number;
  conflict_count: number;
  status: string;
};

export default function ConflictResolutionPage() {
  const params = useParams();
  const wardId = params.wardId as string;

  const [batches, setBatches] = useState<SyncBatch[]>(() => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("syncBatches");
    return stored ? JSON.parse(stored) : syncBatches;
  }
  return syncBatches;
});

  const ward = wards.find((w) => w.id === wardId);

  const conflicts = batches.filter(
    (batch) =>
      batch.ward_id === wardId &&
      batch.conflict_count > 0
  );

  const markResolved = (batchId: string) => {
    const updated = batches.map((batch) =>
      batch.batch_id === batchId
        ? { ...batch, conflict_count: 0, status: "RESOLVED" }
        : batch
    );

    setBatches(updated);
    localStorage.setItem("syncBatches", JSON.stringify(updated));
  };

  return (
        <div className="p-6">

            <h1 className="text-3xl font-bold mb-2">
                Conflict Resolution
            </h1>

            <p className="text-gray-600 mb-6">
                Ward:
                <span className="font-semibold">
                    {" "}
                    {ward?.name_en}
                </span>
            </p>

            {conflicts.length === 0 ? (

                <div className="border rounded p-4 bg-green-50">

                    ✅ No unresolved conflicts

                </div>

            ) : (

                <table className="w-full border">

                    <thead>

                        <tr>

                            <th className="border p-2">
                                Batch ID
                            </th>

                            <th className="border p-2">
                                Submitted
                            </th>

                            <th className="border p-2">
                                Records
                            </th>

                            <th className="border p-2">
                                Conflicts
                            </th>

                            <th className="border p-2">
                                Action
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {conflicts.map((batch) => (

                            <tr key={batch.batch_id}>

                                <td className="border p-2">
                                    {batch.batch_id}
                                </td>

                                <td className="border p-2">
                                    {batch.submitted_at}
                                </td>

                                <td className="border p-2">
                                    {batch.record_count}
                                </td>

                                <td className="border p-2 text-red-600">
                                    {batch.conflict_count}
                                </td>

                                <td className="border p-2">

                                    <button
                                        onClick={() => markResolved(batch.batch_id)}
                                        className="bg-blue-600 text-white px-3 py-1 rounded"
                                    >
                                        Mark Resolved
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            )}

        </div>
    );
}