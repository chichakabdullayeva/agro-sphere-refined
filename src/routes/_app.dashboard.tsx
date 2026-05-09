import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingBag, Tractor, Briefcase, Users, Mic, TriangleAlert } from "lucide-react";
import { ACTIVE_SOS } from "@/data/mock";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Əsas — AgroAzər" }] }),
});

function Stat({ label, value, delta, tone = "neutral" }: {
  label: string; value: string; delta?: string;
  tone?: "neutral" | "up" | "down";
}) {
  const color =
    tone === "up" ? "var(--accent-green)" :
    tone === "down" ? "var(--accent-red)" : "var(--text-secondary)";
  return (
    <div className="min-w-[150px] rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] p-4">
      <p className="text-[11px] uppercase tracking-[0.1em] text-[color:var(--text-tertiary)]">{label}</p>
      <p className="mt-1.5 font-display text-[22px] font-bold tabular-nums">{value}</p>
      {delta && <p className="mt-0.5 text-[12px] font-mono-tabular" style={{ color }}>{delta}</p>}
    </div>
  );
}

const quick = [
  { to: "/market", icon: ShoppingBag, label: "Məhsul əlavə et" },
  { to: "/rent", icon: Tractor, label: "Texnika icarəsi" },
  { to: "/jobs", icon: Briefcase, label: "İşçi tap" },
  { to: "/community", icon: Users, label: "İcma" },
] as const;

const ticker = [
  { crop: "Pomidor", price: "0.68", unit: "kq", change: 4 },
  { crop: "Kələm", price: "0.31", unit: "kq", change: -2 },
  { crop: "Buğda", price: "0.42", unit: "kq", change: 1 },
  { crop: "Alma", price: "1.20", unit: "kq", change: 6 },
  { crop: "Üzüm", price: "1.85", unit: "kq", change: -3 },
];

function Dashboard() {
  return (
    <div className="px-5 pt-5 flex flex-col gap-5">
      <div>
        <p className="text-[13px] text-[color:var(--text-secondary)]">Salam, fermer</p>
        <h1 className="font-display text-[24px] font-bold tracking-tight">Əli Həsənov</h1>
      </div>

      {/* SOS banner */}
      <Link
        to="/community"
        className="block rounded-lg border-l-[3px] border border-[color:var(--accent-red)]/40 border-l-[color:var(--accent-red)] bg-[color:color-mix(in_oklab,var(--accent-red)_10%,var(--bg-secondary))] px-4 py-3.5"
      >
        <div className="flex items-start gap-3">
          <span className="relative inline-flex w-2 h-2 rounded-full bg-[color:var(--accent-red)] mt-1.5 pulse-red" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[color:var(--accent-red)] flex items-center gap-1.5">
              <TriangleAlert className="h-3.5 w-3.5" /> SOS · {ACTIVE_SOS.severity}
            </p>
            <p className="mt-0.5 text-[14px] font-semibold">{ACTIVE_SOS.type} — {ACTIVE_SOS.regions.join(", ")}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-[color:var(--accent-red)]" />
        </div>
      </Link>

      {/* Stats */}
      <div className="-mx-5 px-5 flex gap-2.5 overflow-x-auto scrollbar-none">
        <Stat label="Bu ay satış" value="₼2,840" delta="+12% keçən aya nisbətən" tone="up" />
        <Stat label="Aktiv sifariş" value="3" />
        <Stat label="Reytinq" value="4.8" delta="24 rəy" />
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)] mb-2">
          Sürətli əməliyyat
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {quick.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] p-3.5 hover:bg-[color:var(--bg-tertiary)] transition-colors"
            >
              <Icon className="h-5 w-5 text-[color:var(--accent-green)]" strokeWidth={1.6} />
              <p className="mt-2 text-[13px] font-semibold">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Voice CTA */}
      <button className="w-full rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-tertiary)] px-4 py-4 flex items-center gap-3.5 hover:bg-[color:var(--bg-elevated)] transition-colors text-left">
        <span className="grid place-items-center w-10 h-10 rounded-full bg-[color:var(--accent-green)] text-[color:var(--bg-primary)]">
          <Mic className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="flex-1">
          <p className="text-[14px] font-semibold">Danışın — platform anlayır</p>
          <p className="text-[12px] text-[color:var(--text-secondary)]">"Sabah traktor sifariş et" və ya "Pomidorun qiyməti?"</p>
        </div>
      </button>

      {/* Price ticker */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
            Bazar qiymətləri · canlı
          </h2>
          <span className="badge-pill" data-variant="success">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent-green)] animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="-mx-5 px-5 flex gap-2 overflow-x-auto scrollbar-none">
          {ticker.map((t) => (
            <div key={t.crop} className="min-w-[140px] rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] p-3">
              <p className="text-[12px] text-[color:var(--text-secondary)]">{t.crop}</p>
              <p className="mt-1 font-mono-tabular text-[16px] font-semibold">₼{t.price}<span className="text-[11px] text-[color:var(--text-tertiary)]">/{t.unit}</span></p>
              <p className="mt-0.5 font-mono-tabular text-[12px]" style={{
                color: t.change > 0 ? "var(--accent-green)" : "var(--accent-red)",
              }}>
                {t.change > 0 ? "↑" : "↓"} {Math.abs(t.change)}%
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
