// Workbook feature types - aligned with backend (crates/api-types/src/workbook.rs)
// These types mirror the Rust types and will eventually be auto-generated

// Re-export only Issue and IssuePriority from shared/remote-types (IssueAssignee is defined locally)
export type { Issue, IssuePriority } from 'shared/remote-types';

// ============================================
// Issue Assignee Type (local definition to avoid conflict)
// ============================================
export interface IssueAssignee {
  id: string;
  issue_id: string;
  user_id: string;
  assigned_at: string;
}

// ============================================
// Extended Issue Types (for workbook features)
// ============================================

// Extended Issue type with workbook-specific fields
// These fields are stored in extension_metadata in the actual Issue type
export interface IssueExtended {
  id: string;
  project_id: string;
  issue_number: number;
  simple_id: string;
  status_id: string;
  title: string;
  description: string | null;
  priority: 'urgent' | 'high' | 'medium' | 'low' | null;
  start_date: string | null;
  target_date: string | null;
  completed_at: string | null;
  sort_order: number;
  parent_issue_id: string | null;
  parent_issue_sort_order: number | null;
  extension_metadata: Record<string, unknown> | null;
  creator_user_id: string | null;
  created_at: string;
  updated_at: string;
  // Workbook-specific extension fields
  due_date?: string | null;
  git_link?: string | null;
  resource_links?: Array<{ url: string; label: string }> | string | null;
  feature_id?: string | null;
}

// Extended update request with workbook fields
export interface UpdateIssueRequestExtended {
  status_id?: string | null;
  title?: string | null;
  description?: string | null;
  priority?: 'urgent' | 'high' | 'medium' | 'low' | null;
  start_date?: string | null;
  target_date?: string | null;
  completed_at?: string | null;
  sort_order?: number | null;
  parent_issue_id?: string | null;
  parent_issue_sort_order?: number | null;
  extension_metadata?: Record<string, unknown> | null;
  // Workbook-specific extension fields
  due_date?: string | null;
  git_link?: string | null;
  resource_links?: Array<{ url: string; label: string }> | string | null;
  feature_id?: string | null;
}

// ============================================
// Dashboard Stats
// ============================================
export interface DashboardStats {
  features_count: number;
  kpis_count: number;
  bugs_count: number;
  open_bugs: number;
  risks_count: number;
  open_risks: number;
  sprints_count: number;
  active_sprint: boolean;
  releases_count: number;
  feedback_count: number;
  time_entries_count: number;
  total_time_minutes: number;
}

// ============================================
// Feature Types (aligned with backend)
// ============================================
export type FeatureStatus = 'backlog' | 'in_progress' | 'done' | 'blocked';
export type FeaturePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Feature {
  id: string;
  project_id: string;
  feature_key: string;
  title: string;
  description?: string | null;
  status?: FeatureStatus | null;
  priority?: FeaturePriority | null;
  owner_user_id?: string | null;
  start_date?: string | null;
  target_date?: string | null;
  completed_at?: string | null;
  progress?: number | null;
  created_at: string;
  updated_at: string;
}
export interface CreateFeatureRequest {
  title: string;
  description?: string;
  status?: FeatureStatus;
  priority?: FeaturePriority;
  owner_user_id?: string;
  start_date?: string;
  target_date?: string;
  progress?: number;
}

export interface UpdateFeatureRequest {
  title?: string;
  description?: string | null;
  status?: FeatureStatus | null;
  priority?: FeaturePriority | null;
  owner_user_id?: string | null;
  start_date?: string | null;
  target_date?: string | null;
  completed_at?: string | null;
  progress?: number | null;
}

export interface ListFeaturesResponse {
  features: Feature[];
  total: number;
}

// ============================================
// Bug Types (aligned with backend)
// ============================================
export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'wont_fix';

export interface Bug {
  id: string;
  project_id: string;
  bug_key: string;
  title: string;
  description?: string | null;
  severity?: BugSeverity | null;
  status?: BugStatus | null;
  reported_by_user_id?: string | null;
  assigned_to_user_id?: string | null;
  related_feature_id?: string | null;
  steps_to_reproduce?: string | null;
  environment?: string | null;
  resolution?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBugRequest {
  title: string;
  description?: string;
  severity?: BugSeverity;
  status?: BugStatus;
  assigned_to_user_id?: string;
  related_feature_id?: string;
  steps_to_reproduce?: string;
  environment?: string;
}

export interface UpdateBugRequest {
  title?: string;
  description?: string | null;
  severity?: BugSeverity | null;
  status?: BugStatus | null;
  assigned_to_user_id?: string | null;
  related_feature_id?: string | null;
  steps_to_reproduce?: string | null;
  environment?: string | null;
  resolution?: string | null;
  resolved_at?: string | null;
}

export interface ListBugsResponse {
  bugs: Bug[];
  total: number;
}

// ============================================
// KPI Types (aligned with backend)
// ============================================
export type KPIStatus = 'on_track' | 'at_risk' | 'off_track' | 'achieved';
export type KPIFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface KPI {
  id: string;
  project_id: string;
  kpi_key: string;
  name: string;
  description?: string | null;
  target_value?: number | null;
  current_value?: number | null;
  unit?: string | null;
  frequency?: KPIFrequency | null;
  owner_user_id?: string | null;
  status?: KPIStatus | null;
  created_at: string;
  updated_at: string;
}

export interface CreateKPIRequest {
  name: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  frequency?: KPIFrequency;
  owner_user_id?: string;
  status?: KPIStatus;
}

export interface UpdateKPIRequest {
  name?: string;
  description?: string | null;
  target_value?: number | null;
  current_value?: number | null;
  unit?: string | null;
  frequency?: KPIFrequency | null;
  owner_user_id?: string | null;
  status?: KPIStatus | null;
}

export interface ListKPIsResponse {
  kpis: KPI[];
  total: number;
}

// ============================================
// Risk Types (aligned with backend)
// ============================================
export type RiskCategory = 'technical' | 'resource' | 'schedule' | 'budget' | 'scope' | 'external' | 'other';
export type RiskProbability = 'low' | 'medium' | 'high';
export type RiskImpact = 'low' | 'medium' | 'high' | 'critical';
export type RiskStatus = 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'closed';

export interface Risk {
  id: string;
  project_id: string;
  risk_key: string;
  title: string;
  description?: string | null;
  category?: RiskCategory | null;
  probability?: RiskProbability | null;
  impact?: RiskImpact | null;
  status?: RiskStatus | null;
  owner_user_id?: string | null;
  mitigation_plan?: string | null;
  contingency_plan?: string | null;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRiskRequest {
  title: string;
  description?: string;
  category?: RiskCategory;
  probability?: RiskProbability;
  impact?: RiskImpact;
  status?: RiskStatus;
  owner_user_id?: string;
  mitigation_plan?: string;
  contingency_plan?: string;
  due_date?: string;
}

export interface UpdateRiskRequest {
  title?: string;
  description?: string | null;
  category?: RiskCategory | null;
  probability?: RiskProbability | null;
  impact?: RiskImpact | null;
  status?: RiskStatus | null;
  owner_user_id?: string | null;
  mitigation_plan?: string | null;
  contingency_plan?: string | null;
  due_date?: string | null;
}

export interface ListRisksResponse {
  risks: Risk[];
  total: number;
}

// ============================================
// Sprint Types (aligned with backend)
// ============================================
export type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled';
export type SprintItemStatus = 'todo' | 'in_progress' | 'done';

export interface Sprint {
  id: string;
  project_id: string;
  sprint_key: string;
  name: string;
  goal?: string | null;
  status?: SprintStatus | null;
  start_date?: string | null;
  end_date?: string | null;
  velocity?: number | null;
  capacity?: number | null;
  created_at: string;
  updated_at: string;
}

export interface SprintItem {
  id: string;
  project_id: string;
  sprint_id?: string | null;
  issue_id?: string | null;
  story_points?: number | null;
  status?: SprintItemStatus | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSprintRequest {
  name: string;
  goal?: string;
  status?: SprintStatus;
  start_date?: string;
  end_date?: string;
  capacity?: number;
}

export interface UpdateSprintRequest {
  name?: string;
  goal?: string | null;
  status?: SprintStatus | null;
  start_date?: string | null;
  end_date?: string | null;
  velocity?: number | null;
  capacity?: number | null;
}

export interface CreateSprintItemRequest {
  sprint_id?: string;
  issue_id?: string;
  story_points?: number;
  status?: SprintItemStatus;
}

export interface UpdateSprintItemRequest {
  sprint_id?: string | null;
  story_points?: number | null;
  status?: SprintItemStatus | null;
}

export interface ListSprintsResponse {
  sprints: Sprint[];
  total: number;
}

export interface ListSprintItemsResponse {
  sprint_items: SprintItem[];
  total: number;
}

// ============================================
// Release Types (aligned with backend)
// ============================================
export type ReleaseStatus = 'planning' | 'in_progress' | 'testing' | 'released' | 'cancelled';
export type ReleaseType = 'major' | 'minor' | 'patch' | 'hotfix';

export interface Release {
  id: string;
  project_id: string;
  release_key: string;
  name: string;
  version?: string | null;
  description?: string | null;
  status?: ReleaseStatus | null;
  release_type?: ReleaseType | null;
  planned_date?: string | null;
  released_at?: string | null;
  release_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReleaseRequest {
  name: string;
  version?: string;
  description?: string;
  status?: ReleaseStatus;
  release_type?: ReleaseType;
  planned_date?: string;
  release_notes?: string;
}

export interface UpdateReleaseRequest {
  name?: string;
  version?: string | null;
  description?: string | null;
  status?: ReleaseStatus | null;
  release_type?: ReleaseType | null;
  planned_date?: string | null;
  released_at?: string | null;
  release_notes?: string | null;
}

export interface ListReleasesResponse {
  releases: Release[];
  total: number;
}

// ============================================
// Time Entry Types (aligned with backend)
// ============================================
export interface TimeEntry {
  id: string;
  project_id: string;
  user_id: string;
  issue_id?: string | null;
  feature_id?: string | null;
  description?: string | null;
  duration_minutes: number;
  date: string;
  billable?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTimeEntryRequest {
  issue_id?: string;
  feature_id?: string;
  description?: string;
  duration_minutes: number;
  date: string;
  billable?: boolean;
}

export interface UpdateTimeEntryRequest {
  issue_id?: string | null;
  feature_id?: string | null;
  description?: string | null;
  duration_minutes?: number;
  date?: string;
  billable?: boolean | null;
}

export interface ListTimeEntriesResponse {
  time_entries: TimeEntry[];
  total: number;
}

// ============================================
// User Feedback Types (aligned with backend)
// ============================================
export type FeedbackSource = 'app_store' | 'play_store' | 'email' | 'support' | 'survey' | 'social' | 'other';
export type FeedbackSentiment = 'positive' | 'neutral' | 'negative';
export type FeedbackCategory = 'feature_request' | 'bug_report' | 'improvement' | 'complaint' | 'praise' | 'other';
export type FeedbackStatus = 'new' | 'reviewing' | 'planned' | 'implemented' | 'declined';
export type FeedbackPriority = 'low' | 'medium' | 'high';

export interface UserFeedback {
  id: string;
  project_id: string;
  feedback_key: string;
  title: string;
  description?: string | null;
  source?: FeedbackSource | null;
  sentiment?: FeedbackSentiment | null;
  category?: FeedbackCategory | null;
  status?: FeedbackStatus | null;
  priority?: FeedbackPriority | null;
  customer_name?: string | null;
  customer_email?: string | null;
  related_feature_id?: string | null;
  related_issue_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserFeedbackRequest {
  title: string;
  description?: string;
  source?: FeedbackSource;
  sentiment?: FeedbackSentiment;
  category?: FeedbackCategory;
  status?: FeedbackStatus;
  priority?: FeedbackPriority;
  customer_name?: string;
  customer_email?: string;
  related_feature_id?: string;
  related_issue_id?: string;
}

export interface UpdateUserFeedbackRequest {
  title?: string;
  description?: string | null;
  source?: FeedbackSource | null;
  sentiment?: FeedbackSentiment | null;
  category?: FeedbackCategory | null;
  status?: FeedbackStatus | null;
  priority?: FeedbackPriority | null;
  customer_name?: string | null;
  customer_email?: string | null;
  related_feature_id?: string | null;
  related_issue_id?: string | null;
}

export interface ListUserFeedbackResponse {
  feedback: UserFeedback[];
  total: number;
}

// ============================================
// Member Types
// ============================================

export interface MemberProfile {
  user_id: string;
  username?: string | null;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
}

export interface OrganizationMemberWithProfile {
  user_id: string;
  role: string;
  joined_at: string;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  profile?: MemberProfile;
}
