import { invokeNative } from "./native";
import type { CreateProjectInput, Project } from "@/types/models";

export const listProjects = () => invokeNative<Project[]>("projects_list");

export const createProject = (input: CreateProjectInput) =>
  invokeNative<Project>("project_create", { input });

export const renameProject = (id: string, name: string) =>
  invokeNative<Project>("project_rename", { id, name });

export const deleteProject = (id: string, deleteFiles: boolean) =>
  invokeNative<void>("project_delete", { id, deleteFiles });

export const duplicateProject = (id: string) =>
  invokeNative<Project>("project_duplicate", { id });