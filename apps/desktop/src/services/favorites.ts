import { invokeNative } from "./native";

export interface Favorite {
  id: string;
  itemType: string;
  itemId: string;
  label: string | null;
  createdAt: string;
}

export const listFavorites = () => invokeNative<Favorite[]>("favorites_list");

export const addFavorite = (
  itemType: string,
  itemId: string,
  label?: string
) =>
  invokeNative<void>("favorites_add", {
    input: { itemType, itemId, label: label ?? null }
  });

export const removeFavorite = (itemType: string, itemId: string) =>
  invokeNative<void>("favorites_remove", { itemType, itemId });

export const isFavorite = (itemType: string, itemId: string) =>
  invokeNative<boolean>("favorites_is", { itemType, itemId });