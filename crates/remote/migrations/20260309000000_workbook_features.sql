-- Workbook Features Migration
-- Creates tables for: Features, KPIs, Bugs, Risks, Sprints, Releases, 
-- Time Tracking, User Feedback, A/B Tests, Monetization, KPI-Feature Matrix

-- ============================================
-- Features Table
-- ============================================
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'done', 'blocked')),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ,
    target_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, feature_key)
);

CREATE INDEX idx_features_project_id ON features(project_id);
CREATE INDEX idx_features_status ON features(status);

-- ============================================
-- KPIs Table
-- ============================================
CREATE TABLE IF NOT EXISTS kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    kpi_key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    target_value DOUBLE PRECISION,
    current_value DOUBLE PRECISION,
    unit TEXT,
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'off_track', 'achieved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, kpi_key)
);

CREATE INDEX idx_kpis_project_id ON kpis(project_id);

-- ============================================
-- Bugs Table
-- ============================================
CREATE TABLE IF NOT EXISTS bugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    bug_key TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'wont_fix')),
    reported_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    related_feature_id UUID REFERENCES features(id) ON DELETE SET NULL,
    steps_to_reproduce TEXT,
    environment TEXT,
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, bug_key)
);

CREATE INDEX idx_bugs_project_id ON bugs(project_id);
CREATE INDEX idx_bugs_status ON bugs(status);
CREATE INDEX idx_bugs_severity ON bugs(severity);

-- ============================================
-- Risks Table
-- ============================================
CREATE TABLE IF NOT EXISTS risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    risk_key TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('technical', 'resource', 'schedule', 'budget', 'scope', 'external', 'other')),
    probability TEXT CHECK (probability IN ('low', 'medium', 'high')),
    impact TEXT CHECK (impact IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'analyzing', 'mitigating', 'monitoring', 'closed')),
    owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    mitigation_plan TEXT,
    contingency_plan TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, risk_key)
);

CREATE INDEX idx_risks_project_id ON risks(project_id);
CREATE INDEX idx_risks_status ON risks(status);

-- ============================================
-- Sprints Table
-- ============================================
CREATE TABLE IF NOT EXISTS sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sprint_key TEXT NOT NULL,
    name TEXT NOT NULL,
    goal TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    velocity INTEGER,
    capacity INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, sprint_key)
);

CREATE INDEX idx_sprints_project_id ON sprints(project_id);
CREATE INDEX idx_sprints_status ON sprints(status);

-- Sprint Items (tasks/issues in a sprint)
CREATE TABLE IF NOT EXISTS sprint_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    story_points INTEGER,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sprint_items_sprint_id ON sprint_items(sprint_id);
CREATE INDEX idx_sprint_items_project_id ON sprint_items(project_id);

-- ============================================
-- Releases Table
-- ============================================
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    release_key TEXT NOT NULL,
    name TEXT NOT NULL,
    version TEXT,
    description TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'testing', 'released', 'cancelled')),
    release_type TEXT CHECK (release_type IN ('major', 'minor', 'patch', 'hotfix')),
    planned_date TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    release_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, release_key)
);

CREATE INDEX idx_releases_project_id ON releases(project_id);
CREATE INDEX idx_releases_status ON releases(status);

-- Release Items (features/bugs included in a release)
CREATE TABLE IF NOT EXISTS release_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    bug_id UUID REFERENCES bugs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (feature_id IS NOT NULL OR bug_id IS NOT NULL)
);

CREATE INDEX idx_release_items_release_id ON release_items(release_id);

-- ============================================
-- Time Entries Table
-- ============================================
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
    feature_id UUID REFERENCES features(id) ON DELETE SET NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    date DATE NOT NULL,
    billable BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);

-- ============================================
-- User Feedback Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    feedback_key TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    source TEXT CHECK (source IN ('app_store', 'play_store', 'email', 'support', 'survey', 'social', 'other')),
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    category TEXT CHECK (category IN ('feature_request', 'bug_report', 'improvement', 'complaint', 'praise', 'other')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'planned', 'implemented', 'declined')),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    customer_name TEXT,
    customer_email TEXT,
    related_feature_id UUID REFERENCES features(id) ON DELETE SET NULL,
    related_issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, feedback_key)
);

