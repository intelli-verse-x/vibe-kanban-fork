import { useState } from 'react';
import {
  useABTests,
  useCreateABTest,
  useUpdateABTest,
  useDeleteABTest,
} from '@/shared/hooks/workbook/useWorkbookApi';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { PlusIcon } from '@phosphor-icons/react';
import { WorkbookTable } from './components/WorkbookTable';
import { CreateEditDialog } from './components/CreateEditDialog';
import type { ABTest, CreateABTestRequest, UpdateABTestRequest } from './types';

interface ProjectWorkbookABTestsProps {
  projectId: string;
}

export function ProjectWorkbookABTests({
  projectId,
}: ProjectWorkbookABTestsProps) {
  const { data: abTests, isLoading } = useABTests(projectId);
  const createABTest = useCreateABTest(projectId);
  const updateABTest = useUpdateABTest(projectId);
  const deleteABTest = useDeleteABTest(projectId);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<ABTest | null>(null);

  const columns = [
    {
      key: 'experiment_key',
      label: 'Experiment Key',
      render: (item: ABTest) => (
        <span className="font-mono text-normal">{item.experiment_key}</span>
      ),
    },
    {
      key: 'hypothesis',
      label: 'Hypothesis',
      render: (item: ABTest) => (
        <span className="text-normal line-clamp-2">
          {item.hypothesis || '-'}
        </span>
      ),
    },
    {
      key: 'metric_measured',
      label: 'Metric',
      render: (item: ABTest) => (
        <span className="text-low">{item.metric_measured || '-'}</span>
      ),
    },
    {
      key: 'result',
      label: 'Result',
      render: (item: ABTest) => (
        <span className="text-normal">{item.result || '-'}</span>
      ),
    },
    {
      key: 'decision',
      label: 'Decision',
      render: (item: ABTest) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-500 text-white">
          {item.decision || 'pending'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-base">
      <div className="mb-base flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-normal mb-1">AB Tests</h1>
          <p className="text-sm text-low">
            {abTests?.length || 0} AB test{abTests?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Tooltip content="Create a new A/B test">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-lg flex items-center gap-2 transition-all duration-150 hover:scale-105"
          >
            <PlusIcon className="w-4 h-4" />
            Create AB Test
          </Button>
        </Tooltip>
      </div>

      <WorkbookTable
        data={abTests || []}
        columns={columns}
        isLoading={isLoading}
        onEdit={setEditingTest}
        onDelete={async (item) => {
          await deleteABTest.mutateAsync(item.id);
        }}
        emptyMessage="No AB tests yet"
      />

      {isCreateDialogOpen && (
        <CreateEditDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={async (data) => {
            await createABTest.mutateAsync(data as CreateABTestRequest);
            setIsCreateDialogOpen(false);
          }}
          title="Create AB Test"
          fields={[
            {
              key: 'experiment_key',
              label: 'Experiment Key',
              type: 'text',
              required: true,
            },
            {
              key: 'hypothesis',
              label: 'Hypothesis',
              type: 'textarea',
              required: true,
            },
            { key: 'variant_a', label: 'Variant A', type: 'text' },
            { key: 'variant_b', label: 'Variant B', type: 'text' },
            { key: 'metric_measured', label: 'Metric Measured', type: 'text' },
            { key: 'start_date', label: 'Start Date', type: 'date' },
            { key: 'end_date', label: 'End Date', type: 'date' },
            { key: 'result', label: 'Result', type: 'textarea' },
            {
              key: 'decision',
              label: 'Decision',
              type: 'select',
              options: [
                { value: 'pending', label: 'Pending' },
                { value: 'variant_a', label: 'Variant A' },
                { value: 'variant_b', label: 'Variant B' },
                { value: 'no_difference', label: 'No Difference' },
              ],
            },
          ]}
          isSubmitting={createABTest.isPending}
        />
      )}

      {editingTest && (
        <CreateEditDialog
          isOpen={!!editingTest}
          onClose={() => setEditingTest(null)}
          onSubmit={async (data) => {
            await updateABTest.mutateAsync({
              id: editingTest.id,
              data: data as UpdateABTestRequest,
            });
            setEditingTest(null);
          }}
          title="Edit AB Test"
          fields={[
            {
              key: 'experiment_key',
              label: 'Experiment Key',
              type: 'text',
              required: true,
            },
            {
              key: 'hypothesis',
              label: 'Hypothesis',
              type: 'textarea',
              required: true,
            },
            { key: 'variant_a', label: 'Variant A', type: 'text' },
            { key: 'variant_b', label: 'Variant B', type: 'text' },
            { key: 'metric_measured', label: 'Metric Measured', type: 'text' },
            { key: 'start_date', label: 'Start Date', type: 'date' },
            { key: 'end_date', label: 'End Date', type: 'date' },
            { key: 'result', label: 'Result', type: 'textarea' },
            {
              key: 'decision',
              label: 'Decision',
              type: 'select',
              options: [
                { value: 'pending', label: 'Pending' },
                { value: 'variant_a', label: 'Variant A' },
                { value: 'variant_b', label: 'Variant B' },
                { value: 'no_difference', label: 'No Difference' },
              ],
            },
          ]}
          initialData={editingTest}
          isSubmitting={updateABTest.isPending}
        />
      )}
    </div>
  );
}
