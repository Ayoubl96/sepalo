export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center gap-2 font-semibold tracking-tight text-ink"
      style={{ fontSize: size }}
    >
      <span
        className="inline-flex items-center justify-center rounded bg-primary font-bold text-paper"
        style={{ width: size + 6, height: size + 6, fontSize: size * 0.65, borderRadius: 5 }}
      >
        S
      </span>
      <span>Sepalo</span>
    </span>
  );
}
