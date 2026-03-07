import { useState } from 'react';
import {
  useUserFeedback,
  useCreateUserFeedback,
  useUpdateUserFeedback,
  useDeleteUserFeedback,
} from '@/shared/hooks/workbook/useWorkbookApi';
import { Button } from '@vibe/ui/components/Button';
import { Tooltip } from '@vibe/ui/components/Tooltip';
import { PlusIcon } from '@phosphor-icons/react';
import { WorkbookTable } from './components/WorkbookTable';
import { CreateEditDialog } from './components/CreateEditDialog';
import type {
  UserFeedback,
  CreateUserFeedbackRequest,
  UpdateUserFeedbackRequest,
} from './types';

interface ProjectWorkbookUserFeedbackProps {
  projectId: string;
}

export function ProjectWorkbookUserFeedback({
  projectId,
}: ProjectWorkbookUserFeedbackProps) {
  const { data: feedback, isLoading } = useUserFeedback(projectId);
  const createFeedback = useCreateUserFeedback(projectId);
  const updateFeedback = useUpdateUserFeedback(projectId);
  const deleteFeedback = useDeleteUserFeedback(projectId);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<UserFeedback | null>(
    null
  );

  const columns = [
    {
      key: 'feedback_date',
      label: 'Date',
      render: (item: UserFeedback) => (
        <span className="text-normal">
          {item.feedback_date
            ? new Date(item.feedback_date).toLocaleDateString()
            : '-'}
        </span>
      ),
    },
    {
      key: 'channel',
      label: 'Channel',
      render: (item: UserFeedback) => (
        <span className="text-low">{item.channel || '-'}</span>
      ),
    },
    {
      key: 'summary',
      label: 'Summary',
      render: (item: UserFeedback) => (
        <span className="text-normal line-clamp-2">{item.summary}</span>
      ),
    },
    {
      key: 'sentiment',
      label: 'Sentiment',
      render: (item: UserFeedback) => {
        const colors: Record<string, string> = {
          positive: 'bg-green-500',
          neutral: 'bg-gray-500',
          negative: 'bg-red-500',
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs text-white ${
              colors[item.sentiment || 'neutral'] || 'bg-gray-500'
            }`}
          >
            {item.sentiment || 'neutral'}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: UserFeedback) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-500 text-white">
          {item.status || 'new'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-base">
      <div className="mb-base flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-normal mb-1">
            User Feedback
          </h1>
          <p className="text-sm text-low">
            {feedback?.length || 0} feedback item
            {feedback?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Tooltip content="Create a new user feedback entry">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-lg flex items-center gap-2 transition-all duration-150 hover:scale-105"
          >
            <PlusIcon className="w-4 h-4" />
            Create Feedback
          </Button>
        </Tooltip>
      </div>

      <WorkbookTable
        data={feedback || []}
        columns={columns}
        isLoading={isLoading}
        onEdit={setEditingFeedback}
        onDelete={async (item) => {
          await deleteFeedback.mutateAsync(item.id);
        }}
        emptyMessage="No user feedback yet"
      />

      {isCreateDialogOpen && (
        <CreateEditDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={async (data) => {
            await createFeedback.mutateAsync(data as CreateUserFeedbackRequest);
            setIsCreateDialogOpen(false);
          }}
          title="Create User Feedback"
          fields={[
            {
              key: 'feedback_date',
              label: 'Date',
              type: 'date',
              required: true,
            },
            { key: 'channel', label: 'Channel', type: 'text' },
            {
              key: 'summary',
              label: 'Summary',
              type: 'textarea',
              required: true,
            },
            {
              key: 'sentiment',
              label: 'Sentiment',
              type: 'select',
              options: [
                { value: 'positive', label: 'Positive' },
                { value: 'neutral', label: 'Neutral' },
                { value: 'negative', label: 'Negative' },
              ],
            },
            { key: 'action_taken', label: 'Action Taken', type: 'textarea' },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'new', label: 'New' },
                { value: 'reviewed', label: 'Reviewed' },
                { value: 'addressed', label: 'Addressed' },
                { value: 'closed', label: 'Closed' },
              ],
            },
          ]}
          isSubmitting={createFeedback.isPending}
        />
      )}

      {editingFeedback && (
        <CreateEditDialog
          isOpen={!!editingFeedback}
          onClose={() => setEditingFeedback(null)}
          onSubmit={async (data) => {
            await updateFeedback.mutateAsync({
              id: editingFeedback.id,
              data: data as UpdateUserFeedbackRequest,
            });
            setEditingFeedback(null);
          }}
          title="Edit User Feedback"
          fields={[
            {
              key: 'feedback_date',
              label: 'Date',
              type: 'date',
              required: true,
            },
            { key: 'channel', label: 'Channel', type: 'text' },
            {
              key: 'summary',
              label: 'Summary',
              type: 'textarea',
              required: true,
            },
            {
              key: 'sentiment',
              label: 'Sentiment',
              type: 'select',
              options: [
                { value: 'positive', label: 'Positive' },
                { value: 'neutral', label: 'Neutral' },
                { value: 'negative', label: 'Negative' },
              ],
            },
            { key: 'action_taken', label: 'Action Taken', type: 'textarea' },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'new', label: 'New' },
                { value: 'reviewed', label: 'Reviewed' },
                { value: 'addressed', label: 'Addressed' },
                { value: 'closed', label: 'Closed' },
              ],
            },
          ]}
          initialData={editingFeedback}
          isSubmitting={updateFeedback.isPending}
        />
      )}
    </div>
  );
}
