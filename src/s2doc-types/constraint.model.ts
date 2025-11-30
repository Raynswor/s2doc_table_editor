// Auto-generated constraint models for s2doc TypeScript integration
// Based on kieta-data-objs constraint.model.ts

export interface Constraint {
  name: string;
  value?: [...any];
  group: string[];
  options?: string[] | number[];
  type: string;
  exe: string; //(value: string | string[], ...args: any) => boolean;
  description?: string;
}

export interface ConstraintTemplate {
  tableBody: Constraint[][][];
  tableHead_Row: Constraint[][][];
  tableHead_Col: Constraint[][][];
  tableWide: Constraint[][][];
  orientation: string;
}
