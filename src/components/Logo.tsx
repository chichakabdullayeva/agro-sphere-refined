export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <div
        className="grid place-items-center rounded-md border"
        style={{
          width: size,
          height: size,
          background: "var(--bg-tertiary)",
          borderColor: "var(--border-accent)",
        }}
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3 L12 21 M12 8 C 8 8 5 11 5 15 M12 8 C 16 8 19 11 19 15 M12 14 C 9 14 7 16 7 19 M12 14 C 15 14 17 16 17 19"
            stroke="var(--accent-green)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span
        className="font-display font-bold tracking-tight"
        style={{ fontSize: size * 0.68, color: "var(--text-primary)" }}
      >
        Agro<span style={{ color: "var(--accent-green)" }}>Azər</span>
      </span>
    </div>
  );
}
