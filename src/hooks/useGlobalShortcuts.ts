import { useHotkeys } from 'react-hotkeys-hook';

/**
 * Global application shortcuts.
 * Mount this at the top level (App.tsx) or Main Layout.
 */
export function useGlobalShortcuts() {
    // Esc: Global cancel/clear/blur (Optional, often handled by specific modals)
    useHotkeys('esc', () => {
        // Standard browser behavior often suffices, but we can force blur
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }, { enableOnFormTags: true });
}
