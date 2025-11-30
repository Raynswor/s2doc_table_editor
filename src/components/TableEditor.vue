<template>
  <BaseEditor title="Table Editor" icon="mdi-table" :show-title="false" content-class="p-0" @save="handleSave"
    @change="handleChange">
    <template #content>
      <div class="flex flex-col h-100" style="overscroll-behavior: contain;">
        <!-- Toolbar -->
        <v-sheet class="toolbar-container" elevation="2" :disabled="!tableMatrix || tableMatrix.length <= 0">
          <div class="d-flex align-center justify-space-between px-4 py-3 gap-4">
            <!-- File Operations Section -->
            <div class="toolbar-section">
              <template v-for="btn in fileControls" :key="btn.key">
                <v-btn :icon="btn.icon" :disabled="btn.disabled" :title="btn.title" density="comfortable" size="default"
                  @click="btn.action" />
              </template>
              <div class="section-label">
                File
              </div>
            </div>

            <v-divider vertical class="mx-2" />

            <!-- Selection Section -->
            <div class="toolbar-section">
              <template v-for="btn in selectionControls" :key="btn.key">
                <v-btn :icon="btn.icon" :disabled="btn.disabled" :title="btn.title" density="comfortable" size="default"
                  @click="btn.action" />
              </template>
              <div class="section-label">
                Selection
              </div>
            </div>

            <v-divider vertical class="mx-2" />

            <!-- Table Structure Section -->
            <div class="toolbar-section">
              <div class="d-flex align-center ">
                <!-- Add Controls -->
                <div class="add-controls">
                  <div class="arrow-nav">
                    <template v-for="ctrl in structureAddControls" :key="ctrl.key">
                      <div :class="ctrl.area">
                        <template v-if="ctrl.type === 'button'">
                          <v-btn :icon="ctrl.icon" :title="ctrl.title" density="comfortable" size="default"
                            @click="ctrl.action" />
                        </template>
                        <template v-else>
                          <v-icon :color="ctrl.color || 'primary'">{{ ctrl.icon }}</v-icon>
                        </template>
                      </div>
                    </template>
                  </div>
                </div>

                <div class="d-flex flex-column px-4" style="gap: 8px;">
                  <template v-for="btn in structureDeleteControls" :key="btn.key">
                    <v-btn :icon="btn.icon" :title="btn.title" density="comfortable" size="default"
                      @click="btn.action" />
                  </template>
                </div>

                <!-- Recalibration Control -->
                <div class="d-flex justify-center flex-column align-center">
                  <v-btn v-if="enableUnassignedCells && documentContext && tableElementId" icon="mdi-table-refresh"
                    title="Recalibrate table structure (update row/column elements)" density="comfortable"
                    size="default" color="info" :loading="recalibrationLoading" @click="recalibrateTableStructure" />
                </div>
              </div>
              <div class="section-label">
                Structure
              </div>
            </div>

            <v-divider vertical class="mx-2" />

            <!-- Cell Operations Section -->
            <div class="toolbar-section">
              <div class="d-flex align-center">
                <!-- Move Controls -->
                <div class="move-controls">
                  <div class="arrow-nav">
                    <template v-for="ctrl in cellMoveControls" :key="ctrl.key">
                      <div :class="ctrl.area">
                        <template v-if="ctrl.type === 'button'">
                          <v-btn :icon="ctrl.icon" :title="ctrl.title" density="comfortable" size="default"
                            @click="ctrl.action" />
                        </template>
                        <template v-else>
                          <v-icon :color="ctrl.color || 'secondary'">{{ ctrl.icon }}</v-icon>
                        </template>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Merge/Split Controls -->
                <div class="d-flex flex-column px-4" style="gap: 8px;">
                  <template v-for="btn in mergeSplitControls" :key="btn.key">
                    <v-btn :icon="btn.icon" :title="btn.title" density="comfortable" size="default"
                      @click="btn.action" />
                  </template>
                </div>

                <!-- Unassigned Cells Control -->
                <div class="d-flex flex-column px-4" style="gap: 8px;">
                  <v-btn v-if="enableUnassignedCells && documentContext && tableElementId"
                    :icon="unassignedCellsCount > 0 ? 'mdi-table-plus' : 'mdi-table-check'"
                    :title="`Include ${unassignedCellsCount} unassigned table cells`" density="comfortable"
                    size="default" :color="unassignedCellsCount > 0 ? 'warning' : 'success'"
                    :disabled="unassignedCellsCount === 0" class="unassigned-cell-button"
                    @click="includeUnassignedCells">
                    <v-badge v-if="unassignedCellsCount > 0" :content="unassignedCellsCount" color="error">
                      <v-icon>mdi-table-plus</v-icon>
                    </v-badge>
                    <v-icon v-else>mdi-table-check</v-icon>
                  </v-btn>
                  <v-btn v-if="enableUnassignedCells && documentContext" icon="mdi-content-cut"
                    title="Divide cell by s2doc references" density="comfortable" size="default"
                    :disabled="selection.length !== 1" @click="divideCell" />
                </div>
              </div>
              <div class="section-label">
                Cells
                <v-tooltip v-if="enableUnassignedCells && documentContext && tableElementId" :text="unassignedCellsCount > 0 ?
                  `Found ${unassignedCellsCount} table cells that may have been missed during extraction` :
                  'All table cells appear to be included in the matrix'">
                  <template #activator="{ props }">
                    <v-icon v-bind="props" size="12" class="ml-1">
                      mdi-information-outline
                    </v-icon>
                  </template>
                </v-tooltip>
              </div>
            </div>

            <v-divider vertical class="mx-2" />

            <!-- Edit Mode Section -->
            <div class="toolbar-section edit-mode-section">
              <v-btn-toggle v-model="editMode" density="compact" color="primary" mandatory class="edit-mode-toggle">
                <v-btn value="text" size="default" title="Click to edit cell content">
                  <v-icon size="16" class="mr-1">
                    mdi-pencil
                  </v-icon>
                  Text
                </v-btn>
                <v-btn value="select" size="default" title="Arrow keys navigate selection">
                  <v-icon size="16" class="mr-1">
                    mdi-cursor-pointer
                  </v-icon>
                  Select
                </v-btn>
                <v-btn value="move" size="default" title="Arrow keys move selected cells">
                  <v-icon size="16" class="mr-1">
                    mdi-cursor-move
                  </v-icon>
                  Move
                </v-btn>
              </v-btn-toggle>

              <div class="cell-content-editor">
                <v-textarea v-model="selectionContent" label="Edit selected cell content"
                  :placeholder="selection.length > 0 ? `Editing ${selection.length} cell(s)` : 'Select a cell to edit'"
                  rows="2" density="compact" hide-details variant="outlined" no-resize
                  :disabled="selection.length === 0" @blur="cellContentEvent(undefined, selection[0] || '')"
                  @keydown.ctrl.enter="cellContentEvent(undefined, selection[0] || '')" />
              </div>
              <div class="section-label">
                Edit Mode
                <v-tooltip
                  text="Text: Edit cell content | Select: Navigate selection with arrow keys | Move: Move cells with arrow keys">
                  <template #activator="{ props }">
                    <v-icon v-bind="props" size="12" class="ml-1">
                      mdi-help-circle-outline
                    </v-icon>
                  </template>
                </v-tooltip>
              </div>
            </div>

            <v-divider vertical class="mx-2" />

            <!-- Visualization Section -->
            <div class="toolbar-section visualization-section">
              <v-select style="max-height: 32px;min-width: 196px;max-width:196px;" v-model="colorMode" :items="[
                { value: 'functional', title: 'Functional' },
                { value: 'confidence', title: 'Confidence Levels' },
                { value: 'edited', title: 'Edit Status' },
                { value: 'predef', title: 'Predefined Colors' },
                { value: 'constraint', title: 'Constraint Validation' }
              ]" item-title="title" item-value="value" label="Color Mode" density="compact" hide-details
                variant="outlined" />

              <div class="color-mode-controls" style="flex-grow: 1;">
                <template v-if="colorMode === 'functional'">
                  <div class="functional-controls">
                    <v-btn-toggle v-model="labelType" mandatory density="compact">
                      <v-btn icon="mdi-block-helper" class="nolabel" size="small" title="No label (normal cell)"
                        @click="onLabelChange('noLabel')" />
                      <v-btn class="rowlabel" size="small" title="Row header cell" @click="onLabelChange('rowLabel')">
                        <v-icon size="14">
                          mdi-table-row
                        </v-icon>
                      </v-btn>
                      <v-btn class="columnlabel" size="small" title="Column header cell"
                        @click="onLabelChange('columnLabel')">
                        <v-icon size="14">
                          mdi-table-column
                        </v-icon>
                      </v-btn>
                    </v-btn-toggle>
                  </div>
                </template>
                <template v-else-if="colorMode === 'edited'">
                  <div class="edited-controls">
                    <v-btn-toggle v-model="editedState" mandatory density="compact">
                      <v-btn class="not-edited" size="small" title="To be determined" @click="toggleEditedState('tbd')">
                        TBD
                      </v-btn>
                      <v-btn class="correct" size="small" title="Correctly edited" @click="toggleEditedState('edited')">
                        <v-icon size="14">
                          mdi-check
                        </v-icon>
                      </v-btn>
                      <v-btn class="ignore" size="small" title="Ignore this cell" @click="toggleEditedState('ignore')">
                        <v-icon size="14">
                          mdi-close
                        </v-icon>
                      </v-btn>
                    </v-btn-toggle>
                  </div>
                </template>
                <template v-else-if="colorMode === 'constraint'">
                  <div class="constraint-controls">
                    <div class="d-flex gap-1">
                      <v-btn variant="outlined" size="small" title="Validate with AND logic"
                        @click="checkTableConstraints()">
                        <v-icon size="14" class="mr-1">
                          mdi-logic-and
                        </v-icon>
                        AND
                      </v-btn>
                      <v-btn variant="outlined" size="small" title="Validate with OR logic"
                        @click="checkTableConstraints()">
                        <v-icon size="14" class="mr-1">
                          mdi-logic-or
                        </v-icon>
                        OR
                      </v-btn>
                    </div>
                  </div>
                </template>
                <template v-else-if="colorMode === 'confidence'">
                  <div class="confidence-legend">
                    <div class="legend-items">
                      <div class="legend-item">
                        <div class="legend-color high-conf" />
                        <span>High (80%+)</span>
                      </div>
                      <div class="legend-item">
                        <div class="legend-color medium-conf" />
                        <span>Medium (50-80%)</span>
                      </div>
                      <div class="legend-item">
                        <div class="legend-color low-conf" />
                        <span>Low (<50%) </span>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else-if="colorMode === 'predef'">
                  <div v-if="predefinedColors.length === 0" class="text-caption">No predefined colors found in this
                    table</div>
                  <div v-else class="color-grid">
                    <div v-for="(c, idx) in predefinedColors" :key="c + '-' + idx" class="color-swatch"
                      @click="applyPredefColor(c)">
                      <v-tooltip :text="c">
                        <template #activator="{ props }">
                          <div v-bind="props" class="swatch" :style="{ background: c }" />
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="placeholder-content">
                    <v-icon size="24" color="grey-lighten-1">
                      mdi-palette-outline
                    </v-icon>
                    <div class="text-caption text-center">
                      Select a color mode above
                    </div>
                  </div>
                </template>
              </div>
              <!-- </div> -->
              <div class="section-label">
                Visualization
                <v-tooltip text="Control how table cells are colored and displayed">
                  <template #activator="{ props }">
                    <v-icon v-bind="props" size="12" class="ml-1">
                      mdi-help-circle-outline
                    </v-icon>
                  </template>
                </v-tooltip>
              </div>
            </div>
          </div>
        </v-sheet>

        <!-- Table Editor -->
        <div ref="tableContainerRef" class="d-flex align-start justify-center flex-grow mx-8 my-2"
          style="max-height: 72vh; overflow-y: scroll; overflow-x: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;">
          <table v-if="tableMatrix && tableMatrix.length > 0" class="table-auto min-w-100"
            :style="{ fontSize: fontSize + 'pt' }" tabindex="0"
            @focus="() => { /* Table is focused, ready for keyboard navigation */ }"
            @keydown="handleKeyboardNavigation">
            <tbody>
              <tr v-for="(row, rowIndex) in displayMatrix" :key="rowIndex">
                <td v-for="cell in row" :id="getCellId(cell)" :key="getCellId(cell)"
                  :colspan="cell.colSpan && cell.colSpan > 1 ? cell.colSpan : 1"
                  :rowspan="cell.rowSpan && cell.rowSpan > 1 ? cell.rowSpan : 1" :class="getClasses(cell)"
                  :style="{ background: getColor(cell) }" @click="highlightEvent(getCellId(cell))"
                  @mouseover="verboseConstraints = getCellId(cell); preloadVisibleCellImages()"
                  @mouseleave="verboseConstraints = ''">
                  <div class="d-flex flex-column align-center">
                    <!-- Display cell image snippet if enabled and available -->
                    <img v-if="showCellImages && cell.img" class="zoomable" :src="cell.img"
                      :style="{ width: cellImageSize + 'px', height: cellImageSize + 'px', objectFit: 'cover' }">
                    <div :id="'co' + getCellId(cell)" class="edit-table-cell" :contenteditable="editMode === 'text'"
                      @blur="cellContentEvent($event, getCellId(cell))"
                      @keydown.enter.prevent="cellContentEvent($event, getCellId(cell))"
                      @keydown.arrow-up.prevent="handleTextModeArrow($event, getCellId(cell), 'up')"
                      @keydown.arrow-down.prevent="handleTextModeArrow($event, getCellId(cell), 'down')"
                      @keydown.arrow-left.prevent="handleTextModeArrow($event, getCellId(cell), 'left')"
                      @keydown.arrow-right.prevent="handleTextModeArrow($event, getCellId(cell), 'right')"
                      @click.stop="editMode === 'text' ? onTextModeCellClick(getCellId(cell)) : null">
                      {{ cell.data.content }}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Caption -->
        <v-sheet v-if="colorMode === 'constraint' && verboseConstraints"
          class="absolute z-10 px-1 py-1 text-sm font-medium bg-gray-900 text-white rounded-lg shadow-sm"
          style="width: 512px; top: -5px; right: 0;">
          <p>"TESTING"</p>
        </v-sheet>
      </div>
    </template>
  </BaseEditor>
