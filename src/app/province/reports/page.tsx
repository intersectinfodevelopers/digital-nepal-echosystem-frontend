"use client";

import citizens from "../../../../data/citizens.json";
import wards from "../../../../data/wards.json";
import municipalities from "../../../../data/municipalities.json";
import grievances from "../../../../data/grievances.json";
import idCards from "../../../../data/id-cards.json";
import Table from "@/components/ui/Table";

interface Citizen {
  id: string;
  ward_id: string;
  dob: string;
  sex: "MALE" | "FEMALE" | "OTHER";
}

interface Ward {
  id: string;
  municipality_id: string;
  name_en: string;
}

interface Municipality {
  id: string;
  name_en: string;
}

interface Grievance {
  citizen_id: string;
  status: string;
  filed_at: string;
}

interface IdCard {
  id: string;
  citizen_id: string;
  card_type: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "COLLECTED";
  qr_hash: string;
  issued_at: string | null;
  expires_at: string | null;
  collected_at: string | null;
}

interface PopulationByWard {
  id: string;
  ward: string;
  total: number;
}

interface PopulationByMunicipality {
  id: string;
  municipality: string;
  total: number;
}

interface SexDistribution {
  sex: string;
  total: number;
}

interface AgeBandRow {
  band: string;
  total: number;
}

interface GrievanceReport {
  id: string;
  municipality: string;
  received: number;
  resolved: number;
  pending: number;
  sla: string;
}

interface CardReport {
  type: string;
  initiated: number;
  approved: number;
  collected: number;
}

interface MunicipalityCardReport {
  id: string;
  municipality: string;
  initiated: number;
  approved: number;
  collected: number;
}

const citizensData = citizens as Citizen[];
const wardsData = wards as Ward[];
const municipalitiesData = municipalities as Municipality[];
const grievancesData = grievances as Grievance[];
const idCardsData = idCards as IdCard[];

export default function ProvinceReportsPage() {
  const printReport = () => window.print();

  const getAge = (dob: string) => {
    const today = new Date();
    const birth = new Date(dob);

    let age = today.getFullYear() - birth.getFullYear();

    const month = today.getMonth() - birth.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const getMunicipalityCitizenIds = (municipalityId: string): string[] => {
    const wardIds = wardsData
      .filter((ward) => ward.municipality_id === municipalityId)
      .map((ward) => ward.id);

    return citizensData
      .filter((citizen) => wardIds.includes(citizen.ward_id))
      .map((citizen) => citizen.id);
  };

  const populationByWard: PopulationByWard[] = wardsData.map((ward) => ({
    id: ward.id,
    ward: ward.name_en,
    total: citizensData.filter((c) => c.ward_id === ward.id).length,
  }));

  const populationByMunicipality: PopulationByMunicipality[] =
    municipalitiesData.map((municipality) => {
      const citizenIds = getMunicipalityCitizenIds(municipality.id);

      return {
        id: municipality.id,
        municipality: municipality.name_en,
        total: citizenIds.length,
      };
    });

  const sexDistribution: SexDistribution[] = ["MALE", "FEMALE", "OTHER"].map(
    (sex) => ({
      sex,
      total: citizensData.filter((c) => c.sex === sex).length,
    }),
  );

  const ageBands = {
    "0-17": 0,
    "18-35": 0,
    "36-60": 0,
    "60+": 0,
  };

  citizensData.forEach((citizen) => {
    const age = getAge(citizen.dob);

    if (age <= 17) ageBands["0-17"]++;
    else if (age <= 35) ageBands["18-35"]++;
    else if (age <= 60) ageBands["36-60"]++;
    else ageBands["60+"]++;
  });

  const ageBandRows: AgeBandRow[] = Object.entries(ageBands).map(
    ([band, total]) => ({ band, total }),
  );

  const grievanceReport: GrievanceReport[] = municipalitiesData.map(
    (municipality) => {
      const citizenIds = getMunicipalityCitizenIds(municipality.id);

      const municipalityGrievances = grievancesData.filter((g) =>
        citizenIds.includes(g.citizen_id),
      );

      const received = municipalityGrievances.length;

      const resolved = municipalityGrievances.filter((g) =>
        ["RESOLVED", "CLOSED", "RESOLVED_WARD", "COMPLETED"].includes(g.status),
      ).length;

      const pending = received - resolved;

      const slaBreached = municipalityGrievances.filter((g) => {
        const filed = new Date(g.filed_at);

        const diff = (Date.now() - filed.getTime()) / (1000 * 60 * 60 * 24);

        return diff > 15;
      }).length;

      return {
        id: municipality.id,
        municipality: municipality.name_en,
        received,
        resolved,
        pending,
        sla:
          received === 0
            ? "0%"
            : `${((slaBreached / received) * 100).toFixed(1)}%`,
      };
    },
  );

  const cardTypes = [...new Set(idCardsData.map((card) => card.card_type))];

  const cardReport: CardReport[] = cardTypes.map((type) => {
    const cards = idCardsData.filter((card) => card.card_type === type);

    return {
      type,
      initiated: cards.filter((c) => c.status === "PENDING_APPROVAL").length,
      approved: cards.filter((c) => c.status === "APPROVED").length,
      collected: cards.filter((c) => c.status === "COLLECTED").length,
    };
  });

  const idCardMunicipalityReport: MunicipalityCardReport[] =
    municipalitiesData.map((municipality) => {
      const citizenIds = getMunicipalityCitizenIds(municipality.id);

      const cards = idCardsData.filter((card) =>
        citizenIds.includes(card.citizen_id),
      );

      return {
        id: municipality.id,
        municipality: municipality.name_en,
        initiated: cards.filter((c) => c.status === "PENDING_APPROVAL").length,
        approved: cards.filter((c) => c.status === "APPROVED").length,
        collected: cards.filter((c) => c.status === "COLLECTED").length,
      };
    });

  const summaryCards = [
    { label: "Total Citizens", value: citizensData.length },
    { label: "Municipalities", value: municipalitiesData.length },
    { label: "Wards", value: wardsData.length },
    { label: "Grievances", value: grievancesData.length },
    { label: "ID Cards", value: idCardsData.length },
  ];

  return (
    <div className="mx-auto max-w-6xl bg-background p-6">
      <h1 className="mb-6 text-center text-2xl font-bold text-secondary">
        Province Reports
      </h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-surface p-4 shadow-card"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-secondary">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mb-8 rounded-lg border border-border bg-surface p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary">
            Province Population Report
          </h2>
          <button
            onClick={printReport}
            className="print:hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-card hover:bg-primary/90 transition-colors"
          >
            Print Report
          </button>
        </div>

        <h3 className="mb-2 text-sm font-medium text-muted uppercase tracking-wide">
          Population by Ward
        </h3>
        <Table
          columns={[
            { key: "ward", header: "Ward" },
            { key: "total", header: "Population" },
          ]}
          data={populationByWard}
          keyExtractor={(row) => row.id}
        />

        <h3 className="mb-2 mt-6 text-sm font-medium text-muted uppercase tracking-wide">
          Population by Municipality
        </h3>
        <Table
          columns={[
            { key: "municipality", header: "Municipality" },
            { key: "total", header: "Population" },
          ]}
          data={populationByMunicipality}
          keyExtractor={(row) => row.id}
        />

        <h3 className="mb-2 mt-6 text-sm font-medium text-muted uppercase tracking-wide">
          Sex Distribution
        </h3>
        <Table
          columns={[
            { key: "sex", header: "Sex" },
            { key: "total", header: "Count" },
          ]}
          data={sexDistribution}
          keyExtractor={(row) => row.sex}
        />

        <h3 className="mb-2 mt-6 text-sm font-medium text-muted uppercase tracking-wide">
          Age Bands
        </h3>
        <Table
          columns={[
            { key: "band", header: "Age Group" },
            { key: "total", header: "Population" },
          ]}
          data={ageBandRows}
          keyExtractor={(row) => row.band}
        />
      </section>

      <section className="mb-8 rounded-lg border border-border bg-surface p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary">
            Grievance Resolution Report
          </h2>
          <button
            onClick={printReport}
            className="print:hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-card hover:bg-primary/90 transition-colors"
          >
            Print Report
          </button>
        </div>

        <Table
          columns={[
            { key: "municipality", header: "Municipality" },
            { key: "received", header: "Received" },
            { key: "resolved", header: "Resolved" },
            { key: "pending", header: "Pending" },
            {
              key: "sla",
              header: "SLA Breach Rate",
              render: (row) => (
                <span className="font-medium text-danger">{row.sla}</span>
              ),
            },
          ]}
          data={grievanceReport}
          keyExtractor={(row) => row.id}
        />
      </section>

      <section className="rounded-lg border border-border bg-surface p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary">
            ID Card Report
          </h2>
          <button
            onClick={printReport}
            className="print:hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-card hover:bg-primary/90 transition-colors"
          >
            Print Report
          </button>
        </div>

        <h3 className="mb-2 text-sm font-medium text-muted uppercase tracking-wide">
          By Card Type
        </h3>
        <Table
          columns={[
            { key: "type", header: "Card Type" },
            { key: "initiated", header: "Initiated" },
            { key: "approved", header: "Approved" },
            { key: "collected", header: "Collected" },
          ]}
          data={cardReport}
          keyExtractor={(row) => row.type}
        />

        <h3 className="mb-2 mt-6 text-sm font-medium text-muted uppercase tracking-wide">
          By Municipality
        </h3>
        <Table
          columns={[
            { key: "municipality", header: "Municipality" },
            { key: "initiated", header: "Initiated" },
            { key: "approved", header: "Approved" },
            { key: "collected", header: "Collected" },
          ]}
          data={idCardMunicipalityReport}
          keyExtractor={(row) => row.id}
        />
      </section>
    </div>
  );
}
