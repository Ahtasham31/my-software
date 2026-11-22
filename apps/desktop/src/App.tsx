import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { AppearanceSettingsPage } from "@/features/settings/appearance-settings-page";
import { FileManagerPage } from "@/features/files/file-manager-page";
import { PhotoEditorPage } from "@/features/photo/photo-editor-page";
import { BatchProcessingPage } from "@/features/photo/components/batch-processing-page";
import { PassportPage } from "@/features/passport/passport-page";
import { BatchPassportPage } from "@/features/passport/components/batch-passport-page";
import { OcrPage } from "@/features/ocr/ocr-page";
import { ModulePlaceholderPage } from "@/features/placeholder/module-placeholder-page";
import { NAV_GROUPS } from "@/app/nav-config";
import { SettingsProvider } from "@/providers/settings-provider";
import { StartupGate } from "@/providers/startup-gate";
import { ThemeProvider } from "@/design-system/theme-provider";

export default function App(): JSX.Element {
  const placeholders = NAV_GROUPS.flatMap((g) => g.items).filter(
    (i) =>
      i.placeholder &&
      i.to !== "/files" &&
      i.to !== "/photo" &&
      i.to !== "/passport" &&
      i.to !== "/ocr"
  );

  return (
    <StartupGate>
      <SettingsProvider>
        <ThemeProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="/files" element={<FileManagerPage />} />
              <Route path="/photo" element={<PhotoEditorPage />} />
              <Route path="/photo/batch" element={<BatchProcessingPage />} />
              <Route path="/passport" element={<PassportPage />} />
              <Route path="/passport/batch" element={<BatchPassportPage />} />
              <Route path="/ocr" element={<OcrPage />} />
              <Route path="/appearance" element={<AppearanceSettingsPage />} />
              {placeholders.map((item) => (
                <Route
                  key={item.to}
                  path={item.to}
                  element={
                    <ModulePlaceholderPage
                      title={item.label}
                      moduleId={item.to.replace("/", "")}
                    />
                  }
                />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </SettingsProvider>
    </StartupGate>
  );
}