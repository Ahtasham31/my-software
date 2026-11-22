use crate::db::DbPool;
use crate::storage::paths::StoragePaths;

pub struct AppState {
    pub db: DbPool,
    pub paths: StoragePaths,
}