</template>

<script lang="ts">
// Type definitions that need to be available for defineProps
// Using proper s2doc types
import type { Element as S2DocElement } from '../s2doc-types/element.model'

export interface Element extends S2DocElement {
  // Extend if needed for table-specific properties
}

export enum ColorMode {
  FUNCTIONAL = 'functional',
  CONFIDENCE = 'confidence',
  EDITED = 'edited',
  PREDEF = 'predef',
  CONSTRAINT = 'constraint'
}
</script>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useConfigManagement } from '@/composables/useConfigManagement'
import { useOperationManager } from '@/composables/useOperationManager'
import { TableCell, RectangleRegion, makeid, areMatricesEquivalent, isTableCell, getCellId } from '@/utils/tableHelpers'
import BaseEditor from './BaseEditor.vue'

// Types from the regular script block are already in scope
// No need to import them

// Stub for API calls in standalone mode
const useDocumentApi = () => ({
  recalibrateTableStructure: async (_docId: string, _tableId: string) => ({
    status: 'success',
    message: 'Table structure updated successfully (Stub)'
  }),
  divideTableCell: async (_docId: string, cellId: string) => ({
    status: 'success',
    original_cell_id: cellId,
    new_cell_ids: [cellId + '_1', cellId + '_2'],
    total_divisions: 2,
    message: 'Cell divided successfully (Stub)',
    placed_positions: []
  })
})

const { showError } = useOperationManager({
  showUserNotifications: true,
  retryAttempts: 1
});

// Helper functions are now imported from @/utils/tableHelpers

const props = defineProps({
  initialTableMatrix: {
    type: Array<Array<Element | string | undefined>>, default: () => [
      [Object.assign({
        category: "TableCell", boundingBox: { x1: 0, x2: 0, y1: 0, y2: 0 }, data: { content: "" }
      }, { oid: "0", data: { content: "stub" } }), "0", Object.assign({
        category: "TableCell", boundingBox: { x1: 0, x2: 0, y1: 0, y2: 0 }, data: { content: "" }
      }, { oid: "2", data: { content: "col1" } }), Object.assign({
        category: "TableCell", boundingBox: { x1: 0, x2: 0, y1: 0, y2: 0 }, data: { content: "" }
      }, { oid: "3", data: { content: "col2" } })],
      [Object.assign({
        category: "TableCell", boundingBox: { x1: 0, x2: 0, y1: 0, y2: 0 }, data: { content: "" }
      }, { oid: "4", data: { content: "row0" } }), Object.assign({
        category: "TableCell", boundingBox: { x1: 0, x2: 0, y1: 0, y2: 0 }, data: { content: "" }
      }, { oid: "5", data: { content: "1" } }), Object.assign({
        category: "TableCell", boundingBox: { x1: 0, x2: 0, y1: 0, y2: 0 }, data: { content: "" }
      }, { oid: "-6", data: { content: "" } }), Object.assign({
        category: "TableCell", boundingBox: { x1: 0, x2: 0, y1: 0, y2: 0 }, data: { content: "" }
      }, { oid: "7", data: { content: "3" } })],
    ]
  },
  constraintMatrix: { type: Array, default: () => undefined },
  editOpsTracker: {
    type: Object,
    default: () => ({
      addRow: 0,
      addColumn: 0,
      deleteRow: 0,
      deleteColumn: 0,
      merge: 0,
      split: 0,
      move: 0,
      changeText: 0,
      changeLabel: 0,
    })
  },
  // New props for document context and unassigned cells functionality
  documentContext: {
    type: Object,
    default: () => null
  },
  tableElementId: {
    type: String,
    default: () => ''
  },
  enableUnassignedCells: {
    type: Boolean,
    default: () => true
  },
  pageImage: {
    type: String,
    default: () => undefined
  }
})

watch(() => props.initialTableMatrix, (newMatrix, oldMatrix) => {
  // Only initialize the table once, or if explicitly resetting
  if (!isInitialized.value) {
    selectionContent.value = ''
    selection.value = []
    tableMatrix.value = convertAreaToTableCellMatrix()
    updateTableMatrixMap()
    isInitialized.value = true
    return;
  }

  // Don't reset the table if we're currently saving or have unsaved changes
  if (isSaving.value || hasUnsavedChanges.value || areMatricesEquivalent(newMatrix, oldMatrix)) {
    return;
  }
  selectionContent.value = ''
  selection.value = []
  tableMatrix.value = convertAreaToTableCellMatrix()
  updateTableMatrixMap()
})

const emit = defineEmits<{
  (e: 'errorEvent', error: string): void;
  (e: 'saveEvent', data: any): void;
  (e: 'constraintEvent', data: any): void;
  (e: 'save'): void;
  (e: 'change', value: any): void;
  (e: 'tableRecalibrated', data: { documentId: string; tableId: string; message: string }): void;
  (e: 'cellDivided', data: { originalCellId: string; newCellIds: string[]; totalDivisions: number; message: string }): void;
}>();

onMounted(() => {
  tableMatrix.value = convertAreaToTableCellMatrix()
  selectionContent.value = ''
  selection.value = []
  updateTableMatrixMap()

  // If pageImage wasn't passed as prop, try to load from document
  if (!pageImage.value && props.documentContext?.pages) {
    const pages = props.documentContext.pages?.byId || {};
    for (const pageId of Object.keys(pages)) {
      const page = pages[pageId];
      // Try decoded image first, then fall back to raw base64
      const decodedImage = (page as any).decodedImage;
      if (decodedImage) {
        const canvas = document.createElement('canvas');
        canvas.width = decodedImage.width;
        canvas.height = decodedImage.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(decodedImage, 0, 0);
          pageImage.value = canvas.toDataURL('image/jpeg', 0.85);
        }
        break;
      } else if (page.img) {
        // Ensure that the image is a proper data URL
        let imageSrc = page.img;
        if (!imageSrc.startsWith('data:')) {
          imageSrc = `data:image/jpeg;base64,${imageSrc}`;
        }
        pageImage.value = imageSrc;
        break;
      }
    }
  } else if (pageImage.value) {
  } else {
    // Standalone mode: pageImage and documentContext are optional
    // console.warn('⚠️ No pageImage and no documentContext.pages');
  }
})

onUnmounted(() => {
  // Clean up any pending save timer
  if (saveDebounceTimer.value) {
    clearTimeout(saveDebounceTimer.value);
    saveDebounceTimer.value = null;
  }

  // Clear image cache and loading queue
  cellImageCache.clear();
  cellImageLoadingQueue.value.clear();
  imageExtractionWorker.value = false;
  imagedCellsUpdated.value = 0;
})

// All the reactive refs and computed properties from original TableEditor
const colorMode = ref<ColorMode>(ColorMode.FUNCTIONAL);
const tableMatrix = ref<(TableCell | string)[][]>([]);
const selection = ref<string[]>([]);
const zoomLevel = ref<number>(100);
const fontSize = ref<number>(12);
const verboseConstraints = ref<string>('');
const undoStack = ref<any[]>([]);
const redoStack = ref<any[]>([]);
const selectionContent = ref<string>('');
const multiSelectEnabled = ref<boolean>(true);
const editMode = ref<'text' | 'select' | 'move'>('select');
watch(() => editMode.value, () => {
  // clear selection
  selection.value = [];
});
const labelType = ref<string>('');
const editedState = ref<string>('');
const isSaving = ref<boolean>(false);
const hasUnsavedChanges = ref<boolean>(false);
const isInitialized = ref<boolean>(false);
const saveDebounceTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const isUpdatingFromCell = ref<boolean>(false);

// Cell image snippet toggle and caching
const cellImageCache = reactive(new Map<string, string>()); // cellId -> base64 image data URL
const cellImageLoadingQueue = ref<Set<string>>(new Set());
const imageExtractionWorker = ref<boolean>(false);
const imagedCellsUpdated = ref<number>(0); // Trigger for reactivity when images update
const showCellImages = ref<boolean>(false); // Local ref, will be synced with config
const pageImage = ref<string | undefined>(undefined); // Current page image
const decodedPageImage = ref<HTMLImageElement | ImageBitmap | null>(null); // Cached decoded image for faster processing
const pageImageLoadPromise = ref<Promise<void> | null>(null); // Promise for image loading
const tableContainerRef = ref<HTMLDivElement | null>(null); // Reference to scrollable table container

// Watcher to sync pageImage prop to internal ref
watch(() => props.pageImage, (newImage) => {
  pageImage.value = newImage;
}, { immediate: true })

// Watcher to pre-decode page image for faster cell extraction
watch(() => pageImage.value, (newPageImage) => {
  if (!newPageImage) {
    decodedPageImage.value = null;
    pageImageLoadPromise.value = null;
    return;
  }
  pageImageLoadPromise.value = new Promise((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let resolved = false;

    const finish = () => {
      if (!resolved) {
        resolved = true;
        if (timeoutId !== null) clearTimeout(timeoutId);
        resolve();
      }
    };

    const img = new Image();
    img.onload = () => {
      decodedPageImage.value = img;
      finish();
    };
    img.onerror = () => {
      decodedPageImage.value = null;
      finish();
    };

    // Set a timeout to prevent hanging on large images
    timeoutId = setTimeout(() => {
      finish();
    }, 10000); // 10 second timeout

    try {
      const src = newPageImage.startsWith('data:') ? newPageImage : `data:image/jpeg;base64,${newPageImage}`;
      img.src = src;
    } catch (error) {
      decodedPageImage.value = null;
      finish();
    }
  });
}, { immediate: true })

watch(() => editMode.value, val => {
  multiSelectEnabled.value = val === 'select' || val === 'move'
})

// Watch for changes to showCellImages and preload images
watch(() => showCellImages.value, (newVal) => {
  if (newVal) {
    // Defer preloading to next frame
    requestAnimationFrame(() => {
      preloadVisibleCellImages();
    });
  }
}, { immediate: true })

// Watch for image updates and force reactivity
watch(() => imagedCellsUpdated.value, () => {
  // This watcher exists to trigger component re-renders when images are loaded
  // Accessing createDisplayMatrix will force Vue to re-compute display
})

