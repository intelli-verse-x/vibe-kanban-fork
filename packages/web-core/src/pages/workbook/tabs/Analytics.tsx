import React from 'react';

interface ProjectWorkbookAnalyticsProps {
  projectId: string;
}

export function ProjectWorkbookAnalytics({ projectId }: ProjectWorkbookAnalyticsProps) {
  return (
    <div data-project-id={projectId}>Analytics - Coming Soon</div>
  );
}
