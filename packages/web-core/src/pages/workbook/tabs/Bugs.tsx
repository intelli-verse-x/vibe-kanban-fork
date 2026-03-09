import { useState, useMemo, useCallback } from 'react';
import {
  useBugs,
  useCreateBug,
  useUpdateBug,
  useDeleteBug,
  useFeatures,
} from '@/shared/hooks/workbook/useWorkbookApi';
import { useProjectRole } from '@/shared/hooks/workbook/useProjectRole';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import { useOrgContext } from '@/shared/hooks/useOrgContext';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { WorkbookTable } from './components/WorkbookTable';
import { CreateEditDialog } from './components/CreateEditDialog';
import { BugMetricsDashboard } from './components/BugMetricsDashboard';
import { QuickSearch } from './components/QuickSearch';
import {
  useKeyboardShortcuts,
  KeyboardShortcutsHelp,
  getWorkbookShortcuts,
} from './components/KeyboardShortcuts';
import { cn } from '@/shared/lib/utils';
import type { Bug, BugStatus, CreateBugRequest, UpdateBugRequest, Feature } from './types';

// Icons as inline SVGs to avoid heroicons import issues
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

const FunnelIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
    />
  </svg>
);

const TableCellsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 16.125v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 16.125c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125"
    />
  </svg>
);

const ChartBarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
    />
  </svg>
);

const MagnifyingGlassIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

const QuestionMarkCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
    />
  </svg>
);

interface ProjectWorkbookBugsProps {
  projectId: string;
}

type ViewMode = 'table' | 'metrics';

