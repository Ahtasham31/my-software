import { useEffect, useState, type ReactNode } from "react";
import { getAppInfo } from "@/services/app";
import type { AppInfo } from "@/types/models";
import { ErrorState, LoadingState } from "@/components/data/states";

export function StartupGate({ children }: { children: ReactNode }): JSX.Element {
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const init = async () => {
    setError(null);
    try {
      const i = await getAppInfo();
      setInfo(i);
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message ?? "Startup initialization failed");
    }
  };

  useEffect(() => {
    void init();
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6">
        <ErrorState
          title="Startup failed"
          description={error}
          onRetry={() => void init()}
        />
      </div>
    );
  }

  if (!info) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingState label="Initializing DocuVerse Studio…" />
      </div>
    );
  }

  return <>{children}</>;
}