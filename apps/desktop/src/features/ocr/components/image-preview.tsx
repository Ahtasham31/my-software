interface Props {
  src: string | null;
  alt?: string;
  className?: string;
}

export function ImagePreview({ src, alt, className }: Props): JSX.Element {
  if (!src) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-card p-10 text-sm text-muted-foreground">
        No image
      </div>
    );
  }
  return (
    <div className="flex h-full items-center justify-center overflow-auto rounded-lg border border-border bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px] p-2">
      <img
        src={src}
        alt={alt ?? "Preview"}
        className={className ?? "max-h-full max-w-full object-contain"}
      />
    </div>
  );
}