import citizens from "../../../../data/citizens.json";
import wards from "../../../../data/wards.json";
import idCards from "../../../../data/id-cards.json";
import syncBatches from "../../../../data/sync-batches.json";

export default function ProvinceDashboard() {
  const stats = {
    TotalCitizens: citizens.length,
    TotalMunicipalities: 1,
    TotalWards: wards.length,
    IdCardsIssued: idCards.length,
  };

  return (
    <div>
      <h1 className="text-center text-3xl font-bold">Province Dashboard</h1>

      <h2 className="text-center italic">
        Province Admin — Analytical View Only. No write access to citizen
        records
      </h2>

      <div className="grid grid-cols-1 gap-3 mt-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="border rounded-lg p-3">
          Total Citizens: {stats.TotalCitizens}
        </div>
        <div className="border rounded-lg p-3">
          Total Municipalities: {stats.TotalMunicipalities}
        </div>
        <div className="border rounded-lg p-3">
          Total Wards: {stats.TotalWards}
        </div>
        <div className="border rounded-lg p-3">
          ID Cards Issued: {stats.IdCardsIssued}
        </div>
      </div>

      <div className="mt-8">
        <h2>Recent Activity</h2>

        <h4>Recent Sync Batches</h4>

        <ul>
          {syncBatches.slice(0, 5).map((batch) => (
            <li key={batch.batch_id}>
              {batch.ward_id} - {batch.status}
            </li>
          ))}
        </ul>

        <h3 className="mt-4">Recent ID Card Approvals</h3>

        <ul>
          {idCards
            .filter((card) => card.status === "APPROVED")
            .slice(0, 5)
            .map((card) => (
              <li key={card.id}>
                {card.card_type} Card ({card.id})
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