// Watch for changes to selectionContent and update cell content
watch(() => selectionContent.value, (newContent, oldContent) => {
  if (isUpdatingFromCell.value) return; // Prevent recursive updates

  if (selection.value.length === 1 && newContent !== oldContent) {
    const cellId = selection.value[0]!;
    const cell = tableMatrixMap_ID_CELL.get(cellId);
    if (cell && cell.data.content !== newContent) {
      cell.data.content = newContent;

      // Check if this is a dummy cell being converted to a real cell
      const isDummyCell = cellId.startsWith("dummy");

      if (isDummyCell && newContent && newContent.length > 0 && props.documentContext?.elements?.byId) {
        // Generate a new real cell ID
        const newCellId = makeid(18);

        // Create a new TableCell element in the document context
        const newTableCell = new TableCell(
          newCellId,
          cell.region,
          {
            content: newContent,
            row_label: cell.data.row_label || false,
            column_label: cell.data.column_label || false,
            color: cell.data.color
          },
          cell.confidence,
          true, // mark as added
          false,
          cell.img,
          cell.rowSpan,
          cell.colSpan
        );

        // Add the new cell to the document context
        if (props.documentContext?.elements) {
          props.documentContext.elements.byId[newCellId] = newTableCell;
        }

        // Add reference from table to new cell
        if (props.tableElementId && props.documentContext?.addReference) {
          props.documentContext.addReference(props.tableElementId, newCellId);
        }

        // Update the cell's OID in the matrix
        cell.oid = newCellId;

        // Find and update the cell in tableMatrix
        for (let r = 0; r < tableMatrix.value.length; r++) {
          const row = tableMatrix.value[r];
          if (!row) continue;
          for (let c = 0; c < row.length; c++) {
            const matrixCell = row[c];
            if (isTableCell(matrixCell) && matrixCell === cell) {
              row[c] = cell;
            } else if (matrixCell === cellId) {
              // Also update string references to this cell
              row[c] = newCellId;
            }
          }
        }

        // Update the maps with new ID
        updateTableMatrixMap();

        // Update selection with new ID
        selection.value[0] = newCellId;

        // console.log(`✅ Converted dummy cell ${cellId} to real cell ${newCellId}`);

        props.editOpsTracker.changeText++;
        // Save the complete table structure since we added a new element
        saveMatrixBackToTableElement();
      } else {
        // Normal update for existing real cells
        props.editOpsTracker.changeText++;
        saveCellDataOnly([cellId]);
      }
    }
  }
})

// Update selectionContent when selection changes
watch(() => selection.value, (newSelection) => {
  isUpdatingFromCell.value = true;
  if (newSelection.length === 1) {
    const cell = tableMatrixMap_ID_CELL.get(newSelection[0]!);
    if (cell) {
      selectionContent.value = cell.data.content || '';
    }
  } else {
    selectionContent.value = '';
  }
  setTimeout(() => { isUpdatingFromCell.value = false; }, 0);
})

// Internal maps
const tableMatrixMap_ID_CELL = reactive(new Map<string, any>())
const tableMatrixMap_ID_INDEX = reactive(new Map<string, number[]>())

// Configuration management
const { config } = useConfigManagement()
watch(() => config.value.tableEditFontSize, val => { fontSize.value = val || 12 })
watch(() => config.value.tableEditZoom, val => { zoomLevel.value = val || 100 })
const cellImageSize = ref(config.value.cellImageSize ?? 120);
watch(() => config.value.cellImageSize, val => { cellImageSize.value = val ?? 120 });

const autoSaveEnabled = ref(config.value.tableEditAutoSave ?? true);
watch(() => config.value.tableEditAutoSave, val => { autoSaveEnabled.value = val ?? true });

// Sync showCellImages with config
watch(() => config.value.showCellImages, val => { showCellImages.value = val ?? false; }, { immediate: true });

// Sync tableColorMode with config
watch(() => config.value.tableColorMode, val => {
  const mode = val as ColorMode ?? ColorMode.FUNCTIONAL;
  colorMode.value = mode;
}, { immediate: true });

// API composable for making backend calls
const { recalibrateTableStructure: apiRecalibrateTable, divideTableCell: apiDivideCell } = useDocumentApi();
const recalibrationLoading = ref(false);

// Computed property to get the count of unassigned cells
const unassignedCellsCount = computed(() => {
  if (!props.enableUnassignedCells || !props.documentContext || !props.tableElementId) {
    return 0;
  }
  return findUnassignedTableCells().length;
});

// Convenience computed booleans to reduce repeated expressions in template
const hasSelection = computed(() => selection.value.length > 0);
// const hasMatrix = computed(() => tableMatrix.value && tableMatrix.value.length > 0);

// Computed property that ensures re-render when images update
const displayMatrix = computed(() => {
  // Access imagedCellsUpdated to create dependency for image updates
  imagedCellsUpdated.value; // eslint-disable-line no-unused-expressions
  // Return the display matrix
  return createDisplayMatrix(tableMatrix.value as (TableCell | string)[][]);
});

// Computed property to collect all unique predefined colors from table cells
const predefinedColors = computed(() => {
  const colorSet = new Set<string>();

  for (const row of tableMatrix.value) {
    for (const cell of row) {
      if (isTableCell(cell) && cell.data?.color) {
        colorSet.add(cell.data.color);
      }
    }
  }

  // Return as array for v-for, sorted for consistency
  return Array.from(colorSet).sort();
});

// Toolbar control arrays to render with v-for (keeps template DRY)
const fileControls = computed(() => [
  { key: 'save', icon: 'mdi-content-save', disabled: autoSaveEnabled.value, title: autoSaveEnabled.value ? 'Autosave is enabled' : 'Save changes', action: save },
  { key: 'undo', icon: 'mdi-undo', disabled: undoStack.value.length === 0, title: 'Undo', action: undo },
  { key: 'redo', icon: 'mdi-redo', disabled: redoStack.value.length === 0, title: 'Redo', action: redo }
]);

const selectionControls = computed(() => [
  { key: 'select-row', icon: 'mdi-table-row', disabled: !multiSelectEnabled.value, title: 'Select row', action: () => selectAll('row') },
  { key: 'select-column', icon: 'mdi-table-column', disabled: !multiSelectEnabled.value, title: 'Select column', action: () => selectAll('column') },
  { key: 'deselect', icon: 'mdi-select-remove', disabled: !hasSelection.value, title: 'Deselect', action: clearSelection }
]);

const structureAddControls = computed(() => [
  { key: 'add-row-above', type: 'button', icon: 'mdi-arrow-up-bold', title: 'Add row above', action: () => addEvent('row', 'before'), area: 'up' },
  { key: 'add-col-left', type: 'button', icon: 'mdi-arrow-left-bold', title: 'Add column left', action: () => addEvent('column', 'before'), area: 'left' },
  { key: 'add-plus', type: 'icon', icon: 'mdi-plus', title: 'Add', action: null, area: 'middle', color: 'primary' },
  { key: 'add-col-right', type: 'button', icon: 'mdi-arrow-right-bold', title: 'Add column right', action: () => addEvent('column', 'after'), area: 'right' },
  { key: 'add-row-below', type: 'button', icon: 'mdi-arrow-down-bold', title: 'Add row below', action: () => addEvent('row', 'after'), area: 'down' }
]);

const structureDeleteControls = computed(() => [
  { key: 'delete-row', icon: 'mdi-table-row-remove', title: 'Delete row', action: () => deleteEvent('row') },
  { key: 'delete-col', icon: 'mdi-table-column-remove', title: 'Delete column', action: () => deleteEvent('column') },
  { key: 'delete-cell', icon: 'mdi-delete', title: 'Delete cell', action: () => deleteEvent('cell') }
]);

const cellMoveControls = computed(() => [
  { key: 'move-up', type: 'button', icon: 'mdi-arrow-up-bold', title: 'Move cells up', action: () => moveCells('up'), area: 'up' },
  { key: 'move-left', type: 'button', icon: 'mdi-arrow-left-bold', title: 'Move cells left', action: () => moveCells('left'), area: 'left' },
  { key: 'center', type: 'icon', icon: 'mdi-pan', title: 'Pan', action: null, area: 'middle', color: 'secondary' },
  { key: 'move-right', type: 'button', icon: 'mdi-arrow-right-bold', title: 'Move cells right', action: () => moveCells('right'), area: 'right' },
  { key: 'move-down', type: 'button', icon: 'mdi-arrow-down-bold', title: 'Move cells down', action: () => moveCells('down'), area: 'down' }
]);

const mergeSplitControls = computed(() => [
  { key: 'merge', icon: 'mdi-table-merge-cells', title: 'Merge cells', action: mergeCells },
  { key: 'split-vert', icon: 'mdi-arrow-split-vertical', title: 'Split cell vertically', action: () => splitCell(false) },
  { key: 'split-horz', icon: 'mdi-arrow-split-horizontal', title: 'Split cell horizontally', action: () => splitCell(true) }
]);

// Helper functions
function makeDummyCell(
  oid: string = makeid(18),
  row_label: boolean = false,
  column_label: boolean = false,
  content: string = "",
  img: string | undefined = undefined,
  added?: boolean,
  deleted?: boolean,
  rowSpan: number = 1,
  colSpan: number = 1,
  confidence?: number,
  color?: string,
  ...data: any[]
) {
  const region = new RectangleRegion(0, 0, 0, 0);
  const cellData = {
    ...data,
    row_label: row_label,
    column_label: column_label,
    content: content,
    color: color
  };

  return new TableCell(
    oid,
    region,
    cellData,
    confidence,
    added,
    deleted,
    img,
    rowSpan,
    colSpan
  );
}

const getCell = (r: number, c: number): TableCell | string => tableMatrix.value[r]?.[c] || ''
const getNoRows = () => tableMatrix.value.length;
const getNoColumns = () => tableMatrix.value.length > 0 ? tableMatrix.value[0]!.length : 0;

// Helper functions isTableCell and getCellId are imported from @/utils/tableHelpers

const getCellIdOfPosition = (r: number, c: number): string | undefined => getCellId(getCell(r, c));
const cellIdInSelection = (cell: TableCell | string | undefined): boolean => {
  const id = getCellId(cell);
  return id ? selection.value.includes(id) : false;
};
const cellPositionInSelection = (r: number, c: number): boolean => cellIdInSelection(getCell(r, c));

/**
 * Extract a cell image snippet from the page image using canvas-based cropping
 * Reuses pre-decoded page image for better performance
 * @param img - Pre-decoded image element
 * @param cellOrElement - TableCell or Element with bounding box/region information
 * @param targetSize - Target size for the image (for resizing on extraction)
 * @returns Promise<string> - Base64 data URL of the cropped cell image
 */
