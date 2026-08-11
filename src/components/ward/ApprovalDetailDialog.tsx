"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Chip,
} from "@mui/material";
import { Close, Check, Block, AttachmentOutlined } from "@mui/icons-material";
import { useState } from "react";
import { updateApprovalStatus, getApprovalItem } from "@/services/mockWardAdmin";
import { useWardAdminStore } from "@/hooks/useWardAdminStore";
import type { ApprovalItem } from "@/types/ward";

const statusTone: Record<ApprovalItem["status"], string> = {
  pending: "bg-[#FFF3E8] text-[#F97316]",
  approved: "bg-[#E9F8EF] text-[#16A34A]",
  rejected: "bg-[#FDE8E8] text-[#EF4444]",
};

interface ApprovalDetailDialogProps {
  wardId: string;
  item: ApprovalItem;
  onClose: () => void;
}

export default function ApprovalDetailDialog({ wardId, item, onClose }: ApprovalDetailDialogProps) {
  useWardAdminStore();
  const [remarks, setRemarks] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [confirmAction, setConfirmAction] = useState<"approved" | "rejected" | null>(null);

  const current = getApprovalItem(wardId, item.id) ?? item;

  const handleApprove = () => {
    updateApprovalStatus(wardId, current.id, "approved", remarks || undefined);
    setConfirmAction(null);
  };

  const handleReject = () => {
    updateApprovalStatus(wardId, current.id, "rejected", rejectReason || "Rejected by ward admin");
    setConfirmAction(null);
  };

  return (
    <>
      <Dialog open onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "18px" } } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1 }}>
          <span className="text-[15px] font-bold text-[#374151]">Application Detail</span>
          <IconButton onClick={onClose} aria-label="Close">
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-[#0A3E9E]">{current.citizen_name}</p>
                <p className="text-xs text-[#6B7280]">{current.application_type}</p>
              </div>
              <Chip
                label={current.status.charAt(0).toUpperCase() + current.status.slice(1)}
                sx={{ backgroundColor: "#FFF3E8", color: "#F97316", fontWeight: 600, fontSize: 12, height: 26 }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-[#F8F9FA] p-3">
                <p className="text-[11px] uppercase text-[#9CA3AF]">Application No.</p>
                <p className="mt-0.5 font-medium text-[#374151]">{current.application_number}</p>
              </div>
              <div className="rounded-xl bg-[#F8F9FA] p-3">
                <p className="text-[11px] uppercase text-[#9CA3AF]">Ward</p>
                <p className="mt-0.5 font-medium text-[#374151]">Ward {current.ward_number}</p>
              </div>
              <div className="rounded-xl bg-[#F8F9FA] p-3">
                <p className="text-[11px] uppercase text-[#9CA3AF]">Submitted</p>
                <p className="mt-0.5 font-medium text-[#374151]">
                  {new Date(current.submitted_date).toLocaleDateString()}
                </p>
              </div>
              <div className="rounded-xl bg-[#F8F9FA] p-3">
                <p className="text-[11px] uppercase text-[#9CA3AF]">Status</p>
                <p className={`mt-0.5 font-medium ${statusTone[current.status].split(" ")[1]}`}>
                  {current.status}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[13px] font-semibold text-[#374151]">Uploaded Documents</p>
              <div className="space-y-1.5">
                {current.documents?.length ? (
                  current.documents.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg border border-[#e6e8ee] px-3 py-2 text-left text-[13px] text-[#0A3E9E] hover:bg-[#F8F9FA]"
                    >
                      <AttachmentOutlined sx={{ fontSize: 16 }} /> {d.name}
                    </button>
                  ))
                ) : (
                  <p className="rounded-lg bg-[#F8F9FA] px-3 py-2 text-[13px] text-[#9CA3AF]">
                    Citizenship photo, NID scan (demo placeholders)
                  </p>
                )}
              </div>
            </div>

            {(current.status === "approved" || current.status === "rejected") && current.remarks && (
              <div>
                <p className="mb-1 text-[13px] font-semibold text-[#374151]">Remarks</p>
                <p className="rounded-lg bg-[#F8F9FA] px-3 py-2 text-[13px] text-[#374151]">{current.remarks}</p>
              </div>
            )}

            {current.status === "pending" && (
              <>
                <TextField
                  label="Remarks (optional)"
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
                <TextField
                  label="Rejection reason (if rejecting)"
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </>
            )}
          </div>
        </DialogContent>

        {current.status === "pending" && (
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={() => setConfirmAction("rejected")}
              startIcon={<Block sx={{ fontSize: 18 }} />}
              sx={{ textTransform: "none", borderRadius: "10px", py: 1 }}
            >
              Reject
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setConfirmAction("approved")}
              startIcon={<Check sx={{ fontSize: 18 }} />}
              sx={{ textTransform: "none", borderRadius: "10px", py: 1, bgcolor: "#0A3E9E", ":hover": { bgcolor: "#083078" } }}
            >
              Approve
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Confirmation */}
      <Dialog open={confirmAction !== null} onClose={() => setConfirmAction(null)} slotProps={{ paper: { sx: { borderRadius: "16px", width: 320 } } }}>
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <p className="text-base font-semibold text-[#374151]">
            {confirmAction === "approved" ? "Approve this application?" : "Reject this application?"}
          </p>
          <p className="mt-1 text-sm text-[#6B7280]">
            {confirmAction === "approved"
              ? "The application will move to Approved and dashboard updates immediately."
              : "A rejection reason will be stored with the application."}
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmAction(null)} sx={{ textTransform: "none", color: "#6B7280" }}>
            Cancel
          </Button>
          <Button
            onClick={confirmAction === "approved" ? handleApprove : handleReject}
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              bgcolor: confirmAction === "approved" ? "#0A3E9E" : "#EF4444",
              ":hover": { bgcolor: confirmAction === "approved" ? "#083078" : "#DC2626" },
            }}
          >
            {confirmAction === "approved" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}