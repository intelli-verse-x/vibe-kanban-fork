import { motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
import type { WorkbookTab } from '@/project-routes/project-search';
import { useProjectRole } from '@/shared/hooks/workbook/useProjectRole';

// Lazy load workbook tab components for better performance
const ProjectWorkbookDashboard = lazy(() =>
  import('@/pages/workbook/tabs/Dashboard').then((m) => ({
    default: m.ProjectWorkbookDashboard,
  }))
);
const ProjectWorkbookFeatures = lazy(() =>
  import('@/pages/workbook/tabs/Features').then((m) => ({
    default: m.ProjectWorkbookFeatures,
  }))
);
const ProjectWorkbookTasks = lazy(() =>
  import('@/pages/workbook/tabs/Tasks').then((m) => ({
    default: m.ProjectWorkbookTasks,
  }))
);
const ProjectWorkbookKPIs = lazy(() =>
  import('@/pages/workbook/tabs/KPIs').then((m) => ({
    default: m.ProjectWorkbookKPIs,
  }))
);
const ProjectWorkbookSprintTracker = lazy(() =>
  import('@/pages/workbook/tabs/SprintTracker').then((m) => ({
    default: m.ProjectWorkbookSprintTracker,
  }))
);
const ProjectWorkbookBugs = lazy(() =>
  import('@/pages/workbook/tabs/Bugs').then((m) => ({
    default: m.ProjectWorkbookBugs,
  }))
);
const ProjectWorkbookMonetization = lazy(() =>
  import('@/pages/workbook/tabs/Monetization').then((m) => ({
    default: m.ProjectWorkbookMonetization,
  }))
);
const ProjectWorkbookABTests = lazy(() =>
  import('@/pages/workbook/tabs/ABTests').then((m) => ({
    default: m.ProjectWorkbookABTests,
  }))
);
const ProjectWorkbookRisks = lazy(() =>
  import('@/pages/workbook/tabs/Risks').then((m) => ({
    default: m.ProjectWorkbookRisks,
  }))
);
const ProjectWorkbookUserFeedback = lazy(() =>
  import('@/pages/workbook/tabs/UserFeedback').then((m) => ({
    default: m.ProjectWorkbookUserFeedback,
  }))
);
const ProjectWorkbookReleases = lazy(() =>
  import('@/pages/workbook/tabs/Releases').then((m) => ({
    default: m.ProjectWorkbookReleases,
  }))
);
const ProjectWorkbookKPIFeatureMatrix = lazy(() =>
  import('@/pages/workbook/tabs/KPIFeatureMatrix').then((m) => ({
    default: m.ProjectWorkbookKPIFeatureMatrix,
  }))
);
const ProjectWorkbookTimeTracking = lazy(() =>
  import('@/pages/workbook/tabs/TimeTracking').then((m) => ({
    default: m.ProjectWorkbookTimeTracking,
  }))
);
const ProjectWorkbookAnalytics = lazy(() =>
  import('@/pages/workbook/tabs/Analytics').then((m) => ({
    default: m.ProjectWorkbookAnalytics,
  }))
);

interface WorkbookContentProps {
  projectId: string;
  activeTab: WorkbookTab;
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-3"
      >
        <motion.div
          className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <span className="text-sm text-low">Loading...</span>
      </motion.div>
    </div>
  );
}

export function WorkbookContent({
  projectId,
  activeTab,
}: WorkbookContentProps) {
  const { data: role } = useProjectRole(projectId);

  return (
    <div className="h-full bg-primary">
      <Suspense fallback={<LoadingFallback />}>
        {activeTab === 'dashboard' && (
          <ProjectWorkbookDashboard projectId={projectId} />
        )}
        {activeTab === 'tasks' && (
          <ProjectWorkbookTasks projectId={projectId} role={role} />
        )}
        {activeTab === 'features' && (
          <ProjectWorkbookFeatures projectId={projectId} />
        )}
        {activeTab === 'kpis' && <ProjectWorkbookKPIs projectId={projectId} />}
        {activeTab === 'sprint-tracker' && (
          <ProjectWorkbookSprintTracker projectId={projectId} />
        )}
        {activeTab === 'bugs' && <ProjectWorkbookBugs projectId={projectId} />}
        {activeTab === 'monetization' && (
          <ProjectWorkbookMonetization projectId={projectId} />
        )}
        {activeTab === 'ab-tests' && (
          <ProjectWorkbookABTests projectId={projectId} />
        )}
        {activeTab === 'risks' && (
          <ProjectWorkbookRisks projectId={projectId} />
        )}
        {activeTab === 'user-feedback' && (
          <ProjectWorkbookUserFeedback projectId={projectId} />
        )}
        {activeTab === 'releases' && (
          <ProjectWorkbookReleases projectId={projectId} />
        )}
        {activeTab === 'kpi-feature-matrix' && (
          <ProjectWorkbookKPIFeatureMatrix projectId={projectId} />
        )}
        {activeTab === 'time-tracking' && (
          <ProjectWorkbookTimeTracking projectId={projectId} />
        )}
        {activeTab === 'analytics' && (
          <ProjectWorkbookAnalytics projectId={projectId} />
        )}
      </Suspense>
    </div>
  );
}
