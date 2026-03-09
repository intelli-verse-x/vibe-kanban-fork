import { useState } from 'react';
import {
  useReleases,
  useCreateRelease,
  useUpdateRelease,
  useDeleteRelease,
} from '@/shared/hooks/workbook/useWorkbookApi';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { PlusIcon } from '@phosphor-icons/react';
import { WorkbookTable } from './components/WorkbookTable';
import { CreateEditDialog } from './components/CreateEditDialog';
import type {
  Release,
  CreateReleaseRequest,
  UpdateReleaseRequest,
} from './types';

interface ProjectWorkbookReleasesProps {
  projectId: string;
}

export function ProjectWorkbookReleases({
  projectId,
}: ProjectWorkbookReleasesProps) {
  const { data: releases, isLoading } = useReleases(projectId);
  const createRelease = useCreateRelease(projectId);
  const updateRelease = useUpdateRelease(projectId);
  const deleteRelease = useDeleteRelease(projectId);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (item: Release) => (
        <span className="font-medium text-normal">{item.name}</span>
      ),
    },
    {
      key: 'version',
      label: 'Version',
      render: (item: Release) => (
        <span className="font-mono text-normal">
          {item.version || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Release) => {
        const statusColors: Record<string, string> = {
          planning: 'bg-gray-500',
          in_progress: 'bg-blue-500',
          testing: 'bg-yellow-500',
          released: 'bg-green-500',
          cancelled: 'bg-red-500',
        };
        const status = item.status || 'planning';
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
      key: 'release_type',
      label: 'Type',
      render: (item: Release) => (
        <span className="text-low">{item.release_type || '-'}</span>
      ),
    },
    {
      key: 'planned_date',
      label: 'Planned Date',
      render: (item: Release) => (
        <span className="text-normal">
          {item.planned_date
            ? new Date(item.planned_date).toLocaleDateString()
            : '-'}
        </span>
      ),
    },
    {
      key: 'released_at',
      label: 'Released At',
      render: (item: Release) => (
        <span className="text-normal">
          {item.released_at
            ? new Date(item.released_at).toLocaleDateString()
            : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-base">
      <div className="mb-base flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-normal mb-1">Releases</h1>
          <p className="text-sm text-low">
            {releases?.length || 0} release{releases?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Tooltip content="Create a new release">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-lg flex items-center gap-2 transition-all duration-150 hover:scale-105"
          >
            <PlusIcon className="w-4 h-4" />
            Create Release
          </Button>
        </Tooltip>
      </div>

      <WorkbookTable
        data={releases || []}
        columns={columns}
        isLoading={isLoading}
        onEdit={setEditingRelease}
        onDelete={async (item) => {
          await deleteRelease.mutateAsync(item.id);
        }}
        emptyMessage="No releases yet"
      />

      {isCreateDialogOpen && (
        <CreateEditDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={async (data) => {
            await createRelease.mutateAsync(data as CreateReleaseRequest);
            setIsCreateDialogOpen(false);
          }}
          title="Create Release"
          fields={[
            { key: 'name', label: 'Name', type: 'text', required: true },
            { key: 'version', label: 'Version', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'planning', label: 'Planning' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'testing', label: 'Testing' },
                { value: 'released', label: 'Released' },
                { value: 'cancelled', label: 'Cancelled' },
              ],
            },
            {
              key: 'release_type',
              label: 'Release Type',
              type: 'select',
              options: [
                { value: 'major', label: 'Major' },
                { value: 'minor', label: 'Minor' },
                { value: 'patch', label: 'Patch' },
                { value: 'hotfix', label: 'Hotfix' },
              ],
            },
            { key: 'planned_date', label: 'Planned Date', type: 'date' },
            { key: 'release_notes', label: 'Release Notes', type: 'textarea' },
          ]}
          isSubmitting={createRelease.isPending}
        />
      )}

      {editingRelease && (
        <CreateEditDialog
          isOpen={!!editingRelease}
          onClose={() => setEditingRelease(null)}
          onSubmit={async (data) => {
            await updateRelease.mutateAsync({
              id: editingRelease.id,
              data: data as UpdateReleaseRequest,
            });
            setEditingRelease(null);
          }}
          title="Edit Release"
          fields={[
            { key: 'name', label: 'Name', type: 'text', required: true },
            { key: 'version', label: 'Version', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'planning', label: 'Planning' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'testing', label: 'Testing' },
                { value: 'released', label: 'Released' },
                { value: 'cancelled', label: 'Cancelled' },
              ],
            },
            {
              key: 'release_type',
              label: 'Release Type',
              type: 'select',
              options: [
                { value: 'major', label: 'Major' },
                { value: 'minor', label: 'Minor' },
                { value: 'patch', label: 'Patch' },
                { value: 'hotfix', label: 'Hotfix' },
              ],
            },
            { key: 'planned_date', label: 'Planned Date', type: 'date' },
            { key: 'released_at', label: 'Released At', type: 'date' },
            { key: 'release_notes', label: 'Release Notes', type: 'textarea' },
          ]}
          initialData={editingRelease}
          isSubmitting={updateRelease.isPending}
        />
      )}
    </div>
  );
}
