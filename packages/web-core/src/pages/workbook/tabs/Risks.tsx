import { useState } from 'react';
import {
  useRisks,
  useCreateRisk,
  useUpdateRisk,
  useDeleteRisk,
} from '@/shared/hooks/workbook/useWorkbookApi';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { PlusIcon } from '@phosphor-icons/react';
import { WorkbookTable } from './components/WorkbookTable';
import { CreateEditDialog } from './components/CreateEditDialog';
import type { Risk, CreateRiskRequest, UpdateRiskRequest } from './types';

interface ProjectWorkbookRisksProps {
  projectId: string;
}

export function ProjectWorkbookRisks({ projectId }: ProjectWorkbookRisksProps) {
  const { data: risks, isLoading } = useRisks(projectId);
  const createRisk = useCreateRisk(projectId);
  const updateRisk = useUpdateRisk(projectId);
  const deleteRisk = useDeleteRisk(projectId);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);

  const columns = [
    {
      key: 'risk_key',
      label: 'Risk ID',
      render: (item: Risk) => (
        <span className="font-mono text-normal">{item.risk_key}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (item: Risk) => (
        <span className="text-normal">{item.description || '-'}</span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (item: Risk) => (
        <span className="text-low">{item.category || '-'}</span>
      ),
    },
    {
      key: 'risk_score',
      label: 'Risk Score',
      render: (item: Risk) => {
        const score = item.risk_score || 0;
        const color =
          score >= 15
            ? 'text-red-500'
            : score >= 10
              ? 'text-orange-500'
              : 'text-green-500';
        return <span className={`font-bold ${color}`}>{score}</span>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Risk) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-500 text-white">
          {item.status || 'identified'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-base">
      <div className="mb-base flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-normal mb-1">Risks</h1>
          <p className="text-sm text-low">
            {risks?.length || 0} risk{risks?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Tooltip content="Create a new risk entry">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-lg flex items-center gap-2 transition-all duration-150 hover:scale-105"
          >
            <PlusIcon className="w-4 h-4" />
            Create Risk
          </Button>
        </Tooltip>
      </div>

      <WorkbookTable
        data={risks || []}
        columns={columns}
        isLoading={isLoading}
        onEdit={setEditingRisk}
        onDelete={async (item) => {
          await deleteRisk.mutateAsync(item.id);
        }}
        emptyMessage="No risks yet"
      />

      {isCreateDialogOpen && (
        <CreateEditDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={async (data) => {
            await createRisk.mutateAsync(data as CreateRiskRequest);
            setIsCreateDialogOpen(false);
          }}
          title="Create Risk"
          fields={[
            {
              key: 'description',
              label: 'Description',
              type: 'textarea',
              required: true,
            },
            { key: 'category', label: 'Category', type: 'text' },
            {
              key: 'probability_1_5',
              label: 'Probability (1-5)',
              type: 'number',
            },
            { key: 'impact_1_5', label: 'Impact (1-5)', type: 'number' },
            {
              key: 'mitigation_plan',
              label: 'Mitigation Plan',
              type: 'textarea',
            },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'identified', label: 'Identified' },
                { value: 'mitigating', label: 'Mitigating' },
                { value: 'mitigated', label: 'Mitigated' },
                { value: 'accepted', label: 'Accepted' },
              ],
            },
          ]}
          isSubmitting={createRisk.isPending}
        />
      )}

      {editingRisk && (
        <CreateEditDialog
          isOpen={!!editingRisk}
          onClose={() => setEditingRisk(null)}
          onSubmit={async (data) => {
            await updateRisk.mutateAsync({
              id: editingRisk.id,
              data: data as UpdateRiskRequest,
            });
            setEditingRisk(null);
          }}
          title="Edit Risk"
          fields={[
            {
              key: 'description',
              label: 'Description',
              type: 'textarea',
              required: true,
            },
            { key: 'category', label: 'Category', type: 'text' },
            {
              key: 'probability_1_5',
              label: 'Probability (1-5)',
              type: 'number',
            },
            { key: 'impact_1_5', label: 'Impact (1-5)', type: 'number' },
            {
              key: 'mitigation_plan',
              label: 'Mitigation Plan',
              type: 'textarea',
            },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'identified', label: 'Identified' },
                { value: 'mitigating', label: 'Mitigating' },
                { value: 'mitigated', label: 'Mitigated' },
                { value: 'accepted', label: 'Accepted' },
              ],
            },
          ]}
          initialData={editingRisk}
          isSubmitting={updateRisk.isPending}
        />
      )}
    </div>
  );
}
