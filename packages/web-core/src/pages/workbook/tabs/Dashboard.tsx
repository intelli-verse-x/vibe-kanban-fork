interface ProjectWorkbookDashboardProps {
  projectId: string;
}

export function ProjectWorkbookDashboard({
  projectId,
}: ProjectWorkbookDashboardProps) {
  return <div data-project-id={projectId}>Dashboard - Coming Soon</div>;
}
