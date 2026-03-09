import { useState, useMemo } from 'react';
import {
  useFeatures,
  useCreateFeature,
  useUpdateFeature,
  useDeleteFeature,
} from '@/shared/hooks/workbook/useWorkbookApi';
import { useProjectRole } from '@/shared/hooks/workbook/useProjectRole';
import { useOrgContext } from '@/shared/hooks/useOrgContext';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { PlusIcon, FunnelSimple, MagnifyingGlass } from '@phosphor-icons/react';
import { WorkbookTable } from './components/WorkbookTable';
import { CreateEditDialog } from './components/CreateEditDialog';
import type {
  Feature,
  CreateFeatureRequest,
  UpdateFeatureRequest,
} from './types';
import { cn } from '@/shared/lib/utils';

interface ProjectWorkbookFeaturesProps {
  projectId: string;
}

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export function ProjectWorkbookFeatures({
  projectId,
}: ProjectWorkbookFeaturesProps) {
  const { data: features, isLoading, refetch } = useFeatures(projectId);
  const createFeature = useCreateFeature(projectId);
  const updateFeature = useUpdateFeature(projectId);
  const deleteFeature = useDeleteFeature(projectId);
  const { data: role } = useProjectRole(projectId);
  const { membersWithProfilesById } = useOrgContext();

  // UI State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const isPrivileged =
    role &&
    ['admin', 'team_leader', 'project_manager', 'project_owner'].includes(role);

  // Filter features
  const filteredFeatures = useMemo(() => {
    if (!features) return [];
    let filtered = features as Feature[];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.title.toLowerCase().includes(query) ||
          f.feature_key?.toLowerCase().includes(query) ||
          f.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(
        (f) => (f.status?.toLowerCase() || 'backlog') === filterStatus
      );
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(
        (f) => f.priority?.toLowerCase() === filterPriority
      );
    }

    return filtered;
  }, [features, searchQuery, filterStatus, filterPriority]);

  // Member options for owner field
  const memberOptions = useMemo(() => {
    return Array.from(membersWithProfilesById.values()).map((member) => ({
      value: member.user_id,
      label: member.username || member.email || 'Unknown',
    }));
  }, [membersWithProfilesById]);

  const columns = [
    {
      key: 'feature_key',
      label: 'ID',
      render: (item: Feature) => (
        <span className="font-mono text-sm text-low">{item.feature_key}</span>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (item: Feature) => (
        <span className="font-medium text-normal">{item.title}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Feature) => {
        const statusColors: Record<string, string> = {
          backlog: 'bg-gray-500',
          in_progress: 'bg-blue-500',
          done: 'bg-green-500',
          blocked: 'bg-red-500',
        };
        const status = (item.status || 'backlog').toLowerCase();
        return (
          <span
            className={`px-2 py-1 rounded text-xs text-white ${statusColors[status] || 'bg-gray-500'}`}
          >
            {status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (item: Feature) => {
        if (!item.priority) return <span className="text-low">-</span>;
        const priorityColors: Record<string, string> = {
          low: 'text-green-400',
          medium: 'text-yellow-400',
          high: 'text-orange-400',
          critical: 'text-red-400',
        };
        return (
          <span className={priorityColors[item.priority] || 'text-low'}>
            {item.priority}
          </span>
        );
      },
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (item: Feature) => {
        if (!item.owner_user_id)
          return <span className="text-low italic">Unassigned</span>;
        const owner = membersWithProfilesById.get(item.owner_user_id);
        return (
          <span className="text-normal">
            {owner?.username || owner?.email || 'Unknown'}
          </span>
        );
      },
    },
    {
      key: 'target_date',
      label: 'Target Date',
      render: (item: Feature) => (
        <span className="text-low">
          {item.target_date
            ? new Date(item.target_date).toLocaleDateString()
            : '-'}
        </span>
      ),
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (item: Feature) => (
        <span className="text-low">
          {item.progress != null ? `${item.progress}%` : '-'}
        </span>
      ),
    },
  ];

  const featureFields = [
    { key: 'title', label: 'Title', type: 'text' as const, required: true },
    { key: 'description', label: 'Description', type: 'textarea' as const },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: STATUS_OPTIONS,
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select' as const,
      options: PRIORITY_OPTIONS,
    },
    {
      key: 'owner_user_id',
      label: 'Owner',
      type: 'select' as const,
      options: memberOptions,
    },
    {
      key: 'start_date',
      label: 'Start Date',
      type: 'date' as const,
    },
    {
      key: 'target_date',
      label: 'Target Date',
      type: 'date' as const,
    },
    {
      key: 'progress',
      label: 'Progress (%)',
      type: 'number' as const,
    },
  ];

  return (
    <div className="p-base">
      <div className="mb-base flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-normal mb-1">Features</h1>
          <p className="text-sm text-low">
            {filteredFeatures.length} of {features?.length || 0} feature
            {features?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Toggle filters">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'rounded-lg',
                showFilters && 'bg-blue-500/20 text-blue-400'
              )}
            >
              <FunnelSimple className="w-4 h-4" />
            </Button>
          </Tooltip>
          {isPrivileged && (
            <Tooltip content="Create a new feature">
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="rounded-lg flex items-center gap-2 transition-all duration-150 hover:scale-105"
              >
                <PlusIcon className="w-4 h-4" />
                Create Feature
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <div className="mb-4 p-4 bg-layer-01 rounded-lg border border-border space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-low" />
            <input
              type="text"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-layer-02 border border-border rounded-lg text-normal placeholder:text-low focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-layer-02 border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 bg-layer-02 border border-border rounded-lg text-normal focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Priorities</option>
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {(filterStatus !== 'all' ||
              filterPriority !== 'all' ||
              searchQuery) && (
              <Button
                variant="secondary"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setSearchQuery('');
                }}
                className="text-sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}

      <WorkbookTable
        data={filteredFeatures}
        columns={columns}
        isLoading={isLoading}
        onEdit={isPrivileged ? setEditingFeature : undefined}
        onDelete={
          isPrivileged
            ? async (item) => {
                await deleteFeature.mutateAsync(item.id);
              }
            : undefined
        }
        emptyMessage={
          searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
            ? 'No features match your filters'
            : 'No features yet'
        }
      />

      {isCreateDialogOpen && (
        <CreateEditDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={async (data) => {
            await createFeature.mutateAsync(data as CreateFeatureRequest);
            setIsCreateDialogOpen(false);
          }}
          title="Create Feature"
          fields={featureFields}
          isSubmitting={createFeature.isPending}
        />
      )}

      {editingFeature && (
        <CreateEditDialog
          isOpen={!!editingFeature}
          onClose={() => setEditingFeature(null)}
          onSubmit={async (data) => {
            await updateFeature.mutateAsync({
              id: editingFeature.id,
              data: data as UpdateFeatureRequest,
            });
            setEditingFeature(null);
          }}
          title="Edit Feature"
          fields={featureFields}
          initialData={editingFeature}
          isSubmitting={updateFeature.isPending}
        />
      )}
    </div>
  );
}