export function ProjectWorkbookBugs({ projectId }: ProjectWorkbookBugsProps) {
  const { data: bugs, isLoading, refetch } = useBugs(projectId);
  const createBug = useCreateBug(projectId);
  const updateBug = useUpdateBug(projectId);
  const deleteBug = useDeleteBug(projectId);
  const { data: role } = useProjectRole(projectId);
  const { userId } = useAuth();
  const { membersWithProfilesById } = useOrgContext();
  const { data: features } = useFeatures(projectId);

  // UI State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBug, setEditingBug] = useState<Bug | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [selectedBugIndex, setSelectedBugIndex] = useState(0);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterAssigned, setFilterAssigned] = useState<string>('all');
  const [filterFeature, setFilterFeature] = useState<string>('all');

  const isPrivileged =
    role &&
    ['admin', 'team_leader', 'project_manager', 'project_owner'].includes(role);

  // Filter bugs based on role and filters
  const filteredBugs = useMemo(() => {
    if (!bugs) return [];
    let filtered = bugs as Bug[];

    // Role-based filtering for non-privileged users
    if (!isPrivileged) {
      // Developers/testers see bugs assigned to them, reported by them, or unassigned
      filtered = filtered.filter(
        (bug: Bug) =>
          bug.assigned_to_user_id === userId ||
          bug.reported_by_user_id === userId ||
          !bug.assigned_to_user_id // Show unassigned bugs to everyone
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(
        (bug: Bug) => (bug.status?.toLowerCase() || 'reported') === filterStatus
      );
    }

    // Severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(
        (bug: Bug) => bug.severity?.toLowerCase() === filterSeverity
      );
    }

    // Assignment filter
    if (filterAssigned === 'me') {
      filtered = filtered.filter(
        (bug: Bug) => bug.assigned_to_user_id === userId
      );
    } else if (filterAssigned === 'unassigned') {
      filtered = filtered.filter((bug: Bug) => !bug.assigned_to_user_id);
    }

    // Feature filter
    if (filterFeature !== 'all') {
      filtered = filtered.filter(
        (bug: Bug) => bug.related_feature_id === filterFeature
      );
    }

    return filtered;
  }, [
    bugs,
    isPrivileged,
    userId,
    filterStatus,
    filterSeverity,
    filterAssigned,
    filterFeature,
  ]);

  // Priority calculation for bug triage
  const getBugPriority = useCallback((bug: Bug) => {
    const severityScore: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    const statusScore: Record<string, number> = {
      reported: 4,
      confirmed: 3,
      in_progress: 2,
      fixed: 1,
      verified: 0,
      closed: 0,
    };
    const severity = severityScore[bug.severity?.toLowerCase() || 'low'] || 1;
    const status = statusScore[bug.status?.toLowerCase() || 'reported'] || 4;
    return severity * status;
  }, []);

  // Sort bugs by priority (highest first)
  const sortedBugs = useMemo(() => {
    return [...filteredBugs].sort(
      (a, b) => getBugPriority(b) - getBugPriority(a)
    );
  }, [filteredBugs, getBugPriority]);

  // Keyboard shortcuts
  const shortcuts = getWorkbookShortcuts({
    onCreateBug: () => setIsCreateDialogOpen(true),
    onSearch: () => setShowSearch(true),
    onRefresh: () => refetch(),
    onToggleFilters: () => setShowFilters(!showFilters),
    onNextItem: () =>
      setSelectedBugIndex((prev) => Math.min(prev + 1, sortedBugs.length - 1)),
    onPrevItem: () => setSelectedBugIndex((prev) => Math.max(prev - 1, 0)),
    onOpenItem: () => {
      if (sortedBugs[selectedBugIndex]) {
        setEditingBug(sortedBugs[selectedBugIndex]);
      }
    },
    onClosePanel: () => {
      if (editingBug) {
        setEditingBug(null);
      } else if (showSearch) {
        setShowSearch(false);
      }
    },
    onToggleHelp: () => setShowShortcutsHelp(!showShortcutsHelp),
  });

  useKeyboardShortcuts({ shortcuts });

  // Members array for smart assignment
  const membersArray = useMemo(() => {
    return Array.from(membersWithProfilesById.values()).map((m) => ({
      user_id: m.user_id,
      profile: {
        username: m.username || undefined,
        email: m.email || undefined,
      },
    }));
  }, [membersWithProfilesById]);

  // Feature options for filters and forms
  const featureOptions = useMemo(() => {
    return ((features || []) as Feature[]).map((feature: Feature) => ({
      value: feature.id,
      label: feature.feature_key,
    }));
  }, [features]);

  // Member options for forms
  const memberOptions = useMemo(() => {
    return Array.from(membersWithProfilesById.values()).map((member) => ({
      value: member.user_id,
      label: member.username || member.email || 'Unknown',
    }));
  }, [membersWithProfilesById]);

  // Features by ID for quick lookup
  const featuresById = useMemo(() => {
    const map: Record<string, Feature> = {};
    ((features || []) as Feature[]).forEach((f: Feature) => {
      map[f.id] = f;
    });
    return map;
  }, [features]);

  const columns = [
    {
      key: 'bug_key',
      label: 'Bug ID',
      render: (item: Bug) => (
        <span className="font-mono text-normal">{item.bug_key}</span>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (item: Bug) => (
        <span className="font-medium text-normal">{item.title}</span>
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (item: Bug) => {
        const colors: Record<string, string> = {
          low: 'bg-green-500',
          medium: 'bg-yellow-500',
          high: 'bg-orange-500',
          critical: 'bg-red-500',
        };
        const severity = item.severity?.toLowerCase() || 'low';
        return (
          <span
            className={`px-2 py-1 rounded text-xs text-white ${
              colors[severity] || 'bg-gray-500'
            }`}
          >
            {severity}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Bug) => {
        const statusColors: Record<string, string> = {
          reported: 'bg-gray-500',
          confirmed: 'bg-blue-500',
          in_progress: 'bg-yellow-500',
          fixed: 'bg-green-500',
          verified: 'bg-purple-500',
          closed: 'bg-gray-600',
        };
        const status = (item.status || 'reported').toLowerCase();
        return (
          <span
            className={`px-2 py-1 rounded text-xs text-white ${
              statusColors[status] || 'bg-gray-500'
            }`}
          >
            {status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'assigned_to',
      label: 'Assigned To',
      render: (item: Bug) => {
        if (!item.assigned_to_user_id) {
          return <span className="text-low italic">Unassigned</span>;
        }
        const assignee = membersWithProfilesById.get(item.assigned_to_user_id);
        return (
          <span className="text-normal">
            {assignee?.username || assignee?.email || 'Unknown'}
          </span>
        );
      },
    },
    {
      key: 'reported_by',
      label: 'Reported By',
      render: (item: Bug) => {
        if (!item.reported_by_user_id) {
          return <span className="text-low">-</span>;
        }
        const reporter = membersWithProfilesById.get(item.reported_by_user_id);
        return (
          <span className="text-normal">
            {reporter?.username || reporter?.email || 'Unknown'}
          </span>
        );
      },
    },
    {
      key: 'feature',
      label: 'Feature',
      render: (item: Bug) => {
        if (!item.related_feature_id)
          return <span className="text-low">-</span>;
        const feature = featuresById[item.related_feature_id];
        return (
          <span className="font-mono text-sm text-normal">
            {feature?.feature_key || 'N/A'}
          </span>
        );
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (item: Bug) => {
        const priority = getBugPriority(item);
        const color =
          priority >= 12
            ? 'text-red-500'
            : priority >= 8
              ? 'text-orange-500'
              : priority >= 4
                ? 'text-yellow-500'
                : 'text-green-500';
        return (
          <Tooltip content={`Priority score: ${priority}`}>
            <span className={cn('font-mono text-sm', color)}>{priority}</span>
          </Tooltip>
        );
      },
    },
  ];

  const handleCreateBug = async (data: Record<string, unknown>) => {
    const bugData: CreateBugRequest = {
      title: data.title as string,
      description: (data.description as string) || undefined,
      severity: (data.severity as CreateBugRequest['severity']) || undefined,
      status: (data.status as BugStatus | undefined) || ('reported' as BugStatus),
      assigned_to_user_id: (data.assigned_to_user_id as string) || undefined,
      related_feature_id: (data.related_feature_id as string) || undefined,
      steps: (data.steps as string) || undefined,
      environment: (data.environment as string) || undefined,
    };
    await createBug.mutateAsync(bugData as never);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateBug = async (data: Record<string, unknown>) => {
    if (!editingBug) return;
    const bugData: UpdateBugRequest = {
      title: data.title as string,
      description:
        data.description !== undefined
          ? (data.description as string | null)
          : undefined,
      severity:
        data.severity !== undefined
          ? (data.severity as UpdateBugRequest['severity'])
          : undefined,
      status:
        data.status !== undefined ? (data.status as BugStatus | null) : undefined,
      assigned_to_user_id:
        data.assigned_to_user_id !== undefined
          ? (data.assigned_to_user_id as string | null) || null
          : undefined,
      related_feature_id:
        data.related_feature_id !== undefined
          ? (data.related_feature_id as string | null) || null
          : undefined,
      steps:
        data.steps !== undefined ? (data.steps as string | null) : undefined,
      environment:
        data.environment !== undefined
          ? (data.environment as string | null)
          : undefined,
    };
    await updateBug.mutateAsync({ id: editingBug.id, data: bugData as never });
    setEditingBug(null);
  };

  return (
    <div className="p-base h-full flex flex-col">
      {/* Header */}
      <div className="mb-base flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-normal mb-1">Bugs</h1>
          <p className="text-sm text-low">
            {filteredBugs.length} of {bugs?.length || 0} bug
            {bugs?.length !== 1 ? 's' : ''}
            {filteredBugs.length !== bugs?.length && ' (filtered)'}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
                <TableCellsIcon />
              </button>
            </Tooltip>
            <Tooltip content="Metrics Dashboard">
              <button
                onClick={() => setViewMode('metrics')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'metrics'
                    ? 'bg-brand text-white'
                    : 'bg-panel hover:bg-secondary'
                )}
              >
                <ChartBarIcon />
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
              <MagnifyingGlassIcon />
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
              <QuestionMarkCircleIcon />
            </Button>
          </Tooltip>

          {/* Create Bug */}
          <Tooltip content="Create a new bug report (B)">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="rounded-lg flex items-center gap-2 transition-all duration-150 hover:scale-105"
            >
              <PlusIcon />
              Create Bug
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Filters */}
      {showFilters && viewMode === 'table' && (
        <div className="mb-base flex flex-wrap gap-base items-center animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <FunnelIcon />
            <span className="text-sm font-medium text-normal">Filters:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-base py-half bg-panel border border-border rounded text-sm text-normal"
          >
            <option value="all">All Status</option>
            <option value="reported">Reported</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="fixed">Fixed</option>
            <option value="verified">Verified</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-base py-half bg-panel border border-border rounded text-sm text-normal"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterStatus('all');
              setFilterSeverity('all');
              setFilterAssigned('all');
              setFilterFeature('all');
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
            data={sortedBugs}
            columns={columns}
            isLoading={isLoading}
            onEdit={setEditingBug}
            onDelete={
              isPrivileged
                ? async (item) => {
                    await deleteBug.mutateAsync(item.id);
                  }
                : undefined
            }
            emptyMessage="No bugs found"
          />
        ) : (
          <BugMetricsDashboard bugs={(bugs || []) as Bug[]} />
        )}
      </div>

      {/* Create Bug Dialog */}
      {isCreateDialogOpen && (
        <CreateEditDialog
          isOpen={isCreateDialogOpen}
          onClose={() => {
            setIsCreateDialogOpen(false);
          }}
          onSubmit={handleCreateBug}
          title="Create Bug"
          fields={[
            { key: 'title', label: 'Title', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea' },
            {
              key: 'severity',
              label: 'Severity',
              type: 'select',
              options: [
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ],
            },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'reported', label: 'Reported' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'fixed', label: 'Fixed' },
                { value: 'verified', label: 'Verified' },
                { value: 'closed', label: 'Closed' },
              ],
            },
            { key: 'environment', label: 'Environment', type: 'text' },
            {
              key: 'steps',
              label: 'Steps to Reproduce',
              type: 'textarea',
              placeholder:
                'Use the template button above for a structured format',
            },
            {
              key: 'assigned_to_user_id',
              label: 'Assign To',
              type: 'select',
              options: [{ value: '', label: 'Unassigned' }, ...memberOptions],
            },
            {
              key: 'related_feature_id',
              label: 'Related Feature',
              type: 'select',
              options: [{ value: '', label: 'None' }, ...featureOptions],
            },
          ]}
          isSubmitting={createBug.isPending}
        />
      )}

      {/* Edit Bug Dialog */}
      {editingBug && (
        <CreateEditDialog
          isOpen={!!editingBug}
          onClose={() => setEditingBug(null)}
          onSubmit={handleUpdateBug}
          title="Edit Bug"
          fields={[
            { key: 'title', label: 'Title', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea' },
            {
              key: 'severity',
              label: 'Severity',
              type: 'select',
              options: [
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ],
            },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'reported', label: 'Reported' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'fixed', label: 'Fixed' },
                { value: 'verified', label: 'Verified' },
                { value: 'closed', label: 'Closed' },
              ],
            },
            { key: 'environment', label: 'Environment', type: 'text' },
            { key: 'steps', label: 'Steps to Reproduce', type: 'textarea' },
            {
              key: 'assigned_to_user_id',
              label: 'Assign To',
              type: 'select',
              options: [{ value: '', label: 'Unassigned' }, ...memberOptions],
            },
            {
              key: 'related_feature_id',
              label: 'Related Feature',
              type: 'select',
              options: [{ value: '', label: 'None' }, ...featureOptions],
            },
          ]}
          initialData={editingBug}
          isSubmitting={updateBug.isPending}
        />
      )}

      {/* Quick Search */}
      <QuickSearch
        bugs={(bugs || []) as Bug[]}
        features={(features || []) as Feature[]}
        members={membersArray}
        onSelectBug={(bug: Bug) => setEditingBug(bug)}
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
