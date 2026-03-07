export function useKeyboardShortcuts(_config: unknown): void {
  // stub
}

interface KeyboardShortcutsHelpProps {
  shortcuts: unknown;
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp(_props: KeyboardShortcutsHelpProps) {
  return null;
}

export function getWorkbookShortcuts(
  _config?: Record<string, unknown>
): unknown[] {
  return [];
}
