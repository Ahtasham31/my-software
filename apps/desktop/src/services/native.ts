import { invoke } from "@tauri-apps/api/core";
import { isBrowserMode, mockInvoke } from "./dev-mock";

export interface NativeError {
  category: string;
  message: string;
  detail?: string | null;
}

export async function invokeNative<T>(
  cmd: string,
  args?: Record<string, unknown>
): Promise<T> {
  if (isBrowserMode) {
    return mockInvoke<T>(cmd, args);
  }

  try {
    return await invoke<T>(cmd, args);
  } catch (e) {
    const err = e as Partial<NativeError>;
    const wrapped: NativeError = {
      category: err.category ?? "native",
      message: err.message ?? String(e),
      detail: err.detail ?? null
    };
    throw wrapped;
  }
}