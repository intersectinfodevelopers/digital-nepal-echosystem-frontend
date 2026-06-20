import syncBatches from "../../../../../../data/sync-batches.json";
import wards from "../../../../../../data/wards.json";

export default async function SyncHistoryPage({
  params,
}: {
  params: Promise<{
    wardId: string;
  }>;
}) {
  const { wardId } = await params;

  const ward = wards.find(
    (w) => w.id === wardId
  );

  const batches = syncBatches.filter(
    (batch) => batch.ward_id === wardId
  );

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Sync Batch History
      </h1>

      <p className="mb-4">
        Ward:
        <span className="font-semibold">
          {" "}
          {ward?.name_en ?? "Unknown Ward"}
        </span>
      </p>

      {batches.length === 0 ? (
        <div className="border p-4 rounded bg-yellow-50">
          No sync history found
        </div>
      ) : (
        <table className="w-full border">

          <thead>
            <tr>
              <th className="border p-2">Batch ID</th>
              <th className="border p-2">Submitted</th>
              <th className="border p-2">Records</th>
              <th className="border p-2">Conflicts</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>

          <tbody>

            {batches.map((batch) => (
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

                <td className="border p-2">
                  {batch.conflict_count}
                </td>

                <td className="border p-2">
                  {batch.status}
                </td>

              </tr>
            ))}

          </tbody>

        </table>
      )}
    </div>
  );
}