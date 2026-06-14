type Slice = { label: string; value: number };

const SEGMENTS = 6;

const R = 42;
const CIRC = 2 * Math.PI * R;

export default function DonutChart({
  title,
  caption,
  slices,
}: {
  title: string;
  caption: string;
  slices: Slice[];
}) {
  const data = group(slices);
  const total = data.reduce((acc, s) => acc + s.value, 0);

  return (
    <div className="chart">
      <span className="label">{title}</span>

      {total === 0 ? (
        <p className="muted">Brak wydanych kwot.</p>
      ) : (
        <div className="chart-body">
          <svg viewBox="0 0 100 100" className="donut" role="img" aria-label={title}>
            <g transform="rotate(-90 50 50)">
              {drawSegments(data, total)}
            </g>
            <text x="50" y="47" className="donut-total">
              {total.toLocaleString("pl-PL")}
            </text>
            <text x="50" y="58" className="donut-caption">
              PLN · {caption}
            </text>
          </svg>

          <ul className="legend">
            {data.map((s, i) => (
              <li key={i}>
                <span className={`dot seg${i % SEGMENTS}`} />
                <span className="legend-name">{s.label}</span>
                <span className="muted">{((s.value / total) * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function group(slices: Slice[]): Slice[] {
  const sorted = slices.filter((s) => s.value > 0).sort((a, b) => b.value - a.value);
  if (sorted.length <= SEGMENTS) return sorted;

  const top = sorted.slice(0, SEGMENTS - 1);
  const other = sorted.slice(SEGMENTS - 1).reduce((acc, s) => acc + s.value, 0);
  return [...top, { label: "Inne", value: other }];
}

function drawSegments(data: Slice[], total: number) {
  let offset = 0;
  return data.map((s, i) => {
    const len = (s.value / total) * CIRC;
    const seg = (
      <circle
        key={i}
        className={`seg${i % SEGMENTS}`}
        cx="50"
        cy="50"
        r={R}
        fill="none"
        strokeWidth="16"
        strokeDasharray={`${len} ${CIRC - len}`}
        strokeDashoffset={-offset}
      />
    );
    offset += len;
    return seg;
  });
}
