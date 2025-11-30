// Auto-generated from s2doc Python classes
// Extended with full table manipulation functionality

import { Region } from './region.model';
import { Element, type RegionType } from './element.model';

export interface ITable {
  oid: string;
  category: string;
  region: RegionType;
  data?: any;
  confidence?: number;
}

/**
 * Cell node information for managing merged cells
 */
interface CellNode {
  grid: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  positions: Array<[number, number]>;
}

/**
 * Table class extending Element with table-specific functionality
 */
export class Table extends Element implements ITable {
  // Cell grouping data structures for managing merged cells
  cellNodes: Map<string, CellNode> = new Map();
  coordToGroup: Map<string, number> = new Map(); // key: "row,col"
  groupToNode: Map<number, string> = new Map();
  nRows: number = 0;
  nCols: number = 0;

  constructor(oid: string, region: RegionType, data?: any, confidence?: number) {
    super(oid, 'table', region, data, confidence);

    // Initialize cell grouping if cells exist
    if (this.data?.cells) {
      this._computeCellGroups();
    } else {
      this.data = this.data || {};
      this.data.cells = [];
    }
  }

  /**
   * Get cells matrix
   */
  get cells(): any[][] {
    return this.data?.cells || [];
  }

  /**
   * Set cells matrix and recompute cell groups
   */
  set cells(value: any[][]) {
    if (!this.data) this.data = {};
    this.data.cells = value;
    this._computeCellGroups();
  }

  /**
   * Compute cell groups for handling merged cells
   * Groups contiguous grid positions with the same cell id
   */
  private _computeCellGroups(): void {
    const cellsArray = this.data?.cells || [];
    this.nRows = cellsArray.length;
    this.nCols = this.nRows > 0 ? Math.max(...cellsArray.map((row: any[]) => row.length)) : 0;

    const visited = new Set<string>();
    const groups: Array<[any, Array<[number, number]>]> = [];
    this.coordToGroup.clear();

    // Walk over every position and group contiguous positions of the same id
    for (let r = 0; r < this.nRows; r++) {
      for (let c = 0; c < this.nCols; c++) {
        const coordKey = `${r},${c}`;
        if (visited.has(coordKey)) continue;

        const cellValue = cellsArray[r]?.[c];
        if (!cellValue) continue;

        const stack: Array<[number, number]> = [[r, c]];
        const groupCoords: Array<[number, number]> = [];

        while (stack.length > 0) {
          const [rr, cc] = stack.pop()!;
          const rrccKey = `${rr},${cc}`;

          if (visited.has(rrccKey)) continue;

          const currentCell = cellsArray[rr]?.[cc];
          if (this._cellValuesEqual(currentCell, cellValue)) {
            visited.add(rrccKey);
            groupCoords.push([rr, cc]);

            // Check 4-connected neighbors
            const neighbors: Array<[number, number]> = [
              [rr + 1, cc],
              [rr - 1, cc],
              [rr, cc + 1],
              [rr, cc - 1]
            ];

            for (const [rrr, ccc] of neighbors) {
              const rrrCccKey = `${rrr},${ccc}`;
              if (
                rrr >= 0 && rrr < this.nRows &&
                ccc >= 0 && ccc < this.nCols &&
                !visited.has(rrrCccKey) &&
                this._cellValuesEqual(cellsArray[rrr]?.[ccc], cellValue)
              ) {
                stack.push([rrr, ccc]);
              }
            }
          }
        }

        if (groupCoords.length > 0) {
          groups.push([cellValue, groupCoords]);
        }
      }
    }

    // Build unique cell nodes for each group
    this.cellNodes.clear();
    this.groupToNode.clear();

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      if (!group) continue;
      const [cellValue, coords] = group;
      const nodeId = this._getCellId(cellValue);

      const top = Math.min(...coords.map(([r]: [number, number]) => r));
      const left = Math.min(...coords.map(([, c]: [number, number]) => c));
      const bottom = Math.max(...coords.map(([r]: [number, number]) => r));
      const right = Math.max(...coords.map(([, c]: [number, number]) => c));

      this.cellNodes.set(nodeId, {
        grid: { top, left, bottom, right },
        positions: coords
      });

      this.groupToNode.set(i, nodeId);

      // Map each coordinate to this group index
      for (const coord of coords) {
        this.coordToGroup.set(`${coord[0]},${coord[1]}`, i);
      }
    }
  }

  /**
   * Helper to check if two cell values are equal
   */
  private _cellValuesEqual(cell1: any, cell2: any): boolean {
    const id1 = this._getCellId(cell1);
    const id2 = this._getCellId(cell2);
    return id1 === id2;
  }

  /**
   * Helper to extract cell ID from various cell formats
   */
  private _getCellId(cell: any): string {
    if (typeof cell === 'string') return cell;
    if (cell?.oid) return cell.oid;
    if (cell?.id) return cell.id;
    return String(cell);
  }

  /**
   * Get the unique cell info that covers the given grid position
   */
  getCellAt(row: number, col: number): { cellId: string; cellInfo: CellNode | null } {
    if (row < 0 || row >= this.nRows || col < 0 || col >= this.nCols) {
      throw new Error('Cell position out of range');
    }

    const groupIndex = this.coordToGroup.get(`${row},${col}`);
    if (groupIndex === undefined) {
      return { cellId: '', cellInfo: null };
    }

    const nodeId = this.groupToNode.get(groupIndex);
    if (!nodeId) {
      return { cellId: '', cellInfo: null };
    }

    const cellInfo = this.cellNodes.get(nodeId) || null;
    return { cellId: nodeId, cellInfo };
  }

  /**
   * Get all grid positions covered by the given cell ID
   */
  getRowsColsOfCell(cellId: string): Array<[number, number]> {
    const positions: Array<[number, number]> = [];

    for (let r = 0; r < this.nRows; r++) {
      const row = this.cells[r];
      if (!row) continue;

      for (let c = 0; c < this.nCols; c++) {
        const val = row[c];
        if (!val) continue;

        if (val === cellId ||
            (typeof val === 'object' && val.oid === cellId)) {
          positions.push([r, c]);
        }
      }
    }

    return positions;
  }

  /**
   * Create Table from dictionary
   */
  static override from_dict(d: Record<string, any>): Table {
    return new Table(
      d.oid,
      Region.from_dict(d.r || d.region || d.boundingBox),
      d.data,
      d.confidence
    );
  }

  /**
   * Convert Table to dictionary
   */
  override to_obj(): Record<string, any> {
    // Convert cells from elements to ids, preserving span information
    const cellsCopy: any[][] = [];
    const cells = this.cells;

    for (let rowIdx = 0; rowIdx < cells.length; rowIdx++) {
      const row = cells[rowIdx];
      if (!row) {
        cellsCopy.push([]);
        continue;
      }
      const rowCopy: any[] = [];

      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const cell = row[colIdx];

        if (cell === null || cell === undefined) {
          rowCopy.push(null);
        } else if (typeof cell === 'string') {
          rowCopy.push(cell);
        } else if (typeof cell === 'object') {
          // Preserve rowSpan and colSpan if they exist
          const cellId = cell.oid || '';
          if (cell.rowSpan || cell.colSpan) {
            const cellEntry: any = { oid: cellId };
            if (cell.rowSpan) cellEntry.rowSpan = cell.rowSpan;
            if (cell.colSpan) cellEntry.colSpan = cell.colSpan;
            rowCopy.push(cellEntry);
          } else {
            rowCopy.push(cellId);
          }
        }
      }

      cellsCopy.push(rowCopy);
    }

    const obj = super.to_obj();
    if (obj.data) {
      obj.data.cells = cellsCopy;
    }

    return obj;
  }
}