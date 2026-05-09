import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, X, Loader2, MessageSquare, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_app/community")({
  component: CommunityPage,
  head: () => ({ meta: [{ title: "İcma — AgroAzər" }] }),
});

type Post = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: string;
  image: string;
  created_at: string;
  author_name?: string;
};

const CATEGORIES = ["Ümumi", "Sual", "Tövsiyə", "Xəstəlik", "Hava"];

function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "indi";
  if (d < 3600) return `${Math.floor(d / 60)} dəq əvvəl`;
  if (d < 86400) return `${Math.floor(d / 3600)} saat əvvəl`;
  return `${Math.floor(d / 86400)} gün əvvəl`;
}

function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });
    const list = (rows as Post[]) ?? [];
    if (list.length) {
      const ids = Array.from(new Set(list.map((p) => p.author_id)));
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p.full_name]));
      list.forEach((p) => { p.author_name = map.get(p.author_id) || "Anonim fermer"; });
    }
    setPosts(list);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  return (
    <div className="px-5 pt-5 pb-10 flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight">İcma</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--text-secondary)]">Fermerlər bir-birinə kömək edir</p>
        </div>
        <button
          onClick={() => user ? setOpen(true) : showToast("Əvvəl daxil olun")}
          className="shrink-0 inline-flex items-center gap-1.5 h-10 px-3.5 rounded-md bg-[color:var(--accent-green)] text-[color:var(--bg-primary)] text-[13px] font-semibold"
        >
          <Plus className="h-4 w-4" /> Paylaş
        </button>
      </div>

      {loading ? (
        <div className="py-16 grid place-items-center text-[color:var(--text-tertiary)]"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center text-[color:var(--text-tertiary)] text-[13px]">Hələlik yazı yoxdur. İlk paylaşımı sən et!</div>
      ) : (
        posts.map((p) => (
          <article key={p.id} className="rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] p-4">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center w-9 h-9 rounded-full bg-[color:var(--bg-tertiary)] text-[12px] font-semibold">
                {(p.author_name || "AA").split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold truncate">{p.author_name}</p>
                <p className="text-[12px] text-[color:var(--text-tertiary)]">{p.category} · {timeAgo(p.created_at)}</p>
              </div>
            </div>
            <h3 className="mt-3 text-[15px] font-semibold">{p.title}</h3>
            {p.content && <p className="mt-1 text-[14px] leading-relaxed text-[color:var(--text-secondary)] whitespace-pre-wrap">{p.content}</p>}
            {p.image && (
              <div className="mt-3 rounded-md overflow-hidden border border-[color:var(--border)]">
                <img src={p.image} alt="" loading="lazy" className="w-full aspect-[4/3] object-cover" />
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-[color:var(--border)] flex items-center gap-1">
              <button className="flex items-center gap-1.5 px-2.5 h-8 rounded-md text-[12px] text-[color:var(--text-secondary)] hover:text-foreground hover:bg-[color:var(--bg-tertiary)]">
                <MessageSquare className="h-3.5 w-3.5" /> Şərh
              </button>
              <button className="ml-auto flex items-center gap-1.5 px-2.5 h-8 rounded-md text-[12px] text-[color:var(--text-secondary)] hover:text-foreground hover:bg-[color:var(--bg-tertiary)]">
                <Share2 className="h-3.5 w-3.5" /> Paylaş
              </button>
            </div>
          </article>
        ))
      )}

      {open && user && (
        <PostDialog userId={user.id} onClose={() => setOpen(false)} onCreated={() => { setOpen(false); showToast("Yazı paylaşıldı"); load(); }} />
      )}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[color:var(--bg-secondary)] border border-[color:var(--border-accent)] rounded-md px-4 py-2 text-[13px] shadow-lg">{toast}</div>
      )}
    </div>
  );
}

function PostDialog({ userId, onClose, onCreated }: { userId: string; onClose: () => void; onCreated: () => void }) {
  const [f, setF] = useState({ title: "", content: "", category: "Ümumi", image: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!f.title) { setErr("Başlıq vacibdir"); return; }
    setBusy(true);
    const { error } = await supabase.from("community_posts").insert({
      author_id: userId, title: f.title, content: f.content, category: f.category, image: f.image,
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-[color:var(--bg-secondary)] border border-[color:var(--border-accent)] rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--border)]">
          <h2 className="font-display text-[18px] font-bold">Yeni paylaşım</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-[color:var(--text-secondary)]">Başlıq *</span>
            <input className="inp" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-[color:var(--text-secondary)]">Kateqoriya</span>
            <select className="inp" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-[color:var(--text-secondary)]">Məzmun</span>
            <textarea className="inp min-h-[120px]" value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-[color:var(--text-secondary)]">Şəkil URL</span>
            <input className="inp" value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} />
          </label>
          {err && <p className="text-[12px] text-[color:var(--accent-red)]">{err}</p>}
          <button disabled={busy} onClick={submit} className="mt-2 h-11 rounded-md bg-[color:var(--accent-green)] text-[color:var(--bg-primary)] font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Paylaş
          </button>
        </div>
      </div>
      <style>{`.inp{width:100%;height:42px;padding:0 12px;border-radius:8px;background:var(--bg-tertiary);border:1px solid var(--border-accent);color:inherit;font-size:14px} .inp:focus{outline:none;border-color:var(--accent-green)} textarea.inp{padding:10px 12px;height:auto}`}</style>
    </div>
  );
}
