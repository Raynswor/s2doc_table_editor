// Utility classes and functions for table editor

export class RectangleRegion {
  x1: number
  y1: number
  x2: number
  y2: number

  constructor(x1: number = 0, y1: number = 0, x2: number = 0, y2: number = 0) {
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
  }
}

export class TableCell {
  oid: string
  category: string = 'TableCell'
  region: RectangleRegion
  data: {
    content?: string
    row_label?: boolean
    column_label?: boolean
    color?: string
    [key: string]: any
  }
  confidence?: number
  added?: boolean
  deleted?: boolean
  img?: string
  rowSpan: number
  colSpan: number
  boundingBox: RectangleRegion

  constructor(
    oid: string,
    region: RectangleRegion,
    data: any = {},
    confidence?: number,
    added?: boolean,
    deleted?: boolean,
    img?: string,
    rowSpan: number = 1,
    colSpan: number = 1
  ) {
    this.oid = oid
    this.region = region
    this.boundingBox = region  // Alias for compatibility
    this.data = data
    this.confidence = confidence
    this.added = added
    this.deleted = deleted
    this.img = img
    this.rowSpan = rowSpan
    this.colSpan = colSpan
  }

  merge(other: TableCell) {
    if (other.data.content) {
      this.data.content = (this.data.content ? this.data.content + ' ' : '') + other.data.content;
    }
  }
}

export function makeid(length: number): string {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export function areMatricesEquivalent(matrix1: any, matrix2: any): boolean {
  if (!matrix1 || !matrix2) return false
  if (matrix1.length !== matrix2.length) return false

  for (let i = 0; i < matrix1.length; i++) {
    if (!matrix1[i] || !matrix2[i]) continue
    if (matrix1[i].length !== matrix2[i].length) return false

    for (let j = 0; j < matrix1[i].length; j++) {
      const cell1 = matrix1[i][j]
      const cell2 = matrix2[i][j]

      // Compare cell IDs and basic content
      if (getCellId(cell1) !== getCellId(cell2)) return false

      // For objects, compare key content properties
      if (typeof cell1 === 'object' && typeof cell2 === 'object') {
        if (cell1?.data?.content !== cell2?.data?.content) return false
        if (cell1?.data?.row_label !== cell2?.data?.row_label) return false
        if (cell1?.data?.column_label !== cell2?.data?.column_label) return false
      }
    }
  }
  return true
}

export function isTableCell(cell: any): cell is TableCell {
  return typeof cell === 'object' && cell !== null && 'oid' in cell
}

export function getCellId(cell: TableCell | Element | string | undefined): string {
  if (cell === undefined || cell === null) return "";
  return isTableCell(cell) ? cell.oid : (typeof cell === 'string' ? cell : "");
}

interface Element {
  oid: string
  [key: string]: any
}
