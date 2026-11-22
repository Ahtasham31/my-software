use std::path::{Path, PathBuf};

use crate::error::AppError;

pub fn validate_within_root(path: &Path, root: &Path) -> Result<PathBuf, AppError> {
    let canonical_root = root.canonicalize().unwrap_or_else(|_| root.to_path_buf());

    let canonical = path
        .canonicalize()
        .map_err(|_| AppError::PathValidation("Path does not exist or is not accessible".into()))?;

    if !canonical.starts_with(&canonical_root) {
        return Err(AppError::PathValidation(
            "Path escapes the allowed storage root".into(),
        ));
    }
    Ok(canonical)
}

pub fn safe_write(path: &Path, data: &[u8], root: &Path) -> Result<(), AppError> {
    let target = validate_within_root(path, root)?;
    let tmp = target.with_extension("tmp");
    std::fs::write(&tmp, data)?;
    std::fs::rename(&tmp, &target)?;
    Ok(())
}

pub fn unique_filename(dir: &Path, original: &str) -> PathBuf {
    let mut candidate = dir.join(original);
    let mut counter = 1;
    while candidate.exists() {
        let stem = Path::new(original)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("file");
        let ext = Path::new(original)
            .extension()
            .and_then(|s| s.to_str())
            .unwrap_or("");
        let name = if ext.is_empty() {
            format!("{stem}_{counter}")
        } else {
            format!("{stem}_{counter}.{ext}")
        };
        candidate = dir.join(name);
        counter += 1;
    }
    candidate
}
