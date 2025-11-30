// Main library export file
export { default as TableEditor } from './components/TableEditor.vue'
export { useOperationManager } from './composables/useOperationManager'
export { useConfigManagement } from './composables/useConfigManagement'
export { TableCell, RectangleRegion, makeid, areMatricesEquivalent, isTableCell, getCellId } from './utils/tableHelpers'

// Export s2doc types
export { Document } from './s2doc-types/document.model'
export { Page } from './s2doc-types/page.model'
export { Element, Table } from './s2doc-types/element.model'
export { Font } from './s2doc-types/font.model'
export { RectangleRegion as S2DocRectangleRegion } from './s2doc-types/rectangleregion.model'
export type { IDocument } from './s2doc-types/document.model'
export type { IPage } from './s2doc-types/page.model'
export type { IElement } from './s2doc-types/element.model'

// Additional types
export type { TableCell as ITableCell, TableData, CellSelection, TableEditorProps, TableEditorEmits } from './types'
