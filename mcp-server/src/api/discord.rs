// src/api/discord.rs

use axum::{extract::State, http::StatusCode, Json};
use serde::Deserialize;
use serde_json::Value;

use crate::AppState;

#[derive(Deserialize)]
pub struct DiscordPostRequest {
    pub message: String,
    pub username: Option<String>,
}

// Note: request payload is passed straight to the unified service layer; no local payload struct needed.

pub async fn post_discord_message(
    state: &AppState,
    content: &str,
    username: Option<&str>,
) -> anyhow::Result<Value> {
    // Delegate to unified service implementation
    let res = crate::blockchain::services::discord::send_message(state, content, username).await?;
    Ok(res)
}

pub async fn post_discord_handler(
    State(state): State<AppState>,
    Json(req): Json<DiscordPostRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let res = post_discord_message(&state, &req.message, req.username.as_deref())
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(res))
}
