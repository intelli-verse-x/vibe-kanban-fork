//! Route handlers for workbook features
//!
//! This module provides REST API routes for all workbook entities:
//! Features, KPIs, Bugs, Risks, Sprints, Releases, Time Entries, and User Feedback.

use api_types::{
    workbook::*, Bug, CreateBugRequest, CreateFeatureRequest, CreateKPIRequest,
    CreateReleaseRequest, CreateRiskRequest, CreateSprintItemRequest, CreateSprintRequest,
    CreateTimeEntryRequest, CreateUserFeedbackRequest, DeleteResponse, Feature, KPI,
    MutationResponse, Release, Risk, Sprint, SprintItem, TimeEntry, UpdateBugRequest,
    UpdateFeatureRequest, UpdateKPIRequest, UpdateReleaseRequest, UpdateRiskRequest,
    UpdateSprintItemRequest, UpdateSprintRequest, UpdateTimeEntryRequest,
    UpdateUserFeedbackRequest, UserFeedback,
};
use axum::{
    Json,
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    routing::{delete, get, patch, post},
    Router,
};
use serde::Deserialize;
use tracing::instrument;
use uuid::Uuid;

use super::{
    error::{ErrorResponse, db_error},
    organization_members::ensure_project_access,
};
use crate::{
    AppState,
    auth::RequestContext,
    db::workbook::{
        BugsRepository, DashboardRepository, FeaturesRepository, KPIsRepository,
        ReleasesRepository, RisksRepository, SprintItemsRepository, SprintsRepository,
        TimeEntriesRepository, UserFeedbackRepository,
    },
};

/// Query params for listing workbook entities
#[derive(Debug, Deserialize)]
pub struct WorkbookListQuery {
    pub project_id: Uuid,
}

/// Query params for sprint items
#[derive(Debug, Deserialize)]
pub struct SprintItemsQuery {
    pub sprint_id: Uuid,
}

/// Build the workbook router with all feature routes
pub fn router() -> Router<AppState> {
    Router::new()
        // Dashboard / Stats
        .route("/projects/:project_id/workbook/dashboard", get(get_dashboard))
        // Features
        .route("/projects/:project_id/workbook/features", get(list_features))
        .route("/projects/:project_id/workbook/features", post(create_feature))
        .route("/workbook/features/:id", get(get_feature))
        .route("/workbook/features/:id", patch(update_feature))
        .route("/workbook/features/:id", delete(delete_feature))
        // KPIs
        .route("/projects/:project_id/workbook/kpis", get(list_kpis))
        .route("/projects/:project_id/workbook/kpis", post(create_kpi))
        .route("/workbook/kpis/:id", get(get_kpi))
        .route("/workbook/kpis/:id", patch(update_kpi))
        .route("/workbook/kpis/:id", delete(delete_kpi))
        // Bugs
        .route("/projects/:project_id/workbook/bugs", get(list_bugs))
        .route("/projects/:project_id/workbook/bugs", post(create_bug))
        .route("/workbook/bugs/:id", get(get_bug))
        .route("/workbook/bugs/:id", patch(update_bug))
        .route("/workbook/bugs/:id", delete(delete_bug))
        // Risks
        .route("/projects/:project_id/workbook/risks", get(list_risks))
        .route("/projects/:project_id/workbook/risks", post(create_risk))
        .route("/workbook/risks/:id", get(get_risk))
        .route("/workbook/risks/:id", patch(update_risk))
        .route("/workbook/risks/:id", delete(delete_risk))
        // Sprints
        .route("/projects/:project_id/workbook/sprints", get(list_sprints))
        .route("/projects/:project_id/workbook/sprints", post(create_sprint))
        .route("/workbook/sprints/:id", get(get_sprint))
        .route("/workbook/sprints/:id", patch(update_sprint))
        .route("/workbook/sprints/:id", delete(delete_sprint))
        // Sprint Items
        .route("/workbook/sprints/:sprint_id/items", get(list_sprint_items))
        .route("/projects/:project_id/workbook/sprint-items", post(create_sprint_item))
        .route("/workbook/sprint-items/:id", get(get_sprint_item))
        .route("/workbook/sprint-items/:id", patch(update_sprint_item))
        .route("/workbook/sprint-items/:id", delete(delete_sprint_item))
        // Releases
        .route("/projects/:project_id/workbook/releases", get(list_releases))
        .route("/projects/:project_id/workbook/releases", post(create_release))
        .route("/workbook/releases/:id", get(get_release))
        .route("/workbook/releases/:id", patch(update_release))
        .route("/workbook/releases/:id", delete(delete_release))
        // Time Entries
        .route("/projects/:project_id/workbook/time-entries", get(list_time_entries))
        .route("/projects/:project_id/workbook/time-entries", post(create_time_entry))
        .route("/workbook/time-entries/:id", get(get_time_entry))
        .route("/workbook/time-entries/:id", patch(update_time_entry))
        .route("/workbook/time-entries/:id", delete(delete_time_entry))
        // User Feedback
        .route("/projects/:project_id/workbook/feedback", get(list_feedback))
        .route("/projects/:project_id/workbook/feedback", post(create_feedback))
        .route("/workbook/feedback/:id", get(get_feedback))
        .route("/workbook/feedback/:id", patch(update_feedback))
        .route("/workbook/feedback/:id", delete(delete_feedback))
}