async function extractCellImageSnippet(img: HTMLImageElement | ImageBitmap | null, cellOrElement: any, targetSize?: number): Promise<string | undefined> {
  if (!img) {
    return undefined;
  }

  try {
    // Extract bounding box coordinates from either region or boundingBox
    const bbox = cellOrElement.region || cellOrElement.boundingBox;

    if (!bbox || !('x1' in bbox)) {
      return undefined;
    }

    const x1 = Math.max(0, Math.floor(bbox.x1));
    const y1 = Math.max(0, Math.floor(bbox.y1));
    const x2 = Math.min(img.width, Math.ceil(bbox.x2));
    const y2 = Math.min(img.height, Math.ceil(bbox.y2));

    let width = Math.max(1, x2 - x1);
    let height = Math.max(1, y2 - y1);

    // Optionally resize to target size to save memory
    if (targetSize && (width > targetSize * 2 || height > targetSize * 2)) {
      const scale = Math.min(targetSize / width, targetSize / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    // Set canvas size and crop the image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return undefined;
    }

    ctx.drawImage(img, x1, y1, x2 - x1, y2 - y1, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    return dataUrl;
  } catch (error) {
    return undefined;
  }
}/**
 * Get or load a cell image snippet with caching
 * @param cell - TableCell with bounding box information
 * @returns Promise<string | undefined> - Cached or extracted image data URL
 */
async function getCellImage(cell: TableCell): Promise<string | undefined> {
  const cellId = cell.oid;

  // Return cached image if available
  if (cellImageCache.has(cellId)) {
    const cachedImg = cellImageCache.get(cellId);
    // Ensure the cell has the cached image (for cases where it was cleared)
    if (cachedImg && cell.img !== cachedImg) {
      cell.img = cachedImg;
      // Trigger reactivity update
      imagedCellsUpdated.value++;
    }
    return cachedImg;
  }

  // Avoid re-loading the same cell
  if (cellImageLoadingQueue.value.has(cellId)) {
    return undefined;
  }

  cellImageLoadingQueue.value.add(cellId);

  try {
    // Wait for page image to be decoded if still loading
    if (pageImageLoadPromise.value) {
      await pageImageLoadPromise.value;
    }

    // Use the pre-decoded image
    if (!decodedPageImage.value) {
      cellImageLoadingQueue.value.delete(cellId);
      return undefined;
    }


    // Get the element from the document to get bounding box information
    const element = props.documentContext?.elements?.byId?.[cellId];
    if (!element) {
      cellImageLoadingQueue.value.delete(cellId);
      return undefined;
    }

    // Extract the snippet using element's region/bounding box with pre-decoded image
    const snippet = await extractCellImageSnippet(decodedPageImage.value, element, cellImageSize.value);

    if (snippet) {
      cellImageCache.set(cellId, snippet);
      // Update the cell's img property for reactivity
      cell.img = snippet;
      // Trigger Vue reactivity by incrementing counter
      imagedCellsUpdated.value++;
    } else {
      console.warn('⚠️ Failed to extract snippet for:', cellId);
    }

    cellImageLoadingQueue.value.delete(cellId);
    return snippet;
  } catch (error) {
    cellImageLoadingQueue.value.delete(cellId);
    return undefined;
  }
}

/**
 * Preload all visible cell images asynchronously without blocking UI
 * Uses requestIdleCallback for deferred processing
 */
function preloadVisibleCellImages() {
  if (!showCellImages.value || imageExtractionWorker.value) {
    return;
  }

  imageExtractionWorker.value = true;

  // Use requestIdleCallback if available, otherwise use setTimeout
  const schedule = (callback: () => void) => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(callback, { timeout: 5000 });
    } else {
      setTimeout(callback, 16); // ~60fps
    }
  };

  const loadNextBatch = async () => {
    const batchSize = 6; // Load 6 cells in parallel for better throughput
    const cellsToLoad: TableCell[] = [];

    // Collect cells that need loading
    for (const row of tableMatrix.value) {
      for (const cell of row) {
        if (isTableCell(cell) && !cellImageCache.has(cell.oid) && !cellImageLoadingQueue.value.has(cell.oid)) {
          cellsToLoad.push(cell);
          if (cellsToLoad.length >= batchSize) break;
        }
      }
      if (cellsToLoad.length >= batchSize) break;
    }

    // Load batch of cells in parallel for better performance
    if (cellsToLoad.length > 0) {
      await Promise.all(cellsToLoad.map(cell => getCellImage(cell)));
    }

    // Schedule next batch if more cells to load
    if (cellsToLoad.length > 0 && cellsToLoad.length === batchSize) {
      schedule(loadNextBatch);
    } else {
      imageExtractionWorker.value = false;
    }
  };

  schedule(loadNextBatch);
}

function convertAreaToTableCellMatrix(): (TableCell | string)[][] {
  if (!props.initialTableMatrix || !Array.isArray(props.initialTableMatrix)) {
    return [];
  }

  const tableMatrix: (TableCell | string)[][] = [];
  const idToPosition = new Map<string, [TableCell, number, number]>();

  for (const [rindex, row] of props.initialTableMatrix.entries()) {
    if (!row || !Array.isArray(row)) {
      continue;
    }
    const currentRow: (TableCell | string)[] = [];

    for (const [cindex, cell] of row.entries()) {
      // Handle null/undefined cells by creating a dummy cell ONLY as a placeholder
      if (!cell || cell === null) {
        // Create a dummy cell to maintain matrix structure, but mark it clearly
        currentRow.push(makeDummyCell("dummy" + makeid(18)));
        continue;
      }

      const cell_id = getCellId(cell);
      if (!cell_id) {
        // No valid ID - create dummy cell
        currentRow.push(makeDummyCell("dummy" + makeid(18)));
        continue;
      }

      if (idToPosition.has(cell_id)) {
        // This is a reference to an already-seen cell (merged cell continuation)
        const reference = idToPosition.get(cell_id);
        if (!reference) continue;

        const [origCell, origRow, origCol] = reference;
        origCell.rowSpan = Math.max(origCell.rowSpan || 1, rindex - origRow + 1);
        origCell.colSpan = Math.max(origCell.colSpan || 1, cindex - origCol + 1);
        currentRow.push(cell_id);
      } else {
        // First occurrence of this cell
        // Look up the full cell object from documentContext if it's just an ID string
        let cellData = cell;
        if (typeof cell === 'string' && props.documentContext?.elements?.byId) {
          cellData = props.documentContext.elements.byId[cell] || cell;
        }

        // If still just a string ID and not in document context, this is an orphaned reference
        if (typeof cellData === 'string') {
          // Missing element in document context. Create an empty placeholder dummy cell
          // but keep a reference to the original OID for diagnostics (originalOid)
          console.warn(`⚠️ Cell ${cellData} not found in document context - creating empty placeholder`);
          const dummy = makeDummyCell("dummy" + makeid(18));
          // Ensure content is empty and record original OID for debugging
          dummy.data = dummy.data || { content: '' };
          dummy.data.content = '';
          // Store original OID for possible later resolution
          (dummy.data as any).originalOid = cellData;
          currentRow.push(dummy);
          idToPosition.set(cell_id, [dummy, rindex, cindex]);
          continue;
        }

        // Extract data from the resolved cell object to create a working copy
        const workingCell = makeDummyCell(
          cell_id,
          cellData?.data?.['row_label'] as boolean,
          cellData?.data?.['column_label'] as boolean,
          cellData?.data?.['content'] as string,
          (cellData as any)?.img as string,
          false,
          false,
          1,
          1,
          (cellData as any)?.confidence as number,
          cellData?.data?.['color'] as string
        );
        currentRow.push(workingCell);
        idToPosition.set(cell_id, [workingCell, rindex, cindex]);
      }
    }
    tableMatrix.push(currentRow);
  }

  return tableMatrix;
}

function createDisplayMatrix(tableMatrix: (TableCell | string)[][]): TableCell[][] {
  // convert to table cell matrix with row and col span
  // can be irregular, as row/colspan are only considered if the row/col has less cells

  const matrix: TableCell[][] = [];
  if (!tableMatrix || tableMatrix.length === 0) {
    return matrix;
  }

  // id to position map
  const idToPosition = new Map<string, [number, number, number, number]>();

  for (const [rindex, row] of tableMatrix.entries()) {
    for (const [cindex, cell] of row.entries()) {
      const cell_id = getCellId(cell);
      if (!cell_id) continue;

      if (!idToPosition.has(cell_id)) {
        idToPosition.set(cell_id, [rindex, cindex, rindex, cindex]);
      } else {
        const position = idToPosition.get(cell_id);
        if (!position) continue;
        const [r1, c1, r2, c2] = position;
        idToPosition.set(cell_id, [Math.min(r1, rindex), Math.min(c1, cindex), Math.max(r2, rindex), Math.max(c2, cindex)]);
      }
    }
  }

  const done = new Set<string>();
  for (const [rindex, row] of tableMatrix.entries()) {
    const currentRow = [];
    for (const [cindex, cell] of row.entries()) {
      const cell_id = getCellId(cell);
      if (!cell_id) continue;

      if (idToPosition.has(cell_id) && !done.has(cell_id)) {
        done.add(cell_id);
        const position = idToPosition.get(cell_id);
        if (!position) continue;

        const [r1, c1, r2, c2] = position;
        if (r1 === rindex && c1 === cindex) {
          const cc = cell as TableCell;
          currentRow.push(makeDummyCell(
            cell_id,
            cc.data['row_label'] as boolean,
            cc.data['column_label'] as boolean,
            cc.data['content'] as string,
            (cc as any)?.img as string,
            (cc as any)?.added as boolean,
            (cc as any)?.deleted as boolean,
            r2 - r1 + 1,
            c2 - c1 + 1,
            (cc as any)?.confidence as number,
            cc.data['color'] as string
          ));
        }
      }
    }
    matrix.push(currentRow);
  }
  return matrix;
}

function updateTableMatrixMap() {
  tableMatrixMap_ID_CELL.clear();
  tableMatrixMap_ID_INDEX.clear();

  tableMatrix.value.forEach((row, rx) => {
    row.forEach((cell, cx) => {
      if (isTableCell(cell)) {
        const oid = cell.oid;
        if (!tableMatrixMap_ID_CELL.has(oid)) {
          tableMatrixMap_ID_CELL.set(oid, cell);
          tableMatrixMap_ID_INDEX.set(oid, [rx, cx, rx + (cell.rowSpan || 1) - 1, cx + (cell.colSpan || 1) - 1]);
        }
      }
    });
  });
}

function markForChange() {
  hasUnsavedChanges.value = true;
  updateTableMatrixMap()

  if (autoSaveEnabled.value) {
    // Clear any existing timer
    if (saveDebounceTimer.value) {
      clearTimeout(saveDebounceTimer.value);
    }

    // Set up a debounced save
    saveDebounceTimer.value = setTimeout(() => {
      save();
      saveDebounceTimer.value = null;
    }, 500); // 500ms debounce
  }
}

/**
 * Convert tableMatrix cells back to simple ID references for document.data.cells
 * This creates the matrix that will be stored in the table element's data
 * Filters out dummy cells to prevent ghost cell persistence
 */
function convertTableMatrixToCellsArray(): (string | { oid: string; rowSpan?: number; colSpan?: number } | null)[][] {
  const cellsArray: (string | { oid: string; rowSpan?: number; colSpan?: number } | null)[][] = [];

  for (const row of tableMatrix.value) {
    const rowArray: (string | { oid: string; rowSpan?: number; colSpan?: number } | null)[] = [];

    for (const cell of row) {
      if (!cell) {
        // Null/undefined cells stay as null
        rowArray.push(null);
      } else if (typeof cell === 'string') {
        // Check if it's a dummy cell reference
        if (cell.startsWith('dummy')) {
          // Don't persist dummy cells - convert to null
          rowArray.push(null);
        } else {
          // Valid cell reference (for merged cells)
          rowArray.push(cell);
        }
      } else if (isTableCell(cell)) {
        // Check if it's a dummy cell object
        if (cell.oid.startsWith('dummy')) {
          // Don't persist dummy cells - convert to null
          rowArray.push(null);
        } else {
          // Real cell object - check for spans
          const hasRowSpan = cell.rowSpan && cell.rowSpan > 1;
          const hasColSpan = cell.colSpan && cell.colSpan > 1;

          if (hasRowSpan || hasColSpan) {
            // Store as object with span info
            const cellEntry: { oid: string; rowSpan?: number; colSpan?: number } = { oid: cell.oid };
            if (hasRowSpan) cellEntry.rowSpan = cell.rowSpan;
            if (hasColSpan) cellEntry.colSpan = cell.colSpan;
            rowArray.push(cellEntry);
          } else {
            // Just store the OID
            rowArray.push(cell.oid);
          }
        }
      } else {
        // Unknown type - convert to null
        rowArray.push(null);
      }
    }

    cellsArray.push(rowArray);
  }

  return cellsArray;
}

function save() {
  if (isSaving.value) {
    return;
  }

  isSaving.value = true;

  // Convert tableMatrix to cells array format
  const cellsArray = convertTableMatrixToCellsArray();

  // Create a deep copy to prevent reference issues
  const tableMatrixCopy = JSON.parse(JSON.stringify(tableMatrix.value));
  const editOpsTrackerCopy = { ...props.editOpsTracker };

  emit('saveEvent', [tableMatrixCopy, editOpsTrackerCopy, cellsArray])
  emit('save')

  // Mark changes as saved immediately to prevent unnecessary resets
  hasUnsavedChanges.value = false;

  // Clear the saving flag immediately since emit is synchronous
  isSaving.value = false;
}

// Method to force reset the table (for external use)
function resetTable() {
  hasUnsavedChanges.value = false;
  isSaving.value = false;
  isInitialized.value = false;
  selectionContent.value = '';
  selection.value = [];
  tableMatrix.value = convertAreaToTableCellMatrix();
  updateTableMatrixMap();
  isInitialized.value = true;
}

function handleSave() {
  save()
}

function handleChange(value: any) {
  emit('change', value)
}

function saveTableState() {
  undoStack.value.push(JSON.parse(JSON.stringify(tableMatrix.value)))
  if (undoStack.value.length > 25) undoStack.value.shift()
}

function undo() {
  if (undoStack.value.length) {
    redoStack.value.push(tableMatrix.value)
    tableMatrix.value = undoStack.value.pop()
    saveMatrixBackToTableElement()
  }
}

