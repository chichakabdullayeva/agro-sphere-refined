import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { AgroButton } from "@/components/AgroButton";
import { AgroInput } from "@/components/AgroInput";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Qeydiyyat — AgroAzər" }] }),
});

const schema = z
  .object({
    fullName: z.string().trim().min(3, "Ad ən azı 3 simvol"),
    phone: z
      .string()
      .trim()
      .regex(/^\+?994\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/, "Format: +994 XX XXX XX XX"),
    email: z.string().trim().email("Düzgün e-poçt deyil"),
    password: z.string().min(8, "Ən azı 8 simvol").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Şifrələr uyğun deyil",
    path: ["confirm"],
  });

function passwordStrength(p: string): { score: number; label: string } {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (p.length >= 12) s++;
  const labels = ["Çox zəif", "Zəif", "Orta", "Yaxşı", "Güclü", "Çox güclü"];
  return { score: s, label: labels[s] };
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "+994 ",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of r.error.issues) {
        const k = issue.path[0] as keyof typeof form;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    // Persist to session storage for next steps (role select + OTP).
    sessionStorage.setItem("agro:register", JSON.stringify(r.data));
    navigate({ to: "/role-select" });
  };

  const strength = passwordStrength(form.password);

  return (
    <div className="min-h-dvh flex flex-col px-5 sm:px-8 max-w-md mx-auto w-full">
      <header className="flex items-center justify-between pt-5">
        <Link
          to="/"
          className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] hover:bg-[color:var(--bg-elevated)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Logo size={24} />
        <span className="w-10" />
      </header>

      {/* Step indicator */}
      <div className="mt-7 flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              s === 1 ? "bg-[color:var(--accent-green)]" : "bg-[color:var(--bg-tertiary)]"
            }`}
          />
        ))}
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
        Addım 1 / 4 · Hesab məlumatları
      </p>

      <h1 className="mt-3 font-display text-[28px] font-bold tracking-tight">
        Hesab yaradın
      </h1>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <AgroInput
          label="Tam ad"
          placeholder="Əli Həsənov"
          value={form.fullName}
          onChange={set("fullName")}
          error={errors.fullName}
          autoComplete="name"
        />
        <AgroInput
          label="Telefon"
          placeholder="+994 50 123 45 67"
          value={form.phone}
          onChange={set("phone")}
          error={errors.phone}
          inputMode="tel"
          autoComplete="tel"
        />
        <AgroInput
          label="E-poçt"
          type="email"
          placeholder="siz@example.com"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
          autoComplete="email"
        />
        <div>
          <AgroInput
            label="Şifrə"
            type="password"
            placeholder="Ən azı 8 simvol"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
            autoComplete="new-password"
          />
          {form.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{
                      background:
                        i < strength.score
                          ? strength.score >= 4
                            ? "var(--accent-green)"
                            : strength.score >= 3
                              ? "var(--accent-amber)"
                              : "var(--accent-red)"
                          : "var(--bg-tertiary)",
                    }}
                  />
                ))}
              </div>
              <p className="mt-1 text-[12px] text-[color:var(--text-secondary)]">
                Güclülük: <span className="font-semibold">{strength.label}</span>
              </p>
            </div>
          )}
        </div>
        <AgroInput
          label="Şifrəni təkrarlayın"
          type="password"
          placeholder="••••••••"
          value={form.confirm}
          onChange={set("confirm")}
          error={errors.confirm}
          autoComplete="new-password"
        />

        <AgroButton type="submit" className="mt-2">
          Davam et <ArrowRight className="h-4 w-4" />
        </AgroButton>
      </form>

      <p className="mt-auto py-7 text-center text-[13px] text-[color:var(--text-secondary)]">
        Artıq hesabınız var?{" "}
        <Link to="/login" className="text-[color:var(--accent-green)] font-semibold">
          Daxil ol
        </Link>
      </p>
    </div>
  );
}
