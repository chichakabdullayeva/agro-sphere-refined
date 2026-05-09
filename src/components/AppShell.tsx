import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Bell, Home, ShoppingBag, Tractor, Briefcase, Users, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

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

  return (
    <div className="min-h-dvh flex flex-col max-w-2xl mx-auto w-full bg-[color:var(--bg-primary)]">
      {/* Top header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[color:var(--bg-primary)]/85 border-b border-[color:var(--border)]">
        <div className="flex items-center justify-between px-5 h-14">
          <Logo size={24} />
          <div className="flex items-center gap-2">
            <button
              className="relative grid place-items-center w-10 h-10 rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] hover:bg-[color:var(--bg-tertiary)]"
              aria-label="Bildirişlər"
            >
              <Bell className="h-4 w-4" strokeWidth={1.6} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[color:var(--accent-red)]" />
            </button>
            <button
              onClick={onLogout}
              className="grid place-items-center w-10 h-10 rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] hover:bg-[color:var(--bg-tertiary)]"
              aria-label="Çıxış"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.6} />
            </button>
            <div className="grid place-items-center w-9 h-9 rounded-full bg-[color:var(--accent-green-dim)] text-[12px] font-semibold text-[color:var(--bg-primary)]">
              {initials}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24">{children ?? <Outlet />}</main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-[color:var(--border)] bg-[color:var(--bg-primary)]/95 backdrop-blur-md">
        <div className="max-w-2xl mx-auto grid grid-cols-5 px-2 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom))]">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active =
              location.pathname === to ||
              (to !== "/dashboard" && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-md transition-colors"
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={active ? 2 : 1.5}
                  style={{
                    color: active ? "var(--accent-green)" : "var(--text-tertiary)",
                  }}
                />
                <span
                  className="text-[10px] font-semibold tracking-wide uppercase"
                  style={{
                    color: active ? "var(--accent-green)" : "var(--text-tertiary)",
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
