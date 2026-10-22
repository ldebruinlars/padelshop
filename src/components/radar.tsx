/** Zeshoek met de eigenschappen van een racket (0-10), naar het voorbeeld van de Bullpadel-catalogus. */
export function Radar({ values, label }: { values: { label: string; value: number }[]; label: string }) {
  const n = values.length;
  const R = 110;
  const pt = (i: number, r: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [150 + Math.cos(a) * r, 140 + Math.sin(a) * r] as const;
  };
  const ring = (f: number) => values.map((_, i) => pt(i, R * f).join(",")).join(" ");
  const shape = values.map((v, i) => pt(i, (R * v.value) / 10).join(",")).join(" ");
  return (
    <svg viewBox="0 0 300 280" className="w-full max-w-[360px]" role="img" aria-label={`${label}: ${values.map((v) => `${v.label} ${v.value}`).join(", ")}`}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="#2c241f" strokeWidth="1" />
      ))}
      {values.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1="150" y1="140" x2={x} y2={y} stroke="#2c241f" strokeWidth="1" />;
      })}
      <polygon points={shape} fill="#f06a30" fillOpacity="0.28" stroke="#f06a30" strokeWidth="2" strokeLinejoin="round" />
      {values.map((v, i) => {
        const [x, y] = pt(i, R + 18);
        return (
          <text key={v.label} x={x} y={y} fill="#b3a595" fontSize="11" textAnchor="middle" dominantBaseline="middle">
            {v.label}
          </text>
        );
      })}
    </svg>
  );
}
