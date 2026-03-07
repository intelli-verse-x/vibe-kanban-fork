import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

export const workbookTabSchema = z.enum([
  'board',
  'dashboard',
  'tasks',
  'features',
  'kpis',
  'sprint-tracker',
  'bugs',
  'monetization',
  'ab-tests',
  'risks',
  'user-feedback',
  'releases',
  'kpi-feature-matrix',
  'time-tracking',
  'analytics',
]);

export type WorkbookTab = z.infer<typeof workbookTabSchema>;

export const projectSearchSchema = z.object({
  tab: workbookTabSchema.optional(),
});

export type ProjectSearch = z.infer<typeof projectSearchSchema>;

export const projectSearchValidator = zodValidator(projectSearchSchema);
