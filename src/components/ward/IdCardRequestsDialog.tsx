"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  DialogTitle,
  IconButton,
  TextField,
  Chip,
} from "@mui/material";
import { Close, Check, Block } from "@mui/icons-material";
import { getIdCardRequests, updateIdCardStatus } from "@/services/mockWardAdmin";
import { useWardAdminStore } from "@/hooks/useWardAdminStore";

interface IdCardRequestsDialogProps {
  wardId: string;
  onClose: () => void;
}

export default function IdCardRequestsDialog({ wardId, onClose }: IdCardRequestsDialogProps) {
  useWardAdminStore();
  const requests = getIdCardRequests(wardId);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [confirmApprove, setConfirmApprove] = useState<string | null>(null);

  const statusChip = (status: string) => {
    const map: Record<string, { bg: string; fg: string }> = {
      pending: { bg: "#FFF3E8", fg: "#F97316" },
      approved: { bg: "#E9F8EF", fg: "#16A34A" },
      rejected: { bg: "#FDE8E8", fg: "#EF4444" },
    };
    const s = map[status] ?? map.pending;
    return { backgroundColor: s.bg, color: s.fg, fontWeight: 600, fontSize: 11, height: 24 };
  };

  return (
    <>
      <Dialog open onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "18px" } } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1 }}>
          <span className="text-[15px] font-bold text-[#374151]">ID Card Requests</span>
          <IconButton onClick={onClose} aria-label="Close">
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <div className="divide-y divide-[#f0f1f4]">
            {requests.map((r) => {
              const pending = r.status === "pending";
              return (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E8EFFC] text-[#0A3E9E]">
                    {r.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.photo} alt={r.citizen_name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold">
                        {r.citizen_name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-[#374151]">{r.citizen_name}</p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">
                      {r.application_number} · Ward {r.ward}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                      {new Date(r.submitted_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Chip
                    label={r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    sx={statusChip(r.status)}
                  />
                  {pending && (
                    <div className="flex shrink-0 items-center gap-1">
                      <IconButton
                        size="small"
                        aria-label="Approve"
                        sx={{ color: "#16A34A", bgcolor: "#E9F8EF" }}
                        onClick={() => setConfirmApprove(r.id)}
                      >
                        <Check sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Reject"
                        sx={{ color: "#EF4444", bgcolor: "#FDE8E8" }}
                        onClick={() => setRejectId(r.id)}
                      >
                        <Block sx={{ fontSize: 18 }} />
                      </IconButton>
                    </div>
                  )}
                </div>
              );
            })}
            {requests.length === 0 && (
              <p className="py-10 text-center text-sm text-[#9CA3AF]">No ID card requests</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmApprove !== null} onClose={() => setConfirmApprove(null)} slotProps={{ paper: { sx: { borderRadius: "16px", width: 320 } } }}>
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <p className="text-base font-semibold text-[#374151]">Approve this ID card request?</p>
          <p className="mt-1 text-sm text-[#6B7280]">A printable ID request will be created and marked as approved.</p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmApprove(null)} sx={{ textTransform: "none", color: "#6B7280" }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (confirmApprove) updateIdCardStatus(wardId, confirmApprove, "approved");
              setConfirmApprove(null);
            }}
            variant="contained"
            sx={{ textTransform: "none", borderRadius: "10px", bgcolor: "#0A3E9E", ":hover": { bgcolor: "#083078" } }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject with reason */}
      <Dialog open={rejectId !== null} onClose={() => setRejectId(null)} slotProps={{ paper: { sx: { borderRadius: "16px", width: 340 } } }}>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>Reject ID Card Request</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason for rejection"
            fullWidth
            size="small"
            multiline
            minRows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => { setRejectId(null); setReason(""); }} sx={{ textTransform: "none", color: "#6B7280" }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (rejectId) updateIdCardStatus(wardId, rejectId, "rejected");
              setRejectId(null);
              setReason("");
            }}
            variant="contained"
            color="error"
            sx={{ textTransform: "none", borderRadius: "10px" }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}