use std::path::PathBuf;
use std::process::Command;
use std::time::Instant;

use base64::{engine::general_purpose::STANDARD, Engine as _};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::error::{AppError, CommandError};
use crate::state::AppState;

// ---------- Engine detection ----------

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OcrEngineStatus {
    pub available: bool,
    pub version: Option<String>,
    pub tesseract_path: Option<String>,
    pub poppler_available: bool,
}

fn run_tesseract(args: &[&str]) -> Result<std::process::Output, AppError> {
    let mut cmd = Command::new("tesseract");
    for a in args {
        cmd.arg(a);
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }
    cmd.output()
        .map_err(|e| AppError::Internal(format!("tesseract not found: {}", e)))
}

fn run_pdftoppm(args: &[&str]) -> Result<std::process::Output, AppError> {
    let mut cmd = Command::new("pdftoppm");
    for a in args {
        cmd.arg(a);
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }
    cmd.output()
        .map_err(|e| AppError::Internal(format!("pdftoppm not found: {}", e)))
}

#[tauri::command]
pub fn ocr_check_engine() -> Result<OcrEngineStatus, CommandError> {
    let tesseract = run_tesseract(&["--version"]);
    let (available, version) = match tesseract {
        Ok(out) if out.status.success() => {
            let stdout = String::from_utf8_lossy(&out.stdout);
            let v = stdout.lines().next().unwrap_or("").trim().to_string();
            (true, Some(v))
        }
        _ => (false, None),
    };

    let tesseract_path = {
        let cmd = if cfg!(windows) { "where" } else { "which" };
        let out = Command::new(cmd).arg("tesseract").output().ok();
        out.and_then(|o| {
            if o.status.success() {
                String::from_utf8_lossy(&o.stdout)
                    .lines()
                    .next()
                    .map(|s| s.trim().to_string())
            } else {
                None
            }
        })
    };

    let poppler_available = run_pdftoppm(&["-v"]).is_ok();

    Ok(OcrEngineStatus {
        available,
        version,
        tesseract_path,
        poppler_available,
    })
}

// ---------- Languages ----------

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LanguageInfo {
    pub code: String,
    pub name: String,
    pub installed: bool,
}

#[tauri::command]
pub fn ocr_list_languages() -> Result<Vec<LanguageInfo>, CommandError> {
    let installed: Vec<String> = match run_tesseract(&["--list-langs"]) {
        Ok(out) if out.status.success() => String::from_utf8_lossy(&out.stdout)
            .lines()
            .skip(1)
            .map(|l| l.trim().to_string())
            .filter(|l| !l.is_empty())
            .collect(),
        _ => Vec::new(),
    };

    let known = vec![
        ("eng", "English"),
        ("urd", "Urdu"),
        ("ara", "Arabic"),
        ("hin", "Hindi"),
        ("fas", "Persian"),
        ("fra", "French"),
        ("deu", "German"),
        ("spa", "Spanish"),
        ("chi_sim", "Chinese (Simplified)"),
        ("jpn", "Japanese"),
        ("rus", "Russian"),
    ];

    Ok(known
        .into_iter()
        .map(|(code, name)| LanguageInfo {
            code: code.to_string(),
            name: name.to_string(),
            installed: installed.iter().any(|i| i == code),
        })
        .collect())
}

// ---------- Preprocessing ----------

#[derive(Deserialize, Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct PreprocessOptions {
    pub rotate_degrees: Option<i32>,
    pub grayscale: bool,
    pub threshold: Option<u8>,
    pub invert: bool,
    pub brightness: Option<i32>,
    pub contrast: Option<f32>,
    pub deskew: bool,
}

fn preprocess_image(img: &image::DynamicImage, opts: &PreprocessOptions) -> image::DynamicImage {
    let mut out = img.clone();

    if let Some(deg) = opts.rotate_degrees {
        out = match deg {
            90 => image::DynamicImage::ImageRgba8(image::imageops::rotate90(&out.to_rgba8())),
            180 => image::DynamicImage::ImageRgba8(image::imageops::rotate180(&out.to_rgba8())),
            270 => image::DynamicImage::ImageRgba8(image::imageops::rotate270(&out.to_rgba8())),
            _ => out,
        };
    }

    let mut rgba = out.to_rgba8();

    if opts.grayscale || opts.threshold.is_some() {
        let gray = image::DynamicImage::ImageRgba8(rgba.clone()).grayscale();
        rgba = gray.to_rgba8();
    }

    if let Some(br) = opts.brightness {
        if br != 0 {
            let offset = br as i16;
            for p in rgba.pixels_mut() {
                for c in 0..3 {
                    let v = p[c] as i16 + offset;
                    p[c] = v.clamp(0, 255) as u8;
                }
            }
        }
    }

    if let Some(c) = opts.contrast {
        if (c - 1.0).abs() > 0.01 {
            for p in rgba.pixels_mut() {
                for i in 0..3 {
                    let v = p[i] as f32;
                    let adjusted = ((v - 128.0) * c) + 128.0;
                    p[i] = adjusted.clamp(0.0, 255.0) as u8;
                }
            }
        }
    }

    if let Some(t) = opts.threshold {
        let gray = image::DynamicImage::ImageRgba8(rgba.clone()).to_luma8();
        let mut binarized = image::GrayImage::new(gray.width(), gray.height());
        for (x, y, p) in gray.enumerate_pixels() {
            binarized.put_pixel(x, y, image::Luma([if p[0] > t { 255 } else { 0 }]));
        }
        return image::DynamicImage::ImageLuma8(binarized);
    }

    let result = image::DynamicImage::ImageRgba8(rgba);
    if opts.invert {
        result.invert();
    } else {
        result
    }
}

#[tauri::command]
pub fn ocr_preprocess_preview(
    source_path: String,
    preprocess: PreprocessOptions,
) -> Result<String, CommandError> {
    let src = PathBuf::from(&source_path);
    if !src.exists() {
        return Err(AppError::NotFound("Source image not found".into()).into());
    }
    let img = image::open(&src)
        .map_err(|e| AppError::InvalidInput(format!("Failed to open image: {}", e)))?;
    let processed = preprocess_image(&img, &preprocess);

    let temp_dir = std::env::temp_dir().join("docuverse-ocr-preview");
    std::fs::create_dir_all(&temp_dir)?;
    let temp_path = temp_dir.join(format!("{}.png", Uuid::new_v4()));
    processed
        .save(&temp_path)
        .map_err(|e| AppError::Internal(format!("Save failed: {}", e)))?;

    let bytes = std::fs::read(&temp_path)?;
    let _ = std::fs::remove_file(&temp_path);
    let encoded = STANDARD.encode(&bytes);
    Ok(format!("data:image/png;base64,{}", encoded))
}

