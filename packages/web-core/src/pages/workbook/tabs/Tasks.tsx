import { useState, useMemo } from 'react';
import { useProjectContext } from '@/shared/hooks/useProjectContext';
import { useFeatures, useBugs } from '@/shared/hooks/workbook/useWorkbookApi';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import { useOrgContext } from '@/shared/hooks/useOrgContext';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { WorkbookTable } from './components/WorkbookTable';
import { TaskDetailPanel } from './components/TaskDetailPanel';
import { WorkloadBalancer } from './components/WorkloadBalancer';
import { QuickSearch } from './components/QuickSearch';
import {
  useKeyboardShortcuts,
  KeyboardShortcutsHelp,
  getWorkbookShortcuts,
} from './components/KeyboardShortcuts';
import { cn } from '@/shared/lib/utils';
import type { Issue } from 'shared/remote-types';
import type { Feature, IssueExtended } from './types';

// Inline SVG icons to avoid heroicons import issues
const FunnelIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || 'w-4 h-4'}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
    />
  </svg>
);

const MagnifyingGlassIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || 'w-4 h-4'}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

const QuestionMarkCircleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || 'w-4 h-4'}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
    />
  </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || 'w-4 h-4'}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
    />
  </svg>
);

const TableCellsIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || 'w-4 h-4'}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 16.125v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 16.125c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125"
    />
  </svg>
);

interface ProjectWorkbookTasksProps {
  projectId: string;
  role: string | null | undefined;
}

type ViewMode = 'table' | 'workload';

