// Auto-generated table cell models for s2doc TypeScript integration
// Based on kieta-data-objs tableCell.model.ts

import { Element } from "./element.model";
import { RectangleRegion } from "./rectangleregion.model";

export interface ITableCellData {
  content: string;
  row_label?: boolean;
  column_label?: boolean;
  color?: string;
  // anything else
  [key: string]: any;
}

export class TableCell extends Element {
  declare region: RectangleRegion;
  declare data: ITableCellData;
  added?: boolean;
  deleted?: boolean;
  img?: string;
  rowSpan?: number;
  colSpan?: number;

  constructor(
    oid: string,
    region: RectangleRegion,
    data: ITableCellData,
    confidence?: number,
    added?: boolean,
    deleted?: boolean,
    img?: string,
    rowSpan?: number,
    colSpan?: number
  ) {
    super(oid, "tablecell", region, data, confidence);
    this.added = added;
    this.deleted = deleted;
    this.img = img;
    this.rowSpan = rowSpan;
    this.colSpan = colSpan;
  }

  /**
   * Factory method to create TableCell from dictionary/object
   */
  static override from_dict(d: Record<string, any>): TableCell {
    try {
      return new TableCell(
        d.oid,
        d.r || d.region,
        d.data,
        d.confidence,
        d.added,
        d.deleted,
        d.img,
        d.rowSpan,
        d.colSpan
      );
    } catch (error) {
      throw new Error(`Failed to load TableCell from dict: ${error}`);
    }
  }

  /**
   * Convert TableCell to object for serialization
   */
  override to_obj(): Record<string, any> {
    const result = super.to_obj();

    if (this.added !== undefined) {
      result.added = this.added;
    }
    if (this.deleted !== undefined) {
      result.deleted = this.deleted;
    }
    if (this.img !== undefined) {
      result.img = this.img;
    }
    if (this.rowSpan !== undefined) {
      result.rowSpan = this.rowSpan;
    }
    if (this.colSpan !== undefined) {
      result.colSpan = this.colSpan;
    }

    return result;
  }
}
