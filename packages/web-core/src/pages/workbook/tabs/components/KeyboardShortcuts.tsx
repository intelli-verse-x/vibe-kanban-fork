import React from 'react';

export function useKeyboardShortcuts(_config: unknown): void {
  // Stub: no-op
}

interface KeyboardShortcutsHelpProps {
  shortcuts: unknown;
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp(
  _props: KeyboardShortcutsHelpProps
): React.ReactElement | null {
  return null;
}

export function getWorkbookShortcuts(): unknown[] {
  return [];
}
