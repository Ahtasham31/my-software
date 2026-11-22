import { useCallback, useState } from "react";
import { invokeNative } from "@/services/native";
import { openFileDialog, openDirectoryDialog } from "@/services/dialog";

export interface BatchResult {
  source: string;
  output: string | null;
  success: boolean;
  error: string | null;
}

export function useBatchProcessing() {
  const [sources, setSources] = useState<string[]>([]);
  const [outputDir, setOutputDir] = useState("");
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [format, setFormat] = useState("png");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);

  const pickSources = useCallback(async () => {
    const files = await openFileDialog(true);
    if (files.length > 0) setSources((prev) => [...prev, ...files]);
  }, []);

  const pickOutputDir = useCallback(async () => {
    const dir = await openDirectoryDialog();
    if (dir) setOutputDir(dir);
  }, []);

  const run = useCallback(async () => {
    if (sources.length === 0 || !outputDir) return;
    setBusy(true);
    setResults([]);
    try {
      const res = await invokeNative<BatchResult[]>("batch_resize", {
        input: {
          sources,
          outputDir,
          width: width ?? null,
          height: height ?? null,
          format: format || null
        }
      });
      setResults(res);
    } finally {
      setBusy(false);
    }
  }, [sources, outputDir, width, height, format]);

  return {
    sources,
    outputDir,
    width,
    height,
    format,
    busy,
    results,
    setWidth,
    setHeight,
    setFormat,
    setSources,
    pickSources,
    pickOutputDir,
    run
  };
}