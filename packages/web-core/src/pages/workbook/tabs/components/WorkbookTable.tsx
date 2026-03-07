import { useState } from 'react';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { cn } from '@/shared/lib/utils';

interface WorkbookTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => Promise<void>;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
}

interface ColumnDef<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export function WorkbookTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  onEdit,
  onDelete,
  isLoading,
  error,
  emptyMessage = 'No items yet',
}: WorkbookTableProps<T>) {
  const [_sortColumn, _setSortColumn] = useState<string | null>(null);
  const [_sortDirection, _setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-low">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-error mb-2">Failed to load data</div>
        <div className="text-sm text-low">{error.message}</div>
      </div>
    );
  }

  const handleDelete = async (item: T) => {
    if (!onDelete) return;
    setDeleteError(null);
    try {
      await onDelete(item);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete item'
      );
    }
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-low mb-base">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border animate-in fade-in-0 duration-200">
      <table className="w-full border-collapse">
        <thead className="bg-secondary border-b border-border">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="text-left p-base text-sm font-medium text-normal"
              >
                {column.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="text-right p-base text-sm font-medium text-normal">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'border-b border-border transition-all duration-150',
                onRowClick &&
                  'cursor-pointer hover:bg-secondary/50 hover:shadow-sm'
              )}
            >
              {columns.map((column) => (
                <td key={column.key} className="p-base text-sm text-normal">
                  {column.render(item)}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="p-base text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <Tooltip content="Edit this item">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                          }}
                          className="rounded-lg transition-all duration-150 hover:scale-105"
                        >
                          Edit
                        </Button>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip content="Delete this item">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleDelete(item);
                          }}
                          className="rounded-lg text-error hover:text-error transition-all duration-150 hover:scale-105"
                        >
                          Delete
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {deleteError && (
        <div className="mt-2 p-2 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{deleteError}</p>
        </div>
      )}
    </div>
  );
}
