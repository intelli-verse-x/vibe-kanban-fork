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
      key: 'version',
      label: 'Version',
      render: (item: Release) => (
        <span className="font-mono font-medium text-normal">
          {item.version}
        </span>
      ),
    },
    {
      key: 'release_date',
      label: 'Release Date',
      render: (item: Release) => (
        <span className="text-normal">
          {item.release_date
            ? new Date(item.release_date).toLocaleDateString()
            : '-'}
        </span>
      ),
    },
    {
      key: 'rollout_pct',
      label: 'Rollout %',
      render: (item: Release) => (
        <span className="text-normal">{item.rollout_pct || 0}%</span>
      ),
    },
    {
      key: 'major_bugs',
      label: 'Major Bugs',
      render: (item: Release) => (
        <span className={item.major_bugs ? 'text-error' : 'text-normal'}>
          {item.major_bugs || 0}
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
            { key: 'version', label: 'Version', type: 'text', required: true },
            { key: 'release_date', label: 'Release Date', type: 'date' },
            { key: 'rollout_pct', label: 'Rollout %', type: 'number' },
            { key: 'major_bugs', label: 'Major Bugs', type: 'number' },
            { key: 'rollback_plan', label: 'Rollback Plan', type: 'textarea' },
            {
              key: 'post_release_issues',
              label: 'Post-Release Issues',
              type: 'textarea',
            },
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
            { key: 'version', label: 'Version', type: 'text', required: true },
            { key: 'release_date', label: 'Release Date', type: 'date' },
            { key: 'rollout_pct', label: 'Rollout %', type: 'number' },
            { key: 'major_bugs', label: 'Major Bugs', type: 'number' },
            { key: 'rollback_plan', label: 'Rollback Plan', type: 'textarea' },
            {
              key: 'post_release_issues',
              label: 'Post-Release Issues',
              type: 'textarea',
            },
          ]}
          initialData={editingRelease}
          isSubmitting={updateRelease.isPending}
        />
      )}
    </div>
  );
}
