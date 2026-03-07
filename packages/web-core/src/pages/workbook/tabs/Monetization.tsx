import { useState } from 'react';
import {
  useMonetizationItems,
  useCreateMonetizationItem,
  useUpdateMonetizationItem,
  useDeleteMonetizationItem,
} from '@/shared/hooks/workbook/useWorkbookApi';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { PlusIcon } from '@phosphor-icons/react';
import { WorkbookTable } from './components/WorkbookTable';
import { CreateEditDialog } from './components/CreateEditDialog';
import type {
  MonetizationItem,
  CreateMonetizationItemRequest,
  UpdateMonetizationItemRequest,
} from './types';

interface ProjectWorkbookMonetizationProps {
  projectId: string;
}

export function ProjectWorkbookMonetization({
  projectId,
}: ProjectWorkbookMonetizationProps) {
  const { data: items, isLoading } = useMonetizationItems(projectId);
  const createItem = useCreateMonetizationItem(projectId);
  const updateItem = useUpdateMonetizationItem(projectId);
  const deleteItem = useDeleteMonetizationItem(projectId);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MonetizationItem | null>(null);

  const columns = [
    {
      key: 'revenue_stream',
      label: 'Revenue Stream',
      render: (item: MonetizationItem) => (
        <span className="font-medium text-normal">{item.revenue_stream}</span>
      ),
    },
    {
      key: 'monthly_revenue',
      label: 'Monthly Revenue',
      render: (item: MonetizationItem) => (
        <span className="text-normal font-medium">
          {item.monthly_revenue != null
            ? `$${item.monthly_revenue.toLocaleString()}`
            : '-'}
        </span>
      ),
    },
    {
      key: 'conversion_pct',
      label: 'Conversion %',
      render: (item: MonetizationItem) => (
        <span className="text-normal">
          {item.conversion_pct !== null ? `${item.conversion_pct}%` : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: MonetizationItem) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-500 text-white">
          {item.status || 'active'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-base">
      <div className="mb-base flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-normal mb-1">
            Monetization
          </h1>
          <p className="text-sm text-low">
            {items?.length || 0} revenue stream{items?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Tooltip content="Create a new revenue stream">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-lg flex items-center gap-2 transition-all duration-150 hover:scale-105"
          >
            <PlusIcon className="w-4 h-4" />
            Create Revenue Stream
          </Button>
        </Tooltip>
      </div>

      <WorkbookTable
        data={items || []}
        columns={columns}
        isLoading={isLoading}
        onEdit={setEditingItem}
        onDelete={async (item) => {
          await deleteItem.mutateAsync(item.id);
        }}
        emptyMessage="No monetization items yet"
      />

      {isCreateDialogOpen && (
        <CreateEditDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={async (data) => {
            await createItem.mutateAsync(data as CreateMonetizationItemRequest);
            setIsCreateDialogOpen(false);
          }}
          title="Create Revenue Stream"
          fields={[
            {
              key: 'revenue_stream',
              label: 'Revenue Stream',
              type: 'text',
              required: true,
            },
            {
              key: 'monthly_revenue',
              label: 'Monthly Revenue',
              type: 'number',
            },
            { key: 'conversion_pct', label: 'Conversion %', type: 'number' },
            {
              key: 'optimization_idea',
              label: 'Optimization Idea',
              type: 'textarea',
            },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'testing', label: 'Testing' },
              ],
            },
          ]}
          isSubmitting={createItem.isPending}
        />
      )}

      {editingItem && (
        <CreateEditDialog
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={async (data) => {
            await updateItem.mutateAsync({
              id: editingItem.id,
              data: data as UpdateMonetizationItemRequest,
            });
            setEditingItem(null);
          }}
          title="Edit Revenue Stream"
          fields={[
            {
              key: 'revenue_stream',
              label: 'Revenue Stream',
              type: 'text',
              required: true,
            },
            {
              key: 'monthly_revenue',
              label: 'Monthly Revenue',
              type: 'number',
            },
            { key: 'conversion_pct', label: 'Conversion %', type: 'number' },
            {
              key: 'optimization_idea',
              label: 'Optimization Idea',
              type: 'textarea',
            },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'testing', label: 'Testing' },
              ],
            },
          ]}
          initialData={editingItem}
          isSubmitting={updateItem.isPending}
        />
      )}
    </div>
  );
}
