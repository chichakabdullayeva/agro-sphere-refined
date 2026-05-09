import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Fuel, Gauge, ShieldCheck, Plus, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { REGIONS } from "@/data/mock";

export const Route = createFileRoute("/_app/rent")({
  component: RentPage,
  head: () => ({ meta: [{ title: "AgroRent — Texnika icarəsi" }] }),
});

const TYPES = ["Hamısı", "Traktor", "Kombayn", "Dron", "Toxumsəpən"] as const;
const FUELS = ["Dizel", "Benzin", "Elektrik"] as const;

type Equip = {
  id: string; owner_id: string; name: string; brand: string; year: number; type: string;
  status: "AVAILABLE" | "BUSY" | "MAINTENANCE"; price_per_hour: number; price_per_day: number;
  region: string; district: string; power_kw: number; fuel: string; insured: boolean; image: string; description: string;
};

const statusMap = {
  AVAILABLE: { label: "Mövcud", color: "var(--accent-green)" },
  BUSY: { label: "Məşğul", color: "var(--accent-amber)" },
  MAINTENANCE: { label: "T. baxış", color: "var(--accent-red)" },
} as const;

function RentPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Equip[]>([]);
  const [type, setType] = useState<(typeof TYPES)[number]>("Hamısı");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("equipment").select("*").order("created_at", { ascending: false });
    setItems((data as Equip[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => items.filter((e) =>
      (type === "Hamısı" || e.type === type) &&
      (q === "" || `${e.name} ${e.brand} ${e.region}`.toLowerCase().includes(q.toLowerCase()))
    ), [items, type, q]
  );
  const available = items.filter((e) => e.status === "AVAILABLE").length;
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  return (
    <div className="px-5 pt-5 pb-10 flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight">Texnika icarəsi</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--text-secondary)]">
            <span className="text-[color:var(--accent-green)] font-semibold">{available} texnika</span> indi mövcuddur
          </p>
        </div>
        <button
          onClick={() => user ? setOpen(true) : showToast("Əvvəl daxil olun")}
          className="shrink-0 inline-flex items-center gap-1.5 h-10 px-3.5 rounded-md bg-[color:var(--accent-green)] text-[color:var(--bg-primary)] text-[13px] font-semibold"
        >
          <Plus className="h-4 w-4" /> Texnika əlavə et
        </button>
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
            <button key={t} onClick={() => setType(t)}
              className="shrink-0 px-4 h-9 rounded-pill text-[13px] font-semibold border transition-colors"
              style={{
                background: active ? "var(--accent-green)" : "var(--bg-secondary)",
                color: active ? "var(--bg-primary)" : "var(--text-secondary)",
                borderColor: active ? "var(--accent-green)" : "var(--border-accent)",
              }}>{t}</button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-16 grid place-items-center text-[color:var(--text-tertiary)]"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[color:var(--text-tertiary)] text-[13px]">Hələlik texnika yoxdur. İlk elanı sən ver!</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((e) => {
            const s = statusMap[e.status] ?? statusMap.AVAILABLE;
            return (
              <article key={e.id} className="rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] overflow-hidden hover:border-[color:var(--accent-green)]/40 transition-colors">
                <div className="relative aspect-[16/9] bg-[color:var(--bg-tertiary)]">
                  {e.image && <img src={e.image} alt={e.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
                  <div className="absolute top-3 left-3">
                    <span className="badge-pill bg-[color:var(--bg-primary)]/85 backdrop-blur" style={{ color: s.color, borderColor: `${s.color}40` }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />{s.label}
                    </span>
                  </div>
                  {e.insured && (
                    <div className="absolute top-3 right-3">
                      <span className="badge-pill" style={{ background: "var(--bg-primary)", color: "var(--accent-teal)" }}>
                        <ShieldCheck className="h-3 w-3" /> Sığortalı
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-[16px] font-semibold leading-tight">{e.name}</h3>
                      <p className="mt-0.5 text-[12px] text-[color:var(--text-secondary)]">{e.brand} · {e.year}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-[18px] font-bold tabular-nums text-[color:var(--accent-green)]">
                        ₼{Number(e.price_per_hour).toFixed(0)}<span className="text-[11px] text-[color:var(--text-secondary)] font-normal">/saat</span>
                      </p>
                      <p className="text-[11px] font-mono-tabular text-[color:var(--text-tertiary)]">₼{Number(e.price_per_day).toFixed(0)}/gün</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-[color:var(--text-secondary)]">
                    {e.power_kw > 0 && <span className="inline-flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5" /> {e.power_kw} kW</span>}
                    <span className="inline-flex items-center gap-1.5"><Fuel className="h-3.5 w-3.5" /> {e.fuel}</span>
                    <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {e.region}{e.district ? `, ${e.district}` : ""}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {open && user && (
        <PostEquipmentDialog userId={user.id} onClose={() => setOpen(false)} onCreated={() => { setOpen(false); showToast("Texnika əlavə olundu"); load(); }} />
      )}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[color:var(--bg-secondary)] border border-[color:var(--border-accent)] rounded-md px-4 py-2 text-[13px] shadow-lg">{toast}</div>
      )}
    </div>
  );
}

function PostEquipmentDialog({ userId, onClose, onCreated }: { userId: string; onClose: () => void; onCreated: () => void }) {
  const [f, setF] = useState({
    name: "", brand: "", year: "2022", type: "Traktor",
    price_per_hour: "", price_per_day: "", region: REGIONS[0] as string, district: "",
    power_kw: "", fuel: "Dizel" as string, insured: false, image: "", description: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!f.name) { setErr("Texnika adı vacibdir"); return; }
    setBusy(true);
    const { error } = await supabase.from("equipment").insert({
      owner_id: userId, name: f.name, brand: f.brand, year: Number(f.year) || 2022, type: f.type,
      price_per_hour: Number(f.price_per_hour) || 0, price_per_day: Number(f.price_per_day) || 0,
      region: f.region, district: f.district, power_kw: Number(f.power_kw) || 0, fuel: f.fuel,
      insured: f.insured, image: f.image, description: f.description, status: "AVAILABLE",
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-[color:var(--bg-secondary)] border border-[color:var(--border-accent)] rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--border)]">
          <h2 className="font-display text-[18px] font-bold">Yeni texnika</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <Field label="Ad *"><input className="inp" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Brend"><input className="inp" value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} /></Field>
            <Field label="İl"><input type="number" className="inp" value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tip">
              <select className="inp" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
                {TYPES.filter((t) => t !== "Hamısı").map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Yanacaq">
              <select className="inp" value={f.fuel} onChange={(e) => setF({ ...f, fuel: e.target.value })}>
                {FUELS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Saatlıq (₼)"><input type="number" className="inp" value={f.price_per_hour} onChange={(e) => setF({ ...f, price_per_hour: e.target.value })} /></Field>
            <Field label="Günlük (₼)"><input type="number" className="inp" value={f.price_per_day} onChange={(e) => setF({ ...f, price_per_day: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Region">
              <select className="inp" value={f.region} onChange={(e) => setF({ ...f, region: e.target.value })}>
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Rayon"><input className="inp" value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Güc (kW)"><input type="number" className="inp" value={f.power_kw} onChange={(e) => setF({ ...f, power_kw: e.target.value })} /></Field>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[color:var(--text-secondary)]">Sığorta</span>
              <label className="inp inline-flex items-center gap-2 text-[13px]">
                <input type="checkbox" checked={f.insured} onChange={(e) => setF({ ...f, insured: e.target.checked })} /> Sığortalı
              </label>
            </label>
          </div>
          <Field label="Şəkil URL"><input className="inp" value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} /></Field>
          <Field label="Təsvir"><textarea className="inp min-h-[80px]" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          {err && <p className="text-[12px] text-[color:var(--accent-red)]">{err}</p>}
          <button disabled={busy} onClick={submit} className="mt-2 h-11 rounded-md bg-[color:var(--accent-green)] text-[color:var(--bg-primary)] font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Yerləşdir
          </button>
        </div>
      </div>
      <style>{`.inp{width:100%;height:42px;padding:0 12px;border-radius:8px;background:var(--bg-tertiary);border:1px solid var(--border-accent);color:inherit;font-size:14px} .inp:focus{outline:none;border-color:var(--accent-green)} textarea.inp{padding:10px 12px;height:auto}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-[color:var(--text-secondary)]">{label}</span>
      {children}
    </label>
  );
}
