import React from 'react';

interface QuickSearchProps {
  isOpen: boolean;
  onClose: () => void;
  [key: string]: unknown;
}

export function QuickSearch(
  props: QuickSearchProps
): React.ReactElement | null {
  if (!props.isOpen) return null;
  return null;
}
