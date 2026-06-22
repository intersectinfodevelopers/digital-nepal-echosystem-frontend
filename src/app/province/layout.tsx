"use client";

import citizens from "../../../data/citizens.json";
import wards from "../../../data/wards.json";
import municipalities from "../../../data/municipalities.json";
import grievances from "../../../data/grievances.json";
import idCards from "../../../data/id-cards.json";

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

  const getMunicipalityCitizenIds = (municipalityId: string) => {
    const wardIds = wards
      .filter((ward: any) => ward.municipality_id === municipalityId)
      .map((ward: any) => ward.id);

    return citizens
      .filter((citizen: any) => wardIds.includes(citizen.ward_id))
      .map((citizen: any) => citizen.id);
  };

  const populationByWard = wards.map((ward: any) => ({
    id: ward.id,
    ward: ward.name_en,
    total: citizens.filter((c: any) => c.ward_id === ward.id).length,
  }));

  const populationByMunicipality = municipalities.map((municipality: any) => {
    const citizenIds = getMunicipalityCitizenIds(municipality.id);

    return {
      id: municipality.id,
      municipality: municipality.name_en,
      total: citizenIds.length,
    };
  });

  const sexDistribution = ["MALE", "FEMALE", "OTHER"].map((sex) => ({
    sex,
    total: citizens.filter((c: any) => c.sex === sex).length,
  }));

  const ageBands = {
    "0-17": 0,
    "18-35": 0,
    "36-60": 0,
    "60+": 0,
  };

  citizens.forEach((citizen: any) => {
    const age = getAge(citizen.dob);

    if (age <= 17) ageBands["0-17"]++;
    else if (age <= 35) ageBands["18-35"]++;
    else if (age <= 60) ageBands["36-60"]++;
    else ageBands["60+"]++;
  });

  const grievanceReport = municipalities.map((municipality: any) => {
    const citizenIds = getMunicipalityCitizenIds(municipality.id);

    const municipalityGrievances = grievances.filter((g: any) =>
      citizenIds.includes(g.citizen_id),
    );

    const received = municipalityGrievances.length;

    const resolved = municipalityGrievances.filter((g: any) =>
      ["RESOLVED", "CLOSED", "RESOLVED_WARD", "COMPLETED"].includes(g.status),
    ).length;

    const pending = received - resolved;

    const slaBreached = municipalityGrievances.filter((g: any) => {
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
  });

  const cardTypes = [...new Set(idCards.map((card: any) => card.card_type))];

  const cardReport = cardTypes.map((type) => {
    const cards = idCards.filter((card: any) => card.card_type === type);

    return {
      type,
      initiated: cards.filter((c: any) => c.status === "PENDING_APPROVAL")
        .length,
      approved: cards.filter((c: any) => c.status === "APPROVED").length,
      collected: cards.filter((c: any) => c.status === "COLLECTED").length,
    };
  });

  const idCardMunicipalityReport = municipalities.map((municipality: any) => {
    const citizenIds = getMunicipalityCitizenIds(municipality.id);

    const cards = idCards.filter((card: any) =>
      citizenIds.includes(card.citizen_id),
    );

    return {
      id: municipality.id,
      municipality: municipality.name_en,
      initiated: cards.filter((c: any) => c.status === "PENDING_APPROVAL")
        .length,
      approved: cards.filter((c: any) => c.status === "APPROVED").length,
      collected: cards.filter((c: any) => c.status === "COLLECTED").length,
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
          <h2>{citizens.length}</h2>
        </div>

        <div style={sectionStyle}>
          <strong>Municipalities</strong>
          <h2>{municipalities.length}</h2>
        </div>

        <div style={sectionStyle}>
          <strong>Wards</strong>
          <h2>{wards.length}</h2>
        </div>

        <div style={sectionStyle}>
          <strong>Grievances</strong>
          <h2>{grievances.length}</h2>
        </div>

        <div style={sectionStyle}>
          <strong>ID Cards</strong>
          <h2>{idCards.length}</h2>
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
