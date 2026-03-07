import { useState } from 'react';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { PlusIcon, Clock, Info } from '@phosphor-icons/react';
import {
  useTimeEntries,
  useCreateTimeEntry,
  useUpdateTimeEntry,
  useDeleteTimeEntry,
} from '@/shared/hooks/workbook/useWorkbookApi';
import { useFeatures } from '@/shared/hooks/workbook/useWorkbookApi';
import { useProjectContext } from '@/shared/hooks/useProjectContext';
import { CreateEditDialog } from './components/CreateEditDialog';
import { WorkbookTable } from './components/WorkbookTable';
import type { TimeEntry } from './types';

interface ProjectWorkbookTimeTrackingProps {
  projectId: string;
}

export function ProjectWorkbookTimeTracking({
  projectId,
}: ProjectWorkbookTimeTrackingProps) {
  const { data: timeEntries, isLoading, error } = useTimeEntries(projectId);
  const { data: features } = useFeatures(projectId);
  const { issues } = useProjectContext();
  const createMutation = useCreateTimeEntry(projectId);
  const updateMutation = useUpdateTimeEntry(projectId);
  const deleteMutation = useDeleteTimeEntry(projectId);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const handleCreate = async (data: Record<string, any>) => {
    await createMutation.mutateAsync({
      issue_id: data.issue_id || null,
      feature_id: data.feature_id || null,
      description: data.description || null,
      duration_minutes: Math.round((parseFloat(data.hours) || 0) * 60),
      date: data.date || new Date().toISOString().split('T')[0],
    });
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = async (data: Record<string, any>) => {
    if (!editingEntry) return;
    await updateMutation.mutateAsync({
      id: editingEntry.id,
      data: {
        issue_id:
          data.issue_id !== undefined ? data.issue_id || null : undefined,
        feature_id:
          data.feature_id !== undefined ? data.feature_id || null : undefined,
        description:
          data.description !== undefined ? data.description || null : undefined,
        duration_minutes:
          data.hours !== undefined
            ? Math.round(parseFloat(data.hours) * 60)
            : undefined,
        date: data.date || undefined,
      },
    });
    setEditingEntry(null);
  };

  const handleDelete = async (entry: TimeEntry) => {
    await deleteMutation.mutateAsync(entry.id);
  };

  const issueOptions = issues.map((issue) => ({
    value: issue.id,
    label: `${issue.title} (${issue.id.slice(0, 8)})`,
  }));

  const featureOptions = features
    ? features.map((feature) => ({
        value: feature.id,
        label: `${feature.feature_key}: ${feature.title}`,
      }))
    : [];

  const timeEntryFields = [
    {
      key: 'date',
      label: 'Date',
      type: 'date' as const,
      required: true,
    },
    {
      key: 'hours',
      label: 'Hours',
      type: 'number' as const,
      required: true,
      placeholder: '0.0',
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea' as const,
      placeholder: 'What did you work on?',
    },
    {
      key: 'issue_id',
      label: 'Related Issue',
      type: 'select' as const,
      options: [{ value: '', label: 'None' }, ...issueOptions],
    },
    {
      key: 'feature_id',
      label: 'Related Feature',
      type: 'select' as const,
      options: [{ value: '', label: 'None' }, ...featureOptions],
    },
  ];

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (item: TimeEntry) => (
        <span className="text-normal">
          {new Date(item.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'hours',
      label: 'Hours',
      render: (item: TimeEntry) => (
        <span className="font-medium text-normal">
          {(item.hours ?? item.duration_minutes / 60).toFixed(2)}h
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (item: TimeEntry) => (
        <span className="text-normal">{item.description || '-'}</span>
      ),
    },
    {
      key: 'issue',
      label: 'Issue',
      render: (item: TimeEntry) => {
        if (!item.issue_id) return <span className="text-low">-</span>;
        const issue = issues.find((i) => i.id === item.issue_id);
        return (
          <span className="text-sm text-normal">
            {issue ? issue.title.slice(0, 30) : item.issue_id.slice(0, 8)}
          </span>
        );
      },
    },
    {
      key: 'feature',
      label: 'Feature',
      render: (item: TimeEntry) => {
        if (!item.feature_id) return <span className="text-low">-</span>;
        const feature = features?.find((f) => f.id === item.feature_id);
        return (
          <span className="font-mono text-sm text-normal">
            {feature ? feature.feature_key : item.feature_id.slice(0, 8)}
          </span>
        );
      },
    },
  ];

  const totalHours =
    timeEntries?.reduce(
      (sum, entry) => sum + (entry.hours ?? entry.duration_minutes / 60),
      0
    ) || 0;

  return (
    <div className="flex flex-col h-full">
      <div className="p-base border-b border-border bg-secondary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-normal mb-1 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Time Tracking
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-sm text-low">
                {timeEntries?.length || 0} entries • {totalHours.toFixed(2)}{' '}
                total hours
              </p>
              <Tooltip content="Total time logged across all entries">
                <Info className="w-4 h-4 text-low hover:text-normal transition-colors" />
              </Tooltip>
            </div>
          </div>
          <Tooltip content="Log time spent on tasks or features">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="rounded-lg flex items-center gap-2 transition-all duration-150 hover:scale-105"
            >
              <PlusIcon className="w-4 h-4" />
              Log Time
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <WorkbookTable
          data={timeEntries || []}
          columns={columns}
          isLoading={isLoading}
          error={error}
          onEdit={(item) => setEditingEntry(item)}
          onDelete={handleDelete}
          emptyMessage="No time entries yet. Click 'Log Time' to get started."
        />
      </div>

      {isCreateDialogOpen && (
        <CreateEditDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreate}
          title="Log Time Entry"
          fields={timeEntryFields}
          isSubmitting={createMutation.isPending}
          error={createMutation.error as Error | null}
        />
      )}

      {editingEntry && (
        <CreateEditDialog
          isOpen={!!editingEntry}
          onClose={() => setEditingEntry(null)}
          onSubmit={handleUpdate}
          title="Edit Time Entry"
          fields={timeEntryFields}
          initialData={{
            date: editingEntry.date,
            hours: (
              editingEntry.hours ?? editingEntry.duration_minutes / 60
            ).toString(),
            description: editingEntry.description || '',
            issue_id: editingEntry.issue_id || '',
            feature_id: editingEntry.feature_id || '',
          }}
          isSubmitting={updateMutation.isPending}
          error={updateMutation.error as Error | null}
        />
      )}
    </div>
  );
}
