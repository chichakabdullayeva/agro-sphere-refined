import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Plus, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { REGIONS } from "@/data/mock";

export const Route = createFileRoute("/_app/market")({
  component: MarketPage,
  head: () => ({ meta: [{ title: "Market — AgroAzər" }] }),
});

type Product = {
  id: string;
  owner_id: string;
  title: string;
  price: number;
  unit: string;
  stock: number;
  region: string;
  seller: string;
  rating: number;
  bnpl: boolean;
  organic: boolean;
  image: string;
  description: string;
};

function MarketPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setItems((data as Product[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => items.filter((p) => q === "" || `${p.title} ${p.seller} ${p.region}`.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  return (
    <div className="px-5 pt-5 pb-10 flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight">Marketplace</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--text-secondary)]">
            Toxum, gübrə, məhsul — birbaşa fermerdən fermerə
          </p>
        </div>
        <button
          onClick={() => user ? setOpen(true) : showToast("Əvvəl daxil olun")}
          className="shrink-0 inline-flex items-center gap-1.5 h-10 px-3.5 rounded-md bg-[color:var(--accent-green)] text-[color:var(--bg-primary)] text-[13px] font-semibold"
        >
          <Plus className="h-4 w-4" /> Elan ver
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-tertiary)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Məhsul axtar..."
          className="h-[52px] w-full rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-tertiary)] pl-10 pr-4 text-[15px] placeholder:text-[color:var(--text-tertiary)] focus:outline-none focus:border-[color:var(--accent-green)]"
        />
      </div>

      {loading ? (
        <div className="py-16 grid place-items-center text-[color:var(--text-tertiary)]"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[color:var(--text-tertiary)] text-[13px]">
          Hələlik elan yoxdur. İlk elanı sən ver!
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p) => (
            <article key={p.id} className="rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] overflow-hidden">
              <div className="relative aspect-[4/3] bg-[color:var(--bg-tertiary)]">
                {p.image && <img src={p.image} alt={p.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
                {p.bnpl && <span className="absolute top-2 right-2 badge-pill" data-variant="warning">BNPL</span>}
                {p.organic && <span className="absolute top-2 left-2 badge-pill" data-variant="success">Üzvi</span>}
              </div>
              <div className="p-3">
                <h3 className="text-[13px] font-semibold leading-tight line-clamp-2">{p.title}</h3>
                <p className="mt-1.5 font-display text-[16px] font-bold tabular-nums text-[color:var(--accent-green)]">
                  ₼{Number(p.price).toFixed(2)}<span className="text-[10px] text-[color:var(--text-secondary)] font-normal">/{p.unit}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-[color:var(--text-tertiary)]">
                  {p.seller || "—"} · {p.region || "—"}
                </p>
                {p.rating > 0 && <p className="mt-1 text-[11px] font-mono-tabular text-[color:var(--text-secondary)]">★ {Number(p.rating).toFixed(1)}</p>}
              </div>
            </article>
          ))}
        </div>
      )}

      {open && user && (
        <PostProductDialog
          userId={user.id}
          onClose={() => setOpen(false)}
          onCreated={() => { setOpen(false); showToast("Elan yerləşdirildi"); load(); }}
        />
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[color:var(--bg-secondary)] border border-[color:var(--border-accent)] rounded-md px-4 py-2 text-[13px] shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function PostProductDialog({ userId, onClose, onCreated }: { userId: string; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: "", price: "", unit: "kq", stock: "", region: REGIONS[0] as string,
    seller: "", image: "", description: "", bnpl: false, organic: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!form.title || !form.price) { setErr("Ad və qiymət vacibdir"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("products").insert({
      owner_id: userId,
      title: form.title,
      price: Number(form.price) || 0,
      unit: form.unit,
      stock: Number(form.stock) || 0,
      region: form.region,
      seller: form.seller,
      image: form.image,
      description: form.description,
      bnpl: form.bnpl,
      organic: form.organic,
    });
    setSubmitting(false);
    if (error) { setErr(error.message); return; }
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-[color:var(--bg-secondary)] border border-[color:var(--border-accent)] rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--border)]">
          <h2 className="font-display text-[18px] font-bold">Yeni məhsul elanı</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <Field label="Məhsul adı *"><input className="inp" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Qiymət (₼) *"><input type="number" step="0.01" className="inp" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
            <Field label="Vahid"><input className="inp" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ehtiyat"><input type="number" className="inp" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></Field>
            <Field label="Region">
              <select className="inp" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Satıcı / Təsərrüfat"><input className="inp" value={form.seller} onChange={(e) => setForm({ ...form, seller: e.target.value })} /></Field>
          <Field label="Şəkil URL"><input className="inp" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></Field>
          <Field label="Təsvir"><textarea className="inp min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="flex gap-4 text-[13px]">
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.bnpl} onChange={(e) => setForm({ ...form, bnpl: e.target.checked })} /> BNPL</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.organic} onChange={(e) => setForm({ ...form, organic: e.target.checked })} /> Üzvi</label>
          </div>
          {err && <p className="text-[12px] text-[color:var(--accent-red)]">{err}</p>}
          <button disabled={submitting} onClick={submit} className="mt-2 h-11 rounded-md bg-[color:var(--accent-green)] text-[color:var(--bg-primary)] font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Yerləşdir
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
