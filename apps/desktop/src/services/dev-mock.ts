import type {
  ActivityEntry,
  AppInfo,
  AppSettings,
  DashboardSummary,
  DirListing,
  Project,
  RecentItem,
  StoragePaths
} from "@/types/models";

export const isBrowserMode =
  typeof window === "undefined" || !("__TAURI_INTERNALS__" in window);

const MOCK_STORAGE_PATHS: StoragePaths = {
  root: "/mock/DocuVerseStudio",
  database: "/mock/DocuVerseStudio/database",
  projects: "/mock/DocuVerseStudio/projects",
  documents: "/mock/DocuVerseStudio/documents",
  images: "/mock/DocuVerseStudio/images",
  thumbnails: "/mock/DocuVerseStudio/thumbnails",
  templates: "/mock/DocuVerseStudio/templates",
  exports: "/mock/DocuVerseStudio/exports",
  backups: "/mock/DocuVerseStudio/backups",
  cache: "/mock/DocuVerseStudio/cache",
  temporary: "/mock/DocuVerseStudio/temporary",
  logs: "/mock/DocuVerseStudio/logs",
  settings: "/mock/DocuVerseStudio/settings"
};

const MOCK_APP_INFO: AppInfo = {
  name: "DocuVerse Studio",
  version: "0.1.0-mock",
  platform: "browser",
  arch: "unknown",
  storage: MOCK_STORAGE_PATHS
};

const MOCK_SETTINGS: AppSettings = {
  appearance: {
    themeId: "midnight-pro",
    mode: "dark",
    density: "comfortable",
    scale: 1,
    radius: 0.75
  },
  general: { language: "en", fontFamily: "Inter", autosaveIntervalSecs: 60 },
  performance: {
    profile: "balanced",
    cacheLimitMb: 256,
    backgroundConcurrency: 2
  }
};

const MOCK_DASHBOARD: DashboardSummary = {
  projectCount: 0,
  recentFileCount: 0,
  activityCount: 0,
  storage: {
    root: MOCK_STORAGE_PATHS.root,
    projectsBytes: 0,
    documentsBytes: 0,
    imagesBytes: 0,
    exportsBytes: 0,
    backupsBytes: 0
  }
};

const MOCK_DASHBOARD_PREFS = {
  hiddenWidgets: [] as string[],
  widgetOrder: [
    "welcome",
    "quickActions",
    "recentProjects",
    "recentFiles",
    "storage",
    "activity",
    "systemInfo"
  ]
};

const MOCK_EMPTY_LISTING = (path: string): DirListing => ({ path, entries: [] });

const mockProjects: Project[] = [];
const mockRecent: RecentItem[] = [];
const mockActivity: ActivityEntry[] = [];
const mockPresets: any[] = [];
const mockPassportBackgrounds: any[] = [];
const mockOcrJobs: any[] = [];
const mockFavorites: any[] = [];

