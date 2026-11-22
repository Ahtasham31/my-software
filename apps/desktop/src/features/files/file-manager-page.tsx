import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { browseDirectory, createFolder, deletePath, importFile, renamePath } from "@/services/files";
import { openFileDialog } from "@/services/dialog";
import { getStoragePaths } from "@/services/storage";
import { trackRecent } from "@/services/data";
import { useConfirm, useToast } from "@/components/ui/overlay";
import type { DirListing, FileEntry, StoragePaths } from "@/types/models";
import { ErrorState, LoadingState } from "@/components/data/states";
import { FolderTree } from "./components/folder-tree";
import { FileToolbar } from "./components/file-toolbar";
import { FileGrid } from "./components/file-grid";
import { FileList } from "./components/file-list";
import { FileDetailsPanel } from "./components/file-details-panel";
export function FileManagerPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const confirm = useConfirm();
  const [paths, setPaths] = useState<StoragePaths | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [listing, setListing] = useState<DirListing | null>(null);
  const [selected, setSelected] = useState<FileEntry | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const p = await getStoragePaths();
        setPaths(p);
        setCurrentPath(p.projects);
      } catch (e) {
        setError((e as { message?: string }).message ?? "Failed to load storage paths");
      }
    })();
  }, []);

  const load = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const l = await browseDirectory(path);
      setListing(l);
      setSelected(null);
    } catch (e) {
      setError((e as { message?: string }).message ?? "Failed to browse directory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentPath) void load(currentPath);
  }, [currentPath, load]);

  useEffect(() => {
    if (searchParams.get("action") === "import") void handleImport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImport = async () => {
    if (!currentPath) return;
    const files = await openFileDialog(true);
    if (files.length === 0) return;
    let ok = 0;
    for (const f of files) {
      try {
        await importFile(f, currentPath);
        ok++;
      } catch (e) {
        toast.show({ title: "Import failed", description: (e as { message?: string }).message, variant: "error" });
      }
    }
    if (ok > 0) {
      toast.show({ title: `Imported ${ok} file(s)`, variant: "success" });
      await load(currentPath);
      await trackRecent({ itemType: "folder", path: currentPath });
    }
  };

  const handleNewFolder = async () => {
    if (!currentPath) return;
    const name = window.prompt("Folder name");
    if (!name) return;
    try {
      await createFolder(currentPath, name);
      await load(currentPath);
    } catch (e) {
      toast.show({ title: "Create folder failed", description: (e as { message?: string }).message, variant: "error" });
    }
  };

  const handleRename = async (entry: FileEntry) => {
    const name = window.prompt("New name", entry.name);
    if (!name || name === entry.name) return;
    try {
      await renamePath(entry.path, name);
      await load(currentPath!);
    } catch (e) {
      toast.show({ title: "Rename failed", description: (e as { message?: string }).message, variant: "error" });
    }
  };

  const handleDelete = async (entry: FileEntry) => {
    confirm.confirm({
      title: `Delete ${entry.name}?`,
      description: "This action cannot be undone.",
      destructive: true,
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          await deletePath(entry.path);
          await load(currentPath!);
          toast.show({ title: "Deleted", variant: "success" });
        } catch (e) {
          toast.show({ title: "Delete failed", description: (e as { message?: string }).message, variant: "error" });
        }
      }
    });
  };

  if (error) {
    return <PageContainer><ErrorState title="File manager error" description={error} onRetry={() => currentPath && void load(currentPath)} /></PageContainer>;
  }

  return (
    <PageContainer className="flex h-full flex-col">
      <PageHeader title="File Manager" description="Browse and manage application-managed files." />
      <div className="grid min-h-0 flex-1 grid-cols-12 gap-4">
        <aside className="col-span-3 min-h-0">
          {paths && <FolderTree paths={paths} current={currentPath ?? ""} onSelect={setCurrentPath} />}
        </aside>
        <section className="col-span-6 min-h-0 flex flex-col">
          <FileToolbar
            currentPath={currentPath ?? ""}
            view={view}
            onViewChange={setView}
            onRefresh={() => currentPath && void load(currentPath)}
            onImport={handleImport}
            onNewFolder={handleNewFolder}
            onUp={() => {
              if (!currentPath || !paths) return;
              if (currentPath === paths.root) return;
              const parts = currentPath.split(/[\\/]/);
              parts.pop();
              setCurrentPath(parts.join(currentPath.includes("\\") ? "\\" : "/"));
            }}
          />
          <div className="mt-3 min-h-0 flex-1 overflow-auto">
            {loading ? <LoadingState /> : listing && (view === "grid" ? (
              <FileGrid entries={listing.entries} onSelect={setSelected} onOpen={(e) => e.isDir ? setCurrentPath(e.path) : setSelected(e)} onContext={(e) => setSelected(e)} />
            ) : (
              <FileList entries={listing.entries} onSelect={setSelected} onOpen={(e) => e.isDir ? setCurrentPath(e.path) : setSelected(e)} />
            ))}
          </div>
        </section>
        <aside className="col-span-3 min-h-0">
          <FileDetailsPanel
            entry={selected}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        </aside>
      </div>
    </PageContainer>
  );
}