// Auto-generated from s2doc Python classes

export interface ISpace {
  label: string;
  dimensions: number[];
  axis_directions?: boolean[];
}

export class Space implements ISpace {
  constructor(label: string, dimensions: number[], axis_directions?: boolean[]) {
    this.label = label;
    this.dimensions = dimensions;
    this.axis_directions = axis_directions;
  }

  label: string;
  dimensions: number[];
  axis_directions?: boolean[];
  
  static from_dict(d: Record<string, any>): Space {
    try {
      return new Space(
        d.label,
        d.dimensions.map((x: any) => parseFloat(x)),
        d.axis_directions || []
      );
    } catch (error) {
      throw new Error(`Space.from_dict: Failed to load Space from dict: ${error}`);
    }
  }

  to_obj(): Record<string, any> {
    return {
      label: this.label,
      dimensions: this.dimensions,
      axis_directions: this.axis_directions
    };
  }

}