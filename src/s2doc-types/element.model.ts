// Auto-generated from s2doc Python classes

import { SpanRegion } from "./spanregion.model";
import { RectangleRegion } from "./rectangleregion.model";
import { PolygonRegion } from "./polygonregion.model";
import { LineRegion } from "./lineregion.model";
import { PolylineRegion } from "./polylineregion.model";
import { Region } from "./region.model";

export type RegionType = SpanRegion | RectangleRegion | PolygonRegion | LineRegion | PolylineRegion | null;

export interface IElement {
  oid: string;
  category: string;
  region: RegionType;
  data?: Record<string, any>;
  confidence?: number;
}

export class Element implements IElement {
  oid: string;
  category: string;
  region: RegionType;
  data: Record<string, any>;
  confidence?: number;

  constructor(oid: string, category: string, region: RegionType, data?: Record<string, any>, confidence?: number) {
    this.oid = oid;
    this.category = category;
    this.region = region;
    this.data = data || {};
    this.confidence = confidence;
  }

  /**
   * Factory method to instantiate the correct subclass
   */
  static create(oid: string, category: string, region: RegionType, data?: Record<string, any>, confidence?: number): Element {
    if (category.toLowerCase() === "table") {
      return new Table(oid, region, data, confidence);
    }
    return new Element(oid, category, region, data, confidence);
  }

  toString(): string {
    return `<${this.oid}: ${JSON.stringify(this.region)} ${this.data ? JSON.stringify(this.data) : ''}>`;
  }

  /**
   * Merge another element with this one
   */
  merge(other: Element, mergeData: boolean = true, mergeConfidence: boolean = true): void {
    // Check if the other element is of the same type
    if (this.category !== other.category) {
      throw new Error(`Incompatible categories: ${this.category} vs ${other.category}`);
    }

    // Union the regions (assuming RectangleRegion has a union method)
    this.region = this.unionRegions(this.region, other.region);

    if (mergeData) {
      for (const [key, value] of Object.entries(other.data)) {
        if (key in this.data) {
          if (Array.isArray(this.data[key])) {
            this.data[key] = [...this.data[key], ...value];
          } else if (typeof this.data[key] === 'object' && this.data[key] !== null) {
            this.data[key] = { ...this.data[key], ...value };
          } else if (typeof this.data[key] === 'string') {
            this.data[key] += value;
          } else {
            this.data[key] = value;
          }
        } else {
          this.data[key] = value;
        }
      }
    }

    if (mergeConfidence) {
      if (this.confidence !== undefined && other.confidence !== undefined) {
        this.confidence = Math.max(this.confidence, other.confidence);
      } else if (other.confidence !== undefined) {
        this.confidence = other.confidence;
      }
    }
  }

  /**
   * Helper method to union two regions
   */
  private unionRegions(region1: any, region2: any): any {
    // This is a simplified merge - proper implementation would depend on region type
    // For now assuming rectangular regions with x1, y1, x2, y2 properties
    if (region1 && region2 && 'x1' in region1 && 'x1' in region2) {
      return {
        ...region1,
        x1: Math.min(region1.x1, region2.x1),
        y1: Math.min(region1.y1, region2.y1),
        x2: Math.max(region1.x2, region2.x2),
        y2: Math.max(region1.y2, region2.y2)
      };
    }
    return region1; // Fallback to first region if merge not possible
  }

  /**
   * Create Element from dictionary/object
   */
  static from_dict(d: Record<string, any>): Element {
    try {
      return Element.create(
        d.oid,
        d.c,
        Region.from_dict(d.r), // Properly deserialize region from array format
        d.data,
        d.confidence
      );
    } catch (error) {
      throw new Error(`Failed to load Element from dict: ${error}`);
    }
  }

  /**
   * Convert Element to object for serialization
   */
  to_obj(): Record<string, any> {
    const result: Record<string, any> = {
      oid: this.oid,
      c: this.category,
      r: (this.region as any).to_obj ? (this.region as any).to_obj() : this.region
    };

    if (Object.keys(this.data).length > 0) {
      result.data = this.data;
    }

    if (this.confidence !== undefined) {
      result.confidence = this.confidence;
    }

    return result;
  }
}

export class Table extends Element {
  cellNodes: Record<string, any>;
  coordToGroup: Record<string, number>;
  groupToNode: Record<number, string>;
  nRows: number;
  nCols: number;

  constructor(oid: string, boundingBox: RegionType, data?: Record<string, any>, confidence?: number) {
    super(oid, "table", boundingBox, data, confidence);

    if (data && "cells" in data) {
      const computed = this._computeCellGroups();
      this.cellNodes = computed.cellNodes;
      this.coordToGroup = computed.coordToGroup;
      this.groupToNode = computed.groupToNode;
      this.nRows = computed.nRows;
      this.nCols = computed.nCols;
    } else {
      this.cellNodes = {};
      this.coordToGroup = {};
      this.groupToNode = {};
      this.nRows = 0;
      this.nCols = 0;
    }
  }

  static fromElement(element: Element): Table {
    return new Table(element.oid, element.region, element.data, element.confidence);
  }

  static from_dict(d: Record<string, any>): Table {
    return new Table(d.oid, d.r, d.data, d.confidence);
  }

  get cells(): string[][] {
    return this.data.cells || [];
  }

  set cells(value: string[][]) {
    this.data.cells = value;
    const computed = this._computeCellGroups();
    this.cellNodes = computed.cellNodes;
    this.coordToGroup = computed.coordToGroup;
    this.groupToNode = computed.groupToNode;
    this.nRows = computed.nRows;
    this.nCols = computed.nCols;
  }

  get caption(): string {
    return this.data.caption || "";
  }

  get number(): string {
    return this.data.number || "";
  }

  *rows(): Generator<string[], void, unknown> {
    for (const row of this.cells) {
      yield row;
    }
  }

  *columns(): Generator<string[], void, unknown> {
    for (let c = 0; c < this.nCols; c++) {
      const column: string[] = [];
      for (let r = 0; r < this.nRows; r++) {
        const row = this.cells[r];
        column.push(row ? (row[c] || "") : "");
      }
      yield column;
    }
  }

  private _computeCellGroups(): {
    cellNodes: Record<string, any>;
    coordToGroup: Record<string, number>;
    groupToNode: Record<number, string>;
    nRows: number;
    nCols: number;
  } {
    const cellsArray = this.data.cells;
    const nRows = cellsArray.length;
    const nCols = nRows > 0 ? cellsArray[0].length : 0;

    const visited = new Set<string>();
    const groups: Array<[any, Array<[number, number]>]> = [];
    const coordToGroup: Record<string, number> = {};

    // Walk over every position and group contiguous positions of the same id
    for (let r = 0; r < nRows; r++) {
      for (let c = 0; c < nCols; c++) {
        const coordKey = `${r},${c}`;
        if (visited.has(coordKey)) continue;

        const cellValue = cellsArray[r][c];
        if (!cellValue) continue;

        const stack: Array<[number, number]> = [[r, c]];
        const groupCoords: Array<[number, number]> = [];

        while (stack.length > 0) {
          const [rr, cc] = stack.pop()!;
          const rrccKey = `${rr},${cc}`;

          if (visited.has(rrccKey)) continue;

          if (cellsArray[rr][cc] === cellValue) {
            visited.add(rrccKey);
            groupCoords.push([rr, cc]);

            // Check 4-connected neighbors
            const neighbors: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            for (const [dr, dc] of neighbors) {
              const rrr = rr + dr;
              const ccc = cc + dc;
              const rrrCccKey = `${rrr},${ccc}`;

              if (rrr >= 0 && rrr < nRows && ccc >= 0 && ccc < nCols) {
                if (!visited.has(rrrCccKey) && cellsArray[rrr][ccc] === cellValue) {
                  stack.push([rrr, ccc]);
                }
              }
            }
          }
        }

        groups.push([cellValue, groupCoords]);
        for (const pos of groupCoords) {
          coordToGroup[`${pos[0]},${pos[1]}`] = groups.length - 1;
        }
      }
    }

    // Build unique cell nodes for each group
    const cellNodes: Record<string, any> = {};
    const groupToNode: Record<number, string> = {};

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      if (!group) continue;
      const [cellValue, coords] = group;
      const top = Math.min(...coords.map(([r, _]: [number, number]) => r));
      const left = Math.min(...coords.map(([_, c]: [number, number]) => c));
      const bottom = Math.max(...coords.map(([r, _]: [number, number]) => r));
      const right = Math.max(...coords.map(([_, c]: [number, number]) => c));
      const nodeId = `cell_${top}_${left}`;

      cellNodes[nodeId] = {
        nodeId,
        value: cellValue,
        grid: { top, left, bottom, right },
        positions: coords
      };
      groupToNode[i] = nodeId;
    }

    return { cellNodes, coordToGroup, groupToNode, nRows, nCols };
  }

  getCellAt(row: number, col: number): Record<string, any> {
    if (!(0 <= row && row < this.nRows && 0 <= col && col < this.nCols)) {
      throw new Error("Cell position out of range");
    }

    const groupIndex = this.coordToGroup[`${row},${col}`];
    if (groupIndex === undefined) {
      return {};
    }

    const nodeId = this.groupToNode[groupIndex];
    if (nodeId === undefined) {
      return {};
    }
    return this.cellNodes[nodeId];
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
            (typeof val === 'object' && (val as any).oid === cellId)) {
          positions.push([r, c]);
        }
      }
    }

    return positions;
  }

  cellsToGraph(): Record<string, any> {
    const graph: Record<string, any> = { nodes: {}, edges: [] };

    // Create the table node
    const tableNodeId = this.oid || "table";
    graph.nodes[tableNodeId] = {
      type: "table",
      id: tableNodeId,
      rows: this.nRows,
      columns: this.nCols
    };

    // Add cell nodes and link them to the table
    for (const [nodeId, node] of Object.entries(this.cellNodes)) {
      graph.nodes[nodeId] = { type: "cell", ...node };
      graph.edges.push({
        from: tableNodeId,
        to: nodeId,
        relation: "hasCell"
      });
    }

    // Build row-based connections
    const rowsNodes: Record<number, any[]> = {};
    for (let r = 0; r < this.nRows; r++) {
      rowsNodes[r] = [];
    }

    for (const node of Object.values(this.cellNodes)) {
      const bb = (node as any).grid;
      for (let r = bb.top; r <= bb.bottom; r++) {
        if (rowsNodes[r]) {
          rowsNodes[r]!.push(node);
        }
      }
    }

    for (const [, nodes] of Object.entries(rowsNodes)) {
      const uniqueNodes = Array.from(new Map(nodes.map((n: any) => [n.nodeId, n])).values());
      const ordered = uniqueNodes.sort((a: any, b: any) => a.grid.left - b.grid.left);

      for (let i = 0; i < ordered.length - 1; i++) {
        const fromNode = ordered[i].nodeId;
        const toNode = ordered[i + 1].nodeId;

        graph.edges.push({ from: fromNode, to: toNode, relation: "nextInRow" });
        graph.edges.push({ from: toNode, to: fromNode, relation: "prevInRow" });
      }
    }

    // Build column-based connections
    const colsNodes: Record<number, any[]> = {};
    for (let c = 0; c < this.nCols; c++) {
      colsNodes[c] = [];
    }

    for (const node of Object.values(this.cellNodes)) {
      const bb = (node as any).grid;
      for (let c = bb.left; c <= bb.right; c++) {
        if (colsNodes[c]) {
          colsNodes[c]!.push(node);
        }
      }
    }

    for (const [, nodes] of Object.entries(colsNodes)) {
      const uniqueNodes = Array.from(new Map(nodes.map((n: any) => [n.nodeId, n])).values());
      const ordered = uniqueNodes.sort((a: any, b: any) => a.grid.top - b.grid.top);

      for (let i = 0; i < ordered.length - 1; i++) {
        const fromNode = ordered[i].nodeId;
        const toNode = ordered[i + 1].nodeId;

        graph.edges.push({ from: fromNode, to: toNode, relation: "nextInColumn" });
        graph.edges.push({ from: toNode, to: fromNode, relation: "prevInColumn" });
      }
    }

    return graph;
  }

  to_obj(): Record<string, any> {
    // Convert cells from elements to ids, preserving span information
    const cellsCopy: any[][] = [];
    const cells = this.cells;

    for (let rowIdx = 0; rowIdx < cells.length; rowIdx++) {
      const row = cells[rowIdx];
      const rowCopy: any[] = [];

      for (let colIdx = 0; colIdx < (row?.length || 0); colIdx++) {
        if (!row) continue;
        const cell = row[colIdx];

        if (cell === null || cell === undefined) {
          rowCopy.push(null);
        } else if (typeof cell === 'string') {
          rowCopy.push(cell);
        } else if (typeof cell === 'object') {
          // Handle object cells - preserve rowSpan and colSpan if they exist
          const cellId = (cell as any).oid || '';
          const rowSpan = (cell as any).rowSpan;
          const colSpan = (cell as any).colSpan;

          if ((rowSpan && rowSpan > 1) || (colSpan && colSpan > 1)) {
            // Store as dict with oid, rowSpan, colSpan
            const cellEntry: any = { oid: cellId };
            if (rowSpan && rowSpan > 1) {
              cellEntry.rowSpan = rowSpan;
            }
            if (colSpan && colSpan > 1) {
              cellEntry.colSpan = colSpan;
            }
            rowCopy.push(cellEntry);
          } else {
            // Just store the cell ID
            rowCopy.push(cellId);
          }
        } else {
          rowCopy.push(cell);
        }
      }

      cellsCopy.push(rowCopy);
    }

    const result = super.to_obj();
    if (result.data) {
      result.data.cells = cellsCopy;
    }
    return result;
  }
}