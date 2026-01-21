/**
 * Composable para gestión del modo de vista (grid/table)
 */

import { ref } from 'vue';

export type ViewMode = 'grid' | 'table';

export function useViewMode(initialMode: ViewMode = 'grid') {
  const viewMode = ref<ViewMode>(initialMode);

  function toggleViewMode() {
    viewMode.value = viewMode.value === 'grid' ? 'table' : 'grid';
  }

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode;
  }

  return {
    viewMode,
    toggleViewMode,
    setViewMode,
  };
}