function redo() {
  if (redoStack.value.length) {
    undoStack.value.push(tableMatrix.value)
    tableMatrix.value = redoStack.value.pop()
    saveMatrixBackToTableElement()
  }
}

function highlightEvent(cellId: string) {
  const idx = selection.value.indexOf(cellId)
  if (idx !== -1) {
    // Deselecting the cell
    selection.value.splice(idx, 1)
  } else {
    // Selecting the cell
    if (!multiSelectEnabled.value) selection.value = []
    selection.value.push(cellId)

    // Focus on contenteditable elements if they exist
    setTimeout(() => {
      const el = document.getElementById('co' + cellId)
      if (el && el.getAttribute('contenteditable') === 'true') {
        const range = document.createRange()
        const sel = window.getSelection()
        range.selectNodeContents(el)
        sel?.removeAllRanges()
        sel?.addRange(range)
        el.focus()
      }
    })
  }

  // Update selection content after selection change
  if (selection.value.length === 1) {
    const cell = tableMatrixMap_ID_CELL.get(selection.value[0]!);
    if (cell) {
      selectionContent.value = cell.data.content || '';
    }
  } else {
    selectionContent.value = '';
  }
}

function onTextModeCellClick(cellId: string) {
  // Update selection to this cell
  if (!multiSelectEnabled.value) selection.value = [];
  if (!selection.value.includes(cellId)) {
    selection.value.push(cellId);
  }

  // Update selection content
  const cell = tableMatrixMap_ID_CELL.get(cellId);
  if (cell) {
    isUpdatingFromCell.value = true;
    selectionContent.value = cell.data.content || '';
    setTimeout(() => { isUpdatingFromCell.value = false; }, 0);
  }

  // Focus the contenteditable element for immediate editing
  setTimeout(() => {
    const el = document.getElementById('co' + cellId);
    if (el && el.contentEditable === 'true') {
      el.focus();
      // Move cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, 0);
}

// Direction utility helpers to reduce repeated switch statements
const directionMap = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 }
} as const;

const getNewPosition = (row: number, col: number, direction: keyof typeof directionMap): [number, number] => {
  const { row: dRow, col: dCol } = directionMap[direction];
  return [row + dRow, col + dCol];
};



function handleKeyboardNavigation(event: KeyboardEvent) {
  // Only handle arrow keys when a cell is selected and not editing content
  if (!selection.value.length || event.target instanceof HTMLTextAreaElement) {
    return;
  }

  // Check if the focus is on a contenteditable element (cell being edited)
  const activeElement = document.activeElement as HTMLElement;
  if (activeElement?.getAttribute('contenteditable') === 'true') {
    return;
  }

  // Map keys to direction values
  const keyToDirection: Record<string, 'up' | 'down' | 'left' | 'right' | null> = {
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right'
  };

  const direction = keyToDirection[event.key];
  if (!direction) return;

  // Handle arrow keys based on edit mode
  if (editMode.value === 'move') {
    moveCells(direction);
    event.preventDefault();
  } else if (editMode.value === 'select') {
    navigateSelection(direction);
    event.preventDefault();
  }
  // In 'text' mode, arrow keys do nothing special
}

function navigateSelection(direction: 'up' | 'down' | 'left' | 'right') {
  if (selection.value.length === 0) return;

  const position = tableMatrixMap_ID_INDEX.get(selection.value[0]!);
  if (!position) return;

  const [currentRow, currentCol] = position as [number, number];
  const [newRow, newCol] = getNewPosition(currentRow, currentCol, direction);

  // Clamp to table bounds
  const boundedRow = Math.max(0, Math.min(getNoRows() - 1, newRow));
  const boundedCol = Math.max(0, Math.min(getNoColumns() - 1, newCol));

  // If position changed, select the new cell
  if (boundedRow !== currentRow || boundedCol !== currentCol) {
    const newCellId = getCellIdOfPosition(boundedRow, boundedCol);
    if (newCellId) {
      selection.value = [newCellId];

      // Update selection content for the new cell
      const cell = tableMatrixMap_ID_CELL.get(newCellId);
      if (cell) {
        isUpdatingFromCell.value = true;
        selectionContent.value = cell.data.content || '';
        setTimeout(() => { isUpdatingFromCell.value = false; }, 0);
      }
    }
  }
}

function handleTextModeArrow(event: KeyboardEvent, cellId: string, direction: 'up' | 'down' | 'left' | 'right') {
  // Save the current cell content first
  const contentElement = event.target as HTMLElement;
  if (contentElement) {
    cellContentEvent({ target: contentElement }, cellId);
  }

  if (selection.value.length === 0) return;

  const position = tableMatrixMap_ID_INDEX.get(cellId);
  if (!position) return;

  const [currentRow, currentCol] = position as [number, number];
  const [newRow, newCol] = getNewPosition(currentRow, currentCol, direction);

  // Clamp to table bounds
  const boundedRow = Math.max(0, Math.min(getNoRows() - 1, newRow));
  const boundedCol = Math.max(0, Math.min(getNoColumns() - 1, newCol));

  // If position changed, select the new cell and focus it for editing
  if (boundedRow !== currentRow || boundedCol !== currentCol) {
    const newCellId = getCellIdOfPosition(boundedRow, boundedCol);
    if (newCellId) {
      selection.value = [newCellId];

      // Update selection content for the new cell
      const cell = tableMatrixMap_ID_CELL.get(newCellId);
      if (cell) {
        isUpdatingFromCell.value = true;
        selectionContent.value = cell.data.content || '';
        setTimeout(() => { isUpdatingFromCell.value = false; }, 0);
      }

      // Focus the new cell's contenteditable element for immediate editing
      setTimeout(() => {
        const newCellElement = document.getElementById('co' + newCellId) as HTMLElement;
        if (newCellElement && newCellElement.contentEditable === 'true') {
          newCellElement.focus();
          // Move cursor to the end for better UX
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(newCellElement);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }, 0);
    }
  }
}

function getClasses(cell: TableCell) {
  let classes = ''
  if (cellIdInSelection(cell)) classes += ' highlighted'

  if (!cell.data) return classes;

  if (colorMode.value === 'functional') {
    if (cell.data.row_label) classes += ' rowlabel'
    if (cell.data.column_label) classes += ' columnlabel'
  } else if (colorMode.value === 'confidence') {
    const val = cell.confidence || 0
    classes += val >= 0.8 ? ' highConf' : val >= 0.5 ? ' mediumConf' : val >= 0.2 ? ' lowConf' : ' noConf'
  } else if (colorMode.value === 'edited') {
    if (cell.data.edited) classes += ' correct'
    if (cell.data.ignore) classes += ' ignore'
    if (!cell.data.edited && !cell.data.ignore) classes += ' not-edited'
  }

  // Add special styling for unassigned cells that were added
  if (cell.added && cell.data.color === '#ffeb3b') {
    classes += ' unassigned-cell'
  }

  // Add special styling for divided cells
  if (cell.added && cell.data.color === '#e3f2fd') {
    classes += ' divided-cell'
  }

  return classes
}

function getColor(cell: TableCell) {
  if (colorMode.value === 'predef' || colorMode.value === 'constraint') {
    return cell.data && cell.data.color ? cell.data.color : 'white'
  }
  return ''
}

function cellContentEvent(cellContentEvent: any, cellId: string) {
  if (!cellId) {
    console.warn('cellContentEvent called without cellId');
    return;
  }

  saveTableState();
  const text = cellContentEvent === undefined
    ? selectionContent.value.trim()
    : cellContentEvent.target.textContent.trim();

  const cell = tableMatrixMap_ID_CELL.get(cellId);
  if (cell) {
    const oldContent = cell.data.content;

    // Only update if content actually changed
    if (oldContent !== text) {
      cell.data.content = text || '';

      // Check if this is a dummy cell being converted to a real cell
      const isDummyCell = cellId.startsWith("dummy");

      if (isDummyCell && text && text.length > 0 && props.documentContext?.elements?.byId) {
        // Generate a new real cell ID
        const newCellId = makeid(18);

        // Create a new TableCell element in the document context
        const newTableCell = new TableCell(
          newCellId,
          cell.region,
          {
            content: text,
            row_label: cell.data.row_label || false,
            column_label: cell.data.column_label || false,
            color: cell.data.color
          },
          cell.confidence,
          true, // mark as added
          false,
          cell.img,
          cell.rowSpan,
          cell.colSpan
        );

        // Add the new cell to the document context
        if (props.documentContext?.elements) {
          props.documentContext.elements.byId[newCellId] = newTableCell;
        }

        // Add reference from table to new cell
        if (props.tableElementId && props.documentContext?.addReference) {
          props.documentContext.addReference(props.tableElementId, newCellId);
        }

        // Update the cell's OID in the matrix
        cell.oid = newCellId;

        // Find and update the cell in tableMatrix
        for (let r = 0; r < tableMatrix.value.length; r++) {
          const row = tableMatrix.value[r];
          if (!row) continue;
          for (let c = 0; c < row.length; c++) {
            const matrixCell = row[c];
            if (isTableCell(matrixCell) && matrixCell === cell) {
              row[c] = cell;
            } else if (matrixCell === cellId) {
              // Also update string references to this cell
              row[c] = newCellId;
            }
          }
        }

        // Update the maps with new ID
        updateTableMatrixMap();

        // Update selection if needed
        const selectionIndex = selection.value.indexOf(cellId);
        if (selectionIndex !== -1) {
          selection.value[selectionIndex] = newCellId;
        }

        // console.log(`✅ Converted dummy cell ${cellId} to real cell ${newCellId}`);

        // Save the complete table structure since we added a new element
        saveMatrixBackToTableElement();
      } else {
        // Normal update for existing real cells
        // Update selectionContent to stay in sync
        if (selection.value.includes(cellId)) {
          isUpdatingFromCell.value = true;
          selectionContent.value = cell.data.content;
          setTimeout(() => { isUpdatingFromCell.value = false; }, 0);
        }

        props.editOpsTracker.changeText++;
        saveCellDataOnly([cellId]);
      }
    }
  } else {
    console.warn(`Cell with ID ${cellId} not found in tableMatrixMap_ID_CELL`);
  }
}

function onLabelChange(type: string) {
  if (selection.value.length === 0) {
    return;
  }

  let hasChanges = false;

  // Check if changes will occur before saving state
  for (const id of selection.value) {
    const cell = tableMatrixMap_ID_CELL.get(id);
    if (cell) {
      const willChange = type === 'rowLabel'
        ? !cell.data.row_label || cell.data.column_label
        : type === 'columnLabel'
          ? !cell.data.column_label || cell.data.row_label
          : cell.data.row_label || cell.data.column_label;

      if (willChange) {
        hasChanges = true;
        break;
      }
    }
  }

  if (!hasChanges) return; // Exit early if no changes needed

  saveTableState();

  // Update selected cells' label properties based on type
  selection.value.forEach(id => {
    const cell = tableMatrixMap_ID_CELL.get(id);
    if (cell) {
      // Clear all labels first
      cell.data.row_label = false;
      cell.data.column_label = false;

      // Set the new label
      if (type === 'rowLabel') {
        cell.data.row_label = true;
      } else if (type === 'columnLabel') {
        cell.data.column_label = true;
      }
      // 'noLabel' keeps both false
    } else {
      console.warn(`Cell with ID ${id} not found in tableMatrixMap_ID_CELL`);
    }
  });

  props.editOpsTracker.changeLabel++;
  saveCellDataOnly();
}

function toggleEditedState(state: string) {
  saveTableState();
  selection.value.forEach(id => {
    const cell = tableMatrixMap_ID_CELL.get(id)
    if (cell) {
      cell.data.edited = state === 'edited'
      cell.data.ignore = state === 'ignore'
    }
  })
  saveCellDataOnly()
}

/**
 * Apply a predefined color to all selected cells.
 * Updates cell.data.color and marks the table as changed.
 */
function applyPredefColor(color: string) {
  if (!color) return;
  if (!selection.value.length) return;

  saveTableState();
  selection.value.forEach(id => {
    const cell = tableMatrixMap_ID_CELL.get(id);
    if (cell) {
      cell.data = cell.data || {};
      cell.data.color = color;
    }
  });
  saveCellDataOnly();
}

function deleteEvent(mode: 'row' | 'column' | 'cell') {
  if (!selection.value.length) return;

  // Check if selection contains a spanning cell. If so, don't allow deletion
  for (const cellId of selection.value) {
    const cell = tableMatrixMap_ID_CELL.get(cellId);
    if (cell && ((cell.rowSpan || 1) > 1 || (cell.colSpan || 1) > 1)) {
      showError('Selection contains spanning cell. Please split beforehand.');
      return;
    }
  }

  saveTableState();

  switch (mode) {
    case 'row': {
      const [row_index] = (tableMatrixMap_ID_INDEX.get(selection.value[0]!) || [-1]) as [number];
      if (row_index >= 0) {
        tableMatrix.value.splice(row_index, 1);
        props.editOpsTracker.deleteRow++;
      }
      break;
    }
    case 'column': {
      const [, col_index] = (tableMatrixMap_ID_INDEX.get(selection.value[0]!) || [-1, -1]) as [number, number];
      if (col_index >= 0) {
        tableMatrix.value.forEach(row => row.splice(col_index, 1));
        props.editOpsTracker.deleteColumn++;
      }
      break;
    }
    case 'cell': {
      selection.value.forEach(cellId => {
        const cellIndex = tableMatrixMap_ID_INDEX.get(cellId);
        if (cellIndex) {
          const [rowIndex, colIndex] = cellIndex as [number, number];
          if (tableMatrix.value[rowIndex]) {
            tableMatrix.value[rowIndex][colIndex] = makeDummyCell();
          }
        }
      });
      props.editOpsTracker.deleteCell++;
      break;
    }
  }

  selection.value = [];
  saveMatrixBackToTableElement();
}

function addEvent(mode: 'row' | 'column', direction: string) {
  saveTableState()

  const getIndex = (direction: string, isRow: boolean) => {
    if (selection.value.length > 0) {
      const idx = tableMatrixMap_ID_INDEX.get(selection.value[0]!)?.[isRow ? 0 : 1];
      // check if the cell is a multi-span cell. if so, return the corresponding edge index
      if (idx !== undefined && idx >= 0) {
        const cell = tableMatrixMap_ID_CELL.get(selection.value[0]!);
        if (cell) {
          if (isRow && (cell.rowSpan || 1) > 1) {
            return direction === "before" ? idx : idx + (cell?.rowSpan || 1);
          } else if (!isRow && (cell.colSpan || 1) > 1) {
            return direction === "before" ? idx : idx + (cell?.colSpan || 1);
          }
        }
        return direction === "before" ? idx : idx + 1;
      }
    }
    return direction === "before" ? 0 : (isRow ? tableMatrix.value.length : tableMatrix.value[0]!.length);
  };

  const createDummyCells = (length: number) => new Array(length).fill(0).map(_ => makeDummyCell(undefined, undefined, undefined, " "));

  const copyStrings = (matrix: any[][], index: number, isRow: boolean) => {
    const copiedStrings: string[] = [];
    const newCells: (TableCell | string)[] = createDummyCells(isRow ? matrix[0]!.length : matrix.length);
    for (let i = 0; i < (isRow ? matrix[0]!.length : matrix.length); i++) {
      const cell = isRow ? matrix[index]![i] : matrix[i]![index];
      if (typeof cell === 'string') {
        copiedStrings.push(cell);
        newCells[i] = cell;
      }
    }
    return { copiedStrings, newCells };
  };

  const updateCells = (matrix: any[][], index: number, copiedStrings: string[], newCells: any[], isRow: boolean) => {
    for (let i = 0; i < (isRow ? matrix[0]!.length : matrix.length); i++) {
      const cell = isRow ? matrix[index]![i] : matrix[i]![index];
      if (cell && typeof cell !== 'string') {
        const objId = cell.oid;
        if (!objId.includes("dummy") && copiedStrings.includes(objId)) {
          newCells[i] = cell;
          if (isRow) matrix[index]![i] = objId;
          else matrix[i]![index] = objId;
        }
      }
    }
  };

  if (mode === "row") {
    const index = getIndex(direction, true);
    if (index >= 0) {
      const { copiedStrings, newCells } = copyStrings(tableMatrix.value, index, true);
      updateCells(tableMatrix.value, index, copiedStrings, newCells, true);
      tableMatrix.value.splice(index, 0, newCells);
      props.editOpsTracker.addRow++
    }
  } else {
    const index = getIndex(direction, false);
    if (index >= 0) {
      const { copiedStrings, newCells } = copyStrings(tableMatrix.value, index, false);
      updateCells(tableMatrix.value, index, copiedStrings, newCells, false);
      tableMatrix.value.forEach((row, i) => row.splice(index, 0, newCells[i]!));
      props.editOpsTracker.addColumn++;
    }
  }
  saveMatrixBackToTableElement()
}

const checkIfSelectedIsBlock = (): [boolean, number, number, number, number] => {
  let minRow = Infinity;
  let maxRow = -Infinity;
  let minCol = Infinity;
  let maxCol = -Infinity;
  let found = false;
  for (let r = 0; r < getNoRows(); r++) {
    for (let c = 0; c < getNoColumns(); c++) {
      if (cellPositionInSelection(r, c)) {
        found = true;
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }
  if (!found) {
    showError('Selection has to be rectangular for this operation.');
    return [false, -1, -1, -1, -1];
  }

  const shouldBe = (maxRow - minRow + 1) * (maxCol - minCol + 1)
  let counter = 0;
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (cellPositionInSelection(r, c)) counter++;
    }
  }
  if (counter !== shouldBe) {
    showError('Selection has to be rectangular for this operation.');
    return [false, -1, -1, -1, -1];
  }
  return [true, minRow, minCol, maxRow, maxCol];
}

function mergeCells() {
  const [b, minRow, minCol, maxRow, maxCol] = checkIfSelectedIsBlock()
  if (!b)
    return

  saveTableState()

  // Collect all cell IDs that will be merged
  const cellsToMerge: string[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const cellId = getCellIdOfPosition(r, c);
      if (cellId && !cellsToMerge.includes(cellId)) {
        cellsToMerge.push(cellId);
      }
    }
  }

  let orig_cell: TableCell | string = getCell(minRow, minCol)
  if (typeof orig_cell === 'string') {
    // search for first object in selection
    const indices = selection.value.map(s => (tableMatrixMap_ID_INDEX.get(s) || [1000, 1000]) as [number, number]).sort((a, b) => a[0] - b[0] || a[1] - b[1])
    do {
      const [r, c] = indices.shift() || [1000, 1000]
      const obj = getCell(r, c)
      if (typeof obj === 'object') {
        orig_cell = obj
        break
      }
    } while (indices.length > 0)
  }
  if (typeof orig_cell === 'string') {
    showError('At least one cell in selection must contain data to merge.')
    return
  }

  orig_cell.colSpan = maxCol - minCol + 1
  orig_cell.rowSpan = maxRow - minRow + 1
  if (!orig_cell.data) {
    orig_cell.data = { content: '', row_label: false, column_label: false, color: 'white' }
  }

  // Merge cell data in the tableMatrix (display copy)
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (r === minRow && c === minCol) {
        // put the original cell here
        continue
      }
      const merge_cell: TableCell | string = getCell(r, c)
      if (typeof merge_cell === 'object' && merge_cell.data != undefined) {
        orig_cell.merge(merge_cell as TableCell)
      }
      tableMatrix.value[r]![c] = orig_cell.oid
    }
  }
  tableMatrix.value[minRow]![minCol] = orig_cell

  // If we have document context, merge references
  if (props.documentContext?.getChildren) {
    for (const cell of cellsToMerge) {
      if (cell !== orig_cell.oid) {
        for (const child of props.documentContext.getChildren(cell)) {
          props.documentContext.addReference(orig_cell.oid, child);
          props.documentContext.removeReference(cell, child);
          // table to cell
          props.documentContext.removeReference(props.tableElementId, cell);
        }
      }
    }
  }
  props.editOpsTracker.merge++;

  saveMatrixBackToTableElement()

}

