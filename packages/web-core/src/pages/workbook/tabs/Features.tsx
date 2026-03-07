interface ProjectWorkbookFeaturesProps {
  projectId: string;
}

export function ProjectWorkbookFeatures({
  projectId,
}: ProjectWorkbookFeaturesProps) {
  return <div data-project-id={projectId}>Features - Coming Soon</div>;
}
