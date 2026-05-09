import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EQUIPMENT } from "@/data/mock";
import { Search, MapPin, Fuel, Gauge, ShieldCheck, Calendar } from "lucide-react";

export const Route = createFileRoute("/_app/rent")({
  component: RentPage,
  head: () => ({ meta: [{ title: "AgroRent — Texnika icarəsi" }] }),
});

const TYPES = ["Hamısı", "Traktor", "Kombayn", "Dron", "Toxumsəpən"] as const;

const statusMap = {
  AVAILABLE: { label: "Mövcud", color: "var(--accent-green)" },
  BUSY: { label: "Məşğul", color: "var(--accent-amber)" },
  MAINTENANCE: { label: "T. baxış", color: "var(--accent-red)" },
} as const;

function RentPage() {
  const [type, setType] = useState<(typeof TYPES)[number]>("Hamısı");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      EQUIPMENT.filter(
        (e) =>
          (type === "Hamısı" || e.type === type) &&
          (q === "" || `${e.name} ${e.brand} ${e.region}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [type, q],
  );

  const available = EQUIPMENT.filter((e) => e.status === "AVAILABLE").length;

  return (
    <div className="px-5 pt-5 flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight">Texnika icarəsi</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--text-secondary)]">
            <span className="text-[color:var(--accent-green)] font-semibold">{available} texnika</span> indi mövcuddur
          </p>
        </div>
        <span className="badge-pill" data-variant="success">AgroRent</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-tertiary)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Brend, model və ya rayon..."
          className="h-[52px] w-full rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-tertiary)] pl-10 pr-4 text-[15px] placeholder:text-[color:var(--text-tertiary)] focus:outline-none focus:border-[color:var(--accent-green)]"
        />
      </div>

      <div className="-mx-5 px-5 flex gap-2 overflow-x-auto scrollbar-none">
        {TYPES.map((t) => {
          const active = t === type;
          return (
            <button
              key={t}
              onClick={() => setType(t)}
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
        {filtered.map((e) => {
          const s = statusMap[e.status];
          return (
            <article
              key={e.id}
              className="rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] overflow-hidden hover:border-[color:var(--accent-green)]/40 transition-colors"
            >
              <div className="relative aspect-[16/9] bg-[color:var(--bg-tertiary)]">
                <img
                  src={e.image}
                  alt={e.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="badge-pill bg-[color:var(--bg-primary)]/85 backdrop-blur" style={{ color: s.color, borderColor: `${s.color}40` }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                    {s.label}
                  </span>
                </div>
                {e.insured && (
                  <div className="absolute top-3 right-3">
                    <span className="badge-pill" style={{ background: "var(--bg-primary)/85", color: "var(--accent-teal)" }}>
                      <ShieldCheck className="h-3 w-3" /> Sığortalı
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-semibold leading-tight">{e.name}</h3>
                    <p className="mt-0.5 text-[12px] text-[color:var(--text-secondary)]">
                      {e.brand} · {e.year}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-[18px] font-bold tabular-nums text-[color:var(--accent-green)]">
                      ₼{e.pricePerHour}<span className="text-[11px] text-[color:var(--text-secondary)] font-normal">/saat</span>
                    </p>
                    <p className="text-[11px] font-mono-tabular text-[color:var(--text-tertiary)]">
                      ₼{e.pricePerDay}/gün
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-[color:var(--text-secondary)]">
                  {e.powerKw > 0 && (
                    <span className="inline-flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5" /> {e.powerKw} kW</span>
                  )}
                  <span className="inline-flex items-center gap-1.5"><Fuel className="h-3.5 w-3.5" /> {e.fuel}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {e.region}, {e.district}</span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-[color:var(--border)]">
                  <div className="text-[12px] text-[color:var(--text-secondary)]">
                    <span className="text-[color:var(--text-primary)] font-medium">{e.owner.name}</span>
                    <span className="mx-1.5 text-[color:var(--text-tertiary)]">·</span>
                    ★ {e.owner.rating} ({e.owner.rentals})
                  </div>
                  <button
                    disabled={e.status !== "AVAILABLE"}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-[color:var(--accent-green)] text-[color:var(--bg-primary)] text-[13px] font-semibold disabled:opacity-40 disabled:bg-[color:var(--bg-tertiary)] disabled:text-[color:var(--text-tertiary)]"
                  >
                    <Calendar className="h-3.5 w-3.5" /> İcarəyə götür
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[14px] text-[color:var(--text-secondary)]">
            Filtrlərə uyğun texnika tapılmadı.
          </div>
        )}
      </div>
    </div>
  );
}
