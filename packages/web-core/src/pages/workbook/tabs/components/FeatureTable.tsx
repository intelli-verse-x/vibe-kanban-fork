import type { Feature } from '../types';
import { cn } from '@/shared/lib/utils';

interface FeatureTableProps {
  features: Feature[];
  selectedFeatureId: string | null;
  onSelectFeature: (id: string) => void;
  onDeleteFeature: (id: string) => Promise<void>;
}

export function FeatureTable({
  features,
  selectedFeatureId,
  onSelectFeature,
  onDeleteFeature: _onDeleteFeature,
}: FeatureTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-secondary border-b border-border sticky top-0">
          <tr>
            <th className="text-left p-base text-sm font-medium text-normal">
              Feature ID
            </th>
            <th className="text-left p-base text-sm font-medium text-normal">
              Title
            </th>
            <th className="text-left p-base text-sm font-medium text-normal">
              Status
            </th>
            <th className="text-left p-base text-sm font-medium text-normal">
              Priority
            </th>
            <th className="text-left p-base text-sm font-medium text-normal">
              Owner
            </th>
            <th className="text-left p-base text-sm font-medium text-normal">
              Target Date
            </th>
            <th className="text-left p-base text-sm font-medium text-normal">
              Progress
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr
              key={feature.id}
              onClick={() => onSelectFeature(feature.id)}
              className={cn(
                'border-b border-border cursor-pointer transition-colors',
                'hover:bg-secondary/50',
                selectedFeatureId === feature.id && 'bg-brand/10'
              )}
            >
              <td className="p-base text-sm font-mono text-normal">
                {feature.feature_key}
              </td>
              <td className="p-base text-sm text-normal font-medium">
                {feature.title}
              </td>
              <td className="p-base">
                <StatusBadge status={feature.status} />
              </td>
              <td className="p-base">
                <PriorityBadge priority={feature.priority} />
              </td>
              <td className="p-base text-sm text-low">
                {feature.owner_user_id ? 'Assigned' : '-'}
              </td>
              <td className="p-base text-sm text-low">
                {feature.target_date
                  ? new Date(feature.target_date).toLocaleDateString()
                  : '-'}
              </td>
              <td className="p-base text-sm text-low">
                {feature.progress != null ? `${feature.progress}%` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="text-low">-</span>;

  const colors: Record<string, string> = {
    backlog: 'bg-slate-500',
    in_progress: 'bg-blue-500',
    blocked: 'bg-red-500',
    done: 'bg-green-500',
    cancelled: 'bg-gray-500',
  };

  return (
    <span
      className={cn(
        'px-2 py-1 rounded text-xs font-medium text-white',
        colors[status] || 'bg-gray-500'
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string | null | undefined }) {
  if (!priority) return <span className="text-low">-</span>;

  const colors: Record<string, string> = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  };

  return (
    <span
      className={cn(
        'px-2 py-1 rounded text-xs font-medium text-white',
        colors[priority] || 'bg-gray-500'
      )}
    >
      {priority}
    </span>
  );
}
