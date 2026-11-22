import type { GuideState } from "@/types/passport";
import { GUIDE_META } from "../engine/guides";

interface Props {
  guides: GuideState[];
  width: number;
  height: number;
}

export function GuidesOverlay({ guides, width, height }: Props): JSX.Element {
  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible" }}
    >
      {guides.map((g) => {
        if (!g.enabled) return null;
        const meta = GUIDE_META[g.id];
        if (meta.horizontal) {
          const y = g.position * height;
          return (
            <g key={g.id}>
              <line
                x1={0}
                x2={width}
                y1={y}
                y2={y}
                stroke={meta.color}
                strokeWidth={2}
                strokeDasharray="6 4"
                opacity={0.85}
              />
              <text
                x={6}
                y={Math.max(12, y - 4)}
                fill={meta.color}
                fontSize={11}
                fontWeight={600}
              >
                {meta.label}
              </text>
            </g>
          );
        }
        const x = g.position * width;
        return (
          <g key={g.id}>
            <line
              x1={x}
              x2={x}
              y1={0}
              y2={height}
              stroke={meta.color}
              strokeWidth={2}
              strokeDasharray="6 4"
              opacity={0.85}
            />
            <text x={x + 4} y={14} fill={meta.color} fontSize={11} fontWeight={600}>
              {meta.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}