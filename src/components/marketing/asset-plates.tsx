/**
 * Flat asset plates.
 *
 * Technical-drawing style SVGs of the two asset types we currently expose,
 * annotated with the coordinates of the sponsorable spots on each surface.
 *
 * Per AGENTS.md §5 this renderer is deliberately isolated: it is pure
 * presentation driven by the `*_PLATE` coordinate objects below, so it can be
 * swapped for a richer (or eventually 3D) renderer without touching the pages
 * that use it. It renders marketing illustrations only — it has no connection
 * to real assets, surfaces, or listings, none of which exist yet.
 */

type Spot = {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

type Plate = {
  readonly viewBox: string;
  readonly spots: readonly Spot[];
};

export const MACBOOK_PLATE: Plate = {
  viewBox: "0 0 560 400",
  spots: [{ id: "lid", label: "SPOT 01", x: 176, y: 126, width: 208, height: 104 }],
};

export const JERSEY_PLATE: Plate = {
  viewBox: "0 0 440 440",
  spots: [{ id: "chest", label: "SPOT 01", x: 160, y: 176, width: 120, height: 76 }],
};

type Tone = "light" | "dark";

const TONES: Record<Tone, { line: string; hair: string; wash: string; faint: string }> = {
  light: {
    line: "var(--color-ink)",
    hair: "var(--color-rule)",
    wash: "rgba(23, 20, 15, 0.035)",
    faint: "var(--color-ink-faint)",
  },
  dark: {
    line: "var(--color-chalk)",
    hair: "var(--color-rule-dark)",
    wash: "rgba(237, 231, 218, 0.04)",
    faint: "var(--color-chalk-muted)",
  },
};

function RegistrationMarks({ w, h, inset, color }: { w: number; h: number; inset: number; color: string }) {
  const arm = 7;
  const corners = [
    [inset, inset],
    [w - inset, inset],
    [inset, h - inset],
    [w - inset, h - inset],
  ];
  return (
    <g stroke={color} strokeWidth={1} aria-hidden="true">
      {corners.map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <line x1={cx - arm} y1={cy} x2={cx + arm} y2={cy} />
          <line x1={cx} y1={cy - arm} x2={cx} y2={cy + arm} />
        </g>
      ))}
    </g>
  );
}

function DimensionLine({
  x1,
  x2,
  y,
  color,
}: {
  x1: number;
  x2: number;
  y: number;
  color: string;
}) {
  return (
    <g stroke={color} strokeWidth={1} aria-hidden="true">
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} />
      <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} />
    </g>
  );
}

function SpotOutline({ spot, labelSize = 13 }: { spot: Spot; labelSize?: number }) {
  const cx = spot.x + spot.width / 2;
  const cy = spot.y + spot.height / 2;
  return (
    <g aria-hidden="true">
      <rect
        x={spot.x}
        y={spot.y}
        width={spot.width}
        height={spot.height}
        fill="rgba(217, 64, 42, 0.08)"
        stroke="var(--color-vermilion)"
        strokeWidth={1.5}
        strokeDasharray="7 5"
      />
      <text
        x={cx}
        y={cy - 3}
        textAnchor="middle"
        fill="var(--color-vermilion-deep)"
        fontFamily="var(--font-mono)"
        fontSize={labelSize}
        fontWeight={600}
        letterSpacing="0.18em"
      >
        {spot.label}
      </text>
      <text
        x={cx}
        y={cy + 15}
        textAnchor="middle"
        fill="var(--color-vermilion-deep)"
        fontFamily="var(--font-mono)"
        fontSize={9.5}
        letterSpacing="0.16em"
        opacity={0.75}
      >
        {spot.width} × {spot.height} MM
      </text>
    </g>
  );
}

function PlateFrame({
  fig,
  title,
  stats,
  tone,
  children,
  className,
}: {
  fig: string;
  title: string;
  stats: readonly string[];
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const divider = tone === "light" ? "border-rule" : "border-rule-dark";
  const muted = tone === "light" ? "text-ink-faint" : "text-chalk-muted";
  const strong = tone === "light" ? "text-ink" : "text-chalk";

  return (
    <figure className={className}>
      <div className={`flex items-baseline justify-between border-b ${divider} pb-2.5`}>
        <span className={`spec ${muted}`}>{fig}</span>
        <span className={`spec ${strong}`}>{title}</span>
      </div>
      {children}
      <figcaption className={`flex flex-wrap gap-x-5 gap-y-1.5 border-t ${divider} pt-2.5 spec ${muted}`}>
        {stats.map((stat) => (
          <span key={stat}>{stat}</span>
        ))}
      </figcaption>
    </figure>
  );
}

export function MacbookPlate({ tone = "light", className }: { tone?: Tone; className?: string }) {
  const t = TONES[tone];
  const [spot] = MACBOOK_PLATE.spots;

  return (
    <PlateFrame
      fig="Fig. 01"
      title="MacBook · Lid"
      stats={["1 surface", "1 spot", "Rented by the month"]}
      tone={tone}
      className={className}
    >
      <svg
        viewBox={MACBOOK_PLATE.viewBox}
        className="my-3 w-full"
        role="img"
        aria-label="Technical drawing of a MacBook lid with one rentable sponsorship spot marked on it."
      >
        <RegistrationMarks w={560} h={400} inset={18} color={t.hair} />

        {/* Lid */}
        <rect x={96} y={52} width={368} height={252} rx={16} fill={t.wash} stroke={t.line} strokeWidth={1.75} />
        <rect x={110} y={66} width={340} height={224} rx={9} fill="none" stroke={t.hair} strokeWidth={1} />

        {/* Base edge + surface line */}
        <rect x={74} y={310} width={412} height={13} rx={6} fill={t.wash} stroke={t.line} strokeWidth={1.75} />
        <line x1={40} y1={344} x2={520} y2={344} stroke={t.hair} strokeWidth={1} strokeDasharray="3 6" />

        <DimensionLine x1={spot.x} x2={spot.x + spot.width} y={108} color={t.faint} />
        <text
          x={spot.x + spot.width / 2}
          y={99}
          textAnchor="middle"
          fill={t.faint}
          fontFamily="var(--font-mono)"
          fontSize={10}
          letterSpacing="0.2em"
        >
          PRIMARY SURFACE
        </text>

        <SpotOutline spot={spot} />

        {/* Leader line out to the label */}
        <g aria-hidden="true">
          <circle cx={spot.x + spot.width} cy={spot.y} r={2.5} fill="var(--color-vermilion)" />
          <polyline
            points={`${spot.x + spot.width},${spot.y} 470,42 534,42`}
            fill="none"
            stroke={t.faint}
            strokeWidth={1}
          />
          <text
            x={534}
            y={34}
            textAnchor="end"
            fill={t.line}
            fontFamily="var(--font-mono)"
            fontSize={10}
            letterSpacing="0.2em"
          >
            OPEN FOR RENT
          </text>
        </g>
      </svg>
    </PlateFrame>
  );
}

export function JerseyPlate({ tone = "light", className }: { tone?: Tone; className?: string }) {
  const t = TONES[tone];
  const [spot] = JERSEY_PLATE.spots;

  return (
    <PlateFrame
      fig="Fig. 02"
      title="Jersey · Front"
      stats={["1 surface", "1 spot", "Rented by the match"]}
      tone={tone}
      className={className}
    >
      <svg
        viewBox={JERSEY_PLATE.viewBox}
        className="my-3 w-full"
        role="img"
        aria-label="Technical drawing of a jersey with one rentable sponsorship spot marked on the chest."
      >
        <RegistrationMarks w={440} h={440} inset={16} color={t.hair} />

        <path
          d="M152 44 C168 76, 272 76, 288 44 L318 56 L382 96 L346 156 L310 132 L310 400 L130 400 L130 132 L94 156 L58 96 L122 56 Z"
          fill={t.wash}
          stroke={t.line}
          strokeWidth={1.75}
          strokeLinejoin="round"
        />
        <path d="M158 52 C174 80, 266 80, 282 52" fill="none" stroke={t.hair} strokeWidth={1} />
        <line x1={130} y1={382} x2={310} y2={382} stroke={t.hair} strokeWidth={1} strokeDasharray="3 6" />
        <line x1={104} y1={146} x2={338} y2={146} stroke={t.hair} strokeWidth={1} strokeDasharray="3 6" />

        <SpotOutline spot={spot} labelSize={12} />

        <DimensionLine x1={spot.x} x2={spot.x + spot.width} y={276} color={t.faint} />
        <text
          x={spot.x + spot.width / 2}
          y={294}
          textAnchor="middle"
          fill={t.faint}
          fontFamily="var(--font-mono)"
          fontSize={10}
          letterSpacing="0.2em"
        >
          CHEST
        </text>

        <g aria-hidden="true">
          <circle
            cx={spot.x + spot.width}
            cy={spot.y + spot.height / 2}
            r={2.5}
            fill="var(--color-vermilion)"
          />
          <polyline
            points={`${spot.x + spot.width},${spot.y + spot.height / 2} 348,190 414,190`}
            fill="none"
            stroke={t.faint}
            strokeWidth={1}
          />
          <text
            x={414}
            y={182}
            textAnchor="end"
            fill={t.line}
            fontFamily="var(--font-mono)"
            fontSize={10}
            letterSpacing="0.2em"
          >
            MATCH DAY
          </text>
        </g>
      </svg>
    </PlateFrame>
  );
}
