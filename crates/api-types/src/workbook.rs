//! Workbook feature types for project management
//!
//! These types support Features, KPIs, Bugs, Risks, Sprints, Releases,
//! Time Tracking, User Feedback, A/B Tests, Monetization, and KPI-Feature Matrix.

use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

// ============================================
// Features
// ============================================

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum FeatureStatus {
    Backlog,
    InProgress,
    Done,
    Blocked,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum FeaturePriority {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Feature {
    pub id: Uuid,
    pub project_id: Uuid,
    pub feature_key: String,
    pub title: String,
    pub description: Option<String>,
    pub status: Option<FeatureStatus>,
    pub priority: Option<FeaturePriority>,
    pub owner_user_id: Option<Uuid>,
    pub start_date: Option<DateTime<Utc>>,
    pub target_date: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub progress: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CreateFeatureRequest {
    pub title: String,
    pub description: Option<String>,
    pub status: Option<FeatureStatus>,
    pub priority: Option<FeaturePriority>,
    pub owner_user_id: Option<Uuid>,
    pub start_date: Option<DateTime<Utc>>,
    pub target_date: Option<DateTime<Utc>>,
    pub progress: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UpdateFeatureRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<FeatureStatus>,
    pub priority: Option<FeaturePriority>,
    pub owner_user_id: Option<Uuid>,
    pub start_date: Option<DateTime<Utc>>,
    pub target_date: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub progress: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ListFeaturesResponse {
    pub features: Vec<Feature>,
    pub total: i64,
}

// ============================================
// KPIs
// ============================================

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum KPIStatus {
    OnTrack,
    AtRisk,
    OffTrack,
    Achieved,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum KPIFrequency {
    Daily,
    Weekly,
    Monthly,
    Quarterly,
    Yearly,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct KPI {
    pub id: Uuid,
    pub project_id: Uuid,
    pub kpi_key: String,
    pub name: String,
    pub description: Option<String>,
    pub target_value: Option<f64>,
    pub current_value: Option<f64>,
    pub unit: Option<String>,
    pub frequency: Option<KPIFrequency>,
    pub owner_user_id: Option<Uuid>,
    pub status: Option<KPIStatus>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CreateKPIRequest {
    pub name: String,
    pub description: Option<String>,
    pub target_value: Option<f64>,
    pub current_value: Option<f64>,
    pub unit: Option<String>,
    pub frequency: Option<KPIFrequency>,
    pub owner_user_id: Option<Uuid>,
    pub status: Option<KPIStatus>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UpdateKPIRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub target_value: Option<f64>,
    pub current_value: Option<f64>,
    pub unit: Option<String>,
    pub frequency: Option<KPIFrequency>,
    pub owner_user_id: Option<Uuid>,
    pub status: Option<KPIStatus>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ListKPIsResponse {
    pub kpis: Vec<KPI>,
    pub total: i64,
}

// ============================================
// Bugs
// ============================================

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum BugSeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum BugStatus {
    Open,
    InProgress,
    Resolved,
    Closed,
    WontFix,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Bug {
    pub id: Uuid,
    pub project_id: Uuid,
    pub bug_key: String,
    pub title: String,
    pub description: Option<String>,
    pub severity: Option<BugSeverity>,
    pub status: Option<BugStatus>,
    pub reported_by_user_id: Option<Uuid>,
    pub assigned_to_user_id: Option<Uuid>,
    pub related_feature_id: Option<Uuid>,
    pub steps_to_reproduce: Option<String>,
    pub environment: Option<String>,
    pub resolution: Option<String>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CreateBugRequest {
    pub title: String,
    pub description: Option<String>,
    pub severity: Option<BugSeverity>,
    pub status: Option<BugStatus>,
    pub assigned_to_user_id: Option<Uuid>,
    pub related_feature_id: Option<Uuid>,
    pub steps_to_reproduce: Option<String>,
    pub environment: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UpdateBugRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub severity: Option<BugSeverity>,
    pub status: Option<BugStatus>,
    pub assigned_to_user_id: Option<Uuid>,
    pub related_feature_id: Option<Uuid>,
    pub steps_to_reproduce: Option<String>,
    pub environment: Option<String>,
    pub resolution: Option<String>,
    pub resolved_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ListBugsResponse {
    pub bugs: Vec<Bug>,
    pub total: i64,
}

// ============================================
// Risks
// ============================================

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum RiskCategory {
    Technical,
    Resource,
    Schedule,
    Budget,
    Scope,
    External,
    Other,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum RiskProbability {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum RiskImpact {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum RiskStatus {
    Identified,
    Analyzing,
    Mitigating,
    Monitoring,
    Closed,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Risk {
    pub id: Uuid,
    pub project_id: Uuid,
    pub risk_key: String,
    pub title: String,
    pub description: Option<String>,
    pub category: Option<RiskCategory>,
    pub probability: Option<RiskProbability>,
    pub impact: Option<RiskImpact>,
    pub status: Option<RiskStatus>,
    pub owner_user_id: Option<Uuid>,
    pub mitigation_plan: Option<String>,
    pub contingency_plan: Option<String>,
    pub due_date: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CreateRiskRequest {
    pub title: String,
    pub description: Option<String>,
    pub category: Option<RiskCategory>,
    pub probability: Option<RiskProbability>,
    pub impact: Option<RiskImpact>,
    pub status: Option<RiskStatus>,
    pub owner_user_id: Option<Uuid>,
    pub mitigation_plan: Option<String>,
    pub contingency_plan: Option<String>,
    pub due_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UpdateRiskRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub category: Option<RiskCategory>,
    pub probability: Option<RiskProbability>,
    pub impact: Option<RiskImpact>,
    pub status: Option<RiskStatus>,
    pub owner_user_id: Option<Uuid>,
    pub mitigation_plan: Option<String>,
    pub contingency_plan: Option<String>,
    pub due_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ListRisksResponse {
    pub risks: Vec<Risk>,
    pub total: i64,
}

// ============================================
// Sprints
// ============================================

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum SprintStatus {
    Planning,
    Active,
    Completed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Sprint {
    pub id: Uuid,
    pub project_id: Uuid,
    pub sprint_key: String,
    pub name: String,
    pub goal: Option<String>,
    pub status: Option<SprintStatus>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub velocity: Option<i32>,
    pub capacity: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum SprintItemStatus {
    Todo,
    InProgress,
    Done,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SprintItem {
    pub id: Uuid,
    pub project_id: Uuid,
    pub sprint_id: Option<Uuid>,
    pub issue_id: Option<Uuid>,
    pub story_points: Option<i32>,
    pub status: Option<SprintItemStatus>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CreateSprintRequest {
    pub name: String,
    pub goal: Option<String>,
    pub status: Option<SprintStatus>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub capacity: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UpdateSprintRequest {
    pub name: Option<String>,
    pub goal: Option<String>,
    pub status: Option<SprintStatus>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub velocity: Option<i32>,
    pub capacity: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CreateSprintItemRequest {
    pub sprint_id: Option<Uuid>,
    pub issue_id: Option<Uuid>,
    pub story_points: Option<i32>,
    pub status: Option<SprintItemStatus>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UpdateSprintItemRequest {
    pub sprint_id: Option<Uuid>,
    pub story_points: Option<i32>,
    pub status: Option<SprintItemStatus>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ListSprintsResponse {
    pub sprints: Vec<Sprint>,
    pub total: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ListSprintItemsResponse {
    pub sprint_items: Vec<SprintItem>,
    pub total: i64,
}

// ============================================
// Releases
// ============================================

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum ReleaseStatus {
    Planning,
    InProgress,
    Testing,
    Released,
    Cancelled,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum ReleaseType {
    Major,
    Minor,
    Patch,
    Hotfix,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Release {
    pub id: Uuid,
    pub project_id: Uuid,
    pub release_key: String,
    pub name: String,
    pub version: Option<String>,
    pub description: Option<String>,
    pub status: Option<ReleaseStatus>,
    pub release_type: Option<ReleaseType>,
    pub planned_date: Option<DateTime<Utc>>,
    pub released_at: Option<DateTime<Utc>>,
    pub release_notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CreateReleaseRequest {
    pub name: String,
    pub version: Option<String>,
    pub description: Option<String>,
    pub status: Option<ReleaseStatus>,
    pub release_type: Option<ReleaseType>,
    pub planned_date: Option<DateTime<Utc>>,
    pub release_notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UpdateReleaseRequest {
    pub name: Option<String>,
    pub version: Option<String>,
    pub description: Option<String>,
    pub status: Option<ReleaseStatus>,
    pub release_type: Option<ReleaseType>,
    pub planned_date: Option<DateTime<Utc>>,
    pub released_at: Option<DateTime<Utc>>,
    pub release_notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ListReleasesResponse {
    pub releases: Vec<Release>,
    pub total: i64,
}

// ============================================
// Time Entries
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct TimeEntry {
    pub id: Uuid,
    pub project_id: Uuid,
    pub user_id: Uuid,
    pub issue_id: Option<Uuid>,
    pub feature_id: Option<Uuid>,
    pub description: Option<String>,
    pub duration_minutes: i32,
    pub date: NaiveDate,
    pub billable: Option<bool>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CreateTimeEntryRequest {
    pub issue_id: Option<Uuid>,
    pub feature_id: Option<Uuid>,
    pub description: Option<String>,
    pub duration_minutes: i32,
    pub date: NaiveDate,
    pub billable: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UpdateTimeEntryRequest {
    pub issue_id: Option<Uuid>,
    pub feature_id: Option<Uuid>,
    pub description: Option<String>,
    pub duration_minutes: Option<i32>,
    pub date: Option<NaiveDate>,
    pub billable: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ListTimeEntriesResponse {
    pub time_entries: Vec<TimeEntry>,
    pub total: i64,
}

// ============================================
// User Feedback
// ============================================

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum FeedbackSource {
    AppStore,
    PlayStore,
    Email,
    Support,
    Survey,
    Social,
    Other,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum FeedbackSentiment {
    Positive,
    Neutral,
    Negative,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum FeedbackCategory {
    FeatureRequest,
    BugReport,
    Improvement,
    Complaint,
    Praise,
    Other,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum FeedbackStatus {
    New,
    Reviewing,
    Planned,
    Implemented,
    Declined,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum FeedbackPriority {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UserFeedback {
    pub id: Uuid,
    pub project_id: Uuid,
    pub feedback_key: String,
    pub title: String,
    pub description: Option<String>,
    pub source: Option<FeedbackSource>,
    pub sentiment: Option<FeedbackSentiment>,
    pub category: Option<FeedbackCategory>,
    pub status: Option<FeedbackStatus>,
    pub priority: Option<FeedbackPriority>,
    pub customer_name: Option<String>,
    pub customer_email: Option<String>,
    pub related_feature_id: Option<Uuid>,
    pub related_issue_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CreateUserFeedbackRequest {
    pub title: String,
    pub description: Option<String>,
    pub source: Option<FeedbackSource>,
    pub sentiment: Option<FeedbackSentiment>,
    pub category: Option<FeedbackCategory>,
    pub status: Option<FeedbackStatus>,
    pub priority: Option<FeedbackPriority>,
    pub customer_name: Option<String>,
    pub customer_email: Option<String>,
    pub related_feature_id: Option<Uuid>,
    pub related_issue_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UpdateUserFeedbackRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub source: Option<FeedbackSource>,
    pub sentiment: Option<FeedbackSentiment>,
    pub category: Option<FeedbackCategory>,
    pub status: Option<FeedbackStatus>,
    pub priority: Option<FeedbackPriority>,
    pub customer_name: Option<String>,
    pub customer_email: Option<String>,
    pub related_feature_id: Option<Uuid>,
    pub related_issue_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ListUserFeedbackResponse {
    pub feedback: Vec<UserFeedback>,
    pub total: i64,
}

// ============================================
// A/B Tests
// ============================================

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum ABTestStatus {
    Draft,
    Running,
    Paused,
    Completed,
    Cancelled,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum ABTestWinner {
    Control,
    Variant,
    Inconclusive,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ABTest {
    pub id: Uuid,
    pub project_id: Uuid,
    pub test_key: String,
    pub name: String,
    pub description: Option<String>,
    pub hypothesis: Option<String>,
    pub status: Option<ABTestStatus>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub control_name: Option<String>,
    pub control_description: Option<String>,
    pub variant_name: Option<String>,
    pub variant_description: Option<String>,
    pub success_metric: Option<String>,
    pub target_sample_size: Option<i32>,
    pub current_sample_size: Option<i32>,
    pub control_conversion_rate: Option<f64>,
    pub variant_conversion_rate: Option<f64>,
    pub winner: Option<ABTestWinner>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CreateABTestRequest {
    pub name: String,
    pub description: Option<String>,
    pub hypothesis: Option<String>,
    pub status: Option<ABTestStatus>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub control_name: Option<String>,
    pub control_description: Option<String>,
    pub variant_name: Option<String>,
    pub variant_description: Option<String>,
    pub success_metric: Option<String>,
    pub target_sample_size: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UpdateABTestRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub hypothesis: Option<String>,
    pub status: Option<ABTestStatus>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub control_name: Option<String>,
    pub control_description: Option<String>,
    pub variant_name: Option<String>,
    pub variant_description: Option<String>,
    pub success_metric: Option<String>,
    pub target_sample_size: Option<i32>,
    pub current_sample_size: Option<i32>,
    pub control_conversion_rate: Option<f64>,
    pub variant_conversion_rate: Option<f64>,
    pub winner: Option<ABTestWinner>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ListABTestsResponse {
    pub ab_tests: Vec<ABTest>,
    pub total: i64,
}

// ============================================
// Monetization
// ============================================

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum MonetizationType {
    Subscription,
    OneTime,
    Consumable,
    AdRevenue,
    Other,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum MonetizationPlatform {
    Ios,
    Android,
    Web,
    All,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum MonetizationStatus {
    Active,
    Inactive,
    Deprecated,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct MonetizationItem {
    pub id: Uuid,
    pub project_id: Uuid,
    pub item_key: String,
    pub name: String,
    pub description: Option<String>,
    #[serde(rename = "type")]
    pub monetization_type: Option<MonetizationType>,
    pub platform: Option<MonetizationPlatform>,
    pub price: Option<f64>,
    pub currency: Option<String>,
    pub revenue: Option<f64>,
    pub units_sold: Option<i32>,
    pub status: Option<MonetizationStatus>,
    pub related_feature_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CreateMonetizationItemRequest {
    pub name: String,
    pub description: Option<String>,
    #[serde(rename = "type")]
    pub monetization_type: Option<MonetizationType>,
    pub platform: Option<MonetizationPlatform>,
    pub price: Option<f64>,
    pub currency: Option<String>,
    pub status: Option<MonetizationStatus>,
    pub related_feature_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UpdateMonetizationItemRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    #[serde(rename = "type")]
    pub monetization_type: Option<MonetizationType>,
    pub platform: Option<MonetizationPlatform>,
    pub price: Option<f64>,
    pub currency: Option<String>,
    pub revenue: Option<f64>,
    pub units_sold: Option<i32>,
    pub status: Option<MonetizationStatus>,
    pub related_feature_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ListMonetizationItemsResponse {
    pub items: Vec<MonetizationItem>,
    pub total: i64,
}

// ============================================
// KPI-Feature Matrix
// ============================================

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "snake_case")]
pub enum ImpactLevel {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct KPIFeatureMatrix {
    pub id: Uuid,
    pub project_id: Uuid,
    pub kpi_id: Uuid,
    pub feature_id: Uuid,
    pub impact_level: Option<ImpactLevel>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CreateKPIFeatureMatrixRequest {
    pub kpi_id: Uuid,
    pub feature_id: Uuid,
    pub impact_level: Option<ImpactLevel>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UpdateKPIFeatureMatrixRequest {
    pub impact_level: Option<ImpactLevel>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ListKPIFeatureMatrixResponse {
    pub matrix: Vec<KPIFeatureMatrix>,
    pub total: i64,
}

// ============================================
// Dashboard Stats
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct DashboardStats {
    pub features_count: i32,
    pub kpis_count: i32,
    pub bugs_count: i32,
    pub open_bugs: i32,
    pub risks_count: i32,
    pub open_risks: i32,
    pub sprints_count: i32,
    pub active_sprint: bool,
    pub releases_count: i32,
    pub feedback_count: i32,
    pub time_entries_count: i32,
    pub total_time_minutes: i32,
}
