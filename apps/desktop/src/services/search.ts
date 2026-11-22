import { invokeNative } from "./native";
import type { SearchHit } from "@/types/models";

export const globalSearch = (query: string, limit?: number) =>
  invokeNative<SearchHit[]>("global_search", { query, limit });