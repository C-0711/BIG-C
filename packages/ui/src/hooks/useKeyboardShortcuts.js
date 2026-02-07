import { useEffect } from 'react';

/**
 * useKeyboardShortcuts Hook
 * Registers keyboard shortcuts for graph controls
 */
export function useKeyboardShortcuts(shortcuts = {}) {
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Don't trigger if user is typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = event.key.toLowerCase();

      // Prevent default for registered shortcuts
      const shortcutKeys = Object.keys(shortcuts);
      if (shortcutKeys.includes(key)) {
        event.preventDefault();
      }

      // Execute shortcut
      switch (key) {
        case '+':
        case '=':
          shortcuts.zoomIn?.();
          break;
        case '-':
        case '_':
          shortcuts.zoomOut?.();
          break;
        case 'f':
          shortcuts.fitView?.();
          break;
        case 'e':
          shortcuts.export?.();
          break;
        case 'r':
          shortcuts.refresh?.();
          break;
        case 'escape':
        case 'esc':
          shortcuts.escape?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [shortcuts]);
}

/**
 * Default keyboard shortcuts configuration
 */
export const DEFAULT_SHORTCUTS = {
  zoomIn: '+',
  zoomOut: '-',
  fitView: 'F',
  export: 'E',
  refresh: 'R',
  escape: 'ESC',
};
