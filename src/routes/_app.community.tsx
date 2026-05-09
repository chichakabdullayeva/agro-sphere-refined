import { createFileRoute } from "@tanstack/react-router";
import { POSTS, ACTIVE_SOS } from "@/data/mock";
import { TriangleAlert, Sparkles, ArrowUp, MessageSquare, Share2, ShieldCheck, MapPin, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/community")({
  component: CommunityPage,
  head: () => ({ meta: [{ title: "İcma — AgroAzər" }] }),
});

function CommunityPage() {
  return (
    <div className="px-5 pt-5 flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight">İcma</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--text-secondary)]">
            Şəmkir rayonu · 1,240 fermer
          </p>
        </div>
        <button className="shrink-0 inline-flex items-center gap-1.5 h-10 px-3.5 rounded-md bg-[color:var(--accent-green)] text-[color:var(--bg-primary)] text-[13px] font-semibold">
          <Plus className="h-4 w-4" /> Paylaş
        </button>
      </div>

      {/* SOS pinned card */}
      <article className="relative rounded-lg border border-[color:var(--accent-red)]/40 border-l-[3px] border-l-[color:var(--accent-red)] bg-[color:color-mix(in_oklab,var(--accent-red)_8%,var(--bg-secondary))] p-4">
        <div className="flex items-start gap-3">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-[color:var(--accent-red)]/20 text-[color:var(--accent-red)] pulse-red">
            <TriangleAlert className="h-4 w-4" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="badge-pill" data-variant="danger">SOS · {ACTIVE_SOS.severity}</span>
              <span className="text-[11px] text-[color:var(--text-tertiary)]">{ACTIVE_SOS.createdAt}</span>
            </div>
            <h3 className="mt-1.5 text-[16px] font-semibold">{ACTIVE_SOS.type}</h3>
            <p className="mt-0.5 text-[12px] text-[color:var(--text-secondary)]">
              Təsirlənən rayonlar: {ACTIVE_SOS.regions.join(" · ")}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed">{ACTIVE_SOS.description}</p>
            <button className="mt-3 h-9 px-4 rounded-md bg-[color:var(--accent-red)] text-white text-[13px] font-semibold">
              Bütün rayona paylaş
            </button>
          </div>
        </div>
      </article>

      {/* Feed */}
      {POSTS.map((p) => (
        <article
          key={p.id}
          className="rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="grid place-items-center w-9 h-9 rounded-full bg-[color:var(--bg-tertiary)] text-[12px] font-semibold">
              {p.author.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[14px] font-semibold truncate">{p.author.name}</p>
                {p.author.isExpert && (
                  <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--accent-teal)]" strokeWidth={2.2} />
                )}
              </div>
              <p className="text-[12px] text-[color:var(--text-tertiary)] inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {p.author.region} · {p.timeAgo}
              </p>
            </div>
          </div>

          <p className="mt-3 text-[14px] leading-relaxed">{p.content}</p>

          {p.image && (
            <div className="mt-3 rounded-md overflow-hidden border border-[color:var(--border)]">
              <img src={p.image} alt="" loading="lazy" className="w-full aspect-[4/3] object-cover" />
            </div>
          )}

          {p.aiAnalysis && (
            <div className="mt-3 rounded-md border border-[color:var(--accent-teal)]/35 bg-[color:color-mix(in_oklab,var(--accent-teal)_10%,transparent)] p-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[color:var(--accent-teal)]" strokeWidth={2} />
                <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-[color:var(--accent-teal)]">
                  AI Analizi
                </p>
                <span className="ml-auto text-[11px] font-mono-tabular text-[color:var(--text-secondary)]">
                  {p.aiAnalysis.confidence}% ehtimal
                </span>
              </div>
              <p className="mt-2 text-[14px] font-semibold">{p.aiAnalysis.disease}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-tertiary)] font-semibold">
                Tövsiyə olunan müalicə
              </p>
              <ol className="mt-1.5 space-y-1.5">
                {p.aiAnalysis.treatment.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] text-[color:var(--text-secondary)]">
                    <span className="font-mono-tabular text-[color:var(--accent-teal)] shrink-0 w-4">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <span key={t} className="text-[12px] text-[color:var(--accent-green)] font-medium">
                {t}
              </span>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-[color:var(--border)] flex items-center gap-1">
            <button className="flex items-center gap-1.5 px-2.5 h-8 rounded-md text-[12px] text-[color:var(--text-secondary)] hover:text-[color:var(--accent-green)] hover:bg-[color:var(--bg-tertiary)]">
              <ArrowUp className="h-3.5 w-3.5" /> <span className="font-mono-tabular">{p.upvotes}</span> Faydalı
            </button>
            <button className="flex items-center gap-1.5 px-2.5 h-8 rounded-md text-[12px] text-[color:var(--text-secondary)] hover:text-foreground hover:bg-[color:var(--bg-tertiary)]">
              <MessageSquare className="h-3.5 w-3.5" /> <span className="font-mono-tabular">{p.comments}</span>
            </button>
            <button className="ml-auto flex items-center gap-1.5 px-2.5 h-8 rounded-md text-[12px] text-[color:var(--text-secondary)] hover:text-foreground hover:bg-[color:var(--bg-tertiary)]">
              <Share2 className="h-3.5 w-3.5" /> Paylaş
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
