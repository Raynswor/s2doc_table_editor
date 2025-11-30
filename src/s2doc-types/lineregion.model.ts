// Auto-generated from s2doc Python classes


import type { IRegion } from "./region.model";

export interface ILineRegion extends IRegion {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  space?: string;
}

export class LineRegion implements ILineRegion {
  constructor(x1: number, y1: number, x2: number, y2: number, space?: string) {
    // Ensure x1 and x2 are at least 1 pixel apart for visibility
    if (Math.abs(x2 - x1) < 1) {
      if (x2 >= x1) {
        x2 = x1 + 1;
      } else {
        x2 = x1 - 1;
      }
    }

    // Ensure y1 and y2 are at least 1 pixel apart for visibility
    if (Math.abs(y2 - y1) < 1) {
      if (y2 >= y1) {
        y2 = y1 + 1;
      } else {
        y2 = y1 - 1;
      }
    }

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.space = space;
  }

  x1: number;
  y1: number;
  x2: number;
  y2: number;
  space?: string;

  static from_dict(d: any[]): LineRegion {
    if (d.length !== 5) {
      throw new Error(`LineRegion.from_dict: Incorrect number of parameters. Expected 5, got ${d.length}`);
    }
    return new LineRegion(d[0], d[1], d[2], d[3], d[4]);
  }

  to_obj(): any[] {
    return ["lr", this.x1, this.y1, this.x2, this.y2, this.space];
  }

}