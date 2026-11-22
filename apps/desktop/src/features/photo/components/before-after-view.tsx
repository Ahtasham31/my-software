import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface Props {
  original: HTMLCanvasElement | null;
  edited: HTMLCanvasElement | null;
  visible: boolean;
}

export function BeforeAfterView({ original, edited, visible }: Props): JSX.Element {
  const [splitX, setSplitX] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!visible || !original || !edited) {
    return <></>;
  }

  const onMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitX(Math.max(0, Math.min(100, pct)));
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-full items-center justify-center bg-black/30"
      onMouseMove={onMove}
    >
      <div className="relative max-h-full max-w-full">
        <CanvasDisplay canvas={edited} />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${splitX}%` }}
        >
          <CanvasDisplay canvas={original} />
        </div>
        <div
          className={cn("absolute inset-y-0 w-0.5 bg-primary")}
          style={{ left: `${splitX}%` }}
        />
        <div
          className={cn("absolute top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white")}
          style={{ left: 8 }}
        >
          Before
        </div>
        <div
          className={cn("absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white")}
        >
          After
        </div>
      </div>
    </div>
  );
}

function CanvasDisplay({ canvas }: { canvas: HTMLCanvasElement }): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);
  if (ref.current && (ref.current.width !== canvas.width || ref.current.height !== canvas.height)) {
    ref.current.width = canvas.width;
    ref.current.height = canvas.height;
  }
  if (ref.current) {
    const ctx = ref.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, ref.current.width, ref.current.height);
      ctx.drawImage(canvas, 0, 0);
    }
  }
  return <canvas ref={ref} className="max-h-full max-w-full" />;
}