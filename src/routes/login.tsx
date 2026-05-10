import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { AgroButton } from "@/components/AgroButton";
import { AgroInput } from "@/components/AgroInput";
import { ArrowLeft, Eye, EyeOff, Fingerprint } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Daxil ol — AgroAzər" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"phone" | "email">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let email = identifier.trim();
      if (mode === "phone") {
        // Look up email by phone via profiles
        const digits = identifier.replace(/\D/g, "");
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, phone")
          .ilike("phone", `%${digits.slice(-9)}%`)
          .limit(1)
          .maybeSingle();
        if (!prof) throw new Error("Bu nömrə ilə hesab tapılmadı");
        // Get email via auth — we can sign in only via email, so ask user to use email
        throw new Error("Telefonla giriş hazırda dəstəklənmir. E-poçtla daxil olun.");
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş alınmadı");
    } finally {
      setLoading(false);
    }
  };

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

      <div className="mt-10">
        <h1 className="font-display text-[32px] font-bold tracking-tight">Xoş gəlmisiniz</h1>
        <p className="mt-1.5 text-[14px] text-[color:var(--text-secondary)]">
          Hesabınıza daxil olun
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mt-7 inline-flex w-full rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] p-1">
        {(["phone", "email"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 h-9 rounded text-[13px] font-semibold transition-colors ${
              mode === m
                ? "bg-[color:var(--bg-elevated)] text-foreground"
                : "text-[color:var(--text-secondary)]"
            }`}
          >
            {m === "phone" ? "Telefon" : "E-poçt"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
        <AgroInput
          name="identifier"
          label={mode === "phone" ? "Telefon nömrəsi" : "E-poçt"}
          placeholder={mode === "phone" ? "+994 50 123 45 67" : "siz@example.com"}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          inputMode={mode === "phone" ? "tel" : "email"}
          autoComplete={mode === "phone" ? "tel" : "email"}
          required
        />
        <div className="relative">
          <AgroInput
            name="password"
            label="Şifrə"
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-[34px] h-[52px] grid place-items-center text-[color:var(--text-secondary)]"
            aria-label="Şifrəni göstər"
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-[13px]">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 accent-[color:var(--accent-green)]"
            />
            <span className="text-[color:var(--text-secondary)]">Məni xatırla</span>
          </label>
          <Link to="/" className="text-[color:var(--accent-green)] font-medium">
            Şifrəni unutdum?
          </Link>
        </div>

        {error && (
          <div className="rounded-md border border-[color:var(--accent-red)]/40 bg-[color:var(--accent-red)]/10 px-3 py-2.5 text-[13px] text-[color:var(--accent-red)]">
            {error}
          </div>
        )}

        <AgroButton type="submit" disabled={loading}>
          {loading ? "Yoxlanılır..." : "Daxil ol"}
        </AgroButton>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 h-11 rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] text-[14px] text-[color:var(--text-secondary)] hover:text-foreground"
        >
          <Fingerprint className="h-4 w-4" /> Biometrik giriş
        </button>
      </form>

      <p className="mt-auto py-7 text-center text-[13px] text-[color:var(--text-secondary)]">
        Hesabınız yoxdur?{" "}
        <Link to="/register" className="text-[color:var(--accent-green)] font-semibold">
          Qeydiyyat
        </Link>
      </p>
    </div>
  );
}
