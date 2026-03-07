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

        {feature.category && (
          <div>
            <label className="text-xs font-medium text-low uppercase">
              Category
            </label>
            <div className="mt-1 text-sm text-normal">{feature.category}</div>
          </div>
        )}

        {feature.problem_statement && (
          <div>
            <label className="text-xs font-medium text-low uppercase">
              Problem Statement
            </label>
            <div className="mt-1 text-sm text-normal whitespace-pre-wrap">
              {feature.problem_statement}
            </div>
          </div>
        )}

        {feature.business_goal && (
          <div>
            <label className="text-xs font-medium text-low uppercase">
              Business Goal
            </label>
            <div className="mt-1 text-sm text-normal whitespace-pre-wrap">
              {feature.business_goal}
            </div>
          </div>
        )}

        {feature.notes && (
          <div>
            <label className="text-xs font-medium text-low uppercase">
              Notes
            </label>
            <div className="mt-1 text-sm text-normal whitespace-pre-wrap">
              {feature.notes}
            </div>
          </div>
        )}

        {feature.target_release_date && (
          <div>
            <label className="text-xs font-medium text-low uppercase">
              Target Release
            </label>
            <div className="mt-1 text-sm text-normal">
              {new Date(feature.target_release_date).toLocaleDateString()}
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
