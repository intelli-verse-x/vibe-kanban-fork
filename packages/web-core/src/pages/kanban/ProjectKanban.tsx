import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Group, Layout, Panel, Separator } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';
import { OrgProvider } from '@/shared/providers/remote/OrgProvider';
import { useOrgContext } from '@/shared/hooks/useOrgContext';
import { ProjectProvider } from '@/shared/providers/remote/ProjectProvider';
import { useProjectContext } from '@/shared/hooks/useProjectContext';
import { useActions } from '@/shared/hooks/useActions';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { KanbanContainer } from '@/features/kanban/ui/KanbanContainer';
import { useIsMobile } from '@/shared/hooks/useIsMobile';
import { ProjectRightSidebarContainer } from './ProjectRightSidebarContainer';
import { LoginRequiredPrompt } from '@/shared/dialogs/shared/LoginRequiredPrompt';
import { WorkbookTabBar } from '@/shared/components/WorkbookTabBar';
import { WorkbookContent } from './WorkbookContent';
import {
  PERSIST_KEYS,
  usePaneSize,
} from '@/shared/stores/useUiPreferencesStore';
import { useUserOrganizations } from '@/shared/hooks/useUserOrganizations';
import { useOrganizationProjects } from '@/shared/hooks/useOrganizationProjects';
import { useOrganizationStore } from '@/shared/stores/useOrganizationStore';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { useCurrentKanbanRouteState } from '@/shared/hooks/useCurrentKanbanRouteState';
import {
  buildKanbanIssueComposerKey,
  closeKanbanIssueComposer,
} from '@/shared/stores/useKanbanIssueComposerStore';
import type { WorkbookTab } from '@/project-routes/project-search';
/**
 * Component that registers project mutations with ActionsContext.
 * Must be rendered inside both ActionsProvider and ProjectProvider.
 */
function ProjectMutationsRegistration({ children }: { children: ReactNode }) {
  const { registerProjectMutations } = useActions();
  const { removeIssue, insertIssue, getIssue, getAssigneesForIssue, issues } =
    useProjectContext();

  // Use ref to always access latest issues (avoid stale closure)
  const issuesRef = useRef(issues);
  useEffect(() => {
    issuesRef.current = issues;
  }, [issues]);

  useEffect(() => {
    registerProjectMutations({
      removeIssue: (id) => {
        removeIssue(id);
      },
      duplicateIssue: (issueId) => {
        const issue = getIssue(issueId);
        if (!issue) return;

        // Use ref to get current issues (not stale closure)
        const currentIssues = issuesRef.current;
        const statusIssues = currentIssues.filter(
          (i) => i.status_id === issue.status_id
        );
        const minSortOrder =
          statusIssues.length > 0
            ? Math.min(...statusIssues.map((i) => i.sort_order))
            : 0;

        insertIssue({
          project_id: issue.project_id,
          status_id: issue.status_id,
          title: `${issue.title} (Copy)`,
          description: issue.description,
          priority: issue.priority,
          sort_order: minSortOrder - 1,
          start_date: issue.start_date,
          target_date: issue.target_date,
          completed_at: null,
          parent_issue_id: issue.parent_issue_id,
          parent_issue_sort_order: issue.parent_issue_sort_order,
          extension_metadata: issue.extension_metadata,
        });
      },
      getIssue,
      getAssigneesForIssue,
    });

    return () => {
      registerProjectMutations(null);
    };
  }, [
    registerProjectMutations,
    removeIssue,
    insertIssue,
    getIssue,
    getAssigneesForIssue,
  ]);

  return <>{children}</>;
}

function ProjectKanbanLayout({
  projectName,
  projectId,
}: {
  projectName: string;
  projectId: string;
}) {
  const { issueId, isPanelOpen } = useCurrentKanbanRouteState();
  const isMobile = useIsMobile();
  const { getIssue } = useProjectContext();
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const activeTab: WorkbookTab = (search.tab as WorkbookTab) || 'board';
  const handleTabChange = useCallback(
    (tab: WorkbookTab) => {
      void (navigate as (opts: Record<string, unknown>) => Promise<void>)({
        search: {
          ...(search as Record<string, unknown>),
          tab: tab === 'board' ? undefined : tab,
        },
        replace: true,
      });
    },
    [navigate, search]
  );
  const issue = issueId ? getIssue(issueId) : undefined;
  usePageTitle(issue?.title, projectName);
  const [kanbanLeftPanelSize, setKanbanLeftPanelSize] = usePaneSize(
    PERSIST_KEYS.kanbanLeftPanel,
    75
  );

  const isRightPanelOpen = isPanelOpen && activeTab === 'board';
  const showKanbanBoard = activeTab === 'board';

  if (isMobile) {
    return isRightPanelOpen ? (
      <div className="h-full w-full overflow-hidden bg-secondary">
        <ProjectRightSidebarContainer />
      </div>
    ) : (
      <div className="h-full w-full overflow-hidden bg-primary">
        <KanbanContainer />
      </div>
    );
  }

  const kanbanDefaultLayout: Layout =
    typeof kanbanLeftPanelSize === 'number'
      ? {
          'kanban-left': kanbanLeftPanelSize,
          'kanban-right': 100 - kanbanLeftPanelSize,
        }
      : { 'kanban-left': 75, 'kanban-right': 25 };

  const onKanbanLayoutChange = (layout: Layout) => {
    if (isRightPanelOpen) {
      setKanbanLeftPanelSize(layout['kanban-left']);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <WorkbookTabBar
        projectId={projectId}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="flex-1 min-h-0 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {showKanbanBoard ? (
            <motion.div
              key="kanban"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Group
                orientation="horizontal"
                className="flex-1 min-w-0 h-full"
                defaultLayout={kanbanDefaultLayout}
                onLayoutChange={onKanbanLayoutChange}
              >
                <Panel
                  id="kanban-left"
                  minSize="20%"
                  className="min-w-0 h-full overflow-hidden bg-primary"
                >
                  <KanbanContainer />
                </Panel>

                {isRightPanelOpen && (
                  <Separator
                    id="kanban-separator"
                    className="w-1 bg-panel outline-none hover:bg-brand/50 transition-colors cursor-col-resize"
                  />
                )}

                {isRightPanelOpen && (
                  <Panel
                    id="kanban-right"
                    minSize="400px"
                    maxSize="800px"
                    className="min-w-0 h-full overflow-hidden bg-secondary"
                  >
                    <ProjectRightSidebarContainer />
                  </Panel>
                )}
              </Group>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="absolute inset-0 overflow-auto"
            >
              <WorkbookContent projectId={projectId} activeTab={activeTab} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Inner component that renders the Kanban board once we have the org context
 */
function ProjectKanbanInner({ projectId }: { projectId: string }) {
  const { t } = useTranslation('common');
  const { projects, isLoading } = useOrgContext();

  const project = projects.find((p) => p.id === projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-low">{t('states.loading')}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-low">{t('kanban.noProjectFound')}</p>
      </div>
    );
  }

  return (
    <ProjectProvider projectId={projectId}>
      <ProjectMutationsRegistration>
        <ProjectKanbanLayout projectName={project.name} projectId={projectId} />
      </ProjectMutationsRegistration>
    </ProjectProvider>
  );
}

/**
 * Hook to find a project by ID, using orgId from Zustand store
 */
function useFindProjectById(projectId: string | undefined) {
  const { isLoaded: authLoaded } = useAuth();
  const { data: orgsData, isLoading: orgsLoading } = useUserOrganizations();
  const selectedOrgId = useOrganizationStore((s) => s.selectedOrgId);
  const organizations = orgsData?.organizations ?? [];

  // Use stored org ID, or fall back to first org
  const orgIdToUse = selectedOrgId ?? organizations[0]?.id ?? null;

  const { data: projects = [], isLoading: projectsLoading } =
    useOrganizationProjects(orgIdToUse);

  const project = useMemo(() => {
    if (!projectId) return undefined;
    return projects.find((p) => p.id === projectId);
  }, [projectId, projects]);

  return {
    project,
    organizationId: project?.organization_id ?? selectedOrgId,
    // Include auth loading state - we can't determine project access until auth loads
    isLoading: !authLoaded || orgsLoading || projectsLoading,
  };
}

/**
 * ProjectKanban page - displays the Kanban board for a specific project
 *
 * URL patterns:
 * - /projects/:projectId - Kanban board with no issue selected
 * - /projects/:projectId/issues/:issueId - Kanban with issue panel open
 * - /projects/:projectId/issues/:issueId/workspaces/:workspaceId - Kanban with workspace session panel open
 * - /projects/:projectId/issues/:issueId/workspaces/create/:draftId - Kanban with workspace create panel
 *
 * Note: issue creation is composer-store state on top of /projects/:projectId.
 *
 * Note: This component is rendered inside SharedAppLayout which provides
 * NavbarContainer, AppBar, and SyncErrorProvider.
 */
export function ProjectKanban() {
  const { projectId, hostId, hasInvalidWorkspaceCreateDraftId } =
    useCurrentKanbanRouteState();
  const appNavigation = useAppNavigation();
  const { t } = useTranslation('common');
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const issueComposerKey = useMemo(() => {
    if (!projectId) {
      return null;
    }
    return buildKanbanIssueComposerKey(hostId, projectId);
  }, [hostId, projectId]);
  const previousIssueComposerKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const previousKey = previousIssueComposerKeyRef.current;
    if (previousKey && previousKey !== issueComposerKey) {
      closeKanbanIssueComposer(previousKey);
    }

    previousIssueComposerKeyRef.current = issueComposerKey;
  }, [issueComposerKey]);

  // Redirect invalid workspace-create draft URLs back to the closed project view.
  useEffect(() => {
    if (!projectId) return;

    if (hasInvalidWorkspaceCreateDraftId) {
      appNavigation.goToProject(projectId, {
        replace: true,
      });
    }
  }, [projectId, hasInvalidWorkspaceCreateDraftId, appNavigation]);

  // Find the project and get its organization
  const { organizationId, isLoading } = useFindProjectById(
    projectId ?? undefined
  );

  // Show loading while auth state is being determined
  if (!authLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-low">{t('states.loading')}</p>
      </div>
    );
  }

  // If not signed in, prompt user to log in
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-full w-full p-base">
        <LoginRequiredPrompt
          className="max-w-md"
          title={t('kanban.loginRequired.title')}
          description={t('kanban.loginRequired.description')}
          actionLabel={t('kanban.loginRequired.action')}
        />
      </div>
    );
  }

  if (!projectId || !organizationId) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-low">{t('kanban.noProjectFound')}</p>
      </div>
    );
  }

  return (
    <OrgProvider organizationId={organizationId}>
      <ProjectKanbanInner projectId={projectId} />
    </OrgProvider>
  );
}
