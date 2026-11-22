use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub appearance: AppearanceSettings,
    pub general: GeneralSettings,
    pub performance: PerformanceSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppearanceSettings {
    pub theme_id: String,
    pub mode: String,
    pub density: String,
    pub scale: f64,
    pub radius: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneralSettings {
    pub language: String,
    pub font_family: String,
    pub autosave_interval_secs: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PerformanceSettings {
    pub profile: String,
    pub cache_limit_mb: u64,
    pub background_concurrency: u32,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            appearance: AppearanceSettings {
                theme_id: "midnight-pro".into(),
                mode: "dark".into(),
                density: "comfortable".into(),
                scale: 1.0,
                radius: 0.75,
            },
            general: GeneralSettings {
                language: "en".into(),
                font_family: "Inter".into(),
                autosave_interval_secs: 60,
            },
            performance: PerformanceSettings {
                profile: "balanced".into(),
                cache_limit_mb: 256,
                background_concurrency: 2,
            },
        }
    }
}