// ============================================
// Dashboard Handlers
// ============================================

#[instrument(name = "workbook.get_dashboard", skip(state, ctx))]
async fn get_dashboard(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
) -> Result<Json<DashboardStats>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let stats = DashboardRepository::get_stats(state.pool(), project_id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %project_id, "failed to get dashboard stats");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to get dashboard stats")
        })?;

    Ok(Json(stats))
}

// ============================================
// Features Handlers
// ============================================

#[instrument(name = "workbook.list_features", skip(state, ctx))]
async fn list_features(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
) -> Result<Json<ListFeaturesResponse>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let features = FeaturesRepository::list_by_project(state.pool(), project_id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %project_id, "failed to list features");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to list features")
        })?;
    let total = features.len() as i64;

    Ok(Json(ListFeaturesResponse { features, total }))
}

#[instrument(name = "workbook.get_feature", skip(state, ctx))]
async fn get_feature(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<Feature>, ErrorResponse> {
    let feature = FeaturesRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load feature");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load feature")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "feature not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, feature.project_id).await?;

    Ok(Json(feature))
}

#[instrument(name = "workbook.create_feature", skip(state, ctx, payload))]
async fn create_feature(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<CreateFeatureRequest>,
) -> Result<Json<MutationResponse<Feature>>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let response = FeaturesRepository::create(state.pool(), project_id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to create feature");
            db_error(e, "failed to create feature")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.update_feature", skip(state, ctx, payload))]
async fn update_feature(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateFeatureRequest>,
) -> Result<Json<MutationResponse<Feature>>, ErrorResponse> {
    let feature = FeaturesRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load feature");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load feature")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "feature not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, feature.project_id).await?;

    let response = FeaturesRepository::update(state.pool(), id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to update feature");
            db_error(e, "failed to update feature")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.delete_feature", skip(state, ctx))]
async fn delete_feature(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeleteResponse>, ErrorResponse> {
    let feature = FeaturesRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load feature");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load feature")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "feature not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, feature.project_id).await?;

    let txid = FeaturesRepository::delete(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to delete feature");
            db_error(e, "failed to delete feature")
        })?;

    Ok(Json(DeleteResponse { txid }))
}

// ============================================
// KPIs Handlers
// ============================================

#[instrument(name = "workbook.list_kpis", skip(state, ctx))]
async fn list_kpis(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
) -> Result<Json<ListKPIsResponse>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let kpis = KPIsRepository::list_by_project(state.pool(), project_id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %project_id, "failed to list kpis");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to list kpis")
        })?;
    let total = kpis.len() as i64;

    Ok(Json(ListKPIsResponse { kpis, total }))
}