export function ProjectWorkbookTasks({
  projectId,
  role,
}: ProjectWorkbookTasksProps) {
  const { issues, issueAssignees, statuses } = useProjectContext();
  const { data: features } = useFeatures(projectId);
  const { data: bugs } = useBugs(projectId);
  const { userId } = useAuth();
  const { membersWithProfilesById } = useOrgContext();

  // UI State
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [selectedIssueIndex, setSelectedIssueIndex] = useState(0);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssigned, setFilterAssigned] = useState<string>('all');
  const [filterFeature, setFilterFeature] = useState<string>('all');
  const [filterDue, setFilterDue] = useState<string>('all');

  const isPrivileged =
    role &&
    ['admin', 'team_leader', 'project_manager', 'project_owner'].includes(role);

  // Filter issues based on role and filters
  const filteredIssues = useMemo(() => {
    let filtered = issues;

    // Role-based filtering
    if (!isPrivileged) {
      // Dev/worker can only see assigned issues or issues they created
      filtered = filtered.filter((issue) => {
        const assignees = issueAssignees.filter((a) => a.issue_id === issue.id);
        return (
          assignees.some((a) => a.user_id === userId) ||
          issue.creator_user_id === userId
        );
      });
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((issue) => issue.status_id === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter((issue) => issue.priority === filterPriority);
    }

    // Assignment filter
    if (filterAssigned === 'me') {
      filtered = filtered.filter((issue) => {
        const assignees = issueAssignees.filter((a) => a.issue_id === issue.id);
        return assignees.some((a) => a.user_id === userId);
      });
    } else if (filterAssigned === 'unassigned') {
      filtered = filtered.filter((issue) => {
        const assignees = issueAssignees.filter((a) => a.issue_id === issue.id);
        return assignees.length === 0;
      });
    }

    // Feature filter
    if (filterFeature !== 'all') {
      filtered = filtered.filter(
        (issue) =>
          (issue as Issue & { feature_id?: string }).feature_id ===
          filterFeature
      );
    }

    // Due date filter
    if (filterDue !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      if (filterDue === 'overdue') {
        filtered = filtered.filter((issue) => {
          if (!issue.target_date || issue.completed_at) return false;
          return new Date(issue.target_date) < today;
        });
      } else if (filterDue === 'this_week') {
        filtered = filtered.filter((issue) => {
          if (!issue.target_date) return false;
          const dueDate = new Date(issue.target_date);
          return dueDate >= today && dueDate <= endOfWeek;
        });
      } else if (filterDue === 'no_due') {
        filtered = filtered.filter((issue) => !issue.target_date);
      }
    }

    return filtered;
  }, [
    issues,
    issueAssignees,
    isPrivileged,
    userId,
    filterStatus,
    filterPriority,
    filterAssigned,
    filterFeature,
    filterDue,
  ]);

  // Sort issues by priority and due date
  const sortedIssues = useMemo(() => {
    const priorityOrder: Record<string, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return [...filteredIssues].sort((a, b) => {
      // First by priority
      const aPriority = priorityOrder[a.priority || 'low'] ?? 4;
      const bPriority = priorityOrder[b.priority || 'low'] ?? 4;
      if (aPriority !== bPriority) return aPriority - bPriority;

      // Then by due date (earlier first)
      if (a.target_date && b.target_date) {
        return (
          new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
        );
      }
      if (a.target_date) return -1;
      if (b.target_date) return 1;

      return 0;
    });
  }, [filteredIssues]);

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || null;
  const selectedIssueAssignees = issueAssignees.filter(
    (a) => a.issue_id === selectedIssueId
  );

  // Members array for components
  const membersArray = useMemo(() => {
    return Array.from(membersWithProfilesById.values()).map((m) => ({
      user_id: m.user_id,
      profile: {
        username: m.username || undefined,
        email: m.email || undefined,
      },
    }));
  }, [membersWithProfilesById]);

  // Feature options
  const featureOptions = useMemo(() => {
    return ((features || []) as Feature[]).map((feature: Feature) => ({
      value: feature.id,
      label: feature.feature_key,
    }));
  }, [features]);

  // Status options
  const statusOptions = useMemo(() => {
    return statuses.map((status) => ({
      value: status.id,
      label: status.name,
    }));
  }, [statuses]);

  // Keyboard shortcuts
  const shortcuts = getWorkbookShortcuts({
    onCreateTask: () => {
      // TODO: Open create task dialog
      console.log('Create task');
    },
    onSearch: () => setShowSearch(true),
    onToggleFilters: () => setShowFilters(!showFilters),
    onNextItem: () =>
      setSelectedIssueIndex((prev) =>
        Math.min(prev + 1, sortedIssues.length - 1)
      ),
    onPrevItem: () => setSelectedIssueIndex((prev) => Math.max(prev - 1, 0)),
    onOpenItem: () => {
      if (sortedIssues[selectedIssueIndex]) {
        setSelectedIssueId(sortedIssues[selectedIssueIndex].id);
      }
    },
    onClosePanel: () => {
      if (selectedIssue) {
        setSelectedIssueId(null);
      } else if (showSearch) {
        setShowSearch(false);
      }
    },
    onToggleHelp: () => setShowShortcutsHelp(!showShortcutsHelp),
  });

  useKeyboardShortcuts({ shortcuts });

  // Calculate overdue and due soon counts
  const taskStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    let overdue = 0;
    let dueSoon = 0;
    let unassigned = 0;

    filteredIssues.forEach((issue) => {
      if (issue.target_date && !issue.completed_at) {
        const dueDate = new Date(issue.target_date);
        if (dueDate < today) {
          overdue++;
        } else if (dueDate <= threeDaysFromNow) {
          dueSoon++;
        }
      }
      const assignees = issueAssignees.filter((a) => a.issue_id === issue.id);
      if (assignees.length === 0) {
        unassigned++;
      }
    });

    return { overdue, dueSoon, unassigned };
  }, [filteredIssues, issueAssignees]);

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (item: Issue) => (
        <span className="font-medium text-normal">{item.title}</span>
      ),
    },
    {
      key: 'feature',
      label: 'Feature',
      render: (item: Issue) => {
        const issueWithFeature = item as Issue & { feature_id?: string };
        if (!issueWithFeature.feature_id)
          return <span className="text-low">-</span>;
        const feature = (features as Feature[] | undefined)?.find(
          (f: Feature) => f.id === issueWithFeature.feature_id
        );
        return (
          <span className="font-mono text-sm text-normal">
            {feature?.feature_key || issueWithFeature.feature_id}
          </span>
        );
      },
    },
    {
      key: 'assignees',
      label: 'Assignees',
      render: (item: Issue) => {
        const assignees = issueAssignees.filter((a) => a.issue_id === item.id);
        if (assignees.length === 0) {
          return <span className="text-low italic">Unassigned</span>;
        }
        return (
          <div className="flex flex-wrap gap-half">
            {assignees.slice(0, 2).map((a) => {
              const member = membersWithProfilesById.get(a.user_id);
              const name = member?.username || member?.email || 'Unknown';
              return (
                <span
                  key={a.user_id}
                  className="px-2 py-1 rounded text-xs bg-panel border border-border text-normal"
                >
                  {name}
                </span>
              );
            })}
            {assignees.length > 2 && (
              <Tooltip
                content={assignees
                  .slice(2)
                  .map((a) => {
                    const member = membersWithProfilesById.get(a.user_id);
                    return member?.username || member?.email || 'Unknown';
                  })
                  .join(', ')}
              >
                <span className="px-2 py-1 rounded text-xs bg-panel border border-border text-low">
                  +{assignees.length - 2}
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (item: Issue) => {
        if (!item.target_date) return <span className="text-low">-</span>;
        const dueDate = new Date(item.target_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isOverdue = !item.completed_at && dueDate < today;
        const isDueSoon =
          !item.completed_at &&
          dueDate <= new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000) &&
          !isOverdue;
        return (
          <span
            className={cn(
              'text-normal',
              isOverdue && 'text-red-500 font-semibold',
              isDueSoon && 'text-yellow-500'
            )}
          >
            {dueDate.toLocaleDateString()}
            {isOverdue && ' (Overdue)'}
          </span>
        );
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (item: Issue) => {
        if (!item.priority) return <span className="text-low">-</span>;
        const colors: Record<string, string> = {
          low: 'bg-gray-500',
          medium: 'bg-yellow-500',
          high: 'bg-orange-500',
          urgent: 'bg-red-500',
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs text-white ${
              colors[item.priority] || 'bg-gray-500'
            }`}
          >
            {item.priority}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Issue) => {
        const status = statuses.find((s) => s.id === item.status_id);
        if (!status) return <span className="text-low">-</span>;
        return (
          <span
            className="px-2 py-1 rounded text-xs text-white"
            style={{ backgroundColor: status.color || '#6b7280' }}
          >
            {status.name}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-base border-b border-border bg-secondary">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-normal mb-1">Tasks</h1>
              <p className="text-sm text-low">
                {filteredIssues.length} of {issues.length} task
                {issues.length !== 1 ? 's' : ''}
                {filteredIssues.length !== issues.length && ' (filtered)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Quick Stats */}
              {(taskStats.overdue > 0 ||
                taskStats.dueSoon > 0 ||
                taskStats.unassigned > 0) && (
                <div className="flex items-center gap-2 mr-2 text-xs">
                  {taskStats.overdue > 0 && (
                    <Tooltip content={`${taskStats.overdue} overdue task(s)`}>
                      <span className="px-2 py-1 rounded bg-red-500/20 text-red-500">
                        {taskStats.overdue} overdue
                      </span>
                    </Tooltip>
                  )}
                  {taskStats.dueSoon > 0 && (
                    <Tooltip
                      content={`${taskStats.dueSoon} task(s) due within 3 days`}
                    >
                      <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-500">
                        {taskStats.dueSoon} due soon
                      </span>
                    </Tooltip>
                  )}
                  {taskStats.unassigned > 0 && (
                    <Tooltip
                      content={`${taskStats.unassigned} unassigned task(s)`}
                    >
                      <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-500">
                        {taskStats.unassigned} unassigned
                      </span>
                    </Tooltip>
                  )}
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <Tooltip content="Table View">
                  <button
                    onClick={() => setViewMode('table')}
                    className={cn(
                      'p-2 transition-colors',
                      viewMode === 'table'
                        ? 'bg-brand text-white'
                        : 'bg-panel hover:bg-secondary'
                    )}
                  >
                    <TableCellsIcon className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Workload View">
                  <button
                    onClick={() => setViewMode('workload')}
                    className={cn(
                      'p-2 transition-colors',
                      viewMode === 'workload'
                        ? 'bg-brand text-white'
                        : 'bg-panel hover:bg-secondary'
                    )}
                  >
                    <ChartBarIcon className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>

              {/* Search */}
              <Tooltip content="Quick Search (Ctrl+K or /)">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSearch(true)}
                  className="flex items-center gap-1"
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                </Button>
              </Tooltip>

              {/* Help */}
              <Tooltip content="Keyboard Shortcuts (?)">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowShortcutsHelp(true)}
                  className="flex items-center gap-1"
                >
                  <QuestionMarkCircleIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && viewMode === 'table' && (
          <div className="p-base border-b border-border flex flex-wrap gap-base items-center animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-low" />
              <span className="text-sm font-medium text-normal">Filters:</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-base py-half bg-panel border border-border rounded text-sm text-normal"
            >
              <option value="all">All Status</option>
              {statusOptions.map((opt: { value: string; label: string }) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-base py-half bg-panel border border-border rounded text-sm text-normal"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterAssigned}
              onChange={(e) => setFilterAssigned(e.target.value)}
              className="px-base py-half bg-panel border border-border rounded text-sm text-normal"
            >
              <option value="all">All Assignments</option>
              <option value="me">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
            </select>
            <select
              value={filterFeature}
              onChange={(e) => setFilterFeature(e.target.value)}
              className="px-base py-half bg-panel border border-border rounded text-sm text-normal"
            >
              <option value="all">All Features</option>
              {featureOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={filterDue}
              onChange={(e) => setFilterDue(e.target.value)}
              className="px-base py-half bg-panel border border-border rounded text-sm text-normal"
            >
              <option value="all">All Due Dates</option>
              <option value="overdue">Overdue</option>
              <option value="this_week">Due This Week</option>
              <option value="no_due">No Due Date</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterStatus('all');
                setFilterPriority('all');
                setFilterAssigned('all');
                setFilterFeature('all');
                setFilterDue('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'table' ? (
            <WorkbookTable
              data={sortedIssues}
              columns={columns}
              onRowClick={(item) => setSelectedIssueId(item.id)}
              emptyMessage="No tasks yet"
            />
          ) : (
            <div className="p-base">
              <WorkloadBalancer
                members={membersArray}
                issues={issues}
                issueAssignees={issueAssignees}
                bugs={bugs}
              />
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Panel */}
      {selectedIssue && (
        <TaskDetailPanel
          issue={selectedIssue as IssueExtended}
          assignees={selectedIssueAssignees}
          features={features || []}
          canEdit={
            isPrivileged ||
            selectedIssueAssignees.some((a) => a.user_id === userId)
          }
          onClose={() => setSelectedIssueId(null)}
        />
      )}

      {/* Quick Search */}
      <QuickSearch
        issues={issues}
        bugs={bugs}
        features={features}
        members={membersArray}
        onSelectIssue={(issue) => setSelectedIssueId(issue.id)}
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        shortcuts={shortcuts}
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
    </div>
  );
}
