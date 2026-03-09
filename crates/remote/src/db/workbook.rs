//! Database operations for workbook features
//!
//! This module provides CRUD operations for Features, KPIs, Bugs, Risks,
//! Sprints, Releases, Time Entries, and User Feedback.
//!
//! Uses runtime queries (not compile-time macros) to avoid SQLx offline cache dependency.

use api_types::{
    Bug, BugSeverity, BugStatus, CreateBugRequest, CreateFeatureRequest, CreateKPIRequest,
    CreateReleaseRequest, CreateRiskRequest, CreateSprintItemRequest, CreateSprintRequest,
    CreateTimeEntryRequest, CreateUserFeedbackRequest, Feature, FeaturePriority, FeatureStatus,
    KPIFrequency, KPIStatus, MutationResponse, Release, ReleaseStatus, ReleaseType, Risk,
    RiskCategory, RiskImpact, RiskProbability, RiskStatus, Sprint, SprintItem, SprintItemStatus,
    SprintStatus, TimeEntry, UpdateBugRequest, UpdateFeatureRequest, UpdateKPIRequest,
    UpdateReleaseRequest, UpdateRiskRequest, UpdateSprintItemRequest, UpdateSprintRequest,
    UpdateTimeEntryRequest, UpdateUserFeedbackRequest, UserFeedback, KPI,
};
use api_types::workbook::*;
use chrono::{DateTime, Utc};
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

use super::get_txid;

// ============================================
// Internal Row Types (for runtime queries)
// ============================================
// These types use String for enum columns to avoid SQLx compile-time checking.
// They are converted to API types after fetching from the database.

#[derive(FromRow)]
struct FeatureRow {
    id: Uuid,
    project_id: Uuid,
    feature_key: String,
    title: String,
    description: Option<String>,
    status: Option<String>,
    priority: Option<String>,
    owner_user_id: Option<Uuid>,
    start_date: Option<DateTime<Utc>>,
    target_date: Option<DateTime<Utc>>,
    completed_at: Option<DateTime<Utc>>,
    progress: Option<i32>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<FeatureRow> for Feature {
    fn from(row: FeatureRow) -> Self {
        Feature {
            id: row.id,
            project_id: row.project_id,
            feature_key: row.feature_key,
            title: row.title,
            description: row.description,
            status: row.status.and_then(|s| parse_feature_status(&s)),
            priority: row.priority.and_then(|p| parse_feature_priority(&p)),
            owner_user_id: row.owner_user_id,
            start_date: row.start_date,
            target_date: row.target_date,
            completed_at: row.completed_at,
            progress: row.progress,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[derive(FromRow)]
struct KPIRow {
    id: Uuid,
    project_id: Uuid,
    kpi_key: String,
    name: String,
    description: Option<String>,
    target_value: Option<f64>,
    current_value: Option<f64>,
    unit: Option<String>,
    frequency: Option<String>,
    owner_user_id: Option<Uuid>,
    status: Option<String>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<KPIRow> for KPI {
    fn from(row: KPIRow) -> Self {
        KPI {
            id: row.id,
            project_id: row.project_id,
            kpi_key: row.kpi_key,
            name: row.name,
            description: row.description,
            target_value: row.target_value,
            current_value: row.current_value,
            unit: row.unit,
            frequency: row.frequency.and_then(|f| parse_kpi_frequency(&f)),
            owner_user_id: row.owner_user_id,
            status: row.status.and_then(|s| parse_kpi_status(&s)),
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[derive(FromRow)]
struct BugRow {
    id: Uuid,
    project_id: Uuid,
    bug_key: String,
    title: String,
    description: Option<String>,
    severity: Option<String>,
    status: Option<String>,
    reported_by_user_id: Option<Uuid>,
    assigned_to_user_id: Option<Uuid>,
    related_feature_id: Option<Uuid>,
    steps_to_reproduce: Option<String>,
    environment: Option<String>,
    resolution: Option<String>,
    resolved_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<BugRow> for Bug {
    fn from(row: BugRow) -> Self {
        Bug {
            id: row.id,
            project_id: row.project_id,
            bug_key: row.bug_key,
            title: row.title,
            description: row.description,
            severity: row.severity.and_then(|s| parse_bug_severity(&s)),
            status: row.status.and_then(|s| parse_bug_status(&s)),
            reported_by_user_id: row.reported_by_user_id,
            assigned_to_user_id: row.assigned_to_user_id,
            related_feature_id: row.related_feature_id,
            steps_to_reproduce: row.steps_to_reproduce,
            environment: row.environment,
            resolution: row.resolution,
            resolved_at: row.resolved_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[derive(FromRow)]
struct RiskRow {
    id: Uuid,
    project_id: Uuid,
    risk_key: String,
    title: String,
    description: Option<String>,
    category: Option<String>,
    probability: Option<String>,
    impact: Option<String>,
    status: Option<String>,
    owner_user_id: Option<Uuid>,
    mitigation_plan: Option<String>,
    contingency_plan: Option<String>,
    due_date: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<RiskRow> for Risk {
    fn from(row: RiskRow) -> Self {
        Risk {
            id: row.id,
            project_id: row.project_id,
            risk_key: row.risk_key,
            title: row.title,
            description: row.description,
            category: row.category.and_then(|c| parse_risk_category(&c)),
            probability: row.probability.and_then(|p| parse_risk_probability(&p)),
            impact: row.impact.and_then(|i| parse_risk_impact(&i)),
            status: row.status.and_then(|s| parse_risk_status(&s)),
            owner_user_id: row.owner_user_id,
            mitigation_plan: row.mitigation_plan,
            contingency_plan: row.contingency_plan,
            due_date: row.due_date,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[derive(FromRow)]
struct SprintRow {
    id: Uuid,
    project_id: Uuid,
    sprint_key: String,
    name: String,
    goal: Option<String>,
    status: Option<String>,
    start_date: Option<DateTime<Utc>>,
    end_date: Option<DateTime<Utc>>,
    velocity: Option<i32>,
    capacity: Option<i32>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<SprintRow> for Sprint {
    fn from(row: SprintRow) -> Self {
        Sprint {
            id: row.id,
            project_id: row.project_id,
            sprint_key: row.sprint_key,
            name: row.name,
            goal: row.goal,
            status: row.status.and_then(|s| parse_sprint_status(&s)),
            start_date: row.start_date,
            end_date: row.end_date,
            velocity: row.velocity,
            capacity: row.capacity,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[derive(FromRow)]
struct SprintItemRow {
    id: Uuid,
    project_id: Uuid,
    sprint_id: Uuid,
    issue_id: Uuid,
    story_points: Option<i32>,
    status: Option<String>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<SprintItemRow> for SprintItem {
    fn from(row: SprintItemRow) -> Self {
        SprintItem {
            id: row.id,
            project_id: row.project_id,
            sprint_id: row.sprint_id,
            issue_id: row.issue_id,
            story_points: row.story_points,
            status: row.status.and_then(|s| parse_sprint_item_status(&s)),
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[derive(FromRow)]
struct ReleaseRow {
    id: Uuid,
    project_id: Uuid,
    release_key: String,
    name: String,
    version: Option<String>,
    description: Option<String>,
    status: Option<String>,
    release_type: Option<String>,
    planned_date: Option<DateTime<Utc>>,
    released_at: Option<DateTime<Utc>>,
    release_notes: Option<String>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<ReleaseRow> for Release {
    fn from(row: ReleaseRow) -> Self {
        Release {
            id: row.id,
            project_id: row.project_id,
            release_key: row.release_key,
            name: row.name,
            version: row.version,
            description: row.description,
            status: row.status.and_then(|s| parse_release_status(&s)),
            release_type: row.release_type.and_then(|t| parse_release_type(&t)),
            planned_date: row.planned_date,
            released_at: row.released_at,
            release_notes: row.release_notes,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[derive(FromRow)]
struct TimeEntryRow {
    id: Uuid,
    project_id: Uuid,
    user_id: Uuid,
    issue_id: Option<Uuid>,
    feature_id: Option<Uuid>,
    description: Option<String>,
    duration_minutes: i32,
    date: DateTime<Utc>,
    billable: Option<bool>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<TimeEntryRow> for TimeEntry {
    fn from(row: TimeEntryRow) -> Self {
        TimeEntry {
            id: row.id,
            project_id: row.project_id,
            user_id: row.user_id,
            issue_id: row.issue_id,
            feature_id: row.feature_id,
            description: row.description,
            duration_minutes: row.duration_minutes,
            date: row.date,
            billable: row.billable,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

#[derive(FromRow)]
struct UserFeedbackRow {
    id: Uuid,
    project_id: Uuid,
    feedback_key: String,
    title: String,
    description: Option<String>,
    source: Option<String>,
    sentiment: Option<String>,
    category: Option<String>,
    status: Option<String>,
    priority: Option<String>,
    customer_name: Option<String>,
    customer_email: Option<String>,
    related_feature_id: Option<Uuid>,
    related_issue_id: Option<Uuid>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<UserFeedbackRow> for UserFeedback {
    fn from(row: UserFeedbackRow) -> Self {
        UserFeedback {
            id: row.id,
            project_id: row.project_id,
            feedback_key: row.feedback_key,
            title: row.title,
            description: row.description,
            source: row.source.and_then(|s| parse_feedback_source(&s)),
            sentiment: row.sentiment.and_then(|s| parse_feedback_sentiment(&s)),
            category: row.category.and_then(|c| parse_feedback_category(&c)),
            status: row.status.and_then(|s| parse_feedback_status(&s)),
            priority: row.priority.and_then(|p| parse_feedback_priority(&p)),
            customer_name: row.customer_name,
            customer_email: row.customer_email,
            related_feature_id: row.related_feature_id,
            related_issue_id: row.related_issue_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

// ============================================
// Enum Parsing Helpers
// ============================================

fn parse_feature_status(s: &str) -> Option<FeatureStatus> {
    match s {
        "backlog" => Some(FeatureStatus::Backlog),
        "in_progress" => Some(FeatureStatus::InProgress),
        "done" => Some(FeatureStatus::Done),
        "blocked" => Some(FeatureStatus::Blocked),
        _ => None,
    }
}

fn parse_feature_priority(s: &str) -> Option<FeaturePriority> {
    match s {
        "low" => Some(FeaturePriority::Low),
        "medium" => Some(FeaturePriority::Medium),
        "high" => Some(FeaturePriority::High),
        "critical" => Some(FeaturePriority::Critical),
        _ => None,
    }
}

fn parse_kpi_status(s: &str) -> Option<KPIStatus> {
    match s {
        "on_track" => Some(KPIStatus::OnTrack),
        "at_risk" => Some(KPIStatus::AtRisk),
        "off_track" => Some(KPIStatus::OffTrack),
        "achieved" => Some(KPIStatus::Achieved),
        _ => None,
    }
}

fn parse_kpi_frequency(s: &str) -> Option<KPIFrequency> {
    match s {
        "daily" => Some(KPIFrequency::Daily),
        "weekly" => Some(KPIFrequency::Weekly),
        "monthly" => Some(KPIFrequency::Monthly),
        "quarterly" => Some(KPIFrequency::Quarterly),
        "yearly" => Some(KPIFrequency::Yearly),
        _ => None,
    }
}

fn parse_bug_severity(s: &str) -> Option<BugSeverity> {
    match s {
        "low" => Some(BugSeverity::Low),
        "medium" => Some(BugSeverity::Medium),
        "high" => Some(BugSeverity::High),
        "critical" => Some(BugSeverity::Critical),
        _ => None,
    }
}

fn parse_bug_status(s: &str) -> Option<BugStatus> {
    match s {
        "open" => Some(BugStatus::Open),
        "in_progress" => Some(BugStatus::InProgress),
        "resolved" => Some(BugStatus::Resolved),
        "closed" => Some(BugStatus::Closed),
        "wont_fix" => Some(BugStatus::WontFix),
        _ => None,
    }
}

fn parse_risk_category(s: &str) -> Option<RiskCategory> {
    match s {
        "technical" => Some(RiskCategory::Technical),
        "resource" => Some(RiskCategory::Resource),
        "schedule" => Some(RiskCategory::Schedule),
        "budget" => Some(RiskCategory::Budget),
        "scope" => Some(RiskCategory::Scope),
        "external" => Some(RiskCategory::External),
        "other" => Some(RiskCategory::Other),
        _ => None,
    }
}

fn parse_risk_probability(s: &str) -> Option<RiskProbability> {
    match s {
        "low" => Some(RiskProbability::Low),
        "medium" => Some(RiskProbability::Medium),
        "high" => Some(RiskProbability::High),
        _ => None,
    }
}

fn parse_risk_impact(s: &str) -> Option<RiskImpact> {
    match s {
        "low" => Some(RiskImpact::Low),
        "medium" => Some(RiskImpact::Medium),
        "high" => Some(RiskImpact::High),
        "critical" => Some(RiskImpact::Critical),
        _ => None,
    }
}

fn parse_risk_status(s: &str) -> Option<RiskStatus> {
    match s {
        "identified" => Some(RiskStatus::Identified),
        "analyzing" => Some(RiskStatus::Analyzing),
        "mitigating" => Some(RiskStatus::Mitigating),
        "monitoring" => Some(RiskStatus::Monitoring),
        "closed" => Some(RiskStatus::Closed),
        _ => None,
    }
}

fn parse_sprint_status(s: &str) -> Option<SprintStatus> {
    match s {
        "planned" => Some(SprintStatus::Planned),
        "active" => Some(SprintStatus::Active),
        "completed" => Some(SprintStatus::Completed),
        "cancelled" => Some(SprintStatus::Cancelled),
        _ => None,
    }
}

fn parse_sprint_item_status(s: &str) -> Option<SprintItemStatus> {
    match s {
        "todo" => Some(SprintItemStatus::Todo),
        "in_progress" => Some(SprintItemStatus::InProgress),
        "done" => Some(SprintItemStatus::Done),
        "blocked" => Some(SprintItemStatus::Blocked),
        _ => None,
    }
}

fn parse_release_status(s: &str) -> Option<ReleaseStatus> {
    match s {
        "planning" => Some(ReleaseStatus::Planning),
        "in_progress" => Some(ReleaseStatus::InProgress),
        "released" => Some(ReleaseStatus::Released),
        "cancelled" => Some(ReleaseStatus::Cancelled),
        _ => None,
    }
}

fn parse_release_type(s: &str) -> Option<ReleaseType> {
    match s {
        "major" => Some(ReleaseType::Major),
        "minor" => Some(ReleaseType::Minor),
        "patch" => Some(ReleaseType::Patch),
        "hotfix" => Some(ReleaseType::Hotfix),
        _ => None,
    }
}

fn parse_feedback_source(s: &str) -> Option<FeedbackSource> {
    match s {
        "email" => Some(FeedbackSource::Email),
        "chat" => Some(FeedbackSource::Chat),
        "survey" => Some(FeedbackSource::Survey),
        "support_ticket" => Some(FeedbackSource::SupportTicket),
        "social_media" => Some(FeedbackSource::SocialMedia),
        "in_app" => Some(FeedbackSource::InApp),
        "other" => Some(FeedbackSource::Other),
        _ => None,
    }
}

fn parse_feedback_sentiment(s: &str) -> Option<FeedbackSentiment> {
    match s {
        "positive" => Some(FeedbackSentiment::Positive),
        "neutral" => Some(FeedbackSentiment::Neutral),
        "negative" => Some(FeedbackSentiment::Negative),
        _ => None,
    }
}

fn parse_feedback_category(s: &str) -> Option<FeedbackCategory> {
    match s {
        "feature_request" => Some(FeedbackCategory::FeatureRequest),
        "bug_report" => Some(FeedbackCategory::BugReport),
        "usability" => Some(FeedbackCategory::Usability),
        "performance" => Some(FeedbackCategory::Performance),
        "documentation" => Some(FeedbackCategory::Documentation),
        "pricing" => Some(FeedbackCategory::Pricing),
        "other" => Some(FeedbackCategory::Other),
        _ => None,
    }
}

fn parse_feedback_status(s: &str) -> Option<FeedbackStatus> {
    match s {
        "new" => Some(FeedbackStatus::New),
        "under_review" => Some(FeedbackStatus::UnderReview),
        "planned" => Some(FeedbackStatus::Planned),
        "in_progress" => Some(FeedbackStatus::InProgress),
        "implemented" => Some(FeedbackStatus::Implemented),
        "declined" => Some(FeedbackStatus::Declined),
        _ => None,
    }
}

fn parse_feedback_priority(s: &str) -> Option<FeedbackPriority> {
    match s {
        "low" => Some(FeedbackPriority::Low),
        "medium" => Some(FeedbackPriority::Medium),
        "high" => Some(FeedbackPriority::High),
        "critical" => Some(FeedbackPriority::Critical),
        _ => None,
    }
}

// ============================================
// Enum to String Helpers (for INSERT/UPDATE)
// ============================================

fn feature_status_to_string(s: &FeatureStatus) -> String {
    match s {
        FeatureStatus::Backlog => "backlog".to_string(),
        FeatureStatus::InProgress => "in_progress".to_string(),
        FeatureStatus::Done => "done".to_string(),
        FeatureStatus::Blocked => "blocked".to_string(),
    }
}

fn feature_priority_to_string(p: &FeaturePriority) -> String {
    match p {
        FeaturePriority::Low => "low".to_string(),
        FeaturePriority::Medium => "medium".to_string(),
        FeaturePriority::High => "high".to_string(),
        FeaturePriority::Critical => "critical".to_string(),
    }
}

fn kpi_status_to_string(s: &KPIStatus) -> String {
    match s {
        KPIStatus::OnTrack => "on_track".to_string(),
        KPIStatus::AtRisk => "at_risk".to_string(),
        KPIStatus::OffTrack => "off_track".to_string(),
        KPIStatus::Achieved => "achieved".to_string(),
    }
}

fn kpi_frequency_to_string(f: &KPIFrequency) -> String {
    match f {
        KPIFrequency::Daily => "daily".to_string(),
        KPIFrequency::Weekly => "weekly".to_string(),
        KPIFrequency::Monthly => "monthly".to_string(),
        KPIFrequency::Quarterly => "quarterly".to_string(),
        KPIFrequency::Yearly => "yearly".to_string(),
    }
}

fn bug_severity_to_string(s: &BugSeverity) -> String {
    match s {
        BugSeverity::Low => "low".to_string(),
        BugSeverity::Medium => "medium".to_string(),
        BugSeverity::High => "high".to_string(),
        BugSeverity::Critical => "critical".to_string(),
    }
}

fn bug_status_to_string(s: &BugStatus) -> String {
    match s {
        BugStatus::Open => "open".to_string(),
        BugStatus::InProgress => "in_progress".to_string(),
        BugStatus::Resolved => "resolved".to_string(),
        BugStatus::Closed => "closed".to_string(),
        BugStatus::WontFix => "wont_fix".to_string(),
    }
}

fn risk_category_to_string(c: &RiskCategory) -> String {
    match c {
        RiskCategory::Technical => "technical".to_string(),
        RiskCategory::Resource => "resource".to_string(),
        RiskCategory::Schedule => "schedule".to_string(),
        RiskCategory::Budget => "budget".to_string(),
        RiskCategory::Scope => "scope".to_string(),
        RiskCategory::External => "external".to_string(),
        RiskCategory::Other => "other".to_string(),
    }
}

fn risk_probability_to_string(p: &RiskProbability) -> String {
    match p {
        RiskProbability::Low => "low".to_string(),
        RiskProbability::Medium => "medium".to_string(),
        RiskProbability::High => "high".to_string(),
    }
}

fn risk_impact_to_string(i: &RiskImpact) -> String {
    match i {
        RiskImpact::Low => "low".to_string(),
        RiskImpact::Medium => "medium".to_string(),
        RiskImpact::High => "high".to_string(),
        RiskImpact::Critical => "critical".to_string(),
    }
}

fn risk_status_to_string(s: &RiskStatus) -> String {
    match s {
        RiskStatus::Identified => "identified".to_string(),
        RiskStatus::Analyzing => "analyzing".to_string(),
        RiskStatus::Mitigating => "mitigating".to_string(),
        RiskStatus::Monitoring => "monitoring".to_string(),
        RiskStatus::Closed => "closed".to_string(),
    }
}

fn sprint_status_to_string(s: &SprintStatus) -> String {
    match s {
        SprintStatus::Planned => "planned".to_string(),
        SprintStatus::Active => "active".to_string(),
        SprintStatus::Completed => "completed".to_string(),
        SprintStatus::Cancelled => "cancelled".to_string(),
    }
}

fn sprint_item_status_to_string(s: &SprintItemStatus) -> String {
    match s {
        SprintItemStatus::Todo => "todo".to_string(),
        SprintItemStatus::InProgress => "in_progress".to_string(),
        SprintItemStatus::Done => "done".to_string(),
        SprintItemStatus::Blocked => "blocked".to_string(),
    }
}

fn release_status_to_string(s: &ReleaseStatus) -> String {
    match s {
        ReleaseStatus::Planning => "planning".to_string(),
        ReleaseStatus::InProgress => "in_progress".to_string(),
        ReleaseStatus::Released => "released".to_string(),
        ReleaseStatus::Cancelled => "cancelled".to_string(),
    }
}

fn release_type_to_string(t: &ReleaseType) -> String {
    match t {
        ReleaseType::Major => "major".to_string(),
        ReleaseType::Minor => "minor".to_string(),
        ReleaseType::Patch => "patch".to_string(),
        ReleaseType::Hotfix => "hotfix".to_string(),
    }
}

fn feedback_source_to_string(s: &FeedbackSource) -> String {
    match s {
        FeedbackSource::Email => "email".to_string(),
        FeedbackSource::Chat => "chat".to_string(),
        FeedbackSource::Survey => "survey".to_string(),
        FeedbackSource::SupportTicket => "support_ticket".to_string(),
        FeedbackSource::SocialMedia => "social_media".to_string(),
        FeedbackSource::InApp => "in_app".to_string(),
        FeedbackSource::Other => "other".to_string(),
    }
}

fn feedback_sentiment_to_string(s: &FeedbackSentiment) -> String {
    match s {
        FeedbackSentiment::Positive => "positive".to_string(),
        FeedbackSentiment::Neutral => "neutral".to_string(),
        FeedbackSentiment::Negative => "negative".to_string(),
    }
}

fn feedback_category_to_string(c: &FeedbackCategory) -> String {
    match c {
        FeedbackCategory::FeatureRequest => "feature_request".to_string(),
        FeedbackCategory::BugReport => "bug_report".to_string(),
        FeedbackCategory::Usability => "usability".to_string(),
        FeedbackCategory::Performance => "performance".to_string(),
        FeedbackCategory::Documentation => "documentation".to_string(),
        FeedbackCategory::Pricing => "pricing".to_string(),
        FeedbackCategory::Other => "other".to_string(),
    }
}

fn feedback_status_to_string(s: &FeedbackStatus) -> String {
    match s {
        FeedbackStatus::New => "new".to_string(),
        FeedbackStatus::UnderReview => "under_review".to_string(),
        FeedbackStatus::Planned => "planned".to_string(),
        FeedbackStatus::InProgress => "in_progress".to_string(),
        FeedbackStatus::Implemented => "implemented".to_string(),
        FeedbackStatus::Declined => "declined".to_string(),
    }
}

fn feedback_priority_to_string(p: &FeedbackPriority) -> String {
    match p {
        FeedbackPriority::Low => "low".to_string(),
        FeedbackPriority::Medium => "medium".to_string(),
        FeedbackPriority::High => "high".to_string(),
        FeedbackPriority::Critical => "critical".to_string(),
    }
}

// ============================================
// Features Repository
// ============================================

pub struct FeaturesRepository;

impl FeaturesRepository {
    pub async fn list_by_project(
        pool: &PgPool,
        project_id: Uuid,
    ) -> Result<Vec<Feature>, sqlx::Error> {
        let rows = sqlx::query_as::<_, FeatureRow>(
            r#"
            SELECT 
                id, project_id, feature_key, title, description,
                status, priority, owner_user_id, start_date, target_date,
                completed_at, progress, created_at, updated_at
            FROM features
            WHERE project_id = $1
            ORDER BY created_at DESC
            "#,
        )
        .bind(project_id)
        .fetch_all(pool)
        .await?;

        Ok(rows.into_iter().map(Feature::from).collect())
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Feature>, sqlx::Error> {
        let row = sqlx::query_as::<_, FeatureRow>(
            r#"
            SELECT 
                id, project_id, feature_key, title, description,
                status, priority, owner_user_id, start_date, target_date,
                completed_at, progress, created_at, updated_at
            FROM features
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(Feature::from))
    }

    pub async fn create(
        pool: &PgPool,
        project_id: Uuid,
        req: CreateFeatureRequest,
    ) -> Result<MutationResponse<Feature>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let feature_key = format!("FT-{}", Uuid::new_v4().to_string()[..8].to_uppercase());

        let row = sqlx::query_as::<_, FeatureRow>(
            r#"
            INSERT INTO features (project_id, feature_key, title, description, status, priority, 
                                  owner_user_id, start_date, target_date, progress)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING
                id, project_id, feature_key, title, description,
                status, priority, owner_user_id, start_date, target_date,
                completed_at, progress, created_at, updated_at
            "#,
        )
        .bind(project_id)
        .bind(&feature_key)
        .bind(&req.title)
        .bind(&req.description)
        .bind(req.status.as_ref().map(feature_status_to_string))
        .bind(req.priority.as_ref().map(feature_priority_to_string))
        .bind(req.owner_user_id)
        .bind(req.start_date)
        .bind(req.target_date)
        .bind(req.progress)
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: Feature::from(row), txid })
    }

    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        req: UpdateFeatureRequest,
    ) -> Result<MutationResponse<Feature>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let row = sqlx::query_as::<_, FeatureRow>(
            r#"
            UPDATE features SET
                title = COALESCE($2, title),
                description = COALESCE($3, description),
                status = COALESCE($4, status),
                priority = COALESCE($5, priority),
                owner_user_id = COALESCE($6, owner_user_id),
                start_date = COALESCE($7, start_date),
                target_date = COALESCE($8, target_date),
                completed_at = COALESCE($9, completed_at),
                progress = COALESCE($10, progress),
                updated_at = now()
            WHERE id = $1
            RETURNING
                id, project_id, feature_key, title, description,
                status, priority, owner_user_id, start_date, target_date,
                completed_at, progress, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(&req.title)
        .bind(&req.description)
        .bind(req.status.as_ref().map(feature_status_to_string))
        .bind(req.priority.as_ref().map(feature_priority_to_string))
        .bind(req.owner_user_id)
        .bind(req.start_date)
        .bind(req.target_date)
        .bind(req.completed_at)
        .bind(req.progress)
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: Feature::from(row), txid })
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<i64, sqlx::Error> {
        let mut tx = pool.begin().await?;

        sqlx::query("DELETE FROM features WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(txid)
    }

    pub async fn count_by_project(pool: &PgPool, project_id: Uuid) -> Result<i64, sqlx::Error> {
        let row: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM features WHERE project_id = $1",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;
        Ok(row.0)
    }
}

// ============================================
// KPIs Repository
// ============================================

pub struct KPIsRepository;

impl KPIsRepository {
    pub async fn list_by_project(pool: &PgPool, project_id: Uuid) -> Result<Vec<KPI>, sqlx::Error> {
        let rows = sqlx::query_as::<_, KPIRow>(
            r#"
            SELECT 
                id, project_id, kpi_key, name, description,
                target_value, current_value, unit, frequency,
                owner_user_id, status, created_at, updated_at
            FROM kpis
            WHERE project_id = $1
            ORDER BY created_at DESC
            "#,
        )
        .bind(project_id)
        .fetch_all(pool)
        .await?;

        Ok(rows.into_iter().map(KPI::from).collect())
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<KPI>, sqlx::Error> {
        let row = sqlx::query_as::<_, KPIRow>(
            r#"
            SELECT 
                id, project_id, kpi_key, name, description,
                target_value, current_value, unit, frequency,
                owner_user_id, status, created_at, updated_at
            FROM kpis
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(KPI::from))
    }

    pub async fn create(
        pool: &PgPool,
        project_id: Uuid,
        req: CreateKPIRequest,
    ) -> Result<MutationResponse<KPI>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let kpi_key = format!("KPI-{}", Uuid::new_v4().to_string()[..8].to_uppercase());

        let row = sqlx::query_as::<_, KPIRow>(
            r#"
            INSERT INTO kpis (project_id, kpi_key, name, description, target_value, current_value,
                              unit, frequency, owner_user_id, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING
                id, project_id, kpi_key, name, description,
                target_value, current_value, unit, frequency,
                owner_user_id, status, created_at, updated_at
            "#,
        )
        .bind(project_id)
        .bind(&kpi_key)
        .bind(&req.name)
        .bind(&req.description)
        .bind(req.target_value)
        .bind(req.current_value)
        .bind(&req.unit)
        .bind(req.frequency.as_ref().map(kpi_frequency_to_string))
        .bind(req.owner_user_id)
        .bind(req.status.as_ref().map(kpi_status_to_string))
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: KPI::from(row), txid })
    }

    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        req: UpdateKPIRequest,
    ) -> Result<MutationResponse<KPI>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let row = sqlx::query_as::<_, KPIRow>(
            r#"
            UPDATE kpis SET
                name = COALESCE($2, name),
                description = COALESCE($3, description),
                target_value = COALESCE($4, target_value),
                current_value = COALESCE($5, current_value),
                unit = COALESCE($6, unit),
                frequency = COALESCE($7, frequency),
                owner_user_id = COALESCE($8, owner_user_id),
                status = COALESCE($9, status),
                updated_at = now()
            WHERE id = $1
            RETURNING
                id, project_id, kpi_key, name, description,
                target_value, current_value, unit, frequency,
                owner_user_id, status, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(&req.name)
        .bind(&req.description)
        .bind(req.target_value)
        .bind(req.current_value)
        .bind(&req.unit)
        .bind(req.frequency.as_ref().map(kpi_frequency_to_string))
        .bind(req.owner_user_id)
        .bind(req.status.as_ref().map(kpi_status_to_string))
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: KPI::from(row), txid })
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<i64, sqlx::Error> {
        let mut tx = pool.begin().await?;

        sqlx::query("DELETE FROM kpis WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(txid)
    }

    pub async fn count_by_project(pool: &PgPool, project_id: Uuid) -> Result<i64, sqlx::Error> {
        let row: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM kpis WHERE project_id = $1",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;
        Ok(row.0)
    }
}

// ============================================
// Bugs Repository
// ============================================

pub struct BugsRepository;

impl BugsRepository {
    pub async fn list_by_project(pool: &PgPool, project_id: Uuid) -> Result<Vec<Bug>, sqlx::Error> {
        let rows = sqlx::query_as::<_, BugRow>(
            r#"
            SELECT 
                id, project_id, bug_key, title, description,
                severity, status, reported_by_user_id, assigned_to_user_id,
                related_feature_id, steps_to_reproduce, environment,
                resolution, resolved_at, created_at, updated_at
            FROM bugs
            WHERE project_id = $1
            ORDER BY created_at DESC
            "#,
        )
        .bind(project_id)
        .fetch_all(pool)
        .await?;

        Ok(rows.into_iter().map(Bug::from).collect())
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Bug>, sqlx::Error> {
        let row = sqlx::query_as::<_, BugRow>(
            r#"
            SELECT 
                id, project_id, bug_key, title, description,
                severity, status, reported_by_user_id, assigned_to_user_id,
                related_feature_id, steps_to_reproduce, environment,
                resolution, resolved_at, created_at, updated_at
            FROM bugs
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(Bug::from))
    }

    pub async fn create(
        pool: &PgPool,
        project_id: Uuid,
        user_id: Uuid,
        req: CreateBugRequest,
    ) -> Result<MutationResponse<Bug>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let bug_key = format!("BUG-{}", Uuid::new_v4().to_string()[..8].to_uppercase());

        let row = sqlx::query_as::<_, BugRow>(
            r#"
            INSERT INTO bugs (project_id, bug_key, title, description, severity, status,
                              reported_by_user_id, assigned_to_user_id, related_feature_id,
                              steps_to_reproduce, environment)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING
                id, project_id, bug_key, title, description,
                severity, status, reported_by_user_id, assigned_to_user_id,
                related_feature_id, steps_to_reproduce, environment,
                resolution, resolved_at, created_at, updated_at
            "#,
        )
        .bind(project_id)
        .bind(&bug_key)
        .bind(&req.title)
        .bind(&req.description)
        .bind(req.severity.as_ref().map(bug_severity_to_string))
        .bind(req.status.as_ref().map(bug_status_to_string))
        .bind(user_id)
        .bind(req.assigned_to_user_id)
        .bind(req.related_feature_id)
        .bind(&req.steps_to_reproduce)
        .bind(&req.environment)
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: Bug::from(row), txid })
    }

    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        req: UpdateBugRequest,
    ) -> Result<MutationResponse<Bug>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let row = sqlx::query_as::<_, BugRow>(
            r#"
            UPDATE bugs SET
                title = COALESCE($2, title),
                description = COALESCE($3, description),
                severity = COALESCE($4, severity),
                status = COALESCE($5, status),
                assigned_to_user_id = COALESCE($6, assigned_to_user_id),
                related_feature_id = COALESCE($7, related_feature_id),
                steps_to_reproduce = COALESCE($8, steps_to_reproduce),
                environment = COALESCE($9, environment),
                resolution = COALESCE($10, resolution),
                resolved_at = COALESCE($11, resolved_at),
                updated_at = now()
            WHERE id = $1
            RETURNING
                id, project_id, bug_key, title, description,
                severity, status, reported_by_user_id, assigned_to_user_id,
                related_feature_id, steps_to_reproduce, environment,
                resolution, resolved_at, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(&req.title)
        .bind(&req.description)
        .bind(req.severity.as_ref().map(bug_severity_to_string))
        .bind(req.status.as_ref().map(bug_status_to_string))
        .bind(req.assigned_to_user_id)
        .bind(req.related_feature_id)
        .bind(&req.steps_to_reproduce)
        .bind(&req.environment)
        .bind(&req.resolution)
        .bind(req.resolved_at)
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: Bug::from(row), txid })
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<i64, sqlx::Error> {
        let mut tx = pool.begin().await?;

        sqlx::query("DELETE FROM bugs WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(txid)
    }

    pub async fn count_by_project(pool: &PgPool, project_id: Uuid) -> Result<i64, sqlx::Error> {
        let row: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM bugs WHERE project_id = $1",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;
        Ok(row.0)
    }
}

// ============================================
// Risks Repository
// ============================================

pub struct RisksRepository;

impl RisksRepository {
    pub async fn list_by_project(
        pool: &PgPool,
        project_id: Uuid,
    ) -> Result<Vec<Risk>, sqlx::Error> {
        let rows = sqlx::query_as::<_, RiskRow>(
            r#"
            SELECT 
                id, project_id, risk_key, title, description,
                category, probability, impact, status, owner_user_id,
                mitigation_plan, contingency_plan, due_date,
                created_at, updated_at
            FROM risks
            WHERE project_id = $1
            ORDER BY created_at DESC
            "#,
        )
        .bind(project_id)
        .fetch_all(pool)
        .await?;

        Ok(rows.into_iter().map(Risk::from).collect())
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Risk>, sqlx::Error> {
        let row = sqlx::query_as::<_, RiskRow>(
            r#"
            SELECT 
                id, project_id, risk_key, title, description,
                category, probability, impact, status, owner_user_id,
                mitigation_plan, contingency_plan, due_date,
                created_at, updated_at
            FROM risks
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(Risk::from))
    }

    pub async fn create(
        pool: &PgPool,
        project_id: Uuid,
        req: CreateRiskRequest,
    ) -> Result<MutationResponse<Risk>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let risk_key = format!("RSK-{}", Uuid::new_v4().to_string()[..8].to_uppercase());

        let row = sqlx::query_as::<_, RiskRow>(
            r#"
            INSERT INTO risks (project_id, risk_key, title, description, category, probability,
                               impact, status, owner_user_id, mitigation_plan, contingency_plan, due_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING
                id, project_id, risk_key, title, description,
                category, probability, impact, status, owner_user_id,
                mitigation_plan, contingency_plan, due_date,
                created_at, updated_at
            "#,
        )
        .bind(project_id)
        .bind(&risk_key)
        .bind(&req.title)
        .bind(&req.description)
        .bind(req.category.as_ref().map(risk_category_to_string))
        .bind(req.probability.as_ref().map(risk_probability_to_string))
        .bind(req.impact.as_ref().map(risk_impact_to_string))
        .bind(req.status.as_ref().map(risk_status_to_string))
        .bind(req.owner_user_id)
        .bind(&req.mitigation_plan)
        .bind(&req.contingency_plan)
        .bind(req.due_date)
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: Risk::from(row), txid })
    }

    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        req: UpdateRiskRequest,
    ) -> Result<MutationResponse<Risk>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let row = sqlx::query_as::<_, RiskRow>(
            r#"
            UPDATE risks SET
                title = COALESCE($2, title),
                description = COALESCE($3, description),
                category = COALESCE($4, category),
                probability = COALESCE($5, probability),
                impact = COALESCE($6, impact),
                status = COALESCE($7, status),
                owner_user_id = COALESCE($8, owner_user_id),
                mitigation_plan = COALESCE($9, mitigation_plan),
                contingency_plan = COALESCE($10, contingency_plan),
                due_date = COALESCE($11, due_date),
                updated_at = now()
            WHERE id = $1
            RETURNING
                id, project_id, risk_key, title, description,
                category, probability, impact, status, owner_user_id,
                mitigation_plan, contingency_plan, due_date,
                created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(&req.title)
        .bind(&req.description)
        .bind(req.category.as_ref().map(risk_category_to_string))
        .bind(req.probability.as_ref().map(risk_probability_to_string))
        .bind(req.impact.as_ref().map(risk_impact_to_string))
        .bind(req.status.as_ref().map(risk_status_to_string))
        .bind(req.owner_user_id)
        .bind(&req.mitigation_plan)
        .bind(&req.contingency_plan)
        .bind(req.due_date)
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: Risk::from(row), txid })
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<i64, sqlx::Error> {
        let mut tx = pool.begin().await?;

        sqlx::query("DELETE FROM risks WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(txid)
    }
}

// ============================================
// Sprints Repository
// ============================================

pub struct SprintsRepository;

impl SprintsRepository {
    pub async fn list_by_project(
        pool: &PgPool,
        project_id: Uuid,
    ) -> Result<Vec<Sprint>, sqlx::Error> {
        let rows = sqlx::query_as::<_, SprintRow>(
            r#"
            SELECT 
                id, project_id, sprint_key, name, goal, status,
                start_date, end_date, velocity, capacity,
                created_at, updated_at
            FROM sprints
            WHERE project_id = $1
            ORDER BY created_at DESC
            "#,
        )
        .bind(project_id)
        .fetch_all(pool)
        .await?;

        Ok(rows.into_iter().map(Sprint::from).collect())
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Sprint>, sqlx::Error> {
        let row = sqlx::query_as::<_, SprintRow>(
            r#"
            SELECT 
                id, project_id, sprint_key, name, goal, status,
                start_date, end_date, velocity, capacity,
                created_at, updated_at
            FROM sprints
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(Sprint::from))
    }

    pub async fn create(
        pool: &PgPool,
        project_id: Uuid,
        req: CreateSprintRequest,
    ) -> Result<MutationResponse<Sprint>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let sprint_key = format!("SPR-{}", Uuid::new_v4().to_string()[..8].to_uppercase());

        let row = sqlx::query_as::<_, SprintRow>(
            r#"
            INSERT INTO sprints (project_id, sprint_key, name, goal, status, start_date, end_date, capacity)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                id, project_id, sprint_key, name, goal, status,
                start_date, end_date, velocity, capacity,
                created_at, updated_at
            "#,
        )
        .bind(project_id)
        .bind(&sprint_key)
        .bind(&req.name)
        .bind(&req.goal)
        .bind(req.status.as_ref().map(sprint_status_to_string))
        .bind(req.start_date)
        .bind(req.end_date)
        .bind(req.capacity)
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: Sprint::from(row), txid })
    }

    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        req: UpdateSprintRequest,
    ) -> Result<MutationResponse<Sprint>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let row = sqlx::query_as::<_, SprintRow>(
            r#"
            UPDATE sprints SET
                name = COALESCE($2, name),
                goal = COALESCE($3, goal),
                status = COALESCE($4, status),
                start_date = COALESCE($5, start_date),
                end_date = COALESCE($6, end_date),
                velocity = COALESCE($7, velocity),
                capacity = COALESCE($8, capacity),
                updated_at = now()
            WHERE id = $1
            RETURNING
                id, project_id, sprint_key, name, goal, status,
                start_date, end_date, velocity, capacity,
                created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(&req.name)
        .bind(&req.goal)
        .bind(req.status.as_ref().map(sprint_status_to_string))
        .bind(req.start_date)
        .bind(req.end_date)
        .bind(req.velocity)
        .bind(req.capacity)
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: Sprint::from(row), txid })
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<i64, sqlx::Error> {
        let mut tx = pool.begin().await?;

        sqlx::query("DELETE FROM sprints WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(txid)
    }
}

// ============================================
// Sprint Items Repository
// ============================================

pub struct SprintItemsRepository;

impl SprintItemsRepository {
    pub async fn list_by_sprint(
        pool: &PgPool,
        sprint_id: Uuid,
    ) -> Result<Vec<SprintItem>, sqlx::Error> {
        let rows = sqlx::query_as::<_, SprintItemRow>(
            r#"
            SELECT 
                id, project_id, sprint_id, issue_id, story_points,
                status, created_at, updated_at
            FROM sprint_items
            WHERE sprint_id = $1
            ORDER BY created_at DESC
            "#,
        )
        .bind(sprint_id)
        .fetch_all(pool)
        .await?;

        Ok(rows.into_iter().map(SprintItem::from).collect())
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<SprintItem>, sqlx::Error> {
        let row = sqlx::query_as::<_, SprintItemRow>(
            r#"
            SELECT 
                id, project_id, sprint_id, issue_id, story_points,
                status, created_at, updated_at
            FROM sprint_items
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(SprintItem::from))
    }

    pub async fn create(
        pool: &PgPool,
        project_id: Uuid,
        req: CreateSprintItemRequest,
    ) -> Result<MutationResponse<SprintItem>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let row = sqlx::query_as::<_, SprintItemRow>(
            r#"
            INSERT INTO sprint_items (project_id, sprint_id, issue_id, story_points, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
                id, project_id, sprint_id, issue_id, story_points,
                status, created_at, updated_at
            "#,
        )
        .bind(project_id)
        .bind(req.sprint_id)
        .bind(req.issue_id)
        .bind(req.story_points)
        .bind(req.status.as_ref().map(sprint_item_status_to_string))
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: SprintItem::from(row), txid })
    }

    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        req: UpdateSprintItemRequest,
    ) -> Result<MutationResponse<SprintItem>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let row = sqlx::query_as::<_, SprintItemRow>(
            r#"
            UPDATE sprint_items SET
                sprint_id = COALESCE($2, sprint_id),
                story_points = COALESCE($3, story_points),
                status = COALESCE($4, status),
                updated_at = now()
            WHERE id = $1
            RETURNING
                id, project_id, sprint_id, issue_id, story_points,
                status, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(req.sprint_id)
        .bind(req.story_points)
        .bind(req.status.as_ref().map(sprint_item_status_to_string))
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: SprintItem::from(row), txid })
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<i64, sqlx::Error> {
        let mut tx = pool.begin().await?;

        sqlx::query("DELETE FROM sprint_items WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(txid)
    }
}

// ============================================
// Releases Repository
// ============================================

pub struct ReleasesRepository;

impl ReleasesRepository {
    pub async fn list_by_project(
        pool: &PgPool,
        project_id: Uuid,
    ) -> Result<Vec<Release>, sqlx::Error> {
        let rows = sqlx::query_as::<_, ReleaseRow>(
            r#"
            SELECT 
                id, project_id, release_key, name, version, description,
                status, release_type, planned_date, released_at,
                release_notes, created_at, updated_at
            FROM releases
            WHERE project_id = $1
            ORDER BY created_at DESC
            "#,
        )
        .bind(project_id)
        .fetch_all(pool)
        .await?;

        Ok(rows.into_iter().map(Release::from).collect())
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Release>, sqlx::Error> {
        let row = sqlx::query_as::<_, ReleaseRow>(
            r#"
            SELECT 
                id, project_id, release_key, name, version, description,
                status, release_type, planned_date, released_at,
                release_notes, created_at, updated_at
            FROM releases
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(Release::from))
    }

    pub async fn create(
        pool: &PgPool,
        project_id: Uuid,
        req: CreateReleaseRequest,
    ) -> Result<MutationResponse<Release>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let release_key = format!("REL-{}", Uuid::new_v4().to_string()[..8].to_uppercase());

        let row = sqlx::query_as::<_, ReleaseRow>(
            r#"
            INSERT INTO releases (project_id, release_key, name, version, description, status,
                                  release_type, planned_date, release_notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING
                id, project_id, release_key, name, version, description,
                status, release_type, planned_date, released_at,
                release_notes, created_at, updated_at
            "#,
        )
        .bind(project_id)
        .bind(&release_key)
        .bind(&req.name)
        .bind(&req.version)
        .bind(&req.description)
        .bind(req.status.as_ref().map(release_status_to_string))
        .bind(req.release_type.as_ref().map(release_type_to_string))
        .bind(req.planned_date)
        .bind(&req.release_notes)
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: Release::from(row), txid })
    }

    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        req: UpdateReleaseRequest,
    ) -> Result<MutationResponse<Release>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let row = sqlx::query_as::<_, ReleaseRow>(
            r#"
            UPDATE releases SET
                name = COALESCE($2, name),
                version = COALESCE($3, version),
                description = COALESCE($4, description),
                status = COALESCE($5, status),
                release_type = COALESCE($6, release_type),
                planned_date = COALESCE($7, planned_date),
                released_at = COALESCE($8, released_at),
                release_notes = COALESCE($9, release_notes),
                updated_at = now()
            WHERE id = $1
            RETURNING
                id, project_id, release_key, name, version, description,
                status, release_type, planned_date, released_at,
                release_notes, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(&req.name)
        .bind(&req.version)
        .bind(&req.description)
        .bind(req.status.as_ref().map(release_status_to_string))
        .bind(req.release_type.as_ref().map(release_type_to_string))
        .bind(req.planned_date)
        .bind(req.released_at)
        .bind(&req.release_notes)
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: Release::from(row), txid })
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<i64, sqlx::Error> {
        let mut tx = pool.begin().await?;

        sqlx::query("DELETE FROM releases WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(txid)
    }
}

// ============================================
// Time Entries Repository
// ============================================

pub struct TimeEntriesRepository;

impl TimeEntriesRepository {
    pub async fn list_by_project(
        pool: &PgPool,
        project_id: Uuid,
    ) -> Result<Vec<TimeEntry>, sqlx::Error> {
        let rows = sqlx::query_as::<_, TimeEntryRow>(
            r#"
            SELECT 
                id, project_id, user_id, issue_id, feature_id,
                description, duration_minutes, date, billable,
                created_at, updated_at
            FROM time_entries
            WHERE project_id = $1
            ORDER BY date DESC, created_at DESC
            "#,
        )
        .bind(project_id)
        .fetch_all(pool)
        .await?;

        Ok(rows.into_iter().map(TimeEntry::from).collect())
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<TimeEntry>, sqlx::Error> {
        let row = sqlx::query_as::<_, TimeEntryRow>(
            r#"
            SELECT 
                id, project_id, user_id, issue_id, feature_id,
                description, duration_minutes, date, billable,
                created_at, updated_at
            FROM time_entries
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(TimeEntry::from))
    }

    pub async fn create(
        pool: &PgPool,
        project_id: Uuid,
        user_id: Uuid,
        req: CreateTimeEntryRequest,
    ) -> Result<MutationResponse<TimeEntry>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let row = sqlx::query_as::<_, TimeEntryRow>(
            r#"
            INSERT INTO time_entries (project_id, user_id, issue_id, feature_id, description,
                                      duration_minutes, date, billable)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                id, project_id, user_id, issue_id, feature_id,
                description, duration_minutes, date, billable,
                created_at, updated_at
            "#,
        )
        .bind(project_id)
        .bind(user_id)
        .bind(req.issue_id)
        .bind(req.feature_id)
        .bind(&req.description)
        .bind(req.duration_minutes)
        .bind(req.date)
        .bind(req.billable)
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: TimeEntry::from(row), txid })
    }

    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        req: UpdateTimeEntryRequest,
    ) -> Result<MutationResponse<TimeEntry>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let row = sqlx::query_as::<_, TimeEntryRow>(
            r#"
            UPDATE time_entries SET
                issue_id = COALESCE($2, issue_id),
                feature_id = COALESCE($3, feature_id),
                description = COALESCE($4, description),
                duration_minutes = COALESCE($5, duration_minutes),
                date = COALESCE($6, date),
                billable = COALESCE($7, billable),
                updated_at = now()
            WHERE id = $1
            RETURNING
                id, project_id, user_id, issue_id, feature_id,
                description, duration_minutes, date, billable,
                created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(req.issue_id)
        .bind(req.feature_id)
        .bind(&req.description)
        .bind(req.duration_minutes)
        .bind(req.date)
        .bind(req.billable)
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: TimeEntry::from(row), txid })
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<i64, sqlx::Error> {
        let mut tx = pool.begin().await?;

        sqlx::query("DELETE FROM time_entries WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(txid)
    }
}

// ============================================
// User Feedback Repository
// ============================================

pub struct UserFeedbackRepository;

impl UserFeedbackRepository {
    pub async fn list_by_project(
        pool: &PgPool,
        project_id: Uuid,
    ) -> Result<Vec<UserFeedback>, sqlx::Error> {
        let rows = sqlx::query_as::<_, UserFeedbackRow>(
            r#"
            SELECT 
                id, project_id, feedback_key, title, description,
                source, sentiment, category, status, priority,
                customer_name, customer_email,
                related_feature_id, related_issue_id,
                created_at, updated_at
            FROM user_feedback
            WHERE project_id = $1
            ORDER BY created_at DESC
            "#,
        )
        .bind(project_id)
        .fetch_all(pool)
        .await?;

        Ok(rows.into_iter().map(UserFeedback::from).collect())
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<UserFeedback>, sqlx::Error> {
        let row = sqlx::query_as::<_, UserFeedbackRow>(
            r#"
            SELECT 
                id, project_id, feedback_key, title, description,
                source, sentiment, category, status, priority,
                customer_name, customer_email,
                related_feature_id, related_issue_id,
                created_at, updated_at
            FROM user_feedback
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(UserFeedback::from))
    }

    pub async fn create(
        pool: &PgPool,
        project_id: Uuid,
        req: CreateUserFeedbackRequest,
    ) -> Result<MutationResponse<UserFeedback>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let feedback_key = format!("FB-{}", Uuid::new_v4().to_string()[..8].to_uppercase());

        let row = sqlx::query_as::<_, UserFeedbackRow>(
            r#"
            INSERT INTO user_feedback (project_id, feedback_key, title, description, source,
                                       sentiment, category, status, priority, customer_name,
                                       customer_email, related_feature_id, related_issue_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING
                id, project_id, feedback_key, title, description,
                source, sentiment, category, status, priority,
                customer_name, customer_email,
                related_feature_id, related_issue_id,
                created_at, updated_at
            "#,
        )
        .bind(project_id)
        .bind(&feedback_key)
        .bind(&req.title)
        .bind(&req.description)
        .bind(req.source.as_ref().map(feedback_source_to_string))
        .bind(req.sentiment.as_ref().map(feedback_sentiment_to_string))
        .bind(req.category.as_ref().map(feedback_category_to_string))
        .bind(req.status.as_ref().map(feedback_status_to_string))
        .bind(req.priority.as_ref().map(feedback_priority_to_string))
        .bind(&req.customer_name)
        .bind(&req.customer_email)
        .bind(req.related_feature_id)
        .bind(req.related_issue_id)
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: UserFeedback::from(row), txid })
    }

    pub async fn update(
        pool: &PgPool,
        id: Uuid,
        req: UpdateUserFeedbackRequest,
    ) -> Result<MutationResponse<UserFeedback>, sqlx::Error> {
        let mut tx = pool.begin().await?;

        let row = sqlx::query_as::<_, UserFeedbackRow>(
            r#"
            UPDATE user_feedback SET
                title = COALESCE($2, title),
                description = COALESCE($3, description),
                source = COALESCE($4, source),
                sentiment = COALESCE($5, sentiment),
                category = COALESCE($6, category),
                status = COALESCE($7, status),
                priority = COALESCE($8, priority),
                customer_name = COALESCE($9, customer_name),
                customer_email = COALESCE($10, customer_email),
                related_feature_id = COALESCE($11, related_feature_id),
                related_issue_id = COALESCE($12, related_issue_id),
                updated_at = now()
            WHERE id = $1
            RETURNING
                id, project_id, feedback_key, title, description,
                source, sentiment, category, status, priority,
                customer_name, customer_email,
                related_feature_id, related_issue_id,
                created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(&req.title)
        .bind(&req.description)
        .bind(req.source.as_ref().map(feedback_source_to_string))
        .bind(req.sentiment.as_ref().map(feedback_sentiment_to_string))
        .bind(req.category.as_ref().map(feedback_category_to_string))
        .bind(req.status.as_ref().map(feedback_status_to_string))
        .bind(req.priority.as_ref().map(feedback_priority_to_string))
        .bind(&req.customer_name)
        .bind(&req.customer_email)
        .bind(req.related_feature_id)
        .bind(req.related_issue_id)
        .fetch_one(&mut *tx)
        .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(MutationResponse { data: UserFeedback::from(row), txid })
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<i64, sqlx::Error> {
        let mut tx = pool.begin().await?;

        sqlx::query("DELETE FROM user_feedback WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        let txid = get_txid(&mut *tx).await?;
        tx.commit().await?;

        Ok(txid)
    }
}

// ============================================
// Dashboard Stats Repository (read-only aggregate)
// ============================================

pub struct DashboardRepository;

impl DashboardRepository {
    pub async fn get_stats(pool: &PgPool, project_id: Uuid) -> Result<DashboardStats, sqlx::Error> {
        let features_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM features WHERE project_id = $1",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;

        let kpis_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM kpis WHERE project_id = $1",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;

        let bugs_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM bugs WHERE project_id = $1",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;

        let open_bugs: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM bugs WHERE project_id = $1 AND status != 'resolved'",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;

        let risks_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM risks WHERE project_id = $1",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;

        let open_risks: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM risks WHERE project_id = $1 AND status = 'open'",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;

        let sprints_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM sprints WHERE project_id = $1",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;

        let active_sprint_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM sprints WHERE project_id = $1 AND status = 'active'",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;

        let releases_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM releases WHERE project_id = $1",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;

        let feedback_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM user_feedback WHERE project_id = $1",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;

        let time_entries_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM time_entries WHERE project_id = $1",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;

        let total_time_minutes: (i64,) = sqlx::query_as(
            "SELECT COALESCE(SUM(duration_minutes), 0) FROM time_entries WHERE project_id = $1",
        )
        .bind(project_id)
        .fetch_one(pool)
        .await?;

        Ok(DashboardStats {
            features_count: features_count.0 as i32,
            kpis_count: kpis_count.0 as i32,
            bugs_count: bugs_count.0 as i32,
            open_bugs: open_bugs.0 as i32,
            risks_count: risks_count.0 as i32,
            open_risks: open_risks.0 as i32,
            sprints_count: sprints_count.0 as i32,
            active_sprint: active_sprint_count.0 > 0,
            releases_count: releases_count.0 as i32,
            feedback_count: feedback_count.0 as i32,
            time_entries_count: time_entries_count.0 as i32,
            total_time_minutes: total_time_minutes.0 as i32,
        })
    }
}
