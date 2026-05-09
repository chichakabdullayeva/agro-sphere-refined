import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { AgroButton } from "@/components/AgroButton";
import { ArrowRight, ShieldCheck, Tractor, Sprout, Briefcase, Users, Siren } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Welcome,
});

const langs = ["AZ", "RU", "EN"] as const;

function Welcome() {
  return (
    <div className="relative min-h-dvh flex flex-col">
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      {/* Top bar */}
      <header className="relative flex items-center justify-between px-5 pt-5 sm:px-8">
        <Logo size={28} />
        <div className="inline-flex rounded-pill border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] p-0.5">
          {langs.map((l, i) => (
            <button
              key={l}
              className={`px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase rounded-full transition-colors ${
                i === 0
                  ? "bg-[color:var(--bg-elevated)] text-foreground"
                  : "text-[color:var(--text-secondary)] hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      {/* Hero */}
      <main className="relative flex-1 flex flex-col justify-center px-5 sm:px-8 max-w-xl mx-auto w-full">
        <span className="badge-pill self-start" data-variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent-green)]" />
          Beta · 24 rayon
        </span>

        <h1 className="mt-5 font-display text-[44px] sm:text-[56px] leading-[1.02] font-bold tracking-tight">
          Əkdən satışa —<br />
          <span className="text-[color:var(--accent-green)]">bir platforma.</span>
        </h1>

        <p className="mt-5 text-[15px] sm:text-[17px] text-[color:var(--text-secondary)] leading-relaxed max-w-md">
          Məhsulunuzu satın, texnika icarə edin, işçi tapın və icma ilə xəstəlik
          xəbərdarlıqlarını real vaxtda paylaşın.
        </p>

        {/* Module strip */}
        <div className="mt-8 grid grid-cols-2 gap-2 max-w-md">
          {[
            { icon: Sprout, label: "Marketplace" },
            { icon: Tractor, label: "AgroRent" },
            { icon: Briefcase, label: "AgroJobs" },
            { icon: Users, label: "İcma" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] px-3 py-2.5"
            >
              <Icon className="h-4 w-4 text-[color:var(--accent-green)]" strokeWidth={1.6} />
              <span className="text-[13px] font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Trust row */}
        <div className="mt-6 flex items-center gap-4 text-[12px] text-[color:var(--text-tertiary)]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> OTP doğrulama
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Siren className="h-3.5 w-3.5" /> SOS xəbərdarlıq
          </span>
        </div>
      </main>

      {/* CTA — sticky bottom on mobile */}
      <footer className="relative px-5 sm:px-8 pb-7 pt-4 max-w-xl mx-auto w-full">
        <div className="flex flex-col gap-2.5">
          <Link to="/dashboard">
            <AgroButton fullWidth>
              Demoya bax <ArrowRight className="h-4 w-4" />
            </AgroButton>
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/register">
              <AgroButton variant="ghost" fullWidth size="md">Qeydiyyat</AgroButton>
            </Link>
            <Link to="/login">
              <AgroButton variant="ghost" fullWidth size="md">Daxil ol</AgroButton>
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
          v0.1 · Made in Azərbaycan
        </p>
      </footer>
    </div>
  );
}
