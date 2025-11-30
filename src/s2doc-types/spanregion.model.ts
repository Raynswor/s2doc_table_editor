// Auto-generated from s2doc Python classes


import type { IRegion } from "./region.model";

export interface ISpanRegion extends IRegion {
  start: number;
  end: number;
  space?: string;
}

export class SpanRegion implements ISpanRegion {
  constructor(start: number, end: number, space?: string) {
    this.start = start;
    this.end = end;
    this.space = space;
  }

  start: number;
  end: number;
  space?: string;

  to_obj(): any[] {
    return ["s", this.start, this.end, this.space];
  }

  static from_dict(d: any[]): SpanRegion {
    if (d.length !== 3) {
      throw new Error(`SpanRegion.from_dict: Incorrect number of parameters. Expected 3, got ${d.length}`);
    }
    return new SpanRegion(d[0], d[1], d[2]);
  }

}