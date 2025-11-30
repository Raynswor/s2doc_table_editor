// Auto-generated from s2doc Python classes

import type { IRegion } from "./region.model";

export interface IPolylineRegion extends IRegion {
  points: [number, number][];
  space?: string;
}

export class PolylineRegion implements IPolylineRegion {
  constructor(points: [number, number][], space?: string) {
    this.points = points;
    this.space = space;
  }

  points: [number, number][];
  space?: string;

  static from_dict(d: any[]): PolylineRegion {
    if (d.length !== 2) {
      throw new Error(`PolylineRegion.from_dict: Incorrect number of parameters. Expected 2, got ${d.length}`);
    }
    return new PolylineRegion(d[0], d[1]);
  }

  to_obj(): any[] {
    return ["pl", this.points, this.space];
  }
}