export async function mockInvoke<T>(
  cmd: string,
  args?: Record<string, unknown>
): Promise<T> {
  await new Promise((r) => setTimeout(r, 30));

  switch (cmd) {
    // ---- App / settings / storage ----
    case "get_app_info":
      return MOCK_APP_INFO as T;
    case "settings_get":
      return MOCK_SETTINGS as T;
    case "settings_set":
    case "settings_reset":
      return (cmd === "settings_reset" ? MOCK_SETTINGS : undefined) as T;
    case "storage_paths":
      return MOCK_STORAGE_PATHS as T;

    // ---- Dashboard ----
    case "dashboard_summary":
      return MOCK_DASHBOARD as T;
    case "dashboard_prefs_get":
      return MOCK_DASHBOARD_PREFS as T;
    case "dashboard_prefs_set":
      return undefined as T;

    // ---- Projects ----
    case "projects_list":
      return mockProjects as T;
    case "project_create": {
      const input = (args?.input as { name?: string } | undefined) ?? {};
      const name = input.name ?? "Untitled";
      const project: Project = {
        id: crypto.randomUUID(),
        name,
        moduleId: null,
        rootPath: `${MOCK_STORAGE_PATHS.projects}/${name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockProjects.unshift(project);
      return project as T;
    }
    case "project_rename":
    case "project_delete":
    case "project_duplicate":
      return (cmd === "project_delete" ? undefined : mockProjects[0]) as T;

    // ---- Files ----
    case "fs_browse": {
      const path = (args?.path as string) ?? MOCK_STORAGE_PATHS.projects;
      return MOCK_EMPTY_LISTING(path) as T;
    }
    case "fs_create_folder":
    case "fs_import_file":
    case "fs_rename_path":
      return `/mock/${crypto.randomUUID()}` as T;
    case "fs_delete_path":
    case "fs_reveal_in_os":
    case "fs_safe_write":
      return undefined as T;
    case "fs_metadata":
      return { size: 0, isDir: false, modified: null } as T;

    // ---- Recent / activity ----
    case "recent_track":
      return undefined as T;
    case "recent_list":
      return mockRecent as T;
    case "recent_clear":
      return undefined as T;
    case "activity_list":
      return mockActivity as T;

    // ---- Search ----
    case "global_search":
      return [] as T;

    // ---- Favorites ----
    case "favorites_list":
      return mockFavorites as T;
    case "favorites_add":
    case "favorites_remove":
      return undefined as T;
    case "favorites_is":
      return false as T;

    // ---- Dialogs ----
    case "open_file_dialog":
      return [] as T;
    case "open_dir_dialog":
      return null as T;
    case "save_file_dialog":
      return null as T;

    // ---- Photo ----
    case "photo_load_image": {
      const path = (args?.path as string) ?? "mock";
      const dataUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9a7V8AAAAASUVORK5CYII=";
      return {
        path,
        name: path.split(/[\\/]/).pop() ?? "image.png",
        width: 1,
        height: 1,
        format: "png",
        sizeBytes: 68,
        dataUrl
      } as T;
    }
    case "photo_save_image":
      return "mock-saved.png" as T;
    case "photo_projects_list":
      return [] as T;
    case "photo_project_save":
      return { id: crypto.randomUUID() } as T;

    // ---- Batch ----
    case "batch_resize":
      return [] as T;

    // ---- Passport ----
    case "passport_presets_list":
      return mockPresets as T;
    case "passport_preset_save": {
      const input = (args?.input as any) ?? {};
      const saved = {
        id: crypto.randomUUID(),
        name: input.name,
        category: input.category,
        widthMm: input.widthMm,
        heightMm: input.heightMm,
        dpi: input.dpi,
        aspectRatio: null,
        backgroundPreference: null,
        custom: true,
        createdAt: new Date().toISOString()
      };
      mockPresets.push(saved);
      return saved as T;
    }
    case "passport_preset_delete":
      return undefined as T;
    case "passport_project_save":
      return { id: crypto.randomUUID() } as T;
    case "passport_projects_list":
      return [] as T;
    case "passport_save_data_url":
      return "mock-saved.png" as T;
    case "passport_backgrounds_list":
      return mockPassportBackgrounds as T;
    case "passport_background_save": {
      const input = (args?.input as any) ?? {};
      const saved = {
        id: crypto.randomUUID(),
        name: input.name,
        kind: input.kind,
        color1: input.color1,
        color2: input.color2 ?? null,
        createdAt: new Date().toISOString()
      };
      mockPassportBackgrounds.push(saved);
      return saved as T;
    }
    case "passport_background_delete":
      return undefined as T;

    // ---- OCR ----
    case "ocr_check_engine":
      return {
        available: false,
        version: null,
        tesseractPath: null,
        popplerAvailable: false
      } as T;
    case "ocr_list_languages":
      return [
        { code: "eng", name: "English", installed: false },
        { code: "urd", name: "Urdu", installed: false },
        { code: "ara", name: "Arabic", installed: false }
      ] as T;
    case "ocr_preprocess_preview":
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9a7V8AAAAASUVORK5CYII=" as T;
    case "ocr_recognize_image":
      return {
        text: "[mock OCR output — run npm run tauri dev for real Tesseract]",
        width: 1,
        height: 1,
        language: (args?.input as any)?.language ?? "eng",
        durationMs: 0
      } as T;
    case "ocr_extract_pdf_text":
      return { pages: [], totalPages: 0 } as T;
    case "ocr_render_pdf_page":
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9a7V8AAAAASUVORK5CYII=" as T;
    case "ocr_save_text":
    case "ocr_save_docx":
      return "mock-saved" as T;
    case "ocr_job_save": {
      const input = (args?.input as any) ?? {};
      const job = {
        id: crypto.randomUUID(),
        kind: input.kind,
        sourcePath: input.sourcePath,
        outputPath: input.outputPath ?? null,
        language: input.language,
        engine: "tesseract",
        status: input.status,
        pageCount: input.pageCount,
        durationMs: input.durationMs ?? null,
        errorMessage: input.errorMessage ?? null,
        settingsJson: input.settingsJson ?? null,
        previewText: input.previewText ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockOcrJobs.push(job);
      return job as T;
    }
    case "ocr_jobs_list":
      return mockOcrJobs as T;
    case "ocr_job_delete":
      return undefined as T;
    case "ocr_jobs_clear":
      mockOcrJobs.length = 0;
      return undefined as T;

    // ---- Logging ----
    case "log_frontend":
      return undefined as T;

    default:
      throw new Error(`No mock handler for command: ${cmd}`);
  }
}