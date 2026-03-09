import { useState } from 'react';
import type { Feature, UpdateFeatureRequest } from '../types';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { XIcon } from '@phosphor-icons/react';

interface FeatureDetailPanelProps {
  feature: Feature;
  onClose: () => void;
  onUpdate: (data: UpdateFeatureRequest) => Promise<void>;
}

export function FeatureDetailPanel({
  feature,
  onClose,
  onUpdate: _onUpdate,
}: FeatureDetailPanelProps) {
  const [_isEditing, setIsEditing] = useState(false);
  const [isSaving, _setIsSaving] = useState(false);

  return (
    <div className="w-96 border-l border-border bg-secondary flex flex-col h-full">
      <div className="p-base border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-normal">Feature Details</h2>
        <Tooltip content="Close panel">
          <button
            onClick={onClose}
            className="p-1 hover:bg-primary rounded transition-all duration-150 hover:scale-110"
          >
            <XIcon className="w-5 h-5 text-low" />
          </button>
        </Tooltip>
      </div>

      <div className="flex-1 overflow-auto p-base space-y-base">
        <div>
          <label className="text-xs font-medium text-low uppercase">
            Feature ID
          </label>
          <div className="mt-1 font-mono text-sm text-normal">
            {feature.feature_key}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-low uppercase">
            Title
          </label>
          <div className="mt-1 text-sm text-normal">{feature.title}</div>
        </div>

        {feature.description && (
          <div>
            <label className="text-xs font-medium text-low uppercase">
              Description
            </label>
            <div className="mt-1 text-sm text-normal whitespace-pre-wrap">
              {feature.description}
            </div>
          </div>
        )}

        {feature.status && (
          <div>
            <label className="text-xs font-medium text-low uppercase">
              Status
            </label>
            <div className="mt-1 text-sm text-normal capitalize">
              {String(feature.status).replace('_', ' ')}
            </div>
          </div>
        )}

        {feature.priority && (
          <div>
            <label className="text-xs font-medium text-low uppercase">
              Priority
            </label>
            <div className="mt-1 text-sm text-normal capitalize">
              {feature.priority}
            </div>
          </div>
        )}

        {feature.progress != null && (
          <div>
            <label className="text-xs font-medium text-low uppercase">
              Progress
            </label>
            <div className="mt-1 text-sm text-normal">{feature.progress}%</div>
          </div>
        )}

        {feature.start_date && (
          <div>
            <label className="text-xs font-medium text-low uppercase">
              Start Date
            </label>
            <div className="mt-1 text-sm text-normal">
              {new Date(feature.start_date).toLocaleDateString()}
            </div>
          </div>
        )}

        {feature.target_date && (
          <div>
            <label className="text-xs font-medium text-low uppercase">
              Target Date
            </label>
            <div className="mt-1 text-sm text-normal">
              {new Date(feature.target_date).toLocaleDateString()}
            </div>
          </div>
        )}

        <div className="pt-base border-t border-border">
          <Button
            onClick={() => setIsEditing(true)}
            className="w-full rounded-lg"
            disabled={isSaving}
          >
            Edit Feature
          </Button>
        </div>
      </div>
    </div>
  );
}
