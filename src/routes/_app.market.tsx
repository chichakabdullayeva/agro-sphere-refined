import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter } from "lucide-react";

export const Route = createFileRoute("/_app/market")({
  component: MarketPage,
  head: () => ({ meta: [{ title: "Market — AgroAzər" }] }),
});

const PRODUCTS = [
  { id: "m1", title: "Pomidor — F1 Manon", price: "0.68", unit: "kq", stock: 1200, region: "Sabirabad", seller: "Aqro Cənub", rating: 4.7, bnpl: true, organic: false, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=70" },
  { id: "m2", title: "Üzvi alma — Goldrush", price: "1.40", unit: "kq", stock: 800, region: "Quba", seller: "Quba Bağları", rating: 4.9, bnpl: false, organic: true, image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=70" },
  { id: "m3", title: "Buğda toxumu — Qırmızı Gül", price: "2.10", unit: "kq", stock: 5000, region: "Tovuz", seller: "Tovuz Toxum", rating: 4.5, bnpl: true, organic: false, image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=70" },
  { id: "m4", title: "NPK gübrə 16-16-16", price: "1.85", unit: "kq", stock: 3200, region: "Bakı", seller: "AgroChem", rating: 4.6, bnpl: true, organic: false, image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=70" },
];

function MarketPage() {
  return (
    <div className="px-5 pt-5 flex flex-col gap-4">
      <div>
        <h1 className="font-display text-[26px] font-bold tracking-tight">Marketplace</h1>
        <p className="mt-0.5 text-[13px] text-[color:var(--text-secondary)]">
          Toxum, gübrə, məhsul — birbaşa fermerdən fermerə
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-tertiary)]" />
          <input
            placeholder="Məhsul axtar..."
            className="h-[52px] w-full rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-tertiary)] pl-10 pr-4 text-[15px] placeholder:text-[color:var(--text-tertiary)] focus:outline-none focus:border-[color:var(--accent-green)]"
          />
        </div>
        <button className="shrink-0 grid place-items-center w-[52px] h-[52px] rounded-md border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)]">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PRODUCTS.map((p) => (
          <article
            key={p.id}
            className="rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-secondary)] overflow-hidden"
          >
            <div className="relative aspect-[4/3] bg-[color:var(--bg-tertiary)]">
              <img src={p.image} alt={p.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              {p.bnpl && (
                <span className="absolute top-2 right-2 badge-pill" data-variant="warning">BNPL</span>
              )}
              {p.organic && (
                <span className="absolute top-2 left-2 badge-pill" data-variant="success">Üzvi</span>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-[13px] font-semibold leading-tight line-clamp-2">{p.title}</h3>
              <p className="mt-1.5 font-display text-[16px] font-bold tabular-nums text-[color:var(--accent-green)]">
                ₼{p.price}<span className="text-[10px] text-[color:var(--text-secondary)] font-normal">/{p.unit}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-[color:var(--text-tertiary)]">
                {p.seller} · {p.region}
              </p>
              <p className="mt-1 text-[11px] font-mono-tabular text-[color:var(--text-secondary)]">
                ★ {p.rating}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