#[instrument(name = "workbook.get_kpi", skip(state, ctx))]
async fn get_kpi(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<KPI>, ErrorResponse> {
    let kpi = KPIsRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load kpi");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load kpi")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "kpi not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, kpi.project_id).await?;

    Ok(Json(kpi))
}

#[instrument(name = "workbook.create_kpi", skip(state, ctx, payload))]
async fn create_kpi(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<CreateKPIRequest>,
) -> Result<Json<MutationResponse<KPI>>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let response = KPIsRepository::create(state.pool(), project_id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to create kpi");
            db_error(e, "failed to create kpi")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.update_kpi", skip(state, ctx, payload))]
async fn update_kpi(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateKPIRequest>,
) -> Result<Json<MutationResponse<KPI>>, ErrorResponse> {
    let kpi = KPIsRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load kpi");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load kpi")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "kpi not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, kpi.project_id).await?;

    let response = KPIsRepository::update(state.pool(), id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to update kpi");
            db_error(e, "failed to update kpi")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.delete_kpi", skip(state, ctx))]
async fn delete_kpi(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeleteResponse>, ErrorResponse> {
    let kpi = KPIsRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load kpi");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load kpi")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "kpi not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, kpi.project_id).await?;

    let txid = KPIsRepository::delete(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to delete kpi");
            db_error(e, "failed to delete kpi")
        })?;

    Ok(Json(DeleteResponse { txid }))
}

// ============================================
// Bugs Handlers
// ============================================

#[instrument(name = "workbook.list_bugs", skip(state, ctx))]
async fn list_bugs(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
) -> Result<Json<ListBugsResponse>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let bugs = BugsRepository::list_by_project(state.pool(), project_id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %project_id, "failed to list bugs");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to list bugs")
        })?;
    let total = bugs.len() as i64;

    Ok(Json(ListBugsResponse { bugs, total }))
}

#[instrument(name = "workbook.get_bug", skip(state, ctx))]
async fn get_bug(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<Bug>, ErrorResponse> {
    let bug = BugsRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load bug");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load bug")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "bug not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, bug.project_id).await?;

    Ok(Json(bug))
}

#[instrument(name = "workbook.create_bug", skip(state, ctx, payload))]
async fn create_bug(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<CreateBugRequest>,
) -> Result<Json<MutationResponse<Bug>>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let response = BugsRepository::create(state.pool(), project_id, ctx.user.id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to create bug");
            db_error(e, "failed to create bug")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.update_bug", skip(state, ctx, payload))]
async fn update_bug(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateBugRequest>,
) -> Result<Json<MutationResponse<Bug>>, ErrorResponse> {
    let bug = BugsRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load bug");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load bug")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "bug not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, bug.project_id).await?;

    let response = BugsRepository::update(state.pool(), id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to update bug");
            db_error(e, "failed to update bug")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.delete_bug", skip(state, ctx))]
async fn delete_bug(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeleteResponse>, ErrorResponse> {
    let bug = BugsRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load bug");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load bug")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "bug not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, bug.project_id).await?;

    let txid = BugsRepository::delete(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to delete bug");
            db_error(e, "failed to delete bug")
        })?;

    Ok(Json(DeleteResponse { txid }))
}

// ============================================
// Risks Handlers
// ============================================

#[instrument(name = "workbook.list_risks", skip(state, ctx))]
async fn list_risks(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
) -> Result<Json<ListRisksResponse>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let risks = RisksRepository::list_by_project(state.pool(), project_id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %project_id, "failed to list risks");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to list risks")
        })?;
    let total = risks.len() as i64;

    Ok(Json(ListRisksResponse { risks, total }))
}

#[instrument(name = "workbook.get_risk", skip(state, ctx))]
async fn get_risk(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<Risk>, ErrorResponse> {
    let risk = RisksRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load risk");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load risk")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "risk not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, risk.project_id).await?;

    Ok(Json(risk))
}

