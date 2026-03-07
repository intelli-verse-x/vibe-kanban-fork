// Local type definitions for workbook features
// These types are used by the workbook tabs until backend types are generated

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
  totalIssues: number;
  openIssues: number;
  closedIssues: number;
  inProgressIssues: number;
  totalFeatures: number;
  totalBugs: number;
  totalKPIs: number;
  issuesByPriority: Record<string, number>;
  issuesByStatus: Record<string, number>;
  // Dashboard-specific stats
  tasks_by_status: {
    todo: number;
    in_progress: number;
    done: number;
  };
  features_by_status: {
    backlog: number;
    in_progress: number;
    done: number;
    blocked: number;
  };
  overdue_tasks: number;
  upcoming_deadlines: number;
  at_risk_features: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

// ============================================
// Bug Types
// ============================================
export interface Bug {
  id: string;
  project_id: string;
  bug_key: string;
  title: string;
  description?: string | null;
  severity?: 'low' | 'medium' | 'high' | 'critical' | null;
  status?: string | null;
  reported_by_user_id?: string | null;
  assigned_to_user_id?: string | null;
  related_feature_id?: string | null;
  steps?: string | null;
  environment?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBugRequest {
  title: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: string;
  assigned_to_user_id?: string;
  related_feature_id?: string;
  steps?: string;
  environment?: string;
}

export interface UpdateBugRequest {
  title?: string;
  description?: string | null;
  severity?: 'low' | 'medium' | 'high' | 'critical' | null;
  status?: string | null;
  assigned_to_user_id?: string | null;
  related_feature_id?: string | null;
  steps?: string | null;
  environment?: string | null;
}

export interface ListBugsResponse {
  bugs: Bug[];
  total: number;
}

// ============================================
// Feature Types
// ============================================
export interface Feature {
  id: string;
  project_id: string;
  feature_key: string;
  title: string;
  description?: string | null;
  status?: string | null;
  // Additional fields used by components
  category?: string | null;
  owner_user_id?: string | null;
  working_status?: string | null;
  risk_level?: 'low' | 'medium' | 'high' | null;
  problem_statement?: string | null;
  business_goal?: string | null;
  notes?: string | null;
  target_release_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFeatureRequest {
  project_id?: string;
  title: string;
  description?: string;
  status?: string;
  category?: string;
}

export interface UpdateFeatureRequest {
  title?: string;
  description?: string | null;
  status?: string | null;
  category?: string | null;
  owner_user_id?: string | null;
  working_status?: string | null;
  risk_level?: 'low' | 'medium' | 'high' | null;
  problem_statement?: string | null;
  business_goal?: string | null;
  notes?: string | null;
  target_release_date?: string | null;
}

export interface ListFeaturesResponse {
  features: Feature[];
  total: number;
}

// ============================================
// KPI Types
// ============================================
export interface KPI {
  id: string;
  project_id: string;
  kpi_key: string;
  name: string;
  description?: string | null;
  target_value?: number | null;
  current_value?: number | null;
  unit?: string | null;
  status?: string | null;
  // Additional fields used by components
  metric?: string | null;
  category?: string | null;
  current?: number | null;
  target?: number | null;
  trend?: 'up' | 'down' | 'stable' | null;
  created_at: string;
  updated_at: string;
}

export interface CreateKPIRequest {
  name: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  status?: string;
  metric?: string;
  category?: string;
  current?: number;
  target?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface UpdateKPIRequest {
  name?: string;
  description?: string | null;
  target_value?: number | null;
  current_value?: number | null;
  unit?: string | null;
  status?: string | null;
  metric?: string | null;
  category?: string | null;
  current?: number | null;
  target?: number | null;
  trend?: 'up' | 'down' | 'stable' | null;
}

export interface ListKPIsResponse {
  kpis: KPI[];
  total: number;
}

// ============================================
// Risk Types
// ============================================
export interface Risk {
  id: string;
  project_id: string;
  risk_key: string;
  title: string;
  description?: string | null;
  probability?: 'low' | 'medium' | 'high' | null;
  impact?: 'low' | 'medium' | 'high' | 'critical' | null;
  status?: string | null;
  mitigation?: string | null;
  owner_user_id?: string | null;
  // Additional fields used by components
  category?: string | null;
  risk_score?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRiskRequest {
  title: string;
  description?: string;
  probability?: 'low' | 'medium' | 'high';
  impact?: 'low' | 'medium' | 'high' | 'critical';
  status?: string;
  mitigation?: string;
  owner_user_id?: string;
  category?: string;
  risk_score?: number;
}

export interface UpdateRiskRequest {
  title?: string;
  description?: string | null;
  probability?: 'low' | 'medium' | 'high' | null;
  impact?: 'low' | 'medium' | 'high' | 'critical' | null;
  status?: string | null;
  mitigation?: string | null;
  owner_user_id?: string | null;
  category?: string | null;
  risk_score?: number | null;
}

export interface ListRisksResponse {
  risks: Risk[];
  total: number;
}

// ============================================
// Sprint Types
// ============================================
export interface SprintItem {
  id: string;
  project_id: string;
  sprint_key: string;
  name: string;
  goal?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: 'planning' | 'active' | 'completed' | string | null;
  // Additional fields used by components
  sprint_no?: number | null;
  task_description?: string | null;
  est_hours?: number | null;
  actual_hours?: number | null;
  qa_status?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSprintItemRequest {
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  status?: 'planning' | 'active' | 'completed' | string;
  sprint_no?: number;
  task_description?: string;
  est_hours?: number;
  actual_hours?: number;
  qa_status?: string;
}

export interface UpdateSprintItemRequest {
  name?: string;
  goal?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: 'planning' | 'active' | 'completed' | string | null;
  sprint_no?: number | null;
  task_description?: string | null;
  est_hours?: number | null;
  actual_hours?: number | null;
  qa_status?: string | null;
}

export interface ListSprintItemsResponse {
  sprints: SprintItem[];
  sprint_items: SprintItem[];
  total: number;
}

// ============================================
// User Feedback Types
// ============================================
export interface UserFeedback {
  id: string;
  project_id: string;
  feedback_key: string;
  title: string;
  description?: string | null;
  type?: 'bug' | 'feature' | 'improvement' | 'other' | null;
  status?: string | null;
  source?: string | null;
  user_email?: string | null;
  // Additional fields used by components
  feedback_date?: string | null;
  channel?: string | null;
  summary?: string | null;
  sentiment?: 'positive' | 'neutral' | 'negative' | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserFeedbackRequest {
  title: string;
  description?: string;
  type?: 'bug' | 'feature' | 'improvement' | 'other';
  status?: string;
  source?: string;
  user_email?: string;
  feedback_date?: string;
  channel?: string;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface UpdateUserFeedbackRequest {
  title?: string;
  description?: string | null;
  type?: 'bug' | 'feature' | 'improvement' | 'other' | null;
  status?: string | null;
  source?: string | null;
  user_email?: string | null;
  feedback_date?: string | null;
  channel?: string | null;
  summary?: string | null;
  sentiment?: 'positive' | 'neutral' | 'negative' | null;
}

export interface ListUserFeedbackResponse {
  feedback: UserFeedback[];
  total: number;
}

// ============================================
// Release Types
// ============================================
export interface Release {
  id: string;
  project_id: string;
  release_key: string;
  name: string;
  version?: string | null;
  description?: string | null;
  release_date?: string | null;
  status?: 'planned' | 'in_progress' | 'released' | null;
  rollout_pct?: number | null;
  major_bugs?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReleaseRequest {
  name: string;
  version?: string;
  description?: string;
  release_date?: string;
  status?: 'planned' | 'in_progress' | 'released';
}

export interface UpdateReleaseRequest {
  name?: string;
  version?: string | null;
  description?: string | null;
  release_date?: string | null;
  status?: 'planned' | 'in_progress' | 'released' | null;
}

export interface ListReleasesResponse {
  releases: Release[];
  total: number;
}

// ============================================
// A/B Test Types
// ============================================
export interface ABTest {
  id: string;
  project_id: string;
  test_key: string;
  name: string;
  experiment_key?: string | null;
  description?: string | null;
  hypothesis?: string | null;
  variant_a?: string | null;
  variant_b?: string | null;
  status?: 'draft' | 'running' | 'completed' | 'paused' | null;
  start_date?: string | null;
  end_date?: string | null;
  metric_measured?: string | null;
  result?: string | null;
  decision?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateABTestRequest {
  name: string;
  description?: string;
  hypothesis?: string;
  variant_a?: string;
  variant_b?: string;
  status?: 'draft' | 'running' | 'completed' | 'paused';
  start_date?: string;
  end_date?: string;
}

export interface UpdateABTestRequest {
  name?: string;
  description?: string | null;
  hypothesis?: string | null;
  variant_a?: string | null;
  variant_b?: string | null;
  status?: 'draft' | 'running' | 'completed' | 'paused' | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface ListABTestsResponse {
  tests: ABTest[];
  ab_tests?: ABTest[];
  total: number;
}

// ============================================
// Monetization Types
// ============================================
export interface MonetizationItem {
  id: string;
  project_id: string;
  item_key: string;
  name: string;
  description?: string | null;
  type?: 'revenue' | 'cost' | 'investment' | null;
  amount?: number | null;
  currency?: string | null;
  recurring?: boolean | null;
  date?: string | null;
  revenue_stream?: string | null;
  monthly_revenue?: number | null;
  conversion_pct?: number | null;
  status?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMonetizationItemRequest {
  name: string;
  description?: string;
  type?: 'revenue' | 'cost' | 'investment';
  amount?: number;
  currency?: string;
  recurring?: boolean;
  date?: string;
}

export interface UpdateMonetizationItemRequest {
  name?: string;
  description?: string | null;
  type?: 'revenue' | 'cost' | 'investment' | null;
  amount?: number | null;
  currency?: string | null;
  recurring?: boolean | null;
  date?: string | null;
}

export interface ListMonetizationItemsResponse {
  items: MonetizationItem[];
  monetization_items?: MonetizationItem[];
  total: number;
}

// ============================================
// KPI Feature Matrix Types
// ============================================
export interface KPIFeatureMatrix {
  id: string;
  project_id: string;
  kpi_id: string;
  feature_id: string;
  feature_name?: string | null;
  impact?: 'low' | 'medium' | 'high' | null;
  notes?: string | null;
  dau_impact_1_5?: number | null;
  retention_impact_1_5?: number | null;
  arpu_impact_1_5?: number | null;
  virality_impact_1_5?: number | null;
  strategic_value_1_5?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateKPIFeatureMatrixRequest {
  kpi_id: string;
  feature_id: string;
  impact?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface UpdateKPIFeatureMatrixRequest {
  impact?: 'low' | 'medium' | 'high' | null;
  notes?: string | null;
}

export interface ListKPIFeatureMatrixResponse {
  matrix: KPIFeatureMatrix[];
  kpi_feature_matrix?: KPIFeatureMatrix[];
  total: number;
}

// ============================================
// Time Entry Types
// ============================================
export interface TimeEntry {
  id: string;
  project_id: string;
  entry_key: string;
  user_id: string;
  issue_id?: string | null;
  feature_id?: string | null;
  description?: string | null;
  duration_minutes: number;
  hours?: number | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTimeEntryRequest {
  issue_id?: string;
  feature_id?: string;
  description?: string;
  duration_minutes: number;
  date: string;
}

export interface UpdateTimeEntryRequest {
  issue_id?: string | null;
  feature_id?: string | null;
  description?: string | null;
  duration_minutes?: number;
  date?: string;
}

export interface ListTimeEntriesResponse {
  entries: TimeEntry[];
  time_entries?: TimeEntry[];
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

export interface IssueAssignee {
  id: string;
  issue_id: string;
  user_id: string;
  assigned_at: string;
}
