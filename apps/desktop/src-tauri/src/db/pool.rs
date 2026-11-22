use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use std::path::Path;

use crate::error::AppError;

pub type DbPool = Pool<SqliteConnectionManager>;

pub fn create_pool(db_path: &Path) -> Result<DbPool, AppError> {
    let manager = SqliteConnectionManager::file(db_path).with_init(|c| {
        c.execute_batch(
            "PRAGMA journal_mode=WAL;
             PRAGMA foreign_keys=ON;
             PRAGMA synchronous=NORMAL;
             PRAGMA busy_timeout=5000;",
        )
    });

    let pool = Pool::builder().max_size(8).build(manager)?;
    Ok(pool)
}
