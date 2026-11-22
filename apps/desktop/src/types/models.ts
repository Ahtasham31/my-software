export interface StoragePaths {
  root: string;
  database: string;
  projects: string;
  documents: string;
  images: string;
  thumbnails: string;
  templates: string;
  exports: string;
  backups: string;
  cache: string;
  temporary: string;
  logs: string;
  settings: string;
}

export interface AppInfo {
  name: string;
  version: string;
  platform: string;
  arch: string;
  storage: StoragePaths;
}

export interface AppearanceSettings {
  themeId: string;
  mode: "light" | "dark" | "system";
  density: "compact" | "comfortable" | "spacious";
  scale: number;
  radius: number;
}

export interface GeneralSettings {
  language: string;
  fontFamily: string;
  autosaveIntervalSecs: number;
}

export interface PerformanceSettings {
  profile: "low-ram" | "balanced" | "high-performance" | "custom";
  cacheLimitMb: number;
  backgroundConcurrency: number;
}

export interface AppSettings {
  appearance: AppearanceSettings;
  general: GeneralSettings;
  performance: PerformanceSettings;
}

export interface FileMetadata {
  size: number;
  isDir: boolean;
  modified: string | null;
}


// ... existing exports above

export interface Project {
  id: string;
  name: string;
  moduleId: string | null;
  rootPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  moduleId?: string | null;
}

export interface FileEntry {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modified: string | null;
  extension: string | null;
}

export interface DirListing {
  path: string;
  entries: FileEntry[];
}

export interface RecentItem {
  id: string;
  itemType: string;
  path: string;
  label: string | null;
  moduleId: string | null;
  lastOpenedAt: string;
}

export interface TrackRecentInput {
  itemType: string;
  path: string;
  label?: string | null;
  moduleId?: string | null;
}

export interface ActivityEntry {
  id: string;
  event: string;
  detail: string | null;
  createdAt: string;
}

export interface SearchHit {
  kind: string;
  id: string;
  label: string;
  path: string | null;
}

export interface DashboardSummary {
  projectCount: number;
  recentFileCount: number;
  activityCount: number;
  storage: StorageUsage;
}

export interface StorageUsage {
  root: string;
  projectsBytes: number;
  documentsBytes: number;
  imagesBytes: number;
  exportsBytes: number;
  backupsBytes: number;
}