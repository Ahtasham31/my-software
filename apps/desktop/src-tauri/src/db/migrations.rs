use refinery::embed_migrations;
embed_migrations!("migrations");

pub fn run_migrations(conn: &mut rusqlite::Connection) -> Result<(), crate::error::AppError> {
    migrations::runner().run(conn)?;
    Ok(())
}
