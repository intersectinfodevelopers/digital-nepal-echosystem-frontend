"use client";

import { SubmitEvent, useEffect, useMemo, useState } from "react";

import rulesData from "../../../../data/eligibility-rules.json";

interface PolicyRule {
  id: string;
  rule_name: string;
  category: string;
  description: string;
  suggested_action: string;
  suggested_deadline: string;
  province: string;
  status: string;
  note?: string;
  completed_at?: string;
}

const STORAGE_KEY = "policy_cards_state_v2";

const initialCards = rulesData as PolicyRule[];

const statusStyles: Record<string, string> = {
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  ACKNOWLEDGED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-teal-100 text-teal-800",
  COMPLETED: "bg-green-100 text-green-800",
  DISMISSED: "bg-gray-200 text-gray-700",
};

const label = (value: string) => value.replaceAll("_", " ");

export default function Page() {
  const [cards, setCards] = useState<PolicyRule[]>(initialCards);
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [province, setProvince] = useState("ALL");
  const [dialog, setDialog] = useState<{
    id: string;
    action: "complete" | "dismiss";
  } | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const savedCards = JSON.parse(saved) as PolicyRule[];
      const timeout = window.setTimeout(() => setCards(savedCards), 0);
      return () => window.clearTimeout(timeout);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const updateStatus = (
    id: string,
    nextStatus: string,
    actionNote?: string,
  ) => {
    setCards((current) => {
      const updated = current.map((card) =>
        card.id === id
          ? {
              ...card,
              status: nextStatus,
              note: actionNote ?? card.note,
              completed_at:
                nextStatus === "COMPLETED"
                  ? new Date().toISOString()
                  : card.completed_at,
            }
          : card,
      );
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const filteredCards = useMemo(
    () =>
      cards.filter(
        (card) =>
          (category === "ALL" || card.category === category) &&
          (status === "ALL" || card.status === status) &&
          (province === "ALL" || card.province === province),
      ),
    [cards, category, province, status],
  );

  const categories = [
    ...new Set([...initialCards, ...cards].map((card) => card.category)),
  ];
  const statuses = [
    ...new Set([...initialCards, ...cards].map((card) => card.status)),
  ];
  const provinces = [...new Set(cards.map((card) => card.province))];
  const monthKey = new Date().toISOString().slice(0, 7);
  const counts = {
    pending: cards.filter((card) => card.status === "PENDING_REVIEW").length,
    progress: cards.filter((card) => card.status === "IN_PROGRESS").length,
    completed: cards.filter(
      (card) =>
        card.status === "COMPLETED" && card.completed_at?.startsWith(monthKey),
    ).length,
  };

  const submitNote = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dialog || !note.trim()) return;
    updateStatus(
      dialog.id,
      dialog.action === "complete" ? "COMPLETED" : "DISMISSED",
      note.trim(),
    );
    setDialog(null);
    setNote("");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Policy action cards</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and act on policy recommendations from eligibility rules.
        </p>
      </header>

      <section
        aria-label="Policy summary"
        className="mb-6 grid gap-3 sm:grid-cols-3"
      >
        <Summary
          value={counts.pending}
          label="Pending review"
          tone="text-amber-700"
        />
        <Summary
          value={counts.progress}
          label="In progress"
          tone="text-teal-700"
        />
        <Summary
          value={counts.completed}
          label="Completed this month"
          tone="text-green-700"
        />
      </section>

      <section
        aria-label="Filters"
        className="mb-6 grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-3"
      >
        <Filter
          label="Category"
          value={category}
          onChange={setCategory}
          options={categories}
        />
        <Filter
          label="Status"
          value={status}
          onChange={setStatus}
          options={statuses}
        />
        <Filter
          label="Province"
          value={province}
          onChange={setProvince}
          options={provinces}
        />
      </section>

      {categories.map((group) => {
        const groupCards = filteredCards.filter(
          (card) => card.category === group,
        );
        if (!groupCards.length) return null;
        return (
          <section key={group} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-600">
              {group}
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {groupCards.map((card) => (
                <article
                  key={card.id}
                  className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium">
                        {card.category}
                      </span>
                      <h3 className="mt-3 text-lg font-semibold">
                        {card.rule_name}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[card.status] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {label(card.status)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {card.description}
                  </p>
                  <dl className="mt-4 grid gap-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-gray-500">
                        Suggested action
                      </dt>
                      <dd className="mt-1">{card.suggested_action}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">
                        Deadline / Province
                      </dt>
                      <dd className="mt-1">
                        {card.suggested_deadline} · {card.province}
                      </dd>
                    </div>
                  </dl>
                  {card.note && (
                    <p className="mt-3 rounded bg-gray-50 p-2 text-xs text-gray-600">
                      <strong>Note:</strong> {card.note}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Action
                      onClick={() => updateStatus(card.id, "ACKNOWLEDGED")}
                      disabled={card.status !== "PENDING_REVIEW"}
                    >
                      Acknowledge
                    </Action>
                    <Action
                      onClick={() => updateStatus(card.id, "IN_PROGRESS")}
                      disabled={[
                        "IN_PROGRESS",
                        "COMPLETED",
                        "DISMISSED",
                      ].includes(card.status)}
                    >
                      Start
                    </Action>
                    <Action
                      onClick={() =>
                        setDialog({ id: card.id, action: "complete" })
                      }
                      disabled={["COMPLETED", "DISMISSED"].includes(
                        card.status,
                      )}
                    >
                      Complete
                    </Action>
                    <Action
                      onClick={() =>
                        setDialog({ id: card.id, action: "dismiss" })
                      }
                      disabled={["COMPLETED", "DISMISSED"].includes(
                        card.status,
                      )}
                    >
                      Dismiss
                    </Action>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {!filteredCards.length && (
        <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          No policy cards match these filters.
        </p>
      )}

      {dialog && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={submitNote}
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
          >
            <h2 className="text-lg font-semibold">
              {dialog.action === "complete" ? "Complete card" : "Dismiss card"}
            </h2>
            <label
              htmlFor="action-note"
              className="mt-4 block text-sm font-medium"
            >
              {dialog.action === "complete"
                ? "Resolution note"
                : "Dismissal reason"}
            </label>
            <textarea
              id="action-note"
              required
              autoFocus
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDialog(null);
                  setNote("");
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

function Summary({
  value,
  label: text,
  tone,
}: {
  value: number;
  label: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <strong className={`text-2xl ${tone}`}>{value}</strong>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

function Filter({
  label: text,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-medium">
      {text}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2"
      >
        <option value="ALL">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {label(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Action({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