/**
 * Save specific cell data changes back to the document context elements
 * This updates only the specified cells (more efficient than updating all)
 * @param cellIds - Array of cell IDs to update, if not provided updates all cells in matrix
 */
function saveCellDataToDocument(cellIds?: string[]) {
  if (!props.documentContext?.elements?.byId) return;

  // If specific cell IDs provided, only update those
  if (cellIds && cellIds.length > 0) {
    for (const cellId of cellIds) {
      if (cellId.startsWith("dummy")) continue;

      const cell = tableMatrixMap_ID_CELL.get(cellId);
      if (!cell) continue;

      // Get the corresponding element from document context
      const docElement = props.documentContext.elements.byId[cellId];
      if (docElement && docElement.data) {
        // Update cell data properties
        docElement.data.content = cell.data.content;
        docElement.data.row_label = cell.data.row_label;
        docElement.data.column_label = cell.data.column_label;

        if (cell.data.color !== undefined) {
          docElement.data.color = cell.data.color;
        }

        if (cell.data.edited !== undefined) {
          docElement.data.edited = cell.data.edited;
        }

        if (cell.data.ignore !== undefined) {
          docElement.data.ignore = cell.data.ignore;
        }

        // Update confidence if available
        if (cell.confidence !== undefined) {
          (docElement as any).confidence = cell.confidence;
        }
      }
    }
    return;
  }

  // Otherwise, update all cells in the matrix (for structural changes)
  for (const row of tableMatrix.value) {
    for (const cell of row) {
      if (!isTableCell(cell)) continue;

      const cellId = cell.oid;
      if (cellId.startsWith("dummy")) continue;

      // Get the corresponding element from document context
      const docElement = props.documentContext.elements.byId[cellId];
      if (docElement && docElement.data) {
        // Update cell data properties
        docElement.data.content = cell.data.content;
        docElement.data.row_label = cell.data.row_label;
        docElement.data.column_label = cell.data.column_label;

        if (cell.data.color !== undefined) {
          docElement.data.color = cell.data.color;
        }

        if (cell.data.edited !== undefined) {
          docElement.data.edited = cell.data.edited;
        }

        if (cell.data.ignore !== undefined) {
          docElement.data.ignore = cell.data.ignore;
        }

        // Update confidence if available
        if (cell.confidence !== undefined) {
          (docElement as any).confidence = cell.confidence;
        }
      }
    }
  }
}

/**
 * Save only cell data changes without rebuilding the table structure
 * More efficient for operations that only modify cell properties (content, labels, colors)
 * not the table structure (rows, columns, merges, splits)
 * @param cellIds - Array of cell IDs to update (defaults to current selection)
 */
function saveCellDataOnly(cellIds?: string[]) {
  const idsToSave = cellIds || selection.value;
  saveCellDataToDocument(idsToSave);
  markForChange();
}

function saveMatrixBackToTableElement() {
  // Skip if no document context (standalone mode)
  if (!props.documentContext || !props.documentContext.elements || !props.tableElementId) {
    // console.log('Skipping saveMatrixBackToTableElement - no document context');
    return;
  }

  const tableElement = props.documentContext.elements.byId?.[props.tableElementId];

  // Collect all unique cell IDs in the current matrix (excluding dummy cells)
  const currentCellIds = new Set<string>();
  for (const row of tableMatrix.value) {
    for (const cell of row) {
      const cellId = getCellId(cell as TableCell | string);
      if (cellId && !cellId.startsWith("dummy")) {
        currentCellIds.add(cellId);
      }
    }
  }

  // Clean up orphaned references: remove references to cells no longer in the matrix
  if (props.documentContext?.references && props.tableElementId) {
    const tableRefs = props.documentContext.getChildren(props.tableElementId);
    const toRemove: string[] = [];

    for (const refId of tableRefs) {
      const element = props.documentContext.elements?.byId?.[refId];
      // Only check table_cell/table-cell elements
      if (element && (element.category === 'table_cell' || element.category === 'table-cell' || element.category === 'tablecell')) {
        if (!currentCellIds.has(refId)) {
          toRemove.push(refId);
        }
      }
    }

    // Remove orphaned references
    for (const refId of toRemove) {
      try {
        props.documentContext.removeReference(props.tableElementId, refId);
        // console.log(`🗑️ Removed orphaned cell reference: ${refId}`);
      } catch (error) {
        console.warn(`Failed to remove reference ${refId}:`, error);
      }
    }
  }

  // Ensure all cells in the matrix are referenced by the table element
  if (props.documentContext && props.tableElementId) {
    for (const cellId of currentCellIds) {
      // Check if the table element already references this cell
      const children = props.documentContext.getChildren(props.tableElementId);
      if (!children.includes(cellId)) {
        // Add reference from table to cell if missing
        props.documentContext.addReference(props.tableElementId, cellId);
      }
    }
  }

  // Save cell data changes to document elements
  saveCellDataToDocument();

  updateTableMatrixMap();
  // convert table matrix to id references
  const idMatrix = tableMatrix.value.map(row => row.map(cell => {
    if (!cell) return null;
    if (typeof cell === 'string') return cell;
    if (cell.oid.startsWith("dummy")) return null
    return cell.oid;
  }));

  const updatedTableData = {
    ...tableElement.data,
    cells: idMatrix,
    edit_operations: props.editOpsTracker,
    last_modified: new Date().toISOString()
  };

  // Update table element in frontend model
  if (tableElement && tableElement.data) {
    Object.assign(tableElement.data, updatedTableData);
  }
  markForChange()
}

