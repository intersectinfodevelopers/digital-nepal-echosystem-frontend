"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { DiffViewer } from "@/components/ui/DiffViewer";
import editApprovals from "../../../../../data/edit-approvals.json";
import citizens from "../../../../../data/citizens.json";
import users from "../../../../../data/users.json";
import wards from "../../../../../data/wards.json";

type Approval = {
  id: string;
  citizen_id: string;
  submitter_id: string;
  status: string;
  old_value_json: Record<string, unknown>;
  new_value_json: Record<string, unknown>;
  submitted_at: string;
  escalated_at?: string;
  rejection_reason?: string;
};

const LOCAL_STORAGE_KEY = "edit-approvals";

// Initial data comes from edit-approvals.json.
const initialApprovals = editApprovals as unknown as Approval[];

function addBusinessDays(dateValue: string, daysToAdd: number) {
  const date = new Date(dateValue);
  let addedDays = 0;

  while (addedDays < daysToAdd) {
    date.setDate(date.getDate() + 1);

    const day = date.getDay();
    const isSaturday = day === 6;
    const isSunday = day === 0;

    if (!isSaturday && !isSunday) {
      addedDays++;
    }
  }

  return date.toISOString();
}

function getStatusLabel(status: string) {
  if (status === "PENDING_APPROVAL") {
    return "Pending approval";
  }

  if (status === "CAO_REVIEW") {
    return "CAO review";
  }

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ApprovalDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  // approvals is now stored in state because later approve/reject will update it.
  // We load from localStorage here to avoid calling setState directly inside useEffect.
  const [approvals, setApprovals] = useState<Approval[]>(() => {
    if (typeof window === "undefined") {
      return initialApprovals;
    }

    const storedApprovals = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (storedApprovals) {
      try {
        return JSON.parse(storedApprovals) as Approval[];
      } catch {
        return initialApprovals;
      }
    }

    return initialApprovals;
  });

  // Controls the approve confirmation modal.
  const [showApproveModal, setShowApproveModal] = useState(false);
  // Controls the reject modal.
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Stores the rejection reason typed by the reviewer.
  const [rejectionReason, setRejectionReason] = useState("");

  // Stores temporary success/error message shown on screen.
  const [toastMessage, setToastMessage] = useState("");

  // Load mock approval data into localStorage.
  // If localStorage is empty, use edit-approvals.json as the starting data.
  useEffect(() => {
    const storedApprovals = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!storedApprovals) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialApprovals));
    }
  }, []);

  const approval = approvals.find((item) => item.id === id);

  if (!approval) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Approval not found</h1>
      </main>
    );
  }

  const citizen = citizens.find((item) => item.id === approval.citizen_id);

  const submitter = users.find((item) => item.id === approval.submitter_id);

  const ward = wards.find((item) => item.id === citizen?.ward_id);

  const oldValues = approval.old_value_json as Record<string, unknown>;
  const newValues = approval.new_value_json as Record<string, unknown>;

  const changedFields = Array.from(
    new Set([...Object.keys(oldValues), ...Object.keys(newValues)]),
  );
  const diffChanges = changedFields.map((field) => ({
    field,
    oldValue: oldValues[field],
    newValue: newValues[field],
  }));

  const currentUserId = "user-municipality";
  const isSelfApproval = approval.submitter_id === currentUserId;
  const isFinalStatus =
    approval.status === "APPROVED" || approval.status === "REJECTED";
  const escalationDate =
    approval.escalated_at ?? addBusinessDays(approval.submitted_at, 5);
  const hasReachedEscalation =
    Boolean(approval.escalated_at) || approval.status === "CAO_REVIEW";
  const escalationTimeline = [
    {
      title: "Submitted",
      description: `Request submitted by ${submitter?.full_name ?? "Unknown User"}.`,
      time: approval.submitted_at,
      isComplete: true,
    },
    {
      title: "Pending 5 days",
      description: "Municipality review window before CAO escalation.",
      time: escalationDate,
      isComplete: hasReachedEscalation,
    },
    {
      title: "Auto-escalated to CAO",
      description: hasReachedEscalation
        ? "Request moved to CAO review after the pending window."
        : "Scheduled if municipality review is not completed in time.",
      time: hasReachedEscalation ? escalationDate : "Upcoming",
      isComplete: hasReachedEscalation,
    },
    {
      title: "Current",
      description: getStatusLabel(approval.status),
      time: isFinalStatus ? getStatusLabel(approval.status) : "Now",
      isComplete: true,
      isCurrent: true,
    },
  ];

  function handleApproveConfirm() {
    const updatedApprovals = approvals.map((item) => {
      if (item.id !== approval?.id) {
        return item;
      }

      return {
        ...item,
        status: "APPROVED",
      };
    });

    setApprovals(updatedApprovals);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedApprovals));
    setShowApproveModal(false);

    // Show toast after successful approval.
    setToastMessage("Edit request approved successfully.");

    // Navigate back to approvals list after user sees the toast.
    setTimeout(() => {
      router.push("/municipality/approvals");
    }, 900);
  }
  function handleRejectSubmit() {
    if (!rejectionReason.trim()) {
      setToastMessage("Please enter a rejection reason.");
      return;
    }

    const updatedApprovals = approvals.map((item) => {
      if (item.id !== approval?.id) {
        return item;
      }

      return {
        ...item,
        status: "REJECTED",
        rejection_reason: rejectionReason.trim(),
      };
    });

    setApprovals(updatedApprovals);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedApprovals));

    setShowRejectModal(false);
    setRejectionReason("");

    // Show toast after successful rejection.
    setToastMessage("Edit request rejected successfully.");

    // Navigate back to approvals list after user sees the toast.
    setTimeout(() => {
      router.push("/municipality/approvals");
    }, 900);
  }

  return (
    <main className="p-6">
      {toastMessage && (
        <div className="fixed right-6 top-6 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toastMessage}
        </div>
      )}
      <h1 className="text-2xl font-bold">Approval Detail Page</h1>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Citizen
            </p>
            <p className="mt-1 font-medium text-slate-900">
              {citizen?.name_en}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Ward
            </p>
            <p className="mt-1 font-medium text-slate-900">{ward?.name_en}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Submitted By
            </p>
            <p className="mt-1 font-medium text-slate-900">
              {submitter?.full_name}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Submitted At
            </p>
            <p className="mt-1 font-medium text-slate-900">
              {approval.submitted_at}
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Reason
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {approval.rejection_reason ?? "Not provided"}
          </p>
        </div>
      </section>

      {hasReachedEscalation && (
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Escalation History
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Timeline from submission through the five-day review window and
              CAO escalation.
            </p>
          </div>

          <ol className="mt-6 space-y-0">
            {escalationTimeline.map((item, index) => (
              <li
                key={item.title}
                className="relative flex gap-4 pb-6 last:pb-0"
              >
                {index < escalationTimeline.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-[11px] top-7 h-full w-px ${
                      item.isComplete ? "bg-blue-200" : "bg-slate-200"
                    }`}
                  />
                )}

                <span
                  className={`relative z-10 mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    item.isCurrent
                      ? "border-blue-600 bg-blue-600 text-white"
                      : item.isComplete
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3
                      className={`text-sm font-semibold ${
                        item.isComplete ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs font-medium text-slate-500">
                      {item.time}
                    </p>
                  </div>

                  <p className="mt-1 text-sm text-slate-600">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Edit Difference
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Compare the existing citizen data with the newly submitted changes.
          </p>
        </div>

        <div className="p-5">
          <DiffViewer changes={diffChanges} />
        </div>
      </section>

      <section className="mt-8 flex gap-3">
        <span
          title={
            isFinalStatus
              ? "Finalized requests cannot be changed"
              : isSelfApproval
                ? "You cannot approve your own edit"
                : undefined
          }
        >
          <button
            type="button"
            disabled={isSelfApproval || isFinalStatus}
            onClick={() => setShowApproveModal(true)}
            className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Approve
          </button>
        </span>

        <span
          title={
            isFinalStatus ? "Finalized requests cannot be changed" : undefined
          }
        >
          <button
            type="button"
            disabled={isFinalStatus}
            onClick={() => setShowRejectModal(true)}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Reject
          </button>
        </span>
      </section>

      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Confirm Approval
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to approve this edit request?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApproveConfirm}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Confirm Approve
              </button>
            </div>
          </div>
        </div>
      )}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Reject Edit Request
            </h2>

            <p className="mt-2 text-sm text-black">
              Please provide a reason for rejecting this edit request.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Enter rejection reason..."
              className="mt-4 min-h-28 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-red-500"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRejectSubmit}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
