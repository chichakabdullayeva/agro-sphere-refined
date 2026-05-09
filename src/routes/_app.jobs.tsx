import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Calendar, Users, Zap, Plus, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { JOBS as MOCK_JOBS } from "@/data/mock";
import { REGIONS } from "@/data/mock";

export const Route = createFileRoute("/_app/jobs")({
  component: JobsPage,
  head: () => ({ meta: [{ title: "AgroJobs — İş elanları" }] }),
});

const FILTERS = ["Hamısı", "Dərmanlama", "Yığım", "Aqronom", "Sürücülük", "Digər"] as const;

type Job = {
  id: string;
  owner_id: string;
  title: string;
  task_type: string;
  description: string;
  region: string;
  district: string | null;
  start_date: string | null;
  end_date: string | null;
  workers_needed: number;
  skills: string[];
  daily_rate: number;
  urgent: boolean;
  employer_name: string;
  created_at: string;
};

function JobsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Hamısı");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [postOpen, setPostOpen] = useState(false);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setJobs(data as Job[]);
    setLoading(false);

    if (user) {
      const { data: apps } = await supabase
        .from("job_applications")
        .select("job_id")
        .eq("applicant_id", user.id);
      if (apps) setAppliedIds(new Set(apps.map((a) => a.job_id)));
    }
  };

  useEffect(() => { load(); }, [user?.id]);

  // Show DB jobs first; if none, fallback to demo data so the page isn't empty.
  const allJobs: Job[] = useMemo(() => {
    if (jobs.length > 0) return jobs;
    return MOCK_JOBS.map((j) => ({
      id: j.id,
      owner_id: "",
      title: j.title,
      task_type: j.taskType,
      description: j.description,
      region: j.region,
      district: j.district,
      start_date: j.startDate,
      end_date: j.endDate,
      workers_needed: j.workersNeeded,
      skills: j.skills,
      daily_rate: j.dailyRate,
      urgent: j.urgent,
      employer_name: j.employer.name,
      created_at: new Date().toISOString(),
    }));
  }, [jobs]);

  const filtered = useMemo(
    () => (filter === "Hamısı" ? allJobs : allJobs.filter((j) => j.task_type === filter)),
    [filter, allJobs],
  );

  return (
    <div className="px-5 pt-5 flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight">İş elanları</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--text-secondary)]">
            <span className="text-[color:var(--accent-green)] font-semibold">{allJobs.length} aktiv</span> elan · işçi və ya elan verən kimi qoşulun
          </p>
        </div>
        <button
          onClick={() => setPostOpen(true)}
          className="shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-md text-[13px] font-semibold"
          style={{ background: "var(--accent-green)", color: "var(--accent-green-fg)" }}
        >
          <Plus className="h-4 w-4" /> Elan ver
        </button>
      </div>

      <div className="-mx-5 px-5 flex gap-2 overflow-x-auto scrollbar-none">
        {FILTERS.map((t) => {
          const active = t === filter;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="shrink-0 px-4 h-9 rounded-pill text-[13px] font-semibold border transition-colors"
              style={{
                background: active ? "var(--accent-green)" : "var(--bg-secondary)",
                color: active ? "var(--accent-green-fg)" : "var(--text-secondary)",
                borderColor: active ? "var(--accent-green)" : "var(--border-accent)",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-10 grid place-items-center text-[color:var(--text-secondary)] text-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((j) => {
            const applied = appliedIds.has(j.id);
            const isOwner = user?.id === j.owner_id;
            return (
              <article
                key={j.id}
                className="rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] p-4 hover:border-[color:var(--accent-green)]/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[16px] font-semibold leading-tight">{j.title}</h3>
                      {j.urgent && (
                        <span className="badge-pill" data-variant="danger">
                          <Zap className="h-3 w-3" /> Təcili
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] text-[color:var(--text-secondary)]">
                      {j.employer_name || "AgroSphere"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-[18px] font-bold tabular-nums text-[color:var(--accent-green)]">
                      ₼{j.daily_rate}
                    </p>
                    <p className="text-[11px] font-mono-tabular text-[color:var(--text-tertiary)]">/gün</p>
                  </div>
                </div>

                <p className="mt-2.5 text-[13px] text-[color:var(--text-secondary)] leading-relaxed line-clamp-2">
                  {j.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-[color:var(--text-secondary)]">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {j.region}{j.district ? `, ${j.district}` : ""}</span>
                  {j.start_date && (
                    <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {j.start_date}{j.end_date ? ` — ${j.end_date}` : ""}</span>
                  )}
                  <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {j.workers_needed} nəfər</span>
                </div>

                {j.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {j.skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[color:var(--bg-tertiary)] border border-[color:var(--border)] text-[color:var(--text-secondary)]">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-end pt-3 border-t border-[color:var(--border)]">
                  <button
                    onClick={() => setApplyJob(j)}
                    disabled={!j.owner_id || applied || isOwner}
                    className="h-9 px-4 rounded-md text-[13px] font-semibold disabled:opacity-50"
                    style={{ background: "var(--accent-green)", color: "var(--accent-green-fg)" }}
                  >
                    {isOwner ? "Sizin elanınız" : applied ? "Müraciət göndərildi ✓" : !j.owner_id ? "Demo elan" : "Müraciət et"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {postOpen && (
        <PostJobDialog
          onClose={() => setPostOpen(false)}
          onCreated={() => { setPostOpen(false); load(); showToast("Elan dərc olundu ✓"); }}
        />
      )}

      {applyJob && (
        <ApplyDialog
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onApplied={() => {
            setAppliedIds((s) => new Set([...s, applyJob.id]));
            setApplyJob(null);
            showToast("Müraciətiniz göndərildi ✓");
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-28 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg bg-[color:var(--bg-elevated)] border border-[color:var(--accent-green)]/40 text-[13px] font-semibold shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function PostJobDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState("Yığım");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState(REGIONS[0]);
  const [district, setDistrict] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workersNeeded, setWorkersNeeded] = useState(1);
  const [dailyRate, setDailyRate] = useState(80);
  const [urgent, setUrgent] = useState(false);
  const [skills, setSkills] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErr(null);
    setSaving(true);
    const employerName = (user.user_metadata?.full_name as string | undefined) || user.email || "AgroSphere istifadəçisi";
    const { error } = await supabase.from("jobs").insert({
      owner_id: user.id,
      title,
      task_type: taskType,
      description,
      region,
      district: district || null,
      start_date: startDate || null,
      end_date: endDate || null,
      workers_needed: workersNeeded,
      daily_rate: dailyRate,
      urgent,
      employer_name: employerName,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onCreated();
  };

  return (
    <Modal onClose={onClose} title="Yeni iş elanı">
      <form onSubmit={submit} className="space-y-3">
        <Field label="Başlıq">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="agro-input" placeholder="məs. Pomidor yığımı" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Növ">
            <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="agro-input">
              {["Yığım", "Dərmanlama", "Aqronom", "Sürücülük", "Digər"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Region">
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="agro-input">
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Təsvir">
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="agro-input resize-none" placeholder="İşin təfərrüatları..." />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Rayon / kənd">
            <input value={district} onChange={(e) => setDistrict(e.target.value)} className="agro-input" />
          </Field>
          <Field label="Bacarıqlar (vergüllə)">
            <input value={skills} onChange={(e) => setSkills(e.target.value)} className="agro-input" placeholder="Yığım, Çəkmə" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Başlama tarixi">
            <input value={startDate} onChange={(e) => setStartDate(e.target.value)} className="agro-input" placeholder="20 May" />
          </Field>
          <Field label="Bitmə tarixi">
            <input value={endDate} onChange={(e) => setEndDate(e.target.value)} className="agro-input" placeholder="30 May" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="İşçi sayı">
            <input type="number" min={1} value={workersNeeded} onChange={(e) => setWorkersNeeded(+e.target.value)} className="agro-input" />
          </Field>
          <Field label="Gündəlik haqq (₼)">
            <input type="number" min={0} value={dailyRate} onChange={(e) => setDailyRate(+e.target.value)} className="agro-input" />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-[color:var(--text-secondary)]">
          <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
          Təcili elan kimi göstər
        </label>
        {err && <p className="text-[13px] text-[color:var(--accent-red)]">{err}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded-md border border-[color:var(--border-accent)] text-[14px] font-semibold">
            Ləğv et
          </button>
          <button type="submit" disabled={saving} className="flex-1 h-11 rounded-md text-[14px] font-semibold disabled:opacity-60" style={{ background: "var(--accent-green)", color: "var(--accent-green-fg)" }}>
            {saving ? "Dərc edilir..." : "Dərc et"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ApplyDialog({ job, onClose, onApplied }: { job: Job; onClose: () => void; onApplied: () => void }) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErr(null);
    setSaving(true);
    const { error } = await supabase.from("job_applications").insert({
      job_id: job.id,
      applicant_id: user.id,
      message,
    });
    setSaving(false);
    if (error) {
      setErr(error.code === "23505" ? "Bu elana artıq müraciət etmisiniz" : error.message);
      return;
    }
    onApplied();
  };

  return (
    <Modal onClose={onClose} title="İşə müraciət">
      <div className="rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-tertiary)] px-3.5 py-3 mb-3">
        <p className="text-[14px] font-semibold">{job.title}</p>
        <p className="text-[12px] text-[color:var(--text-secondary)] mt-0.5">{job.employer_name} · {job.region}</p>
        <p className="text-[12px] text-[color:var(--accent-green)] mt-1 font-semibold">₼{job.daily_rate}/gün · {job.workers_needed} nəfər</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Özünüz haqqında qısa məlumat">
          <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="agro-input resize-none" placeholder="Təcrübəniz, bacarıqlarınız, neçə günə hazırsınız..." />
        </Field>
        {err && <p className="text-[13px] text-[color:var(--accent-red)]">{err}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded-md border border-[color:var(--border-accent)] text-[14px] font-semibold">Ləğv</button>
          <button type="submit" disabled={saving} className="flex-1 h-11 rounded-md text-[14px] font-semibold disabled:opacity-60" style={{ background: "var(--accent-green)", color: "var(--accent-green-fg)" }}>
            {saving ? "Göndərilir..." : "Müraciət göndər"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)]">
        <div className="flex items-center justify-between px-5 h-14 border-b border-[color:var(--border)] sticky top-0 bg-[color:var(--bg-secondary)]">
          <h2 className="font-display text-[16px] font-semibold">{title}</h2>
          <button onClick={onClose} className="grid place-items-center w-9 h-9 rounded-md hover:bg-[color:var(--bg-tertiary)]" aria-label="Bağla">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold mb-1.5 text-[color:var(--text-secondary)]">{label}</span>
      {children}
    </label>
  );
}
