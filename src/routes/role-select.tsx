import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { AgroButton } from "@/components/AgroButton";
import { ArrowLeft, ArrowRight, Sprout, Factory, HardHat, Tractor, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/role-select")({
  component: RoleSelectPage,
  head: () => ({ meta: [{ title: "Rol seçimi — AgroAzər" }] }),
});

type RoleKey = "farmer" | "employer" | "worker" | "equipment_owner";
type Role = { key: RoleKey; icon: LucideIcon; title: string; desc: string };

const roles: Role[] = [
  { key: "farmer", icon: Sprout, title: "Fermer", desc: "Məhsul satır, texnika icarə edir, icmada paylaşır." },
  { key: "employer", icon: Factory, title: "İşəgötürən", desc: "İşçi axtarır, tender açır, korporativ alış edir." },
  { key: "worker", icon: HardHat, title: "İşçi", desc: "Mövsümi iş axtarır, bacarıqlarını satır." },
  { key: "equipment_owner", icon: Tractor, title: "Texnika sahibi", desc: "Texnikasını icarəyə verir, gəlir qazanır." },
];

type Stored = { fullName: string; phone: string; email: string; password: string };

function RoleSelectPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<RoleKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stored, setStored] = useState<Stored | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("agro:register");
    if (!raw) {
      navigate({ to: "/register" });
      return;
    }
    setStored(JSON.parse(raw) as Stored);
  }, [navigate]);

  const onContinue = async () => {
    if (!selected || !stored) return;
    setError(null);
    setLoading(true);
    try {
      // 1. Try to get current session (in case signup already happened on previous click)
      let userId = (await supabase.auth.getSession()).data.session?.user?.id;

      if (!userId) {
        // 2. Try sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: stored.email,
          password: stored.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: stored.fullName, phone: stored.phone },
          },
        });

        if (signUpError) {
          // If user already exists → sign in with provided password
          const msg = signUpError.message.toLowerCase();
          if (msg.includes("registered") || msg.includes("exists") || signUpError.status === 422) {
            const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
              email: stored.email,
              password: stored.password,
            });
            if (signInErr) throw new Error("Bu e-poçt artıq qeydiyyatdadır. Şifrə düz deyil.");
            userId = signIn.user?.id;
          } else if (signUpError.status === 429) {
            throw new Error("Çox sürətli cəhd. Bir neçə saniyə gözləyin.");
          } else {
            throw signUpError;
          }
        } else {
          userId = data.user?.id;
          // If session not auto-created (rare with auto-confirm off), sign in
          if (!data.session) {
            const { data: signIn } = await supabase.auth.signInWithPassword({
              email: stored.email,
              password: stored.password,
            });
            userId = signIn.user?.id ?? userId;
          }
        }
      }

      if (!userId) throw new Error("Hesab yaradıla bilmədi");

      // 3. Upsert role (ignore conflict)
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: selected }, { onConflict: "user_id,role" });
      if (roleError && !roleError.message.includes("duplicate")) throw roleError;

      sessionStorage.removeItem("agro:register");
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col px-5 sm:px-8 max-w-md mx-auto w-full">
      <header className="flex items-center justify-between pt-5">
        <Link
          to="/register"
          className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] hover:bg-[color:var(--bg-elevated)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Logo size={24} />
        <span className="w-10" />
      </header>

      <div className="mt-7 flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              s <= 2 ? "bg-[color:var(--accent-green)]" : "bg-[color:var(--bg-tertiary)]"
            }`}
          />
        ))}
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
        Addım 2 / 2 · Rol seçimi
      </p>

      <h1 className="mt-3 font-display text-[28px] font-bold tracking-tight">Siz kimsiniz?</h1>
      <p className="mt-1.5 text-[14px] text-[color:var(--text-secondary)]">
        Platforma sizə uyğun interfeys və imkanlar göstərəcək.
      </p>

      <div className="mt-6 flex flex-col gap-2.5">
        {roles.map(({ key, icon: Icon, title, desc }) => {
          const active = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={`relative text-left rounded-lg border px-4 py-4 transition-all duration-150 active:scale-[0.99] ${
                active
                  ? "border-[color:var(--accent-green)] bg-[color:color-mix(in_oklab,var(--accent-green)_8%,var(--bg-secondary))]"
                  : "border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] hover:bg-[color:var(--bg-tertiary)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="grid place-items-center w-10 h-10 rounded-md border shrink-0"
                  style={{
                    background: active ? "var(--bg-primary)" : "var(--bg-tertiary)",
                    borderColor: active
                      ? "color-mix(in oklab, var(--accent-green) 40%, transparent)"
                      : "var(--border-accent)",
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={1.6}
                    style={{ color: active ? "var(--accent-green)" : "var(--text-secondary)" }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold">{title}</h3>
                    {active && (
                      <span className="grid place-items-center w-5 h-5 rounded-full bg-[color:var(--accent-green)]">
                        <Check className="h-3 w-3 text-[color:var(--bg-primary)]" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[13px] text-[color:var(--text-secondary)] leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-[color:var(--accent-red)]/40 bg-[color:var(--accent-red)]/10 px-3 py-2.5 text-[13px] text-[color:var(--accent-red)]">
          {error}
        </div>
      )}

      <div className="mt-auto py-7">
        <AgroButton fullWidth disabled={!selected || loading} onClick={onContinue}>
          {loading ? "Hesab yaradılır..." : (<>Hesab yarat <ArrowRight className="h-4 w-4" /></>)}
        </AgroButton>
      </div>
    </div>
  );
}
