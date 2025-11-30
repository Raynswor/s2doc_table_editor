// Auto-generated from s2doc Python classes

import type { IRegion } from "./region.model";

export interface IPolygonRegion extends IRegion {
  points: [number, number][];
  space?: string;
}

export class PolygonRegion implements IPolygonRegion {
  constructor(points: [number, number][], space?: string) {
    this.points = points;
    this.space = space;
  }

  points: [number, number][];
  space?: string;

  to_obj(): any[] {
    return ["pr", this.points, this.space];
  }

  static from_dict(d: any[]): PolygonRegion {
    if (d.length !== 5 && d.length !== 2) {
      console.error('Invalid PolygonRegion data:', d);
      throw new Error(`PolygonRegion.from_dict: Incorrect number of parameters. Expected 5, got ${d.length}`);
    }
    if (d.length === 5) {
      return new PolygonRegion([[d[0], d[1]], [d[2], d[3]]], d[4]);
    }
    if (d.length === 2) {
      return new PolygonRegion(d[0], d[1]);
    }
    throw new Error(`PolygonRegion.from_dict: Unreachable code`);
  }
}