#[instrument(name = "workbook.create_risk", skip(state, ctx, payload))]
async fn create_risk(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<CreateRiskRequest>,
) -> Result<Json<MutationResponse<Risk>>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let response = RisksRepository::create(state.pool(), project_id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to create risk");
            db_error(e, "failed to create risk")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.update_risk", skip(state, ctx, payload))]
async fn update_risk(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateRiskRequest>,
) -> Result<Json<MutationResponse<Risk>>, ErrorResponse> {
    let risk = RisksRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load risk");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load risk")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "risk not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, risk.project_id).await?;

    let response = RisksRepository::update(state.pool(), id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to update risk");
            db_error(e, "failed to update risk")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.delete_risk", skip(state, ctx))]
async fn delete_risk(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeleteResponse>, ErrorResponse> {
    let risk = RisksRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load risk");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load risk")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "risk not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, risk.project_id).await?;

    let txid = RisksRepository::delete(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to delete risk");
            db_error(e, "failed to delete risk")
        })?;

    Ok(Json(DeleteResponse { txid }))
}

// ============================================
// Sprints Handlers
// ============================================

#[instrument(name = "workbook.list_sprints", skip(state, ctx))]
async fn list_sprints(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
) -> Result<Json<ListSprintsResponse>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let sprints = SprintsRepository::list_by_project(state.pool(), project_id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %project_id, "failed to list sprints");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to list sprints")
        })?;
    let total = sprints.len() as i64;

    Ok(Json(ListSprintsResponse { sprints, total }))
}

#[instrument(name = "workbook.get_sprint", skip(state, ctx))]
async fn get_sprint(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<Sprint>, ErrorResponse> {
    let sprint = SprintsRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load sprint");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load sprint")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "sprint not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, sprint.project_id).await?;

    Ok(Json(sprint))
}

#[instrument(name = "workbook.create_sprint", skip(state, ctx, payload))]
async fn create_sprint(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<CreateSprintRequest>,
) -> Result<Json<MutationResponse<Sprint>>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let response = SprintsRepository::create(state.pool(), project_id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to create sprint");
            db_error(e, "failed to create sprint")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.update_sprint", skip(state, ctx, payload))]
async fn update_sprint(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateSprintRequest>,
) -> Result<Json<MutationResponse<Sprint>>, ErrorResponse> {
    let sprint = SprintsRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load sprint");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load sprint")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "sprint not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, sprint.project_id).await?;

    let response = SprintsRepository::update(state.pool(), id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to update sprint");
            db_error(e, "failed to update sprint")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.delete_sprint", skip(state, ctx))]
async fn delete_sprint(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeleteResponse>, ErrorResponse> {
    let sprint = SprintsRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load sprint");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load sprint")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "sprint not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, sprint.project_id).await?;

    let txid = SprintsRepository::delete(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to delete sprint");
            db_error(e, "failed to delete sprint")
        })?;

    Ok(Json(DeleteResponse { txid }))
}

// ============================================
// Sprint Items Handlers
// ============================================

#[instrument(name = "workbook.list_sprint_items", skip(state, ctx))]
async fn list_sprint_items(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(sprint_id): Path<Uuid>,
) -> Result<Json<ListSprintItemsResponse>, ErrorResponse> {
    // First get the sprint to verify project access
    let sprint = SprintsRepository::find_by_id(state.pool(), sprint_id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %sprint_id, "failed to load sprint");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load sprint")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "sprint not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, sprint.project_id).await?;

    let sprint_items = SprintItemsRepository::list_by_sprint(state.pool(), sprint_id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %sprint_id, "failed to list sprint items");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to list sprint items")
        })?;
    let total = sprint_items.len() as i64;

    Ok(Json(ListSprintItemsResponse { sprint_items, total }))
}

#[instrument(name = "workbook.get_sprint_item", skip(state, ctx))]
async fn get_sprint_item(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<SprintItem>, ErrorResponse> {
    let item = SprintItemsRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load sprint item");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load sprint item")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "sprint item not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, item.project_id).await?;

    Ok(Json(item))
}

#[instrument(name = "workbook.create_sprint_item", skip(state, ctx, payload))]
async fn create_sprint_item(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<CreateSprintItemRequest>,
) -> Result<Json<MutationResponse<SprintItem>>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let response = SprintItemsRepository::create(state.pool(), project_id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to create sprint item");
            db_error(e, "failed to create sprint item")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.update_sprint_item", skip(state, ctx, payload))]
async fn update_sprint_item(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateSprintItemRequest>,
) -> Result<Json<MutationResponse<SprintItem>>, ErrorResponse> {
    let item = SprintItemsRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load sprint item");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load sprint item")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "sprint item not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, item.project_id).await?;

    let response = SprintItemsRepository::update(state.pool(), id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to update sprint item");
            db_error(e, "failed to update sprint item")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.delete_sprint_item", skip(state, ctx))]
async fn delete_sprint_item(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeleteResponse>, ErrorResponse> {
    let item = SprintItemsRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load sprint item");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load sprint item")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "sprint item not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, item.project_id).await?;

    let txid = SprintItemsRepository::delete(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to delete sprint item");
            db_error(e, "failed to delete sprint item")
        })?;

    Ok(Json(DeleteResponse { txid }))
}

// ============================================
// Releases Handlers
// ============================================

#[instrument(name = "workbook.list_releases", skip(state, ctx))]
async fn list_releases(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
) -> Result<Json<ListReleasesResponse>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let releases = ReleasesRepository::list_by_project(state.pool(), project_id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %project_id, "failed to list releases");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to list releases")
        })?;
    let total = releases.len() as i64;

    Ok(Json(ListReleasesResponse { releases, total }))
}

#[instrument(name = "workbook.get_release", skip(state, ctx))]
async fn get_release(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<Release>, ErrorResponse> {
    let release = ReleasesRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load release");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load release")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "release not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, release.project_id).await?;

    Ok(Json(release))
}

#[instrument(name = "workbook.create_release", skip(state, ctx, payload))]
async fn create_release(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<CreateReleaseRequest>,
) -> Result<Json<MutationResponse<Release>>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let response = ReleasesRepository::create(state.pool(), project_id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to create release");
            db_error(e, "failed to create release")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.update_release", skip(state, ctx, payload))]
async fn update_release(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateReleaseRequest>,
) -> Result<Json<MutationResponse<Release>>, ErrorResponse> {
    let release = ReleasesRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load release");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load release")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "release not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, release.project_id).await?;

    let response = ReleasesRepository::update(state.pool(), id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to update release");
            db_error(e, "failed to update release")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.delete_release", skip(state, ctx))]
async fn delete_release(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeleteResponse>, ErrorResponse> {
    let release = ReleasesRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load release");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load release")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "release not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, release.project_id).await?;

    let txid = ReleasesRepository::delete(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to delete release");
            db_error(e, "failed to delete release")
        })?;

    Ok(Json(DeleteResponse { txid }))
}

// ============================================
// Time Entries Handlers
// ============================================

#[instrument(name = "workbook.list_time_entries", skip(state, ctx))]
async fn list_time_entries(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
) -> Result<Json<ListTimeEntriesResponse>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let time_entries = TimeEntriesRepository::list_by_project(state.pool(), project_id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %project_id, "failed to list time entries");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to list time entries")
        })?;
    let total = time_entries.len() as i64;

    Ok(Json(ListTimeEntriesResponse { time_entries, total }))
}

#[instrument(name = "workbook.get_time_entry", skip(state, ctx))]
async fn get_time_entry(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<TimeEntry>, ErrorResponse> {
    let entry = TimeEntriesRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load time entry");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load time entry")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "time entry not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, entry.project_id).await?;

    Ok(Json(entry))
}

