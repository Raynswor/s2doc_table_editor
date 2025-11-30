// Auto-generated from s2doc Python classes

export interface IFont {
  label: string;
  color: string;
  size: number;
  style?: any;
}

export class Font implements IFont {
  constructor(label: string, color: string, size: number, style?: any) {
    this.label = label;
    this.color = color;
    this.size = size;
    this.style = style;
  }

  label: string;
  color: string;
  size: number;
  style?: any;
  
  static from_dict(d: Record<string, any>): Font {
    try {
      return new Font(
        d.label,
        d.color,
        parseFloat(d.size),
        d.style
      );
    } catch (error) {
      throw new Error(`Font.from_dict: Failed to load Font from dict: ${error}`);
    }
  }

  to_obj(): Record<string, any> {
    return {
      label: this.label,
      color: this.color,
      size: this.size,
      style: this.style
    };
  }

}