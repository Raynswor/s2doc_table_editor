// Simplified type definitions for standalone table editor

export interface TableCell {
  id: string
  row: number
  col: number
  rowSpan: number
  colSpan: number
  content: string
  textContent?: string
  isHeader?: boolean
  style?: Record<string, any>
}

export interface TableData {
  rows: number
  cols: number
  cells: TableCell[]
  metadata?: Record<string, any>
}

export interface CellSelection {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
}

export interface TableEditorProps {
  tableData: TableData | null
  enableUnassignedCells?: boolean
  documentContext?: any
  tableElementId?: string | null
}

export interface TableEditorEmits {
  (e: 'save', data: TableData): void
  (e: 'change', data: TableData): void
  (e: 'update:tableData', data: TableData): void
}
