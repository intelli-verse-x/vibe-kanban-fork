import { useState } from 'react';
import {
  useSprintItems,
  useCreateSprintItem,
  useUpdateSprintItem,
  useDeleteSprintItem,
} from '@/shared/hooks/workbook/useWorkbookApi';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { PlusIcon } from '@phosphor-icons/react';
import { WorkbookTable } from './components/WorkbookTable';
import { CreateEditDialog } from './components/CreateEditDialog';
import type {
  SprintItem,
  CreateSprintItemRequest,
  UpdateSprintItemRequest,
} from './types';

interface ProjectWorkbookSprintTrackerProps {
  projectId: string;
}

export function ProjectWorkbookSprintTracker({
  projectId,
}: ProjectWorkbookSprintTrackerProps) {
  const { data: sprintItems, isLoading } = useSprintItems(projectId);
  const createSprintItem = useCreateSprintItem(projectId);
  const updateSprintItem = useUpdateSprintItem(projectId);
  const deleteSprintItem = useDeleteSprintItem(projectId);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SprintItem | null>(null);

  const columns = [
    {
      key: 'sprint_id',
      label: 'Sprint',
      render: (item: SprintItem) => (
        <span className="text-normal">{item.sprint_id ? 'Assigned' : 'Backlog'}</span>
      ),
    },
    {
      key: 'issue_id',
      label: 'Issue',
      render: (item: SprintItem) => (
        <span className="text-normal">{item.issue_id ? 'Linked' : '-'}</span>
      ),
    },
    {
      key: 'story_points',
      label: 'Story Points',
      render: (item: SprintItem) => (
        <span className="text-normal">{item.story_points || '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: SprintItem) => {
        const statusColors: Record<string, string> = {
          todo: 'bg-gray-500',
          in_progress: 'bg-blue-500',
          done: 'bg-green-500',
        };
        const status = item.status || 'todo';
        return (
          <span className={`px-2 py-1 rounded text-xs text-white ${statusColors[status] || 'bg-gray-500'}`}>
            {status.replace('_', ' ')}
          </span>
        );
      },
    },
  ];

  return (
    <div className="p-base">
      <div className="mb-base flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-normal mb-1">
            Sprint Tracker
          </h1>
          <p className="text-sm text-low">
            {sprintItems?.length || 0} sprint item
            {sprintItems?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Tooltip content="Create a new sprint item">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-lg flex items-center gap-2 transition-all duration-150 hover:scale-105"
          >
            <PlusIcon className="w-4 h-4" />
            Create Sprint Item
          </Button>
        </Tooltip>
      </div>

      <WorkbookTable
        data={sprintItems || []}
        columns={columns}
        isLoading={isLoading}
        onEdit={setEditingItem}
        onDelete={async (item) => {
          await deleteSprintItem.mutateAsync(item.id);
        }}
        emptyMessage="No sprint items yet"
      />

      {isCreateDialogOpen && (
        <CreateEditDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={async (data) => {
            await createSprintItem.mutateAsync(data as CreateSprintItemRequest);
            setIsCreateDialogOpen(false);
          }}
          title="Create Sprint Item"
          fields={[
            {
              key: 'sprint_id',
              label: 'Sprint ID (optional)',
              type: 'text',
            },
            {
              key: 'issue_id',
              label: 'Issue ID (optional)',
              type: 'text',
            },
            { key: 'story_points', label: 'Story Points', type: 'number' },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'todo', label: 'To Do' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'done', label: 'Done' },
              ],
            },
          ]}
          isSubmitting={createSprintItem.isPending}
        />
      )}

      {editingItem && (
        <CreateEditDialog
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={async (data) => {
            await updateSprintItem.mutateAsync({
              id: editingItem.id,
              data: data as UpdateSprintItemRequest,
            });
            setEditingItem(null);
          }}
          title="Edit Sprint Item"
          fields={[
            {
              key: 'sprint_id',
              label: 'Sprint ID (optional)',
              type: 'text',
            },
            { key: 'story_points', label: 'Story Points', type: 'number' },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'todo', label: 'To Do' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'done', label: 'Done' },
              ],
            },
          ]}
          initialData={editingItem}
          isSubmitting={updateSprintItem.isPending}
        />
      )}
    </div>
  );
}
