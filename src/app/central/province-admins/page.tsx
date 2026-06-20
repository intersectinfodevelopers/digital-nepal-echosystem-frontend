"use client";

import { useMemo, useState, useRef } from "react";

// Data imports
import initialProvinceAdmins from "../../../../data/admins/province-admins.json";
import initialAuditLogs from "../../../../data/admin-audit.json";
import provincesData from "../../../../data/provinces.json";

interface ProvinceAdmin {
  id: string;
  username: string;
  full_name: string;
  province_id: string;
  province_name: string;
  is_active: boolean;
  failed_logins: number;
  locked_until: string | null;
  last_login: string | null;
  created_at: string;
  created_by: string | null;
}

interface AuditLog {
  id: string;
  action: string;
  acted_by: string;
  acted_by_role: string;
  target_user_id: string;
  target_username: string;
  target_role: string;
  details: { reason: string };
  created_at: string;
}

export default function ProvinceAdminsPage() {
  const formRef = useRef<HTMLFormElement>(null);

  // Core States (Initialized directly with static JSON data arrays)
  const [admins, setAdmins] = useState<ProvinceAdmin[]>(initialProvinceAdmins as ProvinceAdmin[]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs as unknown as AuditLog[]);

  const [formFullName, setFormFullName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formProvinceId, setFormProvinceId] = useState("");

  const [reason, setReason] = useState("");
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [inspectedAdmin, setInspectedAdmin] = useState<ProvinceAdmin | null>(null);

  // COMPUTED SECURITY MATRICES
  const flaggedAccounts = useMemo(() => admins.filter((admin) => admin.failed_logins >= 3), [admins]);
  const lockedAccounts = useMemo(() => admins.filter((admin) => admin.locked_until !== null), [admins]);
  
  const offHourLogins = useMemo(() => {
    return admins.filter((admin) => {
      if (!admin.last_login) return false;
      const loginDate = new Date(admin.last_login);
      if (isNaN(loginDate.getTime())) return false;
      const hour = loginDate.getUTCHours(); 
      return hour >= 22 || hour < 6;
    });
  }, [admins]);

  const activeAccountHistory = useMemo(() => {
    if (!inspectedAdmin) return [];
    return auditLogs.filter((log) => log.target_username === inspectedAdmin.username);
  }, [inspectedAdmin, auditLogs]);

  // MUTATION HANDLERS
  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName || !formUsername || !formPassword || !formProvinceId) {
      alert("All fields are required.");
      return;
    }

    const targetedProvince = provincesData.find((p) => p.id === formProvinceId);
    const createdAdmin: ProvinceAdmin = {
      username: formUsername,
      full_name: formFullName,
      province_id: formProvinceId,
      province_name: targetedProvince?.name_en || "Unknown Province",
      is_active: true,
      failed_logins: 0,
      locked_until: null,
      last_login: null,
      created_at: new Date().toISOString(),
      created_by: "user-central",
      id: `user-province-${Date.now()}`,
    };

    const finalizedLog: AuditLog = {
      id: `audit-gen-${Date.now()}`,
      created_at: new Date().toISOString(),
      action: "ACCOUNT_CREATED",
      acted_by: "user-central",
      acted_by_role: "CENTRAL_ADMIN",
      target_user_id: createdAdmin.id,
      target_username: createdAdmin.username,
      target_role: "PROVINCE_ADMIN",
      details: { reason: "Initial setup provisioning profile created." },
    };

    setAdmins([createdAdmin, ...admins]);
    setAuditLogs([finalizedLog, ...auditLogs]);

    setFormFullName("");
    setFormUsername("");
    setFormPassword("");
    setFormProvinceId("");
  };

  const handleToggleStatus = () => {
    if (!reason.trim() || !selectedAdminId) {
      alert("A valid reasoning string must be supplied.");
      return;
    }

    const currentTargetAccount = admins.find((admin) => admin.id === selectedAdminId);
    if (!currentTargetAccount) return;

    const invertedActiveState = !currentTargetAccount.is_active;
    const updatedAdmins = admins.map((admin) => 
      admin.id === selectedAdminId ? { ...admin, is_active: invertedActiveState } : admin
    );

    const finalizedLog: AuditLog = {
      id: `audit-gen-${Date.now()}`,
      created_at: new Date().toISOString(),
      action: invertedActiveState ? "ACCOUNT_ENABLED" : "ACCOUNT_DISABLED",
      acted_by: "user-central",
      acted_by_role: "CENTRAL_ADMIN",
      target_user_id: currentTargetAccount.id,
      target_username: currentTargetAccount.username,
      target_role: "PROVINCE_ADMIN",
      details: { reason: reason.trim() },
    };

    setAdmins(updatedAdmins);
    setAuditLogs([finalizedLog, ...auditLogs]);
    setReason("");
    setSelectedAdminId(null);
  };

  const triggerFormSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", backgroundColor: "#fff", color: "#000" }}>
      <div style={{ marginBottom: "25px", borderBottom: "2px solid #eaeaea", paddingBottom: "10px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>Province Admin Management</h1>
      </div>

      {/* Creation Box Form Container  */}
      <div style={{ marginBottom: "30px", padding: "25px", border: "1px solid #ccc", borderRadius: "6px", backgroundColor: "#fafafa" }}>
        <h3 style={{ marginTop: 0, marginBottom: "15px", fontWeight: "600" }}>Create Province Admin</h3>
        <form ref={formRef} onSubmit={handleCreateAdmin} style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>
          <input type="text" value={formFullName} onChange={(e) => setFormFullName(e.target.value)} placeholder="Full Name" style={{ padding: "8px 12px", border: "1px solid #bbb", borderRadius: "4px", minWidth: "200px" }} />
          <input type="text" value={formUsername} onChange={(e) => setFormUsername(e.target.value)} placeholder="Username" style={{ padding: "8px 12px", border: "1px solid #bbb", borderRadius: "4px", minWidth: "200px" }} />
          <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Temporary Password" style={{ padding: "8px 12px", border: "1px solid #bbb", borderRadius: "4px", minWidth: "200px" }} />
          
          <select 
            value={formProvinceId} 
            onChange={(e) => setFormProvinceId(e.target.value)} 
            style={{ padding: "8px 12px", border: "1px solid #bbb", borderRadius: "4px", minWidth: "220px", backgroundColor: "#fff" }}
            title="Assign Province"
            aria-label="Assign Province"
          >
            <option value="">Assign Province Choose Province...</option>
            {provincesData.map((p) => (
              <option key={p.id} value={p.id}>{p.name_en}</option>
            ))}
          </select>
          
          <div onClick={triggerFormSubmit} style={{ display: "inline-block", padding: "9px 16px", color: "#000", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}>
            Provision Account
          </div>
        </form>
      </div>

      {/* Matrix Information Data Table */}
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "12px", fontWeight: "600" }}>Active Province Administrators</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
              <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold" }}>Full Name</th>
              <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold" }}>Province</th>
              <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold" }}>Status</th>
              <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold" }}>Last Login</th>
              <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold" }}>Failed Logins</th>
              <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold" }}>Created At</th>
              <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} style={{ backgroundColor: "#fff" }}>
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>{admin.full_name}</td>
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>{admin.province_name}</td>
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>{admin.is_active ? "Active" : "Disabled"}</td>
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>{admin.last_login || "Never"}</td>
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>{admin.failed_logins}</td>
                <td style={{ border: "1px solid #ccc", padding: "10px" }}>{new Date(admin.created_at).toLocaleDateString()}</td>
                <td style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center", alignItems: "center" }}>
                    
                    <div 
                      title="Toggle Status"
                      onClick={() => {
                        setSelectedAdminId(admin.id);
                        setInspectedAdmin(null); 
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 12px",
                        height: "36px",
                        borderRadius: "18px",
                        border: "1px solid #ccc",
                        backgroundColor: selectedAdminId === admin.id ? "#e0e0e0" : "#fff",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#000",
                        userSelect: "none",
                        whiteSpace: "nowrap"
                      }}
                    >
                      Toggle Status
                    </div>

                    <div 
                      title="Audit History"
                      onClick={() => {
                        setInspectedAdmin(admin);
                        setSelectedAdminId(null); 
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 12px",
                        height: "36px",
                        borderRadius: "18px",
                        border: "1px solid #ccc",
                        backgroundColor: inspectedAdmin?.id === admin.id ? "#d0e0fc" : "#fff",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#000",
                        userSelect: "none",
                        whiteSpace: "nowrap"
                      }}
                    >
                      Audit History
                    </div>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Anomalies Structural Layout */}
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "12px", fontWeight: "600" }}>Security Anomaly Matrix</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
              <th style={{ border: "1px solid #ccc", padding: "10px", width: "33%", fontWeight: "bold" }}>Flagged Brute-Force Profiles (&ge; 3 Failures)</th>
              <th style={{ border: "1px solid #ccc", padding: "10px", width: "33%", fontWeight: "bold" }}>Administrative Account Lockouts</th>
              <th style={{ border: "1px solid #ccc", padding: "10px", width: "33%", fontWeight: "bold" }}>Off-Hours Operational Indicators (22:00 - 06:00 UTC)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #ccc", padding: "12px", verticalAlign: "top", color: "#444" }}>
                {flaggedAccounts.length === 0 ? <p style={{ margin: 0 }}>No threats detected</p> : flaggedAccounts.map((a) => <p key={a.id} style={{ margin: "0 0 4px 0" }}>{a.full_name}</p>)}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "12px", verticalAlign: "top", color: "#444" }}>
                {lockedAccounts.length === 0 ? <p style={{ margin: 0 }}>No lockouts found</p> : lockedAccounts.map((a) => <p key={a.id} style={{ margin: "0 0 4px 0" }}>{a.full_name}</p>)}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "12px", verticalAlign: "top", color: "#444" }}>
                {offHourLogins.length === 0 ? <p style={{ margin: 0 }}>No abnormal activity signatures</p> : offHourLogins.map((a) => <p key={a.id} style={{ margin: "0 0 4px 0" }}>{a.full_name}</p>)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Action Overlay Fields */}
      {selectedAdminId && (
        <div style={{ border: "1px solid #333", borderRadius: "6px", padding: "20px", marginTop: "20px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <h4 style={{ marginTop: 0, marginBottom: "12px", fontWeight: "600" }}>Mandatory Audit Context Log</h4>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide reasoning context details..." style={{ padding: "8px 12px", width: "350px", border: "1px solid #bbb", borderRadius: "4px" }} />
            <div onClick={() => { setSelectedAdminId(null); setReason(""); }} style={{ padding: "8px 14px", backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", userSelect: "none" }}>
              Cancel
            </div>
            <div onClick={handleToggleStatus} style={{ padding: "8px 14px", backgroundColor: "#000", color: "#fff", borderRadius: "4px", cursor: "pointer", userSelect: "none" }}>
              Commit Record
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Trace History Container */}
      {inspectedAdmin && (
        <div style={{ border: "1px solid #0056b3", borderRadius: "6px", padding: "20px", marginTop: "20px", backgroundColor: "#f8faff", boxShadow: "0 4px 12px rgba(0,86,179,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h4 style={{ margin: 0, color: "#0056b3", fontWeight: "600" }}>Audit History Lifecycle Trace: {inspectedAdmin.full_name}</h4>
            <div onClick={() => setInspectedAdmin(null)} style={{ padding: "6px 12px", backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", userSelect: "none" }}>
              Close History
            </div>
          </div>
          {activeAccountHistory.length === 0 ? 
          <p style={{ color: "#666", margin: 0 }}>No runtime lifecycle actions logged for this system admin.
          </p> : (
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {activeAccountHistory.map((log) => (
                <li key={log.id} style={{ marginBottom: "8px", color: "#333" }}>
                  <strong style={{ color: "#111" }}>{log.action}</strong> at {new Date(log.created_at).toLocaleString()} by {log.acted_by} ({log.acted_by_role})
                  {log.details?.reason && 
                  <p 
                  style={{ margin: "2px 0 0 0", color: "#666", fontStyle: "italic", fontSize: "13px" }}>Context Reason: {log.details.reason}
                  </p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}