import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import {
  Bell, Home, ShoppingBag, Tractor, Briefcase, Users, LogOut, Sun, Moon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { AIChatWidget } from "@/components/AIChatWidget";

const tabs: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/dashboard", label: "Əsas", icon: Home },
  { to: "/market", label: "Market", icon: ShoppingBag },
  { to: "/rent", label: "İcarə", icon: Tractor },
  { to: "/jobs", label: "İşlər", icon: Briefcase },
  { to: "/community", label: "İcma", icon: Users },
];

export function AppShell({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  const initials = (user?.user_metadata?.full_name || user?.email || "AA")
    .split(/\s+/)
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const onLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const isActive = (to: string) =>
    location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-[color:var(--bg-primary)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-[color:var(--border)] bg-[color:var(--bg-secondary)] sticky top-0 h-dvh">
        <div className="px-5 h-16 flex items-center border-b border-[color:var(--border)]">
          <Logo size={26} />
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors"
                style={{
                  background: active ? "color-mix(in oklab, var(--accent-green) 14%, transparent)" : "transparent",
                  color: active ? "var(--accent-green)" : "var(--text-secondary)",
                }}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={active ? 2 : 1.6} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-[color:var(--border)] flex items-center gap-2">
          <div className="grid place-items-center w-9 h-9 rounded-full bg-[color:var(--accent-green-dim)] text-[12px] font-semibold text-[color:var(--accent-green-fg)]">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate">{user?.user_metadata?.full_name || "İstifadəçi"}</p>
            <p className="text-[11px] text-[color:var(--text-tertiary)] truncate">{user?.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="grid place-items-center w-8 h-8 rounded-md hover:bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)]"
            aria-label="Çıxış"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-[color:var(--bg-primary)]/85 border-b border-[color:var(--border)]">
          <div className="flex items-center justify-between px-5 h-14 max-w-6xl mx-auto w-full">
            <div className="lg:hidden"><Logo size={24} /></div>
            <div className="hidden lg:block text-[13px] text-[color:var(--text-secondary)]">
              AgroSphere · Azərbaycan kənd təsərrüfatı platforması
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggle}
                className="grid place-items-center w-10 h-10 rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] hover:bg-[color:var(--bg-tertiary)]"
                aria-label="Tema dəyişdir"
                title={theme === "dark" ? "İşıqlı rejim" : "Qaranlıq rejim"}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                className="relative grid place-items-center w-10 h-10 rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] hover:bg-[color:var(--bg-tertiary)]"
                aria-label="Bildirişlər"
              >
                <Bell className="h-4 w-4" strokeWidth={1.6} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[color:var(--accent-red)]" />
              </button>
              <button
                onClick={onLogout}
                className="lg:hidden grid place-items-center w-10 h-10 rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] hover:bg-[color:var(--bg-tertiary)]"
                aria-label="Çıxış"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.6} />
              </button>
              <div className="lg:hidden grid place-items-center w-9 h-9 rounded-full bg-[color:var(--accent-green-dim)] text-[12px] font-semibold text-[color:var(--accent-green-fg)]">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-24 lg:pb-8 max-w-6xl mx-auto w-full">
          {children ?? <Outlet />}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[color:var(--border)] bg-[color:var(--bg-primary)]/95 backdrop-blur-md">
        <div className="max-w-2xl mx-auto grid grid-cols-5 px-2 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom))]">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-md transition-colors"
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={active ? 2 : 1.5}
                  style={{ color: active ? "var(--accent-green)" : "var(--text-tertiary)" }}
                />
                <span
                  className="text-[10px] font-semibold tracking-wide uppercase"
                  style={{ color: active ? "var(--accent-green)" : "var(--text-tertiary)" }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <AIChatWidget />
    </div>
  );
}
