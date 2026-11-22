use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use uuid::Uuid;

use crate::error::{AppError, CommandError};
use crate::state::AppState;
use crate::storage::safe_fs::unique_filename;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub name: String,
    pub module_id: Option<String>,
    pub root_path: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProjectInput {
    pub name: String,
    pub module_id: Option<String>,
}

#[tauri::command]
pub fn projects_list(state: tauri::State<'_, AppState>) -> Result<Vec<Project>, CommandError> {
    let conn = state.db.get()?;
    let mut stmt = conn.prepare(
        "SELECT id, name, module_id, root_path, created_at, updated_at
         FROM projects ORDER BY updated_at DESC",
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(Project {
            id: row.get(0)?,
            name: row.get(1)?,
            module_id: row.get(2)?,
            root_path: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

#[tauri::command]
pub fn project_create(
    state: tauri::State<'_, AppState>,
    input: CreateProjectInput,
) -> Result<Project, CommandError> {
    if input.name.trim().is_empty() {
        return Err(AppError::InvalidInput("Project name is required".into()).into());
    }
    let id = Uuid::new_v4().to_string();
    let folder_name = sanitize(&input.name);
    let projects_root = PathBuf::from(&state.paths.projects);
    fs::create_dir_all(&projects_root)?;

    let target = unique_filename(&projects_root, &folder_name);
    fs::create_dir_all(&target)?;

    let conn = state.db.get()?;
    conn.execute(
        "INSERT INTO projects (id, name, module_id, root_path) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![
            id,
            input.name.trim(),
            input.module_id,
            target.to_string_lossy().to_string()
        ],
    )?;

    let mut stmt = conn.prepare(
        "SELECT id, name, module_id, root_path, created_at, updated_at FROM projects WHERE id=?1",
    )?;
    let project = stmt.query_row([&id], |row| {
        Ok(Project {
            id: row.get(0)?,
            name: row.get(1)?,
            module_id: row.get(2)?,
            root_path: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })?;

    log_activity(&state, "project.created", &id)?;
    Ok(project)
}

#[tauri::command]
pub fn project_rename(
    state: tauri::State<'_, AppState>,
    id: String,
    name: String,
) -> Result<Project, CommandError> {
    if name.trim().is_empty() {
        return Err(AppError::InvalidInput("Project name is required".into()).into());
    }
    let conn = state.db.get()?;
    conn.execute(
        "UPDATE projects SET name=?1, updated_at=datetime('now') WHERE id=?2",
        rusqlite::params![name.trim(), id],
    )?;
    let mut stmt = conn.prepare(
        "SELECT id, name, module_id, root_path, created_at, updated_at FROM projects WHERE id=?1",
    )?;
    let project = stmt.query_row([&id], |row| {
        Ok(Project {
            id: row.get(0)?,
            name: row.get(1)?,
            module_id: row.get(2)?,
            root_path: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })?;
    log_activity(&state, "project.renamed", &id)?;
    Ok(project)
}

#[tauri::command]
pub fn project_delete(
    state: tauri::State<'_, AppState>,
    id: String,
    delete_files: bool,
) -> Result<(), CommandError> {
    let conn = state.db.get()?;
    let root_path: String =
        conn.query_row("SELECT root_path FROM projects WHERE id=?1", [&id], |r| {
            r.get(0)
        })?;

    if delete_files {
        let path = Path::new(&root_path);
        if path.exists() && path.starts_with(&state.paths.projects) {
            fs::remove_dir_all(path)?;
        }
    }
    conn.execute("DELETE FROM projects WHERE id=?1", [&id])?;
    log_activity(
        &state,
        if delete_files {
            "project.deleted"
        } else {
            "project.removed"
        },
        &id,
    )?;
    Ok(())
}

#[tauri::command]
pub fn project_duplicate(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<Project, CommandError> {
    let conn = state.db.get()?;
    let (name, module_id, root_path): (String, Option<String>, String) = conn.query_row(
        "SELECT name, module_id, root_path FROM projects WHERE id=?1",
        [&id],
        |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
    )?;

    let projects_root = PathBuf::from(&state.paths.projects);
    let new_folder = unique_filename(&projects_root, &format!("{} copy", sanitize(&name)));
    if Path::new(&root_path).exists() {
        copy_dir_recursive(Path::new(&root_path), &new_folder)?;
    } else {
        fs::create_dir_all(&new_folder)?;
    }

    let new_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO projects (id, name, module_id, root_path) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![
            new_id,
            format!("{} (Copy)", name),
            module_id,
            new_folder.to_string_lossy().to_string()
        ],
    )?;

    let mut stmt = conn.prepare(
        "SELECT id, name, module_id, root_path, created_at, updated_at FROM projects WHERE id=?1",
    )?;
    let project = stmt.query_row([&new_id], |row| {
        Ok(Project {
            id: row.get(0)?,
            name: row.get(1)?,
            module_id: row.get(2)?,
            root_path: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })?;

    log_activity(&state, "project.duplicated", &new_id)?;
    Ok(project)
}

fn sanitize(name: &str) -> String {
    name.chars()
        .map(|c| {
            if c.is_alphanumeric() || c == ' ' || c == '-' || c == '_' {
                c
            } else {
                '_'
            }
        })
        .collect::<String>()
        .trim()
        .to_string()
}

fn copy_dir_recursive(src: &Path, dst: &Path) -> std::io::Result<()> {
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        let to = dst.join(entry.file_name());
        if ty.is_dir() {
            copy_dir_recursive(&entry.path(), &to)?;
        } else {
            fs::copy(entry.path(), to)?;
        }
    }
    Ok(())
}

fn log_activity(
    state: &tauri::State<'_, AppState>,
    event: &str,
    detail: &str,
) -> Result<(), AppError> {
    let conn = state.db.get()?;
    conn.execute(
        "INSERT INTO activity_history (id, event, detail_json) VALUES (?1, ?2, ?3)",
        rusqlite::params![
            Uuid::new_v4().to_string(),
            event,
            format!("{{\"id\":\"{}\"}}", detail)
        ],
    )?;
    Ok(())
}
