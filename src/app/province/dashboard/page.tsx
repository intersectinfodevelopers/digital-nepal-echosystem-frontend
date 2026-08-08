import citizens from "../../../../data/citizens.json";
import wards from "../../../../data/wards.json";
import municipalities from "../../../../data/municipalities.json";
import idCards from "../../../../data/id-cards.json";
import syncBatches from "../../../../data/sync-batches.json";

import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";

const stats = {
  totalCitizens: citizens.length,
  totalMunicipalities: municipalities.length,
  totalWards: wards.length,
  idCardsIssued: idCards.length,
};

const syncStatusColor = (status: string) => {
  if (status === "SYNCED" || status === "COMPLETED") {
    return "text-success";
  }

  if (status === "PENDING" || status === "IN_PROGRESS") {
    return "text-warning";
  }

  if (status === "CONFLICT" || status === "FAILED") {
    return "text-danger";
  }

  return "text-muted";
};

export default function ProvinceDashboard() {
  return (
    <div className="mx-auto w-full max-w-7xl bg-background p-4 md:p-6">
      <h1 className="text-2xl font-bold text-secondary md:text-3xl">
        Province Dashboard
      </h1>

      <div className="mt-2 rounded-md border border-warning/30 bg-warning/10 px-4 py-2 text-sm font-medium text-warning">
        Province Admin — Analytical View Only. No write access to citizen
        records.
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Citizens" value={stats.totalCitizens} />

        <StatCard
          label="Total Municipalities"
          value={stats.totalMunicipalities}
        />

        <StatCard label="Total Wards" value={stats.totalWards} />

        <StatCard label="ID Cards Issued" value={stats.idCardsIssued} />
      </div>

      <div className="mt-8">
        <Card
          accentColor="border-primary"
          header={
            <h2 className="text-lg font-semibold text-secondary">
              Recent Activity
            </h2>
          }
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted">
                Recent Sync Batches
              </h3>

              <ul className="mt-2 divide-y divide-border">
                {syncBatches.slice(0, 5).map((batch) => (
                  <li
                    key={batch.batch_id}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="text-secondary">{batch.ward_id}</span>

                    <span
                      className={`font-medium ${syncStatusColor(batch.status)}`}
                    >
                      {batch.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-muted">
                Recent ID Card Approvals
              </h3>

              <ul className="mt-2 divide-y divide-border">
                {idCards
                  .filter((card) => card.status === "APPROVED")
                  .slice(0, 5)
                  .map((card) => (
                    <li key={card.id} className="py-2 text-sm text-secondary">
                      {card.card_type} Card ({card.id})
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