#[instrument(name = "workbook.create_time_entry", skip(state, ctx, payload))]
async fn create_time_entry(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<CreateTimeEntryRequest>,
) -> Result<Json<MutationResponse<TimeEntry>>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let response = TimeEntriesRepository::create(state.pool(), project_id, ctx.user.id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to create time entry");
            db_error(e, "failed to create time entry")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.update_time_entry", skip(state, ctx, payload))]
async fn update_time_entry(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateTimeEntryRequest>,
) -> Result<Json<MutationResponse<TimeEntry>>, ErrorResponse> {
    let entry = TimeEntriesRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load time entry");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load time entry")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "time entry not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, entry.project_id).await?;

    let response = TimeEntriesRepository::update(state.pool(), id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to update time entry");
            db_error(e, "failed to update time entry")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.delete_time_entry", skip(state, ctx))]
async fn delete_time_entry(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeleteResponse>, ErrorResponse> {
    let entry = TimeEntriesRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load time entry");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load time entry")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "time entry not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, entry.project_id).await?;

    let txid = TimeEntriesRepository::delete(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to delete time entry");
            db_error(e, "failed to delete time entry")
        })?;

    Ok(Json(DeleteResponse { txid }))
}

// ============================================
// User Feedback Handlers
// ============================================

#[instrument(name = "workbook.list_feedback", skip(state, ctx))]
async fn list_feedback(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
) -> Result<Json<ListUserFeedbackResponse>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let feedback = UserFeedbackRepository::list_by_project(state.pool(), project_id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %project_id, "failed to list feedback");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to list feedback")
        })?;
    let total = feedback.len() as i64;

    Ok(Json(ListUserFeedbackResponse { feedback, total }))
}

#[instrument(name = "workbook.get_feedback", skip(state, ctx))]
async fn get_feedback(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<UserFeedback>, ErrorResponse> {
    let feedback = UserFeedbackRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load feedback");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load feedback")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "feedback not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, feedback.project_id).await?;

    Ok(Json(feedback))
}

#[instrument(name = "workbook.create_feedback", skip(state, ctx, payload))]
async fn create_feedback(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<CreateUserFeedbackRequest>,
) -> Result<Json<MutationResponse<UserFeedback>>, ErrorResponse> {
    ensure_project_access(state.pool(), ctx.user.id, project_id).await?;

    let response = UserFeedbackRepository::create(state.pool(), project_id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to create feedback");
            db_error(e, "failed to create feedback")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.update_feedback", skip(state, ctx, payload))]
async fn update_feedback(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateUserFeedbackRequest>,
) -> Result<Json<MutationResponse<UserFeedback>>, ErrorResponse> {
    let feedback = UserFeedbackRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load feedback");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load feedback")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "feedback not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, feedback.project_id).await?;

    let response = UserFeedbackRepository::update(state.pool(), id, payload)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to update feedback");
            db_error(e, "failed to update feedback")
        })?;

    Ok(Json(response))
}

#[instrument(name = "workbook.delete_feedback", skip(state, ctx))]
async fn delete_feedback(
    State(state): State<AppState>,
    Extension(ctx): Extension<RequestContext>,
    Path(id): Path<Uuid>,
) -> Result<Json<DeleteResponse>, ErrorResponse> {
    let feedback = UserFeedbackRepository::find_by_id(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, %id, "failed to load feedback");
            ErrorResponse::new(StatusCode::INTERNAL_SERVER_ERROR, "failed to load feedback")
        })?
        .ok_or_else(|| ErrorResponse::new(StatusCode::NOT_FOUND, "feedback not found"))?;

    ensure_project_access(state.pool(), ctx.user.id, feedback.project_id).await?;

    let txid = UserFeedbackRepository::delete(state.pool(), id)
        .await
        .map_err(|e| {
            tracing::error!(?e, "failed to delete feedback");
            db_error(e, "failed to delete feedback")
        })?;

    Ok(Json(DeleteResponse { txid }))
}
