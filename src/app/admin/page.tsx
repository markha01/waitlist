"use client";

import { useState, useEffect, useCallback } from "react";

type Entry = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

type EntryAction = "idle" | "notifying" | "removing";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `${m} ${m === 1 ? "min" : "mins"} ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} ${h === 1 ? "hour" : "hours"} ago`;
  }
  if (diff < 604800) {
    const d = Math.floor(diff / 86400);
    return `${d} ${d === 1 ? "day" : "days"} ago`;
  }
  if (diff < 2592000) {
    const w = Math.floor(diff / 604800);
    return `${w} ${w === 1 ? "week" : "weeks"} ago`;
  }
  const mo = Math.floor(diff / 2592000);
  return `${mo} ${mo === 1 ? "month" : "months"} ago`;
}

export default function AdminPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<Record<number, EntryAction>>({});
  const [notifiedIds, setNotifiedIds] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState<Record<number, string>>({});

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/waitlist");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const setState = (id: number, state: EntryAction) =>
    setActionState((prev) => ({ ...prev, [id]: state }));

  const setError = (id: number, msg: string) =>
    setErrorMsg((prev) => ({ ...prev, [id]: msg }));

  const handleNotify = async (entry: Entry) => {
    setState(entry.id, "notifying");
    setError(entry.id, "");
    try {
      const res = await fetch(`/api/waitlist/${entry.id}/notify`, {
        method: "POST",
      });
      if (res.ok) {
        setNotifiedIds((prev) => new Set(prev).add(entry.id));
      } else {
        setError(entry.id, "Couldn't send — try again.");
      }
    } catch {
      setError(entry.id, "Couldn't send — try again.");
    } finally {
      setState(entry.id, "idle");
    }
  };

  const handleRemove = async (entry: Entry) => {
    setState(entry.id, "removing");
    setError(entry.id, "");
    try {
      const res = await fetch(`/api/waitlist/${entry.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      } else {
        setError(entry.id, "Couldn't remove — try again.");
        setState(entry.id, "idle");
      }
    } catch {
      setError(entry.id, "Couldn't remove — try again.");
      setState(entry.id, "idle");
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0d0d] px-4 py-12">
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af70]/30 to-transparent" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,112,0.06)_0%,transparent_100%)] pointer-events-none" />

      <div className="max-w-xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#d4af70] text-sm">✦</span>
            <span className="text-[#d4af70] text-[10px] tracking-[0.3em] uppercase font-semibold">
              Liivo Hair Salon
            </span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-[1.75rem] font-bold text-white tracking-tight leading-none">
              Waiting List
            </h1>
            {!loading && (
              <span className="text-[#555] text-sm tabular-nums">
                {entries.length}{" "}
                {entries.length === 1 ? "person" : "people"}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-24 bg-[#141414] border border-[#222] rounded-2xl">
            <p className="text-[#444] text-sm">The waiting list is empty.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => {
              const action = actionState[entry.id] ?? "idle";
              const notified = notifiedIds.has(entry.id);
              const err = errorMsg[entry.id];

              return (
                <div key={entry.id}>
                  <div className="bg-[#141414] border border-[#222] rounded-xl px-4 py-3.5 flex items-center gap-3">
                    {/* Position number */}
                    <span className="text-[#3a3a3a] text-sm font-semibold w-5 text-right shrink-0 tabular-nums">
                      {index + 1}
                    </span>

                    {/* Name + email */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate leading-snug">
                        {entry.name}
                      </p>
                      <p className="text-[#555] text-xs truncate mt-0.5">
                        {entry.email}
                      </p>
                    </div>

                    {/* Wait time */}
                    <span className="text-[#444] text-xs shrink-0 tabular-nums">
                      {timeAgo(entry.created_at)}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Notify button */}
                      <button
                        onClick={() => handleNotify(entry)}
                        disabled={action !== "idle"}
                        title={notified ? "Notified" : "Notify — it's their turn"}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-150 disabled:cursor-not-allowed ${
                          notified
                            ? "border-[#d4af70]/40 bg-[#d4af70]/10 text-[#d4af70]"
                            : "border-[#252525] text-[#444] hover:border-[#d4af70]/50 hover:text-[#d4af70] hover:bg-[#d4af70]/8 active:scale-95"
                        } disabled:opacity-40`}
                      >
                        {action === "notifying" ? (
                          <Spinner size="sm" />
                        ) : (
                          <BellIcon />
                        )}
                      </button>

                      {/* Check off button */}
                      <button
                        onClick={() => handleRemove(entry)}
                        disabled={action !== "idle"}
                        title="Check off — remove from list"
                        className="w-8 h-8 rounded-lg border border-[#252525] text-[#444] hover:border-emerald-600/50 hover:text-emerald-400 hover:bg-emerald-500/8 active:scale-95 flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {action === "removing" ? (
                          <Spinner size="sm" />
                        ) : (
                          <CheckIcon />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Inline error */}
                  {err && (
                    <p className="text-red-400 text-xs px-4 pt-1.5">{err}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        {!loading && entries.length > 0 && (
          <div className="flex items-center gap-5 mt-6 px-1">
            <span className="flex items-center gap-1.5 text-[#3a3a3a] text-xs">
              <BellIcon small /> Notify
            </span>
            <span className="flex items-center gap-1.5 text-[#3a3a3a] text-xs">
              <CheckIcon small /> Check off
            </span>
          </div>
        )}
      </div>
    </main>
  );
}

function BellIcon({ small }: { small?: boolean }) {
  return (
    <svg
      className={small ? "w-3 h-3" : "w-3.5 h-3.5"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function CheckIcon({ small }: { small?: boolean }) {
  return (
    <svg
      className={small ? "w-3 h-3" : "w-3.5 h-3.5"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function Spinner({ size = "default" }: { size?: "default" | "sm" }) {
  return (
    <svg
      className={`animate-spin ${size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5"}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
