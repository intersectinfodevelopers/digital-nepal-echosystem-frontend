"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import citizensData from "../../../../data/citizens.json";
import municipalitiesData from "../../../../data/municipalities.json";
import wardsData from "../../../../data/wards.json";

enum AnomalyType {
  DataInconsistency = "DATA_INCONSISTENCY",
  DuplicateSuspected = "DUPLICATE_SUSPECTED",
  MissingConsent = "MISSING_CONSENT",
  Other = "OTHER",
}

enum ResolutionStatus {
  Pending = "PENDING",
  Resolved = "RESOLVED",
}

interface AnomalyFlag {
  id: string;
  event_type: "FLAG_ANOMALY";
  citizen_id: string;
  anomaly_type: AnomalyType;
  note: string;
  responsible_municipality: string;
  responsible_municipality_id: string;
  flagged_at: string;
  resolution_status: ResolutionStatus;
  resolution_note?: string;
}

const STORAGE_KEY = "flag_anomalies";
const DAY_MS = 86_400_000;
const anomalyTypes = Object.values(AnomalyType);
const label = (value: string) => value.replaceAll("_", " ");

const wards = wardsData as Array<{
  id: string;
  municipality_id: string;
  ward_no: number;
  name_en: string;
}>;
const municipalities = municipalitiesData as Array<{
  id: string;
  name_en: string;
}>;

function getMunicipality(wardId: string) {
  const ward = wards.find((item) => item.id === wardId);
  const municipality = municipalities.find(
    (item) => item.id === ward?.municipality_id,
  );
  return { ward, municipality };
}

function seedFlags(): AnomalyFlag[] {
  const now = Date.now();
  return [
    {
      id: "flag-demo-pending",
      event_type: "FLAG_ANOMALY",
      citizen_id: "cit-003",
      anomaly_type: AnomalyType.DataInconsistency,
      note: "Address differs from the latest ward record.",
      responsible_municipality: "Phungling Municipality",
      responsible_municipality_id: "mun-01",
      flagged_at: new Date(now - 8 * DAY_MS).toISOString(),
      resolution_status: ResolutionStatus.Pending,
    },
    {
      id: "flag-demo-resolved",
      event_type: "FLAG_ANOMALY",
      citizen_id: "cit-002",
      anomaly_type: AnomalyType.DuplicateSuspected,
      note: "Possible duplicate household member.",
      responsible_municipality: "Phungling Municipality",
      responsible_municipality_id: "mun-01",
      flagged_at: new Date(now - 3 * DAY_MS).toISOString(),
      resolution_status: ResolutionStatus.Resolved,
      resolution_note: "Verified as two different citizens by the ward office.",
    },
  ];
}

export default function FlagAnomalyPage() {
  const [nidLastFour, setNidLastFour] = useState("");
  const [wardNumber, setWardNumber] = useState("");
  const [searched, setSearched] = useState(false);
  const [citizenId, setCitizenId] = useState<string | null>(null);
  const [anomalyType, setAnomalyType] = useState<AnomalyType>(
    AnomalyType.DataInconsistency,
  );
  const [note, setNote] = useState("");
  const [flags, setFlags] = useState<AnomalyFlag[]>([]);
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(0);

  const loadFlags = useCallback(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setFlags(JSON.parse(saved) as AnomalyFlag[]);
        return;
      }
      const initial = seedFlags();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      setFlags(initial);
    } catch {
      setFlags([]);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadFlags();
      setNow(Date.now());
    }, 0);
    window.addEventListener("storage", loadFlags);
    window.addEventListener("focus", loadFlags);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("storage", loadFlags);
      window.removeEventListener("focus", loadFlags);
    };
  }, [loadFlags]);

  const citizen = useMemo(
    () => citizensData.find((item) => item.id === citizenId) ?? null,
    [citizenId],
  );
  const location = citizen ? getMunicipality(citizen.ward_id) : null;

  function searchCitizen(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const match = citizensData.find((item) => {
      const ward = wards.find((entry) => entry.id === item.ward_id);
      return (
        item.nid_masked.endsWith(nidLastFour) &&
        ward?.ward_no === Number(wardNumber)
      );
    });
    setCitizenId(match?.id ?? null);
    setSearched(true);
    setMessage("");
  }

  function createFlag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!citizen || !location?.municipality || !note.trim()) return;

    const newFlag: AnomalyFlag = {
      id: `flag-${Date.now()}`,
      event_type: "FLAG_ANOMALY",
      citizen_id: citizen.id,
      anomaly_type: anomalyType,
      note: note.trim(),
      responsible_municipality: location.municipality.name_en,
      responsible_municipality_id: location.municipality.id,
      flagged_at: new Date().toISOString(),
      resolution_status: ResolutionStatus.Pending,
    };
    const updated = [newFlag, ...flags];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setFlags(updated);
    setNote("");
    setMessage(
      `Flag routed to ${location.municipality.name_en} Local Body Admin.`,
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Flag anomaly</h1>
        <p className="mt-1 text-sm text-gray-500">
          Send citizen record issues to the responsible local body.
        </p>
      </header>

      <section className="mb-8 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Flag new anomaly</h2>
        <form
          onSubmit={searchCitizen}
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <Field label="NID last 4 digits">
            <input
              required
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              value={nidLastFour}
              onChange={(event) =>
                setNidLastFour(event.target.value.replace(/\D/g, ""))
              }
              placeholder="e.g. 5678"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
            />
          </Field>
          <Field label="Ward number">
            <input
              required
              type="number"
              min="1"
              value={wardNumber}
              onChange={(event) => setWardNumber(event.target.value)}
              placeholder="e.g. 4"
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
            />
          </Field>
          <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            Search
          </button>
        </form>

        {searched && !citizen && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            No citizen matched that masked NID and ward.
          </p>
        )}

        {citizen && location?.ward && location.municipality && (
          <form
            onSubmit={createFlag}
            className="mt-5 border-t border-gray-100 pt-5"
          >
            <p className="mb-4 text-sm">
              <strong>{citizen.name_en.split(" ")[0]}</strong> · Ward{" "}
              {location.ward.ward_no}
              <span className="text-gray-500">
                {" "}
                · {location.municipality.name_en}
              </span>
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Anomaly type">
                <select
                  value={anomalyType}
                  onChange={(event) =>
                    setAnomalyType(event.target.value as AnomalyType)
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2"
                >
                  {anomalyTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </Field>
              <Field label="Note">
                <textarea
                  required
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="mt-1 min-h-20 w-full rounded-md border border-gray-300 p-2"
                  placeholder="Briefly describe the issue"
                />
              </Field>
            </div>
            <button className="mt-3 rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800">
              Flag and route
            </button>
            {message && (
              <p className="mt-3 text-sm text-green-700">{message}</p>
            )}
          </form>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Flagged items</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
              <tr>
                <th className="p-3">Anomaly type</th>
                <th className="p-3">Responsible municipality</th>
                <th className="p-3">Flagged at</th>
                <th className="p-3">Days pending</th>
                <th className="p-3">Resolution status</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => {
                const days = Math.max(
                  0,
                  Math.floor(
                    (now - new Date(flag.flagged_at).getTime()) / DAY_MS,
                  ),
                );
                const overdue =
                  flag.resolution_status !== ResolutionStatus.Resolved &&
                  days >= 7;
                return (
                  <tr
                    key={flag.id}
                    className={`border-t border-gray-100 ${overdue ? "bg-amber-50" : ""}`}
                  >
                    <td className="p-3 font-medium">
                      {label(flag.anomaly_type)}
                    </td>
                    <td className="p-3">{flag.responsible_municipality}</td>
                    <td className="p-3 whitespace-nowrap">
                      {new Date(flag.flagged_at).toLocaleString()}
                    </td>
                    <td
                      className={`p-3 ${overdue ? "font-semibold text-amber-800" : ""}`}
                    >
                      {flag.resolution_status === ResolutionStatus.Resolved
                        ? "—"
                        : days}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${flag.resolution_status === ResolutionStatus.Resolved ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}
                      >
                        {flag.resolution_status}
                      </span>
                      {overdue && (
                        <p className="mt-2 text-xs font-medium text-amber-800">
                          Auto-escalating to Data Governance Board
                        </p>
                      )}
                      {flag.resolution_note && (
                        <p className="mt-2 text-xs text-gray-600">
                          {flag.resolution_note}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!flags.length && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No anomalies flagged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Field({
  label: text,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {text}
      {children}
    </label>
  );
}
