import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { JOBS } from "@/data/mock";
import { MapPin, Calendar, Users, Zap, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/jobs")({
  component: JobsPage,
  head: () => ({ meta: [{ title: "AgroJobs — İş elanları" }] }),
});

const FILTERS = ["Hamısı", "Dərmanlama", "Yığım", "Aqronom", "Sürücülük"] as const;

function JobsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Hamısı");

  const filtered = useMemo(
    () => (filter === "Hamısı" ? JOBS : JOBS.filter((j) => j.taskType === filter)),
    [filter],
  );

  return (
    <div className="px-5 pt-5 flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight">İş elanları</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--text-secondary)]">
            <span className="text-[color:var(--accent-green)] font-semibold">{JOBS.length} aktiv</span> elan · işçi və ya elan verən kimi qoşulun
          </p>
        </div>
        <button className="shrink-0 inline-flex items-center gap-1.5 h-10 px-3.5 rounded-md bg-[color:var(--accent-green)] text-[color:var(--bg-primary)] text-[13px] font-semibold">
          <Plus className="h-4 w-4" /> Elan
        </button>
      </div>

      <div className="-mx-5 px-5 flex gap-2 overflow-x-auto scrollbar-none">
        {FILTERS.map((t) => {
          const active = t === filter;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="shrink-0 px-4 h-9 rounded-pill text-[13px] font-semibold border transition-colors"
              style={{
                background: active ? "var(--accent-green)" : "var(--bg-secondary)",
                color: active ? "var(--bg-primary)" : "var(--text-secondary)",
                borderColor: active ? "var(--accent-green)" : "var(--border-accent)",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((j) => (
          <article
            key={j.id}
            className="rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] p-4 hover:border-[color:var(--accent-green)]/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[16px] font-semibold leading-tight">{j.title}</h3>
                  {j.urgent && (
                    <span className="badge-pill" data-variant="danger">
                      <Zap className="h-3 w-3" /> Təcili
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[12px] text-[color:var(--text-secondary)]">
                  {j.employer.name} · ★ {j.employer.rating}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-[18px] font-bold tabular-nums text-[color:var(--accent-green)]">
                  ₼{j.dailyRate}
                </p>
                <p className="text-[11px] font-mono-tabular text-[color:var(--text-tertiary)]">/gün</p>
              </div>
            </div>

            <p className="mt-2.5 text-[13px] text-[color:var(--text-secondary)] leading-relaxed line-clamp-2">
              {j.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-[color:var(--text-secondary)]">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {j.region}, {j.district}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {j.startDate} — {j.endDate}</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {j.workersNeeded} nəfər</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {j.skills.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[color:var(--bg-tertiary)] border border-[color:var(--border)] text-[color:var(--text-secondary)]">
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-[color:var(--border)]">
              <span className="text-[12px] text-[color:var(--text-tertiary)] font-mono-tabular">
                {j.applications} müraciət
              </span>
              <button className="h-9 px-4 rounded-md bg-[color:var(--accent-green)] text-[color:var(--bg-primary)] text-[13px] font-semibold">
                Müraciət et
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
