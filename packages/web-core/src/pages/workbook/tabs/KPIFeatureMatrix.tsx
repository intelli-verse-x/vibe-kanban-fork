import { useState } from 'react';
import {
  useKPIFeatureMatrix,
  useCreateKPIFeatureMatrix,
  useUpdateKPIFeatureMatrix,
  useDeleteKPIFeatureMatrix,
} from '@/shared/hooks/workbook/useWorkbookApi';
import { useFeatures } from '@/shared/hooks/workbook/useWorkbookApi';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { PlusIcon } from '@phosphor-icons/react';
import { WorkbookTable } from './components/WorkbookTable';
import { CreateEditDialog } from './components/CreateEditDialog';
import type {
  KPIFeatureMatrix,
  CreateKPIFeatureMatrixRequest,
  UpdateKPIFeatureMatrixRequest,
} from './types';

interface ProjectWorkbookKPIFeatureMatrixProps {
  projectId: string;
}

export function ProjectWorkbookKPIFeatureMatrix({
  projectId,
}: ProjectWorkbookKPIFeatureMatrixProps) {
  const { data: matrix, isLoading } = useKPIFeatureMatrix(projectId);
  const { data: features } = useFeatures(projectId);
  const createMatrix = useCreateKPIFeatureMatrix(projectId);
  const updateMatrix = useUpdateKPIFeatureMatrix(projectId);
  const deleteMatrix = useDeleteKPIFeatureMatrix(projectId);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMatrix, setEditingMatrix] = useState<KPIFeatureMatrix | null>(
    null
  );

  const getFeatureKey = (featureId: string) => {
    return features?.find((f) => f.id === featureId)?.feature_key || featureId;
  };

  const columns = [
    {
      key: 'feature_id',
      label: 'Feature',
      render: (item: KPIFeatureMatrix) => (
        <span className="font-mono text-normal">
          {getFeatureKey(item.feature_id)}
        </span>
      ),
    },
    {
      key: 'dau_impact',
      label: 'DAU Impact',
      render: (item: KPIFeatureMatrix) => (
        <span className="text-normal">{item.dau_impact_1_5 || '-'}/5</span>
      ),
    },
    {
      key: 'retention_impact',
      label: 'Retention Impact',
      render: (item: KPIFeatureMatrix) => (
        <span className="text-normal">
          {item.retention_impact_1_5 || '-'}/5
        </span>
      ),
    },
    {
      key: 'arpu_impact',
      label: 'ARPU Impact',
      render: (item: KPIFeatureMatrix) => (
        <span className="text-normal">{item.arpu_impact_1_5 || '-'}/5</span>
      ),
    },
    {
      key: 'virality_impact',
      label: 'Virality Impact',
      render: (item: KPIFeatureMatrix) => (
        <span className="text-normal">{item.virality_impact_1_5 || '-'}/5</span>
      ),
    },
    {
      key: 'strategic_value',
      label: 'Strategic Value',
      render: (item: KPIFeatureMatrix) => (
        <span className="text-normal">{item.strategic_value_1_5 || '-'}/5</span>
      ),
    },
  ];

  return (
    <div className="p-base">
      <div className="mb-base flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-normal mb-1">
            KPI Feature Matrix
          </h1>
          <p className="text-sm text-low">
            {matrix?.length || 0} feature{matrix?.length !== 1 ? 's' : ''}{' '}
            tracked
          </p>
        </div>
        <Tooltip content="Create a new KPI feature matrix entry">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-lg flex items-center gap-2 transition-all duration-150 hover:scale-105"
          >
            <PlusIcon className="w-4 h-4" />
            Create Matrix Entry
          </Button>
        </Tooltip>
      </div>

      <WorkbookTable
        data={matrix || []}
        columns={columns}
        isLoading={isLoading}
        onEdit={setEditingMatrix}
        onDelete={async (item) => {
          await deleteMatrix.mutateAsync(item.id);
        }}
        emptyMessage="No KPI feature matrix entries yet"
      />

      {isCreateDialogOpen && (
        <CreateEditDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={async (data) => {
            await createMatrix.mutateAsync(
              data as CreateKPIFeatureMatrixRequest
            );
            setIsCreateDialogOpen(false);
          }}
          title="Create KPI Feature Matrix Entry"
          fields={[
            {
              key: 'feature_id',
              label: 'Feature',
              type: 'select',
              required: true,
              options:
                features?.map((f) => ({
                  value: f.id,
                  label: `${f.feature_key} - ${f.title}`,
                })) || [],
            },
            {
              key: 'dau_impact_1_5',
              label: 'DAU Impact (1-5)',
              type: 'number',
            },
            {
              key: 'retention_impact_1_5',
              label: 'Retention Impact (1-5)',
              type: 'number',
            },
            {
              key: 'arpu_impact_1_5',
              label: 'ARPU Impact (1-5)',
              type: 'number',
            },
            {
              key: 'virality_impact_1_5',
              label: 'Virality Impact (1-5)',
              type: 'number',
            },
            {
              key: 'strategic_value_1_5',
              label: 'Strategic Value (1-5)',
              type: 'number',
            },
          ]}
          isSubmitting={createMatrix.isPending}
        />
      )}

      {editingMatrix && (
        <CreateEditDialog
          isOpen={!!editingMatrix}
          onClose={() => setEditingMatrix(null)}
          onSubmit={async (data) => {
            await updateMatrix.mutateAsync({
              id: editingMatrix.id,
              data: data as UpdateKPIFeatureMatrixRequest,
            });
            setEditingMatrix(null);
          }}
          title="Edit KPI Feature Matrix Entry"
          fields={[
            {
              key: 'dau_impact_1_5',
              label: 'DAU Impact (1-5)',
              type: 'number',
            },
            {
              key: 'retention_impact_1_5',
              label: 'Retention Impact (1-5)',
              type: 'number',
            },
            {
              key: 'arpu_impact_1_5',
              label: 'ARPU Impact (1-5)',
              type: 'number',
            },
            {
              key: 'virality_impact_1_5',
              label: 'Virality Impact (1-5)',
              type: 'number',
            },
            {
              key: 'strategic_value_1_5',
              label: 'Strategic Value (1-5)',
              type: 'number',
            },
          ]}
          initialData={editingMatrix}
          isSubmitting={updateMatrix.isPending}
        />
      )}
    </div>
  );
}
