import logs from "../../../../data/audit-log.json";

const eventColors: Record<string, string> = {
  REGISTERED: "bg-green-100 text-green-800",
  UPDATED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-teal-100 text-teal-800",
  REJECTED: "bg-red-100 text-red-800",
  CONFLICT_RESOLVED: "bg-orange-100 text-orange-800",
  ID_CARD_ISSUED: "bg-purple-100 text-purple-800",
  DATA_PURGED: "bg-gray-100 text-gray-800",
  PASSWORD_RESET: "bg-amber-100 text-amber-800",
};

const roleColors: Record<string, string> = {
  CENTRAL_ADMIN: "bg-purple-100 text-purple-800",
  PROVINCE_ADMIN: "bg-blue-100 text-blue-800",
  MUNICIPAL_ADMIN: "bg-green-100 text-green-800",
  WARD_ADMIN: "bg-orange-100 text-orange-800",
};

const maskCitizenId = (id: string) => `${id.slice(0, 8)}****`;

function getParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function buildQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const eventType = getParam(resolvedSearchParams.eventType);
  const province = getParam(resolvedSearchParams.province);
  const role = getParam(resolvedSearchParams.role);
  const fromDate = getParam(resolvedSearchParams.fromDate);
  const toDate = getParam(resolvedSearchParams.toDate);
  const page = Math.max(
    1,
    Number(getParam(resolvedSearchParams.page) || 1) || 1,
  );
  const pageSize = 20;

  const filteredLogs = logs.filter((log) => {
    const matchEvent = !eventType || log.event_type === eventType;
    const matchProvince =
      !province ||
      log.jurisdiction.toLowerCase().includes(province.toLowerCase());
    const matchRole = !role || log.acted_by_role === role;

    const logTime = new Date(log.timestamp).getTime();
    const from = fromDate ? new Date(fromDate).getTime() : null;
    const to = toDate ? new Date(toDate).getTime() : null;
    const matchDate = (!from || logTime >= from) && (!to || logTime <= to);

    return matchEvent && matchProvince && matchRole && matchDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(start, start + pageSize);

  const baseParams = {
    eventType,
    province,
    role,
    fromDate,
    toDate,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <h1 className="mb-6 text-2xl font-bold">Audit Log Viewer</h1>

      <form method="get" className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="grid gap-4 md:grid-cols-5">
          <div>
            <label
              htmlFor="eventType"
              className="mb-1 block text-sm font-medium"
            >
              Event Type
            </label>
            <select
              id="eventType"
              name="eventType"
              defaultValue={eventType}
              className="w-full rounded border p-2"
            >
              <option value="">All Events</option>
              {Object.keys(eventColors).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="province"
              className="mb-1 block text-sm font-medium"
            >
              Province
            </label>
            <input
              id="province"
              name="province"
              defaultValue={province}
              className="w-full rounded border p-2"
              placeholder="Filter by province"
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium">
              Role
            </label>
            <select
              id="role"
              name="role"
              defaultValue={role}
              className="w-full rounded border p-2"
            >
              <option value="">All Roles</option>
              {Object.keys(roleColors).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="fromDate"
              className="mb-1 block text-sm font-medium"
            >
              From Date
            </label>
            <input
              id="fromDate"
              name="fromDate"
              type="date"
              defaultValue={fromDate}
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label htmlFor="toDate" className="mb-1 block text-sm font-medium">
              To Date
            </label>
            <input
              id="toDate"
              name="toDate"
              type="date"
              defaultValue={toDate}
              className="w-full rounded border p-2"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input type="hidden" name="page" value="1" />
          <button
            type="submit"
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Apply Filters
          </button>
          <a
            href="/central/audit-log"
            className="rounded border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reset
          </a>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Event</th>
              <th className="p-3 text-left">Citizen ID</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Jurisdiction</th>
              <th className="p-3 text-left">Timestamp</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-1 text-sm font-medium ${eventColors[log.event_type] || "bg-gray-100 text-gray-800"}`}
                    >
                      {log.event_type}
                    </span>
                  </td>
                  <td className="p-3">{maskCitizenId(log.citizen_id)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-1 text-sm font-medium ${roleColors[log.acted_by_role] || "bg-gray-100 text-gray-800"}`}
                    >
                      {log.acted_by_role}
                    </span>
                  </td>
                  <td className="p-3">{log.jurisdiction}</td>
                  <td className="p-3">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-6 text-center text-sm text-gray-500"
                  colSpan={6}
                >
                    No audit logs match the current filters.
                  </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <a
          aria-disabled={currentPage === 1}
          href={
            currentPage === 1
              ? "/central/audit-log"
              : `/central/audit-log${buildQueryString({ ...baseParams, page: currentPage - 1 })}`
          }
          className={`rounded border px-3 py-1 ${currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-white"}`}
        >
          Prev
        </a>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <a
          aria-disabled={currentPage === totalPages}
          href={
            currentPage === totalPages
              ? `/central/audit-log${buildQueryString(baseParams)}`
              : `/central/audit-log${buildQueryString({ ...baseParams, page: currentPage + 1 })}`
          }
          className={`rounded border px-3 py-1 ${currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-white"}`}
        >
          Next
        </a>
      </div>
    </div>
  );
}