CREATE INDEX idx_user_feedback_project_id ON user_feedback(project_id);
CREATE INDEX idx_user_feedback_status ON user_feedback(status);

-- ============================================
-- A/B Tests Table
-- ============================================
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    test_key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    hypothesis TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    control_name TEXT,
    control_description TEXT,
    variant_name TEXT,
    variant_description TEXT,
    success_metric TEXT,
    target_sample_size INTEGER,
    current_sample_size INTEGER DEFAULT 0,
    control_conversion_rate DOUBLE PRECISION,
    variant_conversion_rate DOUBLE PRECISION,
    winner TEXT CHECK (winner IN ('control', 'variant', 'inconclusive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, test_key)
);

CREATE INDEX idx_ab_tests_project_id ON ab_tests(project_id);
CREATE INDEX idx_ab_tests_status ON ab_tests(status);

-- ============================================
-- Monetization Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS monetization_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    item_key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('subscription', 'one_time', 'consumable', 'ad_revenue', 'other')),
    platform TEXT CHECK (platform IN ('ios', 'android', 'web', 'all')),
    price DOUBLE PRECISION,
    currency TEXT DEFAULT 'USD',
    revenue DOUBLE PRECISION DEFAULT 0,
    units_sold INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
    related_feature_id UUID REFERENCES features(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, item_key)
);

CREATE INDEX idx_monetization_items_project_id ON monetization_items(project_id);

-- ============================================
-- KPI-Feature Matrix Table
-- ============================================
CREATE TABLE IF NOT EXISTS kpi_feature_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    kpi_id UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(kpi_id, feature_id)
);

CREATE INDEX idx_kpi_feature_matrix_project_id ON kpi_feature_matrix(project_id);
CREATE INDEX idx_kpi_feature_matrix_kpi_id ON kpi_feature_matrix(kpi_id);
CREATE INDEX idx_kpi_feature_matrix_feature_id ON kpi_feature_matrix(feature_id);

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all new tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['features', 'kpis', 'bugs', 'risks', 'sprints', 'sprint_items', 
                                   'releases', 'release_items', 'time_entries', 'user_feedback', 
                                   'ab_tests', 'monetization_items', 'kpi_feature_matrix'])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%s_updated_at ON %I;
            CREATE TRIGGER update_%s_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl, tbl, tbl);
    END LOOP;
END $$;

-- ============================================
-- Enable ElectricSQL sync for tables that need real-time updates
-- ============================================
ALTER TABLE features REPLICA IDENTITY FULL;
ALTER TABLE kpis REPLICA IDENTITY FULL;
ALTER TABLE bugs REPLICA IDENTITY FULL;
ALTER TABLE risks REPLICA IDENTITY FULL;
ALTER TABLE sprints REPLICA IDENTITY FULL;
ALTER TABLE sprint_items REPLICA IDENTITY FULL;
ALTER TABLE releases REPLICA IDENTITY FULL;
ALTER TABLE time_entries REPLICA IDENTITY FULL;
ALTER TABLE user_feedback REPLICA IDENTITY FULL;
ALTER TABLE ab_tests REPLICA IDENTITY FULL;
ALTER TABLE monetization_items REPLICA IDENTITY FULL;
ALTER TABLE kpi_feature_matrix REPLICA IDENTITY FULL;

-- Electrify tables for real-time sync
SELECT electric.electrify('features');
SELECT electric.electrify('kpis');
SELECT electric.electrify('bugs');
SELECT electric.electrify('risks');
SELECT electric.electrify('sprints');
SELECT electric.electrify('sprint_items');
SELECT electric.electrify('releases');
SELECT electric.electrify('time_entries');
SELECT electric.electrify('user_feedback');
SELECT electric.electrify('ab_tests');
SELECT electric.electrify('monetization_items');
SELECT electric.electrify('kpi_feature_matrix');