// ---------- Image → Text ----------

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecognizeImageInput {
    pub source_path: String,
    pub language: String,
    pub preprocess: PreprocessOptions,
    pub psm: Option<u32>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecognizeImageOutput {
    pub text: String,
    pub width: u32,
    pub height: u32,
    pub language: String,
    pub duration_ms: i64,
}

#[tauri::command]
pub fn ocr_recognize_image(
    input: RecognizeImageInput,
) -> Result<RecognizeImageOutput, CommandError> {
    let src = PathBuf::from(&input.source_path);
    if !src.exists() {
        return Err(AppError::NotFound("Source image not found".into()).into());
    }

    let img = image::open(&src)
        .map_err(|e| AppError::InvalidInput(format!("Failed to open image: {}", e)))?;
    let processed = preprocess_image(&img, &input.preprocess);
    let (w, h) = (processed.width(), processed.height());

    let temp_dir = std::env::temp_dir().join("docuverse-ocr");
    std::fs::create_dir_all(&temp_dir)?;
    let temp_path = temp_dir.join(format!("{}.png", Uuid::new_v4()));
    processed
        .save(&temp_path)
        .map_err(|e| AppError::Internal(format!("Failed to save temp: {}", e)))?;

    let start = Instant::now();
    let temp_str = temp_path.to_string_lossy().to_string();
    let mut args: Vec<&str> = vec![&temp_str, "stdout", "-l", &input.language];
    let psm_str;
    if let Some(psm) = input.psm {
        psm_str = psm.to_string();
        args.push("--psm");
        args.push(&psm_str);
    }

    let output = run_tesseract(&args);

    let _ = std::fs::remove_file(&temp_path);

    let out = output?;
    if !out.status.success() {
        let err = String::from_utf8_lossy(&out.stderr).to_string();
        return Err(AppError::Internal(format!("OCR failed: {}", err)).into());
    }

    let text = String::from_utf8_lossy(&out.stdout).to_string();
    let duration_ms = start.elapsed().as_millis() as i64;

    Ok(RecognizeImageOutput {
        text,
        width: w,
        height: h,
        language: input.language,
        duration_ms,
    })
}

// ---------- PDF → Text ----------

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtractPdfTextInput {
    pub source_path: String,
    pub page_start: Option<u32>,
    pub page_end: Option<u32>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtractedPage {
    pub page: u32,
    pub text: String,
    pub has_text: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtractPdfTextOutput {
    pub pages: Vec<ExtractedPage>,
    pub total_pages: u32,
}

#[tauri::command]
pub fn ocr_extract_pdf_text(
    input: ExtractPdfTextInput,
) -> Result<ExtractPdfTextOutput, CommandError> {
    let doc = lopdf::Document::load(&input.source_path)
        .map_err(|e| AppError::InvalidInput(format!("Failed to open PDF: {}", e)))?;
    let page_numbers: Vec<u32> = doc.get_pages().keys().copied().collect();
    let total = page_numbers.len() as u32;
    let start = input.page_start.unwrap_or(1).max(1);
    let end = input.page_end.unwrap_or(total).min(total);

    let mut pages = Vec::new();
    for p in page_numbers.iter().filter(|&&n| n >= start && n <= end) {
        let text = doc
            .extract_text(&[*p])
            .map_err(|e| AppError::Internal(format!("Extract failed: {}", e)))?;
        let has_text = text.trim().len() > 3;
        pages.push(ExtractedPage {
            page: *p,
            text,
            has_text,
        });
    }

    Ok(ExtractPdfTextOutput {
        pages,
        total_pages: total,
    })
}

// ---------- PDF → Image (needs poppler) ----------

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RenderPdfPageInput {
    pub source_path: String,
    pub page: u32,
    pub dpi: Option<u32>,
}

#[tauri::command]
pub fn ocr_render_pdf_page(input: RenderPdfPageInput) -> Result<String, CommandError> {
    let temp_dir = std::env::temp_dir().join("docuverse-pdf-render");
    std::fs::create_dir_all(&temp_dir)?;
    let prefix = temp_dir.join(format!("page_{}", Uuid::new_v4()));

    let dpi = input.dpi.unwrap_or(200).to_string();
    let page = input.page.to_string();
    let prefix_str = prefix.to_string_lossy().to_string();

    let out = run_pdftoppm(&[
        "-png",
        "-r",
        &dpi,
        "-f",
        &page,
        "-l",
        &page,
        &input.source_path,
        &prefix_str,
    ])
    .map_err(|_| {
        AppError::Internal(
            "pdftoppm not available. Install Poppler to enable scanned PDF OCR.".into(),
        )
    })?;

    if !out.status.success() {
        return Err(AppError::Internal("pdftoppm failed to render PDF page".into()).into());
    }

    let rendered = std::fs::read_dir(&temp_dir)?
        .filter_map(|e| e.ok())
        .find(|e| {
            e.file_name()
                .to_string_lossy()
                .starts_with(prefix.file_name().unwrap().to_str().unwrap_or(""))
        });

    let path = rendered
        .ok_or_else(|| AppError::Internal("Rendered page not found".into()))?
        .path();

    let bytes = std::fs::read(&path)?;
    let _ = std::fs::remove_file(&path);
    let encoded = STANDARD.encode(&bytes);
    Ok(format!("data:image/png;base64,{}", encoded))
}

// ---------- Save text file ----------

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveTextInput {
    pub path: String,
    pub text: String,
}

#[tauri::command]
pub fn ocr_save_text(input: SaveTextInput) -> Result<String, CommandError> {
    let p = PathBuf::from(&input.path);
    if let Some(parent) = p.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(&p, input.text.as_bytes())?;
    Ok(p.to_string_lossy().to_string())
}

// ---------- Save DOCX ----------

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveDocxInput {
    pub path: String,
    pub pages: Vec<String>,
    pub rtl: bool,
    pub font_family: Option<String>,
    pub font_size: Option<u32>,
}

#[tauri::command]
pub fn ocr_save_docx(input: SaveDocxInput) -> Result<String, CommandError> {
    use docx_rs::*;

    let mut docx = Docx::new();
    let font = input.font_family.unwrap_or_else(|| "Arial".to_string());
    let size = input.font_size.unwrap_or(24) as usize;

    for (i, page_text) in input.pages.iter().enumerate() {
        if i > 0 {
            docx = docx.add_paragraph(
                Paragraph::new().add_run(Run::new().add_break(BreakType::TextWrapping)),
            );
        }
        for line in page_text.lines() {
            let run = Run::new()
                .add_text(line)
                .size(size)
                .fonts(RunFonts::new().ascii(&font).hansi(&font));
            let mut para = Paragraph::new().add_run(run);
            if input.rtl {
                para = para.align(AlignmentType::Right);
            }
            docx = docx.add_paragraph(para);
        }
    }

    let file = std::fs::File::create(&input.path)?;
    docx.build()
        .pack(file)
        .map_err(|e| AppError::Internal(format!("DOCX write failed: {}", e)))?;
    Ok(input.path)
}
// ---------- Job persistence ----------

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveOcrJobInput {
    pub kind: String,
    pub source_path: String,
    pub output_path: Option<String>,
    pub language: String,
    pub status: String,
    pub page_count: i64,
    pub duration_ms: Option<i64>,
    pub error_message: Option<String>,
    pub settings_json: Option<String>,
    pub preview_text: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OcrJob {
    pub id: String,
    pub kind: String,
    pub source_path: String,
    pub output_path: Option<String>,
    pub language: String,
    pub engine: String,
    pub status: String,
    pub page_count: i64,
    pub duration_ms: Option<i64>,
    pub error_message: Option<String>,
    pub settings_json: Option<String>,
    pub preview_text: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

fn fetch_job(conn: &rusqlite::Connection, id: &str) -> Result<OcrJob, CommandError> {
    let job = conn.query_row(
        "SELECT id, kind, source_path, output_path, language, engine, status, page_count, duration_ms, error_message, settings_json, preview_text, created_at, updated_at
         FROM ocr_jobs WHERE id=?1",
        [id],
        |r| {
            Ok(OcrJob {
                id: r.get(0)?,
                kind: r.get(1)?,
                source_path: r.get(2)?,
                output_path: r.get(3)?,
                language: r.get(4)?,
                engine: r.get(5)?,
                status: r.get(6)?,
                page_count: r.get(7)?,
                duration_ms: r.get(8)?,
                error_message: r.get(9)?,
                settings_json: r.get(10)?,
                preview_text: r.get(11)?,
                created_at: r.get(12)?,
                updated_at: r.get(13)?,
            })
        },
    )?;
    Ok(job)
}

#[tauri::command]
pub fn ocr_job_save(
    state: tauri::State<'_, AppState>,
    input: SaveOcrJobInput,
) -> Result<OcrJob, CommandError> {
    let id = Uuid::new_v4().to_string();
    let conn = state.db.get()?;
    conn.execute(
        "INSERT INTO ocr_jobs (id, kind, source_path, output_path, language, engine, status, page_count, duration_ms, error_message, settings_json, preview_text)
         VALUES (?1, ?2, ?3, ?4, ?5, 'tesseract', ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            id,
            input.kind,
            input.source_path,
            input.output_path,
            input.language,
            input.status,
            input.page_count,
            input.duration_ms,
            input.error_message,
            input.settings_json,
            input.preview_text,
        ],
    )?;
    fetch_job(&conn, &id)
}

#[tauri::command]
pub fn ocr_jobs_list(
    state: tauri::State<'_, AppState>,
    limit: Option<i64>,
) -> Result<Vec<OcrJob>, CommandError> {
    let conn = state.db.get()?;
    let lim = limit.unwrap_or(100);
    let mut stmt = conn.prepare(
        "SELECT id, kind, source_path, output_path, language, engine, status, page_count, duration_ms, error_message, settings_json, preview_text, created_at, updated_at
         FROM ocr_jobs ORDER BY created_at DESC LIMIT ?1",
    )?;
    let rows = stmt.query_map([lim], |r| {
        Ok(OcrJob {
            id: r.get(0)?,
            kind: r.get(1)?,
            source_path: r.get(2)?,
            output_path: r.get(3)?,
            language: r.get(4)?,
            engine: r.get(5)?,
            status: r.get(6)?,
            page_count: r.get(7)?,
            duration_ms: r.get(8)?,
            error_message: r.get(9)?,
            settings_json: r.get(10)?,
            preview_text: r.get(11)?,
            created_at: r.get(12)?,
            updated_at: r.get(13)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

#[tauri::command]
pub fn ocr_job_delete(state: tauri::State<'_, AppState>, id: String) -> Result<(), CommandError> {
    let conn = state.db.get()?;
    conn.execute("DELETE FROM ocr_jobs WHERE id=?1", [&id])?;
    Ok(())
}

#[tauri::command]
pub fn ocr_jobs_clear(state: tauri::State<'_, AppState>) -> Result<(), CommandError> {
    let conn = state.db.get()?;
    conn.execute("DELETE FROM ocr_jobs", [])?;
    Ok(())
}

// ---------- TSV with per-word confidence ----------

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WordConfidence {
    pub word: String,
    pub x: f32,
    pub y: f32,
    pub w: f32,
    pub h: f32,
    pub confidence: f32,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecognizeImageTsvOutput {
    pub text: String,
    pub words: Vec<WordConfidence>,
    pub confidence_avg: f32,
    pub language: String,
    pub duration_ms: i64,
}

#[tauri::command]
pub fn ocr_recognize_image_tsv(
    input: RecognizeImageInput,
) -> Result<RecognizeImageTsvOutput, CommandError> {
    let src = PathBuf::from(&input.source_path);
    if !src.exists() {
        return Err(AppError::NotFound("Source image not found".into()).into());
    }
    let img = image::open(&src)
        .map_err(|e| AppError::InvalidInput(format!("Failed to open image: {}", e)))?;
    let processed = preprocess_image(&img, &input.preprocess);

    let temp_dir = std::env::temp_dir().join("docuverse-ocr-tsv");
    std::fs::create_dir_all(&temp_dir)?;
    let temp_img = temp_dir.join(format!("{}.png", Uuid::new_v4()));
    let temp_tsv = temp_dir.join(format!("{}.tsv", Uuid::new_v4()));
    processed
        .save(&temp_img)
        .map_err(|e| AppError::Internal(format!("Save temp image failed: {}", e)))?;

    let start = Instant::now();
    let img_str = temp_img.to_string_lossy().to_string();
    let tsv_str = temp_tsv.to_string_lossy().to_string();
    let mut args: Vec<&str> = vec![&img_str, &tsv_str, "-l", &input.language, "tsv"];
    let psm_str;
    if let Some(psm) = input.psm {
        psm_str = psm.to_string();
        args.push("--psm");
        args.push(&psm_str);
    }

    let out = run_tesseract(&args)?;
    let _ = std::fs::remove_file(&temp_img);

    if !out.status.success() {
        let _ = std::fs::remove_file(&temp_tsv);
        return Err(AppError::Internal(format!(
            "Tesseract failed: {}",
            String::from_utf8_lossy(&out.stderr)
        ))
        .into());
    }

    let tsv = std::fs::read_to_string(&temp_tsv).unwrap_or_default();
    let _ = std::fs::remove_file(&temp_tsv);

    let mut words = Vec::new();
    let mut text_lines: Vec<String> = Vec::new();
    let mut conf_sum = 0.0f32;
    let mut conf_count = 0;

    for (i, line) in tsv.lines().enumerate() {
        if i == 0 {
            continue;
        }
        let cols: Vec<&str> = line.split('\t').collect();
        if cols.len() < 12 {
            continue;
        }
        let level: i32 = cols[0].parse().unwrap_or(0);
        let word = cols[11];
        if level == 5 && !word.trim().is_empty() {
            let left: f32 = cols[6].parse().unwrap_or(0.0);
            let top: f32 = cols[7].parse().unwrap_or(0.0);
            let w: f32 = cols[8].parse().unwrap_or(0.0);
            let h: f32 = cols[9].parse().unwrap_or(0.0);
            let conf: f32 = cols[10].parse().unwrap_or(-1.0);
            if conf >= 0.0 {
                conf_sum += conf;
                conf_count += 1;
            }
            words.push(WordConfidence {
                word: word.to_string(),
                x: left,
                y: top,
                w,
                h,
                confidence: conf.max(0.0),
            });
            text_lines.push(word.to_string());
        }
    }

    let text = text_lines.join(" ");
    let confidence_avg = if conf_count > 0 {
        conf_sum / conf_count as f32
    } else {
        0.0
    };

    Ok(RecognizeImageTsvOutput {
        text,
        words,
        confidence_avg,
        language: input.language,
        duration_ms: start.elapsed().as_millis() as i64,
    })
}

// ---------- Recognize PDF page (single command) ----------

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecognizePdfPageInput {
    pub source_path: String,
    pub page: u32,
    pub language: String,
    pub dpi: Option<u32>,
    pub preprocess: PreprocessOptions,
    pub psm: Option<u32>,
}

#[tauri::command]
pub fn ocr_recognize_pdf_page(
    input: RecognizePdfPageInput,
) -> Result<RecognizeImageTsvOutput, CommandError> {
    let temp_dir = std::env::temp_dir().join("docuverse-pdf-ocr");
    std::fs::create_dir_all(&temp_dir)?;
    let prefix = temp_dir.join(format!("p_{}", Uuid::new_v4()));
    let dpi = input.dpi.unwrap_or(200).to_string();
    let page = input.page.to_string();
    let prefix_str = prefix.to_string_lossy().to_string();

    let out = run_pdftoppm(&[
        "-png",
        "-r",
        &dpi,
        "-f",
        &page,
        "-l",
        &page,
        &input.source_path,
        &prefix_str,
    ])
    .map_err(|_| {
        AppError::Internal(
            "pdftoppm not available. Install Poppler to enable scanned PDF OCR.".into(),
        )
    })?;

    if !out.status.success() {
        return Err(AppError::Internal("pdftoppm failed to render".into()).into());
    }

    let rendered = std::fs::read_dir(&temp_dir)?
        .filter_map(|e| e.ok())
        .find(|e| {
            e.file_name()
                .to_string_lossy()
                .starts_with(prefix.file_name().unwrap().to_str().unwrap_or(""))
        })
        .ok_or_else(|| AppError::Internal("Rendered page not found".into()))?;

    let rendered_path = rendered.path().to_string_lossy().to_string();

    let result = ocr_recognize_image_tsv(RecognizeImageInput {
        source_path: rendered_path.clone(),
        language: input.language,
        preprocess: input.preprocess,
        psm: input.psm,
    });

    let _ = std::fs::remove_file(&rendered_path);
    result
}

// ---------- Searchable PDF ----------

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSearchablePdfInput {
    pub source_pdf_path: String,
    pub output_path: String,
    pub page_texts: Vec<PageOcrText>,
    pub dpi: Option<u32>,
}

#[derive(Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PageOcrText {
    pub page: u32,
    pub text: String,
}

#[tauri::command]
pub fn ocr_create_searchable_pdf(input: CreateSearchablePdfInput) -> Result<String, CommandError> {
    use printpdf::*;

    struct PageData {
        rgb: Vec<u8>,
        width: u32,
        height: u32,
        text: String,
        w_pt: f32,
        h_pt: f32,
    }

    let dpi_val = input.dpi.unwrap_or(150);
    let dpi = dpi_val as f32;
    let temp_dir = std::env::temp_dir().join("docuverse-searchable-pdf");
    std::fs::create_dir_all(&temp_dir)?;

    let mut pages_data: Vec<PageData> = Vec::new();

    for page_ocr in &input.page_texts {
        let prefix = temp_dir.join(format!("pg_{}", Uuid::new_v4()));
        let prefix_str = prefix.to_string_lossy().to_string();
        let page_str = page_ocr.page.to_string();
        let dpi_str = dpi_val.to_string();

        let out = run_pdftoppm(&[
            "-png",
            "-r",
            &dpi_str,
            "-f",
            &page_str,
            "-l",
            &page_str,
            &input.source_pdf_path,
            &prefix_str,
        ])?;

        if !out.status.success() {
            return Err(AppError::Internal("pdftoppm failed".into()).into());
        }

        let rendered = std::fs::read_dir(&temp_dir)?
            .filter_map(|e| e.ok())
            .find(|e| {
                e.file_name()
                    .to_string_lossy()
                    .starts_with(prefix.file_name().unwrap().to_str().unwrap_or(""))
            })
            .ok_or_else(|| AppError::Internal("Rendered page missing".into()))?;

        let path = rendered.path();
        let img =
            image::open(&path).map_err(|e| AppError::Internal(format!("Load rendered: {}", e)))?;
        let rgb_img = img.to_rgb8();
        let (w, h) = rgb_img.dimensions();
        let w_pt = (w as f32 / dpi) * 72.0;
        let h_pt = (h as f32 / dpi) * 72.0;

        pages_data.push(PageData {
            rgb: rgb_img.into_raw(),
            width: w,
            height: h,
            text: page_ocr.text.clone(),
            w_pt,
            h_pt,
        });

        let _ = std::fs::remove_file(&path);
    }

    if pages_data.is_empty() {
        return Err(AppError::InvalidInput("No pages to process".into()).into());
    }

    let first = &pages_data[0];
    let (doc, first_page, first_layer) = PdfDocument::new(
        "Searchable OCR",
        Mm(first.w_pt * 25.4 / 72.0),
        Mm(first.h_pt * 25.4 / 72.0),
        "Layer",
    );
    let font = doc
        .add_builtin_font(BuiltinFont::Helvetica)
        .map_err(|e| AppError::Internal(format!("Font: {}", e)))?;

    for (idx, pg) in pages_data.iter().enumerate() {
        let (page, layer) = if idx == 0 {
            (first_page, first_layer)
        } else {
            doc.add_page(
                Mm(pg.w_pt * 25.4 / 72.0),
                Mm(pg.h_pt * 25.4 / 72.0),
                "Layer",
            )
        };

        let current = doc.get_page(page).get_layer(layer);

        let raw = RawImage::new(
            pg.width as usize,
            pg.height as usize,
            ColorSpace::Rgb,
            pg.rgb.clone(),
        );
        let image = Image::from(raw);
        image.add_to_layer(
            current.clone(),
            ImageTransform {
                translate_x: Some(Mm(0.0)),
                translate_y: Some(Mm(0.0)),
                dpi: Some(dpi),
                ..Default::default()
            },
        );

        if !pg.text.trim().is_empty() {
            let lines: Vec<&str> = pg.text.lines().collect();
            let line_height = 4.0;
            let start_y = pg.h_pt - 8.0;

            for (i, line) in lines.iter().enumerate() {
                let y = start_y - (i as f32 * line_height);
                if y < 4.0 {
                    break;
                }
                let safe = line.replace('(', "[").replace(')', "]");
                current.use_text(&safe, 6.0, Mm(4.0), Mm(y * 25.4 / 72.0), &font);
            }
        }
    }

    let file = std::fs::File::create(&input.output_path)?;
    let mut writer = std::io::BufWriter::new(file);
    doc.save(&mut writer)
        .map_err(|e| AppError::Internal(format!("Save PDF: {}", e)))?;

    Ok(input.output_path)
}

// ---------- PDF to DOCX with paragraph preservation ----------

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PdfToDocxInput {
    pub source_pdf_path: String,
    pub output_path: String,
    pub pages: Vec<PageOcrText>,
    pub rtl: bool,
    pub font_family: Option<String>,
    pub font_size: Option<u32>,
}

#[tauri::command]
pub fn ocr_pdf_to_docx(input: PdfToDocxInput) -> Result<String, CommandError> {
    use docx_rs::*;

    let font = input.font_family.unwrap_or_else(|| "Arial".to_string());
    let size = input.font_size.unwrap_or(24) as usize;
    let mut docx = Docx::new();

    for (page_idx, page) in input.pages.iter().enumerate() {
        if page_idx > 0 {
            docx = docx.add_paragraph(
                Paragraph::new().add_run(Run::new().add_break(BreakType::TextWrapping)),
            );
        }

        let blocks: Vec<&str> = page.text.split("\n\n").collect();
        let has_blocks = blocks.len() > 1 || blocks[0].len() > 200;

        if has_blocks && blocks.len() > 1 {
            for block in &blocks {
                for line in block.lines() {
                    let run = Run::new()
                        .add_text(line)
                        .size(size)
                        .fonts(RunFonts::new().ascii(&font).hansi(&font));
                    let mut para = Paragraph::new().add_run(run);
                    if input.rtl {
                        para = para.align(AlignmentType::Right);
                    }
                    docx = docx.add_paragraph(para);
                }
                docx = docx.add_paragraph(Paragraph::new());
            }
        } else {
            for line in page.text.lines() {
                let run = Run::new()
                    .add_text(line)
                    .size(size)
                    .fonts(RunFonts::new().ascii(&font).hansi(&font));
                let mut para = Paragraph::new().add_run(run);
                if input.rtl {
                    para = para.align(AlignmentType::Right);
                }
                docx = docx.add_paragraph(para);
            }
        }
    }

    let file = std::fs::File::create(&input.output_path)?;
    docx.build()
        .pack(file)
        .map_err(|e| AppError::Internal(format!("DOCX write: {}", e)))?;
    Ok(input.output_path)
}

// ---------- Language pack management ----------

#[tauri::command]
pub fn ocr_language_pack_status() -> Result<Vec<LanguageInfo>, CommandError> {
    ocr_list_languages()
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallLanguageInput {
    pub source_file_path: String,
    pub language_code: String,
}

#[tauri::command]
pub fn ocr_install_language_pack(
    state: tauri::State<'_, AppState>,
    input: InstallLanguageInput,
) -> Result<(), CommandError> {
    let src = PathBuf::from(&input.source_file_path);
    if !src.exists() {
        return Err(AppError::NotFound("Language pack file not found".into()).into());
    }

    let file_name = format!("{}.traineddata", input.language_code);
    if !src
        .file_name()
        .and_then(|n| n.to_str())
        .map(|n| n.ends_with(".traineddata"))
        .unwrap_or(false)
    {
        return Err(AppError::InvalidInput("File must end with .traineddata".into()).into());
    }

    // Locate tessdata next to tesseract.exe
    let tesseract_path = Command::new(if cfg!(windows) { "where" } else { "which" })
        .arg("tesseract")
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                String::from_utf8_lossy(&o.stdout)
                    .lines()
                    .next()
                    .map(|s| PathBuf::from(s.trim()))
            } else {
                None
            }
        });

    let tessdata_dir = tesseract_path
        .as_ref()
        .and_then(|p| p.parent())
        .map(|p| p.join("tessdata"))
        .ok_or_else(|| AppError::Internal("Could not locate Tesseract tessdata folder".into()))?;

    if !tessdata_dir.exists() {
        return Err(AppError::NotFound(format!(
            "tessdata folder not found: {}",
            tessdata_dir.display()
        ))
        .into());
    }

    let dest = tessdata_dir.join(&file_name);
    if dest.exists() {
        return Err(AppError::InvalidInput(
            format!("Language {} already installed", input.language_code).into(),
        )
        .into());
    }

    std::fs::copy(&src, &dest).map_err(|e| {
        AppError::PermissionDenied(format!("Copy failed (admin rights may be required): {}", e))
    })?;

    let conn = state.db.get()?;
    let size = std::fs::metadata(&dest)
        .map(|m| m.len() as i64)
        .unwrap_or(0);
    conn.execute(
        "INSERT INTO ocr_language_installs (code, source, file_size_bytes)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(code) DO UPDATE SET installed_at = datetime('now'),
                                        source = excluded.source,
                                        file_size_bytes = excluded.file_size_bytes",
        rusqlite::params![input.language_code, "manual", size],
    )?;

    Ok(())
}

#[tauri::command]
pub fn ocr_language_pack_info() -> Result<String, CommandError> {
    let tesseract_path = Command::new(if cfg!(windows) { "where" } else { "which" })
        .arg("tesseract")
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                String::from_utf8_lossy(&o.stdout)
                    .lines()
                    .next()
                    .map(|s| s.trim().to_string())
            } else {
                None
            }
        });

    let tessdata = tesseract_path
        .and_then(|p| {
            PathBuf::from(&p)
                .parent()
                .map(|parent| parent.join("tessdata").to_string_lossy().to_string())
        })
        .unwrap_or_else(|| "Tesseract not found".into());

    Ok(tessdata)
}
