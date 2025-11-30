import { ref, computed } from 'vue'

export interface TableEditorConfig {
  showCellImages: boolean
  tableColorMode: 'functional' | 'confidence' | 'edited' | 'predef' | 'constraint'
  theme: 'light' | 'dark'
  tableEditFontSize?: number
  tableEditZoom?: number
  cellImageSize?: number
  tableEditAutoSave?: boolean
}

const defaultConfig: TableEditorConfig = {
  showCellImages: false,
  tableColorMode: 'functional',
  theme: 'light',
  tableEditFontSize: 12,
  tableEditZoom: 100,
  cellImageSize: 120,
  tableEditAutoSave: true
}

const config = ref<TableEditorConfig>({ ...defaultConfig })

export function useConfigManagement() {
  const showCellImages = computed(() => config.value.showCellImages)
  const tableColorMode = computed(() => config.value.tableColorMode)
  const theme = computed(() => config.value.theme)

  const updateConfig = (updates: Partial<TableEditorConfig>) => {
    config.value = { ...config.value, ...updates }
  }

  const resetConfig = () => {
    config.value = { ...defaultConfig }
  }

  return {
    config,
    showCellImages,
    tableColorMode,
    theme,
    updateConfig,
    resetConfig
  }
}