function splitCell(directionFlag: boolean) {
  saveTableState()

  const [origin_r, origin_c, origin_max_r, origin_max_c] = (tableMatrixMap_ID_INDEX.get(selection.value[0]!) || [-1, -1, -1, -1]) as [number, number, number, number];

  if (origin_r === -1 || origin_c === -1)
    return

  const orig_cell = getCell(origin_r, origin_c) as TableCell
  if (directionFlag) {
    // between origin_r and origin_max_r
    for (let r = origin_r + 1; r <= origin_max_r; r++) {
      for (let c = origin_c; c <= origin_max_c; c++) {
        tableMatrix.value[r]![c] = makeDummyCell()
      }
    }
    orig_cell.rowSpan = 1
  } else {
    // between origin_c and origin_max_c
    for (let c = origin_c + 1; c <= origin_max_c; c++) {
      for (let r = origin_r; r <= origin_max_r; r++) {
        tableMatrix.value[r]![c] = makeDummyCell()
      }
    }
    orig_cell.colSpan = 1
  }

  props.editOpsTracker.split++
  saveMatrixBackToTableElement()
}

async function divideCell() {
  if (selection.value.length !== 1) {
    console.warn('Cannot divide cell: no cell selected or multiple cells selected');
    return;
  }

  saveTableState();

  try {
    // Get the selected cell position and info
    const [origin_r, origin_c, origin_max_r, origin_max_c] = (tableMatrixMap_ID_INDEX.get(selection.value[0]!) || [-1, -1, -1, -1]) as [number, number, number, number];

    if (origin_r === -1 || origin_c === -1) {
      console.warn('Cannot divide cell: invalid cell position');
      return;
    }
    // check if is spanning cell, if so prevent
    if (origin_max_r - origin_r !== 0 || origin_max_c - origin_c !== 0) {
      console.warn('Cannot divide merged cells, split first')
      return;
    }

    const orig_cell = getCell(origin_r, origin_c) as TableCell;
    if (!orig_cell || !orig_cell.oid) {
      console.warn('Cannot divide cell: no cell ID found');
      return;
    }

    // Call the backend API to divide the cell (only available with document context)
    if (!props.documentContext?.oid) {
      console.warn('Cannot divide cell: document context with OID required for API call');
      return;
    }
    const result = await apiDivideCell(props.documentContext.oid, orig_cell.oid);

    if (result && result.status === 'success') {
      // Emit event to parent to refresh the document
      emit('cellDivided', {
        originalCellId: result.original_cell_id,
        newCellIds: result.new_cell_ids,
        totalDivisions: result.total_divisions,
        message: result.message || 'Cell divided successfully'
      });

      // Update edit tracker
      props.editOpsTracker.split++;

      // Update frontend matrix using placed_positions if provided
      try {
        const placed: any[] = result.placed_positions || [];
        // If backend provided positions, place the new cell IDs in the matrix
        if (placed.length > 0) {
          // If the backend returned new_cell_ids, map them
          const newIds: string[] = result.new_cell_ids || [];
          for (let i = 0; i < placed.length && i < newIds.length; i++) {
            const [r, c] = placed[i];
            // Ensure matrix has enough rows
            while (r >= tableMatrix.value.length) {
              // append a row of dummy cells matching column count
              const cols = getNoColumns() || 1;
              const newRow = new Array(cols).fill(null).map(() => makeDummyCell());
              tableMatrix.value.push(newRow);
            }
            // Ensure row has enough columns
            while (c >= tableMatrix.value[r]!.length) {
              tableMatrix.value[r]!.push(makeDummyCell());
            }

            // Insert the new cell as a string reference (documentContext should resolve it)
            tableMatrix.value[r]![c] = newIds[i]!;
          }

          // Replace any placeholder dummy that had originalOid matching the original cell with the updated element
          for (let rr = 0; rr < tableMatrix.value.length; rr++) {
            for (let cc = 0; cc < tableMatrix.value[rr]!.length; cc++) {
              const cell = tableMatrix.value[rr]![cc];
              if (isTableCell(cell) && cell.data && (cell.data as any).originalOid === result.original_cell_id) {
                // Replace placeholder with the real element if available in documentContext
                const docEl = props.documentContext?.elements?.byId?.[result.original_cell_id];
                if (docEl) {
                  tableMatrix.value[rr]![cc] = docEl as any;
                }
              }
            }
          }

          updateTableMatrixMap();
          saveMatrixBackToTableElement();
        } else {
          // If no placement info, just clear selection and ask parent to refresh document
          selection.value = [];
          // Let parent handle reloading if it needs to
        }
      } catch (e) {
        console.warn('Failed to place divided cells in matrix:', e);
      }

    } else {
      const errorMsg = result?.message || 'Unknown error occurred during cell division';
      showError(`Cell division failed: ${errorMsg}`);
    }

  } catch (error) {
    console.error('Error dividing cell:', error);
    showError('Failed to divide cell: ' + (error as Error).message);
  }
}

function moveCells(direction: 'up' | 'down' | 'left' | 'right') {
  saveTableState()

  // if selected cells are not in a row or column, return
  const [isBlock, minRow, minCol, maxRow, maxCol] = checkIfSelectedIsBlock()
  if (!isBlock)
    return
  // direction: up, down, left, right
  // move selected cells in direction
  // if there is a cell in the way and it is not selected, switch places with the cell in the way

  // get coordinates of all selected cells
  const coordinates: Set<[number, number]> = new Set()
  for (let r = 0; r < getNoRows(); r++) {
    for (let c = 0; c < getNoColumns(); c++) {
      if (cellPositionInSelection(r, c)) {
        coordinates.add([r, c])
      }
    }
  }
  let minAmountOfSameId = 1

  //check for every cell, check how many blocks are above it
  // if number of blocks is
  switch (direction) {
    case 'up':
      if (minRow <= 0) return

      minAmountOfSameId = [...coordinates].map(x => {
        const [row, column] = x;
        if (coordinates.has([row - 1, column])) return 1
        const c = getCell(row - 1, column)
        if (typeof c === 'object')
          return c.rowSpan || 1
        else
          return -1
      }).reduce((a, b) => Math.min(a, b))
      if (minAmountOfSameId === -1 || minRow - minAmountOfSameId < 0) return
      break;
    case 'down':
      if (maxRow >= getNoRows() - 1) return
      minAmountOfSameId = [...coordinates].map(x => {
        const [row, column] = x;
        if (coordinates.has([row + 1, column])) return 1
        const c = getCell(row + 1, column)
        if (typeof c === 'object')
          return c.rowSpan || 1
        else
          return -1
      }).reduce((a, b) => Math.max(a, b))
      if (minAmountOfSameId + maxRow >= getNoRows()) return
      break
    case 'left':
      if (minCol <= 0) return
      minAmountOfSameId = [...coordinates].map(x => {
        const [row, column] = x;
        if (coordinates.has([row, column - 1])) return 1
        const c = getCell(row, column - 1)
        if (typeof c === 'object')
          return c.colSpan || 1
        else
          return -1
      }).reduce((a, b) => Math.min(a, b))
      if (minCol - minAmountOfSameId < 0) return
      break
    case 'right':
      if (maxCol >= getNoColumns() - 1) return
      minAmountOfSameId = [...coordinates].map(x => {
        const [row, column] = x;
        if (coordinates.has([row, column + 1])) return 1
        const c = getCell(row, column + 1)
        if (typeof c === 'object')
          return c.colSpan || 1
        else
          return -1
      }).reduce((a, b) => Math.max(a, b))
      if (minAmountOfSameId + maxCol >= getNoColumns()) return
      break
  }
  if (minAmountOfSameId === 0) minAmountOfSameId = 1

  //move all cells by that amount
  switch (direction) {
    case 'up':
      for (let i = 0; i < minAmountOfSameId; i++) {
        for (let r = 1; r < getNoRows(); r++) {
          for (let c = 0; c < getNoColumns(); c++) {
            if (cellPositionInSelection(r, c)) {
              const oldRow = getCell(r - 1, c)
              tableMatrix.value[r - 1]![c] = getCell(r, c)
              tableMatrix.value[r]![c] = oldRow
            }
          }
        }
      }
      break
    case 'down':
      for (let i = 0; i < minAmountOfSameId; i++) {
        for (let r = getNoRows() - 2; r >= 0; r--) {
          for (let c = 0; c < getNoColumns(); c++) {
            if (cellPositionInSelection(r, c)) {
              const oldRow = getCell(r + 1, c)
              tableMatrix.value[r + 1]![c] = getCell(r, c)
              tableMatrix.value[r]![c] = oldRow
            }
          }
        }
      }
      break
    case 'left':
      for (let i = 0; i < minAmountOfSameId; i++) {
        for (let r = 0; r < getNoRows(); r++) {
          for (let c = 1; c < getNoColumns(); c++) {
            if (cellPositionInSelection(r, c)) {
              const oldColumn = getCell(r, c - 1)
              tableMatrix.value[r]![c - 1] = getCell(r, c)
              tableMatrix.value[r]![c] = oldColumn
            }
          }
        }
      }
      break
    case 'right':
      for (let i = 0; i < minAmountOfSameId; i++) {
        for (let r = 0; r < getNoRows(); r++) {
          for (let c = getNoColumns() - 2; c >= 0; c--) {
            if (cellPositionInSelection(r, c)) {
              const oldColumn = getCell(r, c + 1)
              tableMatrix.value[r]![c + 1] = getCell(r, c)
              tableMatrix.value[r]![c] = oldColumn
            }
          }
        }
      }
      break
  }

  props.editOpsTracker.move++
  saveMatrixBackToTableElement()
}

function clearSelection() {
  selection.value = []
  selectionContent.value = ''
}

function selectAll(mode: 'row' | 'column') {
  const idx = tableMatrixMap_ID_INDEX.get(selection.value[0]!);
  if (!idx) return;

  if (mode === 'row') {
    const row = tableMatrix.value[idx[0]!];
    selection.value = row!.map((cell: string | TableCell) => getCellId(cell as TableCell | string)).filter((id: string | undefined) => id !== undefined) as string[];
  } else {
    selection.value = tableMatrix.value
      .map(row => getCellId(row[idx[1]!] as TableCell | string))
      .filter((id: string | undefined) => id !== undefined) as string[];
  }
}

function checkTableConstraints() {
  // Implementation for constraint checking
}

// Helper to collect all cell IDs from matrix (excluding dummy cells)
function collectCellIds(matrix: any[][]): Set<string> {
  const ids = new Set<string>();
  for (const row of matrix) {
    for (const cell of row) {
      const id = getCellId(cell);
      if (id && !id.startsWith('dummy')) {
        ids.add(id);
        // Also check for original OID in case cell was previously added as unassigned
        if (isTableCell(cell) && cell.data?.originalOid) {
          ids.add(cell.data.originalOid);
        }
      }
    }
  }
  return ids;
}

// Function to find and include unassigned table cells
function findUnassignedTableCells(): Element[] {
  if (!props.documentContext || !props.tableElementId || !props.enableUnassignedCells) {
    return [];
  }

  const unassignedCells: Element[] = [];
  const doc = props.documentContext;

  try {
    // Collect all current cell IDs from both matrices
    const currentCellIds = collectCellIds(props.initialTableMatrix);
    collectCellIds(tableMatrix.value).forEach(id => currentCellIds.add(id));

    // Find table cell elements not in the matrix
    if (doc.references && doc.references[props.tableElementId]) {
      const tableReferences = doc.references[props.tableElementId];

      for (const refId of tableReferences) {
        const element = doc.elements?.byId?.[refId];

        if (element &&
          (element.category === 'table-cell' || element.category === 'table_cell') &&
          !currentCellIds.has(element.oid)) {
          unassignedCells.push(element);
        }
      }
    }
  } catch (error) {
    console.error('Error finding unassigned table cells:', error);
  }
  return unassignedCells;
}

