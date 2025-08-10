"use client";

import React from "react";
import Navbar from "../../../components/dashboard/Navbar";
import { Card, CardContent } from "../../../components/ui/card";

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
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6 md:py-10">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="p-5 md:p-7">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#1e40af]">
                  Team Management
                </h1>
                <p className="text-neutral-600 mt-1">
                  View members associated with your account.
                </p>
              </div>
            </div>

            {loading && (
              <div className="text-sm text-neutral-600">Loading team…</div>
            )}
            {error && <div className="text-sm text-red-600">{error}</div>}

            {!loading && !error && (
              <div className="overflow-x-auto border border-neutral-200 rounded-lg bg-white">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50/80">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">
                        Added
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
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
          </CardContent>
        </Card>
      </main>
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