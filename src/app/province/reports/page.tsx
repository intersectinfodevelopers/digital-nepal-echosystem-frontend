"use client";

import citizens from "../../../../data/citizens.json";
import wards from "../../../../data/wards.json";
import municipalities from "../../../../data/municipalities.json";
import grievances from "../../../../data/grievances.json";
import idCards from "../../../../data/id-cards.json";

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
const sectionStyle = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 20,
  marginBottom: 30,
  background: "#fff",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  marginTop: 12,
};

const cell = {
  border: "1px solid #ccc",
  padding: 8,
  textAlign: "left" as const,
};
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

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        <strong> Province Reports</strong>
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
          gap: 16,
          marginBottom: 30,
        }}
      >
        <div style={sectionStyle}>
          <strong>Total Citizens</strong>
          <h2>{citizensData.length}</h2>
        </div>

        <div style={sectionStyle}>
          <strong>Municipalities</strong>
          <h2>{municipalitiesData.length}</h2>
        </div>

        <div style={sectionStyle}>
          <strong>Wards</strong>
          <h2>{wardsData.length}</h2>
        </div>

        <div style={sectionStyle}>
          <strong>Grievances</strong>
          <h2>{grievancesData.length}</h2>
        </div>

        <div style={sectionStyle}>
          <strong>ID Cards</strong>
          <h2>{idCardsData.length}</h2>
        </div>
      </div>

      <section style={sectionStyle}>
        <h2>Province Population Report</h2>

        <button onClick={printReport}>Print Report</button>

        <h3>Population by Ward</h3>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cell}>Ward</th>
              <th style={cell}>Population</th>
            </tr>
          </thead>

          <tbody>
            {populationByWard.map((ward) => (
              <tr key={ward.id}>
                <td style={cell}>{ward.ward}</td>
                <td style={cell}>{ward.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ marginTop: 24 }}>
          <strong>Population by Municipality</strong>
        </h3>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cell}>Municipality</th>
              <th style={cell}>Population</th>
            </tr>
          </thead>

          <tbody>
            {populationByMunicipality.map((municipality) => (
              <tr key={municipality.id}>
                <td style={cell}>{municipality.municipality}</td>
                <td style={cell}>{municipality.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ marginTop: 24 }}>Sex Distribution</h3>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cell}>Sex</th>
              <th style={cell}>Count</th>
            </tr>
          </thead>

          <tbody>
            {sexDistribution.map((sex) => (
              <tr key={sex.sex}>
                <td style={cell}>{sex.sex}</td>
                <td style={cell}>{sex.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ marginTop: 24 }}>Age Bands</h3>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cell}>Age Group</th>
              <th style={cell}>Population</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(ageBands).map(([band, total]) => (
              <tr key={band}>
                <td style={cell}>{band}</td>
                <td style={cell}>{total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={sectionStyle}>
        <h2>Grievance Resolution Report</h2>

        <button onClick={printReport} style={{ marginBottom: 16 }}>
          Print Report
        </button>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cell}>Municipality</th>
              <th style={cell}>Received</th>
              <th style={cell}>Resolved</th>
              <th style={cell}>Pending</th>
              <th style={cell}>SLA Breach Rate</th>
            </tr>
          </thead>

          <tbody>
            {grievanceReport.map((report) => (
              <tr key={report.id}>
                <td style={cell}>{report.municipality}</td>
                <td style={cell}>{report.received}</td>
                <td style={cell}>{report.resolved}</td>
                <td style={cell}>{report.pending}</td>
                <td style={cell}>{report.sla}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={sectionStyle}>
        <h2>ID Card Report</h2>

        <button onClick={printReport} style={{ marginBottom: 16 }}>
          Print Report
        </button>

        <h3>By Card Type</h3>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cell}>Card Type</th>
              <th style={cell}>Initiated</th>
              <th style={cell}>Approved</th>
              <th style={cell}>Collected</th>
            </tr>
          </thead>

          <tbody>
            {cardReport.map((card) => (
              <tr key={card.type}>
                <td style={cell}>{card.type}</td>
                <td style={cell}>{card.initiated}</td>
                <td style={cell}>{card.approved}</td>
                <td style={cell}>{card.collected}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ marginTop: 24 }}>By Municipality</h3>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cell}>Municipality</th>
              <th style={cell}>Initiated</th>
              <th style={cell}>Approved</th>
              <th style={cell}>Collected</th>
            </tr>
          </thead>

          <tbody>
            {idCardMunicipalityReport.map((report) => (
              <tr key={report.id}>
                <td style={cell}>{report.municipality}</td>
                <td style={cell}>{report.initiated}</td>
                <td style={cell}>{report.approved}</td>
                <td style={cell}>{report.collected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