// Function to include unassigned cells in the table matrix
function includeUnassignedCells() {
  const unassignedCells = findUnassignedTableCells();

  if (unassignedCells.length === 0) {
    showError('No unassigned table cells found for this table.');
    return;
  }

  saveTableState(); // Save current state for undo

  // Convert unassigned cells to dummy cells and add them to a new row at the bottom
  const newRows: (TableCell | string)[][] = [];
  const currentColCount = getNoColumns();

  const newRow: (TableCell | string)[] = [];

  for (const cell of unassignedCells) {
    const dummyCell = makeDummyCell(
      cell.oid,
      cell.data?.row_label || false,
      cell.data?.column_label || false,
      cell.data?.content || '',
      undefined, // no image for now
      true, // mark as added
      false, // not deleted
      1, // rowSpan
      1, // colSpan
      cell.confidence,
      cell.data?.color || '#ffeb3b' // highlight unassigned cells with yellow background
    );

    newRow.push(dummyCell);
    if (newRow.length >= currentColCount) {
      newRows.push([...newRow]);
      newRow.length = 0; // reset for next row
    }
  }
  if (newRow.length > 0) {
    newRows.push([...newRow]);
  }

  // Ensure the new row has the same length as existing rows
  for (const row of newRows) {
    while (row.length < currentColCount) {
      row.push(makeDummyCell()); // Fill with empty cells
    }
    tableMatrix.value.push(row);
  }

  // Track the operation
  props.editOpsTracker.addRow++;

  saveMatrixBackToTableElement();
}

// Function to recalibrate table structure via backend API
async function recalibrateTableStructure() {
  if (!props.documentContext || !props.tableElementId) {
    showError('Cannot recalibrate: missing document context or table ID');
    return;
  }

  // Get the document ID from the selected document
  const selectedDoc = props.documentContext;
  if (!selectedDoc || !selectedDoc.oid) {
    showError('Cannot recalibrate: no document selected');
    return;
  }

  recalibrationLoading.value = true;

  try {
    // Validate and clean up before saving
    validateAndCleanTableMatrix();

    // Save current changes first to ensure backend has latest table state
    await save();

    // Call the backend API to recalibrate the table structure
    const result = await apiRecalibrateTable(selectedDoc.oid, props.tableElementId);

    if (result && result.status === 'success') {
      // Emit a success event that parent components can listen to
      // This allows the parent to refresh the document or show updates
      emit('tableRecalibrated', {
        documentId: selectedDoc.oid,
        tableId: props.tableElementId,
        message: result.message || 'Table structure updated successfully'
      });

    } else {
      const errorMsg = result?.message || 'Unknown error occurred during recalibration';
      showError(`Table recalibration failed: ${errorMsg}`);
    }

  } catch (error) {
    console.error('Error during table recalibration:', error);
    showError(`Failed to recalibrate table structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    recalibrationLoading.value = false;
  }
}

/**
 * Validate and clean the table matrix to detect and fix issues
 * This helps prevent ghost cells and orphaned references
 */
function validateAndCleanTableMatrix(): void {
  const issues: string[] = [];
  let dummyCellCount = 0;
  let missingElementCount = 0;
  const validCellIds = new Set<string>();

  // First pass: identify issues
  for (let r = 0; r < tableMatrix.value.length; r++) {
    for (let c = 0; c < tableMatrix.value[r]!.length; c++) {
      const cell = tableMatrix.value[r]![c];
      const cellId = getCellId(cell as TableCell | string);

      if (cellId?.startsWith('dummy')) {
        dummyCellCount++;
        issues.push(`Dummy cell at [${r},${c}]: ${cellId}`);
      } else if (cellId && !cellId.startsWith('dummy')) {
        validCellIds.add(cellId);

        // Check if cell element exists in document
        const docElement = props.documentContext?.elements?.byId?.[cellId];
        if (!docElement) {
          missingElementCount++;
          issues.push(`Missing document element for cell ${cellId} at [${r},${c}]`);
        }
      }
    }
  }

  // Check for orphaned references
  if (props.documentContext?.references && props.tableElementId) {
    const tableRefs = props.documentContext.getChildren(props.tableElementId);
    const orphanedRefs: string[] = [];

    for (const refId of tableRefs) {
      const element = props.documentContext.elements?.byId?.[refId];
      if (element && (element.category === 'table_cell' || element.category === 'table-cell' || element.category === 'tablecell')) {
        if (!validCellIds.has(refId)) {
          orphanedRefs.push(refId);
        }
      }
    }

    if (orphanedRefs.length > 0) {
      issues.push(`Found ${orphanedRefs.length} orphaned cell references: ${orphanedRefs.slice(0, 3).join(', ')}${orphanedRefs.length > 3 ? '...' : ''}`);
    }
  }

  // Log validation results
  if (issues.length > 0) {
    console.warn(`⚠️ Table validation found ${issues.length} issue(s):`, {
      dummyCells: dummyCellCount,
      missingElements: missingElementCount,
      issues: issues.slice(0, 10) // Log first 10 issues
    });
  } else {
    // console.log('✅ Table validation passed - no issues found');
  }
}

// Expose methods for parent components
defineExpose({
  save,
  resetTable,
  isModified: computed(() => hasUnsavedChanges.value),
})
</script>

<style scoped>
/* Toolbar Styling */
.toolbar-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  margin: 8px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toolbar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: fit-content;
  justify-content: space-between;
  height: 150px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #495057;
  text-align: center;
  min-height: 16px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;
  margin-top: auto;
}

.add-controls,
.move-controls {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.color-mode-controls {
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.min-width-200 {
  min-width: 200px;
}

/* Button styling overrides */
.toolbar-section .v-btn {
  transition: all 0.2s ease;
}

.toolbar-section .v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive behavior */
@media (max-width: 1400px) {
  .toolbar-container .d-flex {
    flex-wrap: wrap;
    gap: 12px;
  }

  .section-label {
    font-size: 11px;
  }

  .min-width-200 {
    min-width: 160px;
  }
}

@media (max-width: 1200px) {
  .toolbar-section {
    gap: 6px;
  }

  .min-width-200 {
    min-width: 140px;
  }
}

/* Divider styling */
.v-divider--vertical {
  height: 150px;
  opacity: 0.3;
}

/* Enhanced focus states */
.v-btn:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* Edit Mode Section Enhancements */
.edit-mode-section {
  min-width: 320px;
}

.edit-mode-toggle {
  margin-bottom: 4px;
}

.cell-content-editor {
  position: relative;
  margin-top: 8px;
}

.selection-info {
  position: absolute;
  top: -12px;
  right: 8px;
  z-index: 2;
}

/* Visualization Section Enhancements */
.visualization-section .control-label {
  font-size: 11px;
  font-weight: 500;
  color: #6c757d;
  margin-bottom: 4px;
  text-align: center;
}

/* Predefined colors grid */
.predef-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
  width: 100%;
}

.color-swatch {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  user-select: none;
}

.color-swatch .swatch {
  width: 28px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.predef-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.functional-controls,
.edited-controls,
.constraint-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.confidence-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid #dee2e6;
}

.legend-color.high-conf {
  background-color: rgba(0, 255, 0, 0.4);
}

.legend-color.medium-conf {
  background-color: rgba(255, 255, 0, 0.4);
}

.legend-color.low-conf {
  background-color: rgba(255, 127, 80, 0.4);
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  opacity: 0.6;
}

/* Color mode specific button styling */
.nolabel {
  background-color: rgba(108, 117, 125, 0.1);
}

.nolabel:hover {
  background-color: rgba(108, 117, 125, 0.2);
}

.rowlabel {
  background-color: rgba(40, 167, 69, 0.1);
}

.rowlabel:hover {
  background-color: rgba(40, 167, 69, 0.2);
}

.columnlabel {
  background-color: rgba(0, 123, 255, 0.1);
}

.columnlabel:hover {
  background-color: rgba(0, 123, 255, 0.2);
}

.correct {
  background-color: rgba(0, 255, 0, 0.1);
}

.correct:hover {
  background-color: rgba(0, 255, 0, 0.2);
}

.ignore {
  background-color: rgba(169, 36, 36, 0.1);
}

.ignore:hover {
  background-color: rgba(169, 36, 36, 0.2);
}

.not-edited {
  background-color: rgba(247, 255, 129, 0.3);
}

.not-edited:hover {
  background-color: rgba(247, 255, 129, 0.5);
}

/* Improved tooltips */
.section-label .v-icon {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.section-label:hover .v-icon {
  opacity: 1;
}

.arrow-nav {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 0 0;
  grid-template-areas:
    ". up ."
    "left middle right"
    ". down .";
  margin: auto;
  align-items: center;
  justify-items: center;
}

.right {
  grid-area: right;
  justify-self: center;
  align-self: center;
}

.up {
  grid-area: up;
  justify-self: center;
  align-self: center;
}

.left {
  grid-area: left;
  justify-self: center;
  align-self: center;
}

.down {
  grid-area: down;
  justify-self: center;
  align-self: center;
}

.middle {
  grid-area: middle;
  justify-self: center;
  align-self: center;
}

.table-cell-container {
  overflow: scroll;
  min-width: fit-content;
  white-space: nowrap;
}

mat-spacer {
  margin-left: 10px;
  margin-right: 10px;
}

table,
tr,
td {
  margin: 0;
  padding: 0;
}

table,
td {
  border-collapse: collapse;
  border: 1px solid #000000;
  box-sizing: border-box;
  font-family: monospace;
  text-align: center;
}

tr {
  height: 64px;
  max-height: 100px;
}

td {
  position: relative;
}

textarea {
  max-height: 100%;
  max-width: 100%;
  border-style: none;
  white-space: pre;
  overflow: auto;
}

.table-cell {
  min-height: 64px;
  max-height: 96px;
  min-width: 3em;
  border: 1px solid #AAAAAA;
  padding: 2px 2px;
}

.edit-table-cell {
  text-align: center;
  white-space: pre;
  word-wrap: normal;
  resize: none;
  outline: none;
  overflow: hidden;
  box-sizing: border-box;
}

.zoomable {
  max-height: 80px;
}

/* Cell image snippet styling */
.zoomable {
  max-width: 100%;
  max-height: 60px;
  object-fit: contain;
  margin-bottom: 4px;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.zoomable:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.overflowAlert {
  position: absolute;
  right: 0px;
  bottom: 0px;
  display: none;
  background-color: white;
  padding: 1px;
  border-radius: 1px;
}

.highlighted {
  border: 4px solid orange;
}

.highlightedSec {
  border: 4px solid orange;
}

.editable {
  background-color: #eeeeee;
}

.center {
  margin-left: auto;
  margin-right: auto;
}

.rowlabel {
  background-color: rgba(255, 0, 0, 0.1);
}

.columnlabel {
  background-color: rgba(0, 0, 255, 0.1);
}

.nolabel {
  background-color: rgba(238, 238, 238, 0.4);
}

.highConf {
  background-color: rgba(0, 255, 0, 0.25);
}

.lowConf {
  background-color: rgba(255, 0, 0, 0.25);
}

.mediumConf {
  background-color: rgba(255, 119, 0, 0.25);
}

.noConf {
  background-color: rgba(238, 238, 238, 0.4);
}

.incorrectR {
  background-color: rgba(255, 0, 0, 0.25);
}

.incorrectC {
  background-color: rgba(255, 119, 0, 0.25);
}

.ignore {
  background-color: rgba(169, 36, 36, 0.4);
}

.correct {
  background-color: rgba(0, 255, 0, 0.25);
}

.not-edited {
  background-color: rgba(247, 255, 129, 0.645);
}

/* Unassigned cells styling */
.unassigned-cell {
  background-color: rgba(255, 235, 59, 0.6) !important;
  border: 2px dashed #ff9800 !important;
}

.unassigned-cell-button {
  background-color: rgba(255, 193, 7, 0.1);
}

.unassigned-cell-button:hover {
  background-color: rgba(255, 193, 7, 0.2);
}

/* Divided cells styling */
.divided-cell {
  background-color: rgba(227, 242, 253, 0.8) !important;
  border: 2px solid #2196f3 !important;
  box-shadow: 0 1px 3px rgba(33, 150, 243, 0.3);
}

.divided-cell:hover {
  background-color: rgba(227, 242, 253, 1) !important;
}
</style>
