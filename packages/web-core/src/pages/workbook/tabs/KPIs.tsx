import { useState } from 'react';
import {
  useKPIs,
  useCreateKPI,
  useUpdateKPI,
  useDeleteKPI,
} from '@/shared/hooks/workbook/useWorkbookApi';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { PlusIcon } from '@phosphor-icons/react';
import { WorkbookTable } from './components/WorkbookTable';
import { CreateEditDialog } from './components/CreateEditDialog';
import type { KPI, CreateKPIRequest, UpdateKPIRequest } from './types';

interface ProjectWorkbookKPIsProps {
  projectId: string;
}

export function ProjectWorkbookKPIs({ projectId }: ProjectWorkbookKPIsProps) {
  const { data: kpis, isLoading } = useKPIs(projectId);
  const createKPI = useCreateKPI(projectId);
  const updateKPI = useUpdateKPI(projectId);
  const deleteKPI = useDeleteKPI(projectId);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null);

  const columns = [
    {
      key: 'name',
      label: 'Metric',
      render: (item: KPI) => (
        <span className="font-medium text-normal">{item.name}</span>
      ),
    },
    {
      key: 'unit',
      label: 'Unit',
      render: (item: KPI) => (
        <span className="text-low">{item.unit || '-'}</span>
      ),
    },
    {
      key: 'current_value',
      label: 'Current',
      render: (item: KPI) => (
        <span className="text-normal font-medium">
          {item.current_value !== null && item.current_value !== undefined ? item.current_value : '-'}
        </span>
      ),
    },
    {
      key: 'target_value',
      label: 'Target',
      render: (item: KPI) => (
        <span className="text-normal">
          {item.target_value !== null && item.target_value !== undefined ? item.target_value : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: KPI) => (
        <span className="text-low">{item.status || '-'}</span>
      ),
    },
  ];

  return (
    <div className="p-base">
      <div className="mb-base flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-normal mb-1">KPIs</h1>
          <p className="text-sm text-low">
            {kpis?.length || 0} KPI{kpis?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Tooltip content="Create a new KPI metric">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-lg flex items-center gap-2 transition-all duration-150 hover:scale-105"
          >
            <PlusIcon className="w-4 h-4" />
            Create KPI
          </Button>
        </Tooltip>
      </div>

      <WorkbookTable
        data={kpis || []}
        columns={columns}
        isLoading={isLoading}
        onEdit={setEditingKPI}
        onDelete={async (item) => {
          await deleteKPI.mutateAsync(item.id);
        }}
        emptyMessage="No KPIs yet"
      />

      {isCreateDialogOpen && (
        <CreateEditDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={async (data) => {
            await createKPI.mutateAsync(data as CreateKPIRequest);
            setIsCreateDialogOpen(false);
          }}
          title="Create KPI"
          fields={[
            { key: 'name', label: 'Metric Name', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'current_value', label: 'Current Value', type: 'number' },
            { key: 'target_value', label: 'Target Value', type: 'number' },
            { key: 'unit', label: 'Unit', type: 'text' },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'on_track', label: 'On Track' },
                { value: 'at_risk', label: 'At Risk' },
                { value: 'off_track', label: 'Off Track' },
                { value: 'achieved', label: 'Achieved' },
              ],
            },
          ]}
          isSubmitting={createKPI.isPending}
        />
      )}

      {editingKPI && (
        <CreateEditDialog
          isOpen={!!editingKPI}
          onClose={() => setEditingKPI(null)}
          onSubmit={async (data) => {
            await updateKPI.mutateAsync({
              id: editingKPI.id,
              data: data as UpdateKPIRequest,
            });
            setEditingKPI(null);
          }}
          title="Edit KPI"
          fields={[
            { key: 'name', label: 'Metric Name', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'current_value', label: 'Current Value', type: 'number' },
            { key: 'target_value', label: 'Target Value', type: 'number' },
            { key: 'unit', label: 'Unit', type: 'text' },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'on_track', label: 'On Track' },
                { value: 'at_risk', label: 'At Risk' },
                { value: 'off_track', label: 'Off Track' },
                { value: 'achieved', label: 'Achieved' },
              ],
            },
          ]}
          initialData={editingKPI}
          isSubmitting={updateKPI.isPending}
        />
      )}
    </div>
  );
}
