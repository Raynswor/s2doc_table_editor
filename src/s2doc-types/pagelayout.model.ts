// Auto-generated from s2doc Python classes

export enum TypographicLayout {
  MIXED = "MIXED",
  SINGLE_COLUMN = "SINGLE_COLUMN",
  DOUBLE_COLUMN = "DOUBLE_COLUMN"
}

export interface IPageLayout {
  rotation: number;
  typography_style: TypographicLayout;
  column_fractions?: number[];
}

export class PageLayout implements IPageLayout {
  constructor(
    rotation: number = 0,
    typography_style: TypographicLayout = TypographicLayout.MIXED,
    column_fractions?: number[]
  ) {
    this.rotation = rotation;
    this.typography_style = typography_style;
    this.column_fractions = column_fractions;
  }

  rotation: number;
  typography_style: TypographicLayout;
  column_fractions?: number[];

  static from_dict(d: Record<string, any>): PageLayout {
    try {
      return new PageLayout(
        d.rotation,
        TypographicLayout[d.typography_style.toUpperCase() as keyof typeof TypographicLayout],
        d.column_fractions
      );
    } catch (error) {
      throw new Error(`PageLayout.from_dict: Missing key or invalid data: ${error}`);
    }
  }

  to_obj(): Record<string, any> {
    return {
      rotation: this.rotation,
      typography_style: this.typography_style,
      column_fractions: this.column_fractions
    };
  }
}
