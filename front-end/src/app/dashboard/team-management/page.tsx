"use client";

import React from "react";

type TeamMember = {
  id: number | string;
  name: string | null;
  email: string | null;
  phone_number: any;
  created_at: string | null;
};

export default function TeamManagementPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const [rows, setRows] = React.useState<TeamMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Check auth first so we can show a clear message
        const me = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!me.ok) {
          const payload = await safeJson(me);
          throw new Error(
            payload?.error ||
              `Please sign in to view your team (HTTP ${me.status}).`
          );
        }

        const res = await fetch(`${API_BASE}/team-management/my-team`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          const payload = await safeJson(res);
          throw new Error(
            payload?.error ||
              `Failed to load team (HTTP ${res.status}).`
          );
        }
        const data = await res.json();
        if (active) setRows(Array.isArray(data?.team) ? data.team : []);
      } catch (e: any) {
        if (active) setError(e?.message || "Failed to load team");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [API_BASE]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-[#1e40af]">
        Team Management
      </h1>
      {loading && (
        <div className="text-sm text-neutral-600">Loading team…</div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto border border-neutral-200 rounded-lg">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-neutral-500 text-sm"
                  >
                    No team members yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm text-neutral-900">
                    {r.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700">
                    {r.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700">
                    {typeof r.phone_number === "object" &&
                    r.phone_number !== null
                      ? r.phone_number.phone || ""
                      : r.phone_number || ""}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-500">
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString()
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}