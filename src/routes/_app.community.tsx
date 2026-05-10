import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, X, Loader2, MessageSquare, Star, Lock, Globe, Users, Image as ImageIcon,
  Video, Send, Trash2, ArrowLeft,
} from "lucide-react";
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
  media_url: string;
  media_type: string;
  group_id: string | null;
  created_at: string;
  author_name?: string;
  author_rating?: number;
  comment_count?: number;
};
type Group = {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  owner_id: string;
  cover: string;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
};
type Comment = { id: string; author_id: string; content: string; created_at: string; author_name?: string };

const CATEGORIES = ["Ümumi", "Sual", "Tövsiyə", "Xəstəlik", "Hava"];
const MAX_IMG = 5 * 1024 * 1024; // 5MB
const MAX_VID = 50 * 1024 * 1024; // 50MB

function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "indi";
  if (d < 3600) return `${Math.floor(d / 60)} dəq əvvəl`;
  if (d < 86400) return `${Math.floor(d / 3600)} saat əvvəl`;
  return `${Math.floor(d / 86400)} gün əvvəl`;
}

function CommunityPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"feed" | "groups">("feed");
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  return (
    <div className="px-5 pt-5 pb-10 flex flex-col gap-4 max-w-3xl mx-auto w-full">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight">İcma</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--text-secondary)]">
            Fermerlər bir-birinə kömək edir
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex w-full rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] p-1">
        {([["feed", "Lent"], ["groups", "Qruplar"]] as const).map(([k, lbl]) => (
          <button
            key={k}
            onClick={() => { setTab(k); setActiveGroup(null); }}
            className={`flex-1 h-9 rounded text-[13px] font-semibold transition-colors ${
              tab === k && !activeGroup
                ? "bg-[color:var(--bg-elevated)] text-foreground"
                : "text-[color:var(--text-secondary)]"
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {activeGroup ? (
        <GroupDetail group={activeGroup} user={user} onBack={() => setActiveGroup(null)} showToast={showToast} />
      ) : tab === "feed" ? (
        <Feed user={user} groupId={null} showToast={showToast} />
      ) : (
        <GroupsList user={user} onOpen={(g) => setActiveGroup(g)} showToast={showToast} />
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[color:var(--bg-secondary)] border border-[color:var(--border-accent)] rounded-md px-4 py-2 text-[13px] shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ──────────────── Feed (posts) ──────────────── */

function Feed({ user, groupId, showToast }: { user: any; groupId: string | null; showToast: (m: string) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [rateFor, setRateFor] = useState<{ id: string; name: string } | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("community_posts").select("*").order("created_at", { ascending: false });
    if (groupId) q = q.eq("group_id", groupId);
    else q = q.is("group_id", null);
    const { data: rows } = await q;
    const list = ((rows as Post[]) ?? []);

    if (list.length) {
      const ids = Array.from(new Set(list.map((p) => p.author_id)));
      const [profsRes, ratingsRes, commentsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name").in("id", ids),
        supabase.from("user_ratings").select("rated_user_id, stars").in("rated_user_id", ids),
        supabase.from("community_comments").select("post_id").in("post_id", list.map((p) => p.id)),
      ]);
      const nameMap = new Map((profsRes.data ?? []).map((p: any) => [p.id, p.full_name]));
      const ratingMap = new Map<string, number[]>();
      (ratingsRes.data ?? []).forEach((r: any) => {
        const arr = ratingMap.get(r.rated_user_id) ?? [];
        arr.push(r.stars);
        ratingMap.set(r.rated_user_id, arr);
      });
      const cmtMap = new Map<string, number>();
      (commentsRes.data ?? []).forEach((c: any) => cmtMap.set(c.post_id, (cmtMap.get(c.post_id) ?? 0) + 1));
      list.forEach((p) => {
        p.author_name = nameMap.get(p.author_id) || "Anonim fermer";
        const arr = ratingMap.get(p.author_id);
        p.author_rating = arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        p.comment_count = cmtMap.get(p.id) ?? 0;
      });
    }
    setPosts(list);
    setLoading(false);
  };
  useEffect(() => { load(); }, [groupId]);

  return (
    <>
      <div className="flex justify-end">
        <button
          onClick={() => user ? setOpen(true) : showToast("Əvvəl daxil olun")}
          className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-md bg-[color:var(--accent-green)] text-[color:var(--accent-green-fg,white)] text-[13px] font-semibold"
        >
          <Plus className="h-4 w-4" /> Paylaş
        </button>
      </div>

      {loading ? (
        <div className="py-16 grid place-items-center text-[color:var(--text-tertiary)]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center text-[color:var(--text-tertiary)] text-[13px]">
          Hələlik yazı yoxdur. İlk paylaşımı sən et!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              p={p}
              currentUserId={user?.id ?? null}
              onRate={(id, name) => setRateFor({ id, name })}
              onChange={load}
            />
          ))}
        </div>
      )}

      {open && user && (
        <PostDialog
          userId={user.id}
          groupId={groupId}
          onClose={() => setOpen(false)}
          onCreated={() => { setOpen(false); showToast("Yazı paylaşıldı"); load(); }}
        />
      )}

      {rateFor && user && (
        <RateDialog
          rater={user.id}
          target={rateFor}
          onClose={() => setRateFor(null)}
          onDone={() => { setRateFor(null); showToast("Reytinq qeyd olundu"); load(); }}
        />
      )}
    </>
  );
}

function PostCard({ p, currentUserId, onRate, onChange }: {
  p: Post; currentUserId: string | null;
  onRate: (id: string, name: string) => void;
  onChange: () => void;
}) {
  const [openComments, setOpenComments] = useState(false);
  const initials = (p.author_name || "AA").split(" ").map((n) => n[0]).join("").slice(0, 2);

  const remove = async () => {
    if (!confirm("Yazını silmək istədiyinə əminsən?")) return;
    await supabase.from("community_posts").delete().eq("id", p.id);
    onChange();
  };

  return (
    <article className="rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] p-4">
      <div className="flex items-center gap-3">
        <div className="grid place-items-center w-10 h-10 rounded-full bg-[color:var(--bg-tertiary)] text-[12px] font-semibold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[14px] font-semibold truncate">{p.author_name}</p>
            {!!p.author_rating && p.author_rating > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-[color:var(--text-secondary)]">
                <Star className="h-3 w-3 fill-current text-amber-500" />
                {p.author_rating.toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-[12px] text-[color:var(--text-tertiary)]">
            {p.category} · {timeAgo(p.created_at)}
          </p>
        </div>
        {currentUserId && currentUserId !== p.author_id && (
          <button
            onClick={() => onRate(p.author_id, p.author_name || "Fermer")}
            className="text-[12px] inline-flex items-center gap-1 px-2 h-8 rounded-md border border-[color:var(--border-accent)] hover:bg-[color:var(--bg-tertiary)]"
          >
            <Star className="h-3.5 w-3.5" /> Qiymətləndir
          </button>
        )}
        {currentUserId === p.author_id && (
          <button
            onClick={remove}
            className="grid place-items-center w-8 h-8 rounded-md hover:bg-[color:var(--bg-tertiary)] text-[color:var(--text-tertiary)]"
            aria-label="Sil"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <h3 className="mt-3 text-[15px] font-semibold">{p.title}</h3>
      {p.content && (
        <p className="mt-1 text-[14px] leading-relaxed text-[color:var(--text-secondary)] whitespace-pre-wrap">
          {p.content}
        </p>
      )}

      {p.media_url && p.media_type?.startsWith("video") ? (
        <video
          controls
          src={p.media_url}
          className="mt-3 w-full rounded-md border border-[color:var(--border)] max-h-[480px] bg-black"
        />
      ) : (p.media_url || p.image) ? (
        <div className="mt-3 rounded-md overflow-hidden border border-[color:var(--border)]">
          <img src={p.media_url || p.image} alt="" loading="lazy" className="w-full max-h-[480px] object-cover" />
        </div>
      ) : null}

      <div className="mt-3 pt-3 border-t border-[color:var(--border)] flex items-center gap-1">
        <button
          onClick={() => setOpenComments((v) => !v)}
          className="flex items-center gap-1.5 px-2.5 h-8 rounded-md text-[12px] text-[color:var(--text-secondary)] hover:text-foreground hover:bg-[color:var(--bg-tertiary)]"
        >
          <MessageSquare className="h-3.5 w-3.5" /> Şərhlər ({p.comment_count ?? 0})
        </button>
      </div>

      {openComments && <CommentSection postId={p.id} currentUserId={currentUserId} onCountChange={onChange} />}
    </article>
  );
}

function CommentSection({ postId, currentUserId, onCountChange }: {
  postId: string; currentUserId: string | null; onCountChange: () => void;
}) {
  const [items, setItems] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("community_comments").select("*").eq("post_id", postId).order("created_at");
    const list = (data as Comment[]) ?? [];
    if (list.length) {
      const ids = Array.from(new Set(list.map((c) => c.author_id)));
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p.full_name]));
      list.forEach((c) => { c.author_name = map.get(c.author_id) || "Anonim"; });
    }
    setItems(list);
  };
  useEffect(() => { load(); }, [postId]);

  const submit = async () => {
    if (!text.trim() || !currentUserId) return;
    setBusy(true);
    await supabase.from("community_comments").insert({ post_id: postId, author_id: currentUserId, content: text.trim() });
    setText("");
    setBusy(false);
    await load();
    onCountChange();
  };

  return (
    <div className="mt-3 pt-3 border-t border-[color:var(--border)] flex flex-col gap-2.5">
      {items.map((c) => (
        <div key={c.id} className="flex gap-2.5">
          <div className="grid place-items-center w-7 h-7 rounded-full bg-[color:var(--bg-tertiary)] text-[10px] font-semibold shrink-0">
            {(c.author_name || "AA").split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 bg-[color:var(--bg-tertiary)] rounded-lg px-3 py-2">
            <p className="text-[12px] font-semibold">{c.author_name} <span className="text-[color:var(--text-tertiary)] font-normal">· {timeAgo(c.created_at)}</span></p>
            <p className="text-[13px] whitespace-pre-wrap">{c.content}</p>
          </div>
        </div>
      ))}
      {currentUserId && (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Şərh yazın..."
            className="flex-1 h-10 px-3 rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-elevated)] text-[13px] outline-none focus:border-[color:var(--accent-green)]"
          />
          <button
            disabled={busy || !text.trim()}
            className="h-10 w-10 grid place-items-center rounded-md bg-[color:var(--accent-green)] text-[color:var(--accent-green-fg,white)] disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      )}
    </div>
  );
}

/* ──────────────── Post composer + media upload ──────────────── */

function PostDialog({ userId, groupId, onClose, onCreated }: {
  userId: string; groupId: string | null; onClose: () => void; onCreated: () => void;
}) {
  const [f, setF] = useState({ title: "", content: "", category: "Ümumi" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File | null) => {
    setErr(null);
    if (!file) { setFile(null); setPreview(null); return; }
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) { setErr("Yalnız şəkil və ya video"); return; }
    if (isImage && file.size > MAX_IMG) { setErr("Şəkil 5MB-dan böyükdür"); return; }
    if (isVideo && file.size > MAX_VID) { setErr("Video 50MB-dan böyükdür"); return; }
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!f.title.trim()) { setErr("Başlıq vacibdir"); return; }
    setBusy(true);
    try {
      let media_url = "";
      let media_type = "";
      if (file) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("community-media")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("community-media").getPublicUrl(path);
        media_url = pub.publicUrl;
        media_type = file.type;
      }
      const { error } = await supabase.from("community_posts").insert({
        author_id: userId,
        title: f.title.trim(),
        content: f.content,
        category: f.category,
        group_id: groupId,
        media_url,
        media_type,
      });
      if (error) throw error;
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xəta");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={onClose}>
      <div
        className="bg-[color:var(--bg-secondary)] border border-[color:var(--border-accent)] rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--border)]">
          <h2 className="font-display text-[18px] font-bold">Yeni paylaşım</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <Field label="Başlıq *">
            <input className="inp" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          </Field>
          <Field label="Kateqoriya">
            <select className="inp" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Məzmun">
            <textarea className="inp min-h-[120px]" value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} />
          </Field>

          <Field label="Şəkil və ya video (ixtiyari)">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { if (fileRef.current) { fileRef.current.accept = "image/*"; fileRef.current.click(); } }}
                className="flex-1 h-10 px-3 rounded-md border border-dashed border-[color:var(--border-accent)] bg-[color:var(--bg-tertiary)] text-[13px] inline-flex items-center justify-center gap-1.5 hover:border-[color:var(--accent-green)]"
              >
                <ImageIcon className="h-4 w-4" /> Şəkil (≤5MB)
              </button>
              <button
                type="button"
                onClick={() => { if (fileRef.current) { fileRef.current.accept = "video/*"; fileRef.current.click(); } }}
                className="flex-1 h-10 px-3 rounded-md border border-dashed border-[color:var(--border-accent)] bg-[color:var(--bg-tertiary)] text-[13px] inline-flex items-center justify-center gap-1.5 hover:border-[color:var(--accent-green)]"
              >
                <Video className="h-4 w-4" /> Video (≤50MB)
              </button>
              <input ref={fileRef} type="file" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </div>
            {preview && file && (
              <div className="mt-2 relative rounded-md overflow-hidden border border-[color:var(--border)]">
                {file.type.startsWith("video/") ? (
                  <video src={preview} className="w-full max-h-48 bg-black" controls />
                ) : (
                  <img src={preview} className="w-full max-h-48 object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => onFile(null)}
                  className="absolute top-2 right-2 grid place-items-center w-7 h-7 rounded-full bg-black/60 text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </Field>

          {err && <p className="text-[12px] text-[color:var(--accent-red)]">{err}</p>}
          <button
            disabled={busy}
            onClick={submit}
            className="mt-2 h-11 rounded-md bg-[color:var(--accent-green)] text-[color:var(--accent-green-fg,white)] font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Paylaş
          </button>
        </div>
      </div>
      <InpStyles />
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
function InpStyles() {
  return (
    <style>{`.inp{width:100%;height:42px;padding:0 12px;border-radius:8px;background:var(--bg-tertiary);border:1px solid var(--border-accent);color:inherit;font-size:14px}.inp:focus{outline:none;border-color:var(--accent-green)}textarea.inp{padding:10px 12px;height:auto}`}</style>
  );
}

/* ──────────────── Rate user dialog (5 stars) ──────────────── */

function RateDialog({ rater, target, onClose, onDone }: {
  rater: string; target: { id: string; name: string }; onClose: () => void; onDone: () => void;
}) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (stars < 1) { setErr("Ulduz seçin"); return; }
    setBusy(true);
    const { error } = await supabase.from("user_ratings").upsert(
      { rater_id: rater, rated_user_id: target.id, stars, comment },
      { onConflict: "rater_id,rated_user_id" },
    );
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-[color:var(--bg-secondary)] border border-[color:var(--border-accent)] rounded-lg w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--border)]">
          <h2 className="font-display text-[16px] font-bold">{target.name}-ı qiymətləndir</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 flex flex-col gap-3 items-center">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setStars(n)}
                className="p-1"
              >
                <Star
                  className={`h-8 w-8 ${(hover || stars) >= n ? "fill-amber-400 text-amber-400" : "text-[color:var(--text-tertiary)]"}`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Şərh (ixtiyari)"
            className="w-full min-h-[80px] p-3 rounded-md bg-[color:var(--bg-tertiary)] border border-[color:var(--border-accent)] text-[13px] outline-none focus:border-[color:var(--accent-green)]"
          />
          {err && <p className="text-[12px] text-[color:var(--accent-red)] self-start">{err}</p>}
          <button
            disabled={busy}
            onClick={submit}
            className="w-full h-11 rounded-md bg-[color:var(--accent-green)] text-[color:var(--accent-green-fg,white)] font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Yadda saxla
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Groups list ──────────────── */

function GroupsList({ user, onOpen, showToast }: {
  user: any; onOpen: (g: Group) => void; showToast: (m: string) => void;
}) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase.from("community_groups").select("*").order("created_at", { ascending: false });
    const list = (rows as Group[]) ?? [];
    if (list.length) {
      const { data: members } = await supabase
        .from("community_group_members")
        .select("group_id, user_id")
        .in("group_id", list.map((g) => g.id));
      const counts = new Map<string, number>();
      const mine = new Set<string>();
      (members ?? []).forEach((m: any) => {
        counts.set(m.group_id, (counts.get(m.group_id) ?? 0) + 1);
        if (user && m.user_id === user.id) mine.add(m.group_id);
      });
      list.forEach((g) => {
        g.member_count = counts.get(g.id) ?? 0;
        g.is_member = mine.has(g.id) || g.owner_id === user?.id;
      });
    }
    setGroups(list);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user?.id]);

  const join = async (g: Group) => {
    if (!user) { showToast("Əvvəl daxil olun"); return; }
    await supabase.from("community_group_members").insert({ group_id: g.id, user_id: user.id });
    showToast("Qrupa qoşuldun");
    load();
  };
  const leave = async (g: Group) => {
    if (!user) return;
    await supabase.from("community_group_members").delete().eq("group_id", g.id).eq("user_id", user.id);
    showToast("Qrupdan çıxdın");
    load();
  };

  return (
    <>
      <div className="flex justify-end">
        <button
          onClick={() => user ? setOpen(true) : showToast("Əvvəl daxil olun")}
          className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-md bg-[color:var(--accent-green)] text-[color:var(--accent-green-fg,white)] text-[13px] font-semibold"
        >
          <Plus className="h-4 w-4" /> Yeni qrup
        </button>
      </div>

      {loading ? (
        <div className="py-16 grid place-items-center text-[color:var(--text-tertiary)]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="py-16 text-center text-[color:var(--text-tertiary)] text-[13px]">
          Hələlik qrup yoxdur. İlkini sən yarat!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {groups.map((g) => (
            <div key={g.id} className="rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[15px] font-semibold flex items-center gap-1.5">
                  {g.is_private ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                  {g.name}
                </h3>
                <span className="text-[11px] text-[color:var(--text-tertiary)] inline-flex items-center gap-1">
                  <Users className="h-3 w-3" /> {g.member_count}
                </span>
              </div>
              {g.description && (
                <p className="text-[13px] text-[color:var(--text-secondary)] line-clamp-2">{g.description}</p>
              )}
              <div className="mt-1 flex gap-2">
                <button
                  onClick={() => onOpen(g)}
                  className="flex-1 h-9 rounded-md border border-[color:var(--border-accent)] text-[12px] font-semibold hover:bg-[color:var(--bg-tertiary)]"
                >
                  Aç
                </button>
                {g.owner_id !== user?.id && (
                  g.is_member ? (
                    <button onClick={() => leave(g)} className="h-9 px-3 rounded-md border border-[color:var(--border-accent)] text-[12px] font-semibold hover:bg-[color:var(--bg-tertiary)]">
                      Çıx
                    </button>
                  ) : (
                    <button onClick={() => join(g)} className="h-9 px-3 rounded-md bg-[color:var(--accent-green)] text-[color:var(--accent-green-fg,white)] text-[12px] font-semibold">
                      Qoşul
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {open && user && (
        <CreateGroupDialog userId={user.id} onClose={() => setOpen(false)} onCreated={() => { setOpen(false); showToast("Qrup yaradıldı"); load(); }} />
      )}
    </>
  );
}

function CreateGroupDialog({ userId, onClose, onCreated }: {
  userId: string; onClose: () => void; onCreated: () => void;
}) {
  const [f, setF] = useState({ name: "", description: "", is_private: false });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!f.name.trim()) { setErr("Ad vacibdir"); return; }
    setBusy(true);
    const { data, error } = await supabase
      .from("community_groups")
      .insert({ name: f.name.trim(), description: f.description, is_private: f.is_private, owner_id: userId })
      .select("id").single();
    if (!error && data) {
      // auto-join owner
      await supabase.from("community_group_members").insert({ group_id: data.id, user_id: userId, role: "owner" });
    }
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-[color:var(--bg-secondary)] border border-[color:var(--border-accent)] rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--border)]">
          <h2 className="font-display text-[18px] font-bold">Yeni qrup</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <Field label="Ad *">
            <input className="inp" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </Field>
          <Field label="Təsvir">
            <textarea className="inp min-h-[80px]" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 cursor-pointer text-[13px]">
            <input type="checkbox" checked={f.is_private} onChange={(e) => setF({ ...f, is_private: e.target.checked })} className="w-4 h-4 accent-[color:var(--accent-green)]" />
            <Lock className="h-3.5 w-3.5" /> Məxfi qrup (yalnız üzvlər görür)
          </label>
          {err && <p className="text-[12px] text-[color:var(--accent-red)]">{err}</p>}
          <button
            disabled={busy}
            onClick={submit}
            className="mt-2 h-11 rounded-md bg-[color:var(--accent-green)] text-[color:var(--accent-green-fg,white)] font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Yarat
          </button>
        </div>
      </div>
      <InpStyles />
    </div>
  );
}

function GroupDetail({ group, user, onBack, showToast }: {
  group: Group; user: any; onBack: () => void; showToast: (m: string) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="grid place-items-center w-9 h-9 rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)]">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-bold truncate inline-flex items-center gap-1.5">
            {group.is_private ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
            {group.name}
          </h2>
          {group.description && (
            <p className="text-[12px] text-[color:var(--text-secondary)] truncate">{group.description}</p>
          )}
        </div>
      </div>
      <Feed user={user} groupId={group.id} showToast={showToast} />
    </>
  );
}
