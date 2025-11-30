// Auto-generated from s2doc Python classes

import type { IRegion } from "./region.model";

export interface IRectangleRegion extends IRegion {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  space?: string;
}

export class RectangleRegion implements IRectangleRegion {
  constructor(x1: number, y1: number, x2: number, y2: number, space?: string) {
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

  to_obj(): any[] {
    return ["rr", this.x1, this.y1, this.x2, this.y2, this.space];
  }

  static from_dict(d: any[]): RectangleRegion {
    if (d.length !== 5) {
      throw new Error(`RectangleRegion.from_dict: Incorrect number of parameters. Expected 5, got ${d.length}`);
    }
    return new RectangleRegion(d[0], d[1], d[2], d[3], d[4]);
  }

}