export function WelcomeWidget(): JSX.Element {
  const now = new Date();
  const formatted = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="rounded-lg border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-6">
      <h2 className="text-title">Welcome back</h2>
      <p className="mt-1 text-sm text-muted-foreground">{formatted}</p>
      <p className="mt-2 max-w-prose text-sm">
        DocuVerse Studio is ready. Open an existing project, import files, or
        start a new project from the quick actions below.
      </p>
    </div>
  );
}