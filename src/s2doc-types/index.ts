// Auto-generated TypeScript definitions for s2doc

export type { IDocument } from './document.model';
export type { IPage } from './page.model';
export type { IElement } from './element.model';
export type { IFont } from './font.model';
export type { IRectangleRegion } from './rectangleregion.model';
export type { ISpanRegion } from './spanregion.model';
export type { ILineRegion } from './lineregion.model';
export type { IPolygonRegion } from './polygonregion.model';
export type { ISpace } from './space.model';
export type { IRevision } from './revision.model';
export type { ReferenceGraph, ReferenceGraphUtils } from './referencegraph.model';

// Semantic Network types
export type { SemanticEntity, SemanticRelationship, SemanticNetwork } from './semanticnetwork.model';

// Additional models from kieta-data-objs integration
export type { Constraint, ConstraintTemplate } from './constraint.model';
export type { ITableCellData } from './tablecell.model';
export type { NormalizedObj } from './normalizedobj.model';
export type { ObjectType } from './objecttype.model';
export type { Parameter, PipelineModule, Pipeline } from './pipeline.model';

export { Document } from './document.model';
export { Page } from './page.model';
export { Element, Table } from './element.model';
export { Font } from './font.model';
export { RectangleRegion } from './rectangleregion.model';
export { SpanRegion } from './spanregion.model';
export { LineRegion } from './lineregion.model';
export { PolygonRegion } from './polygonregion.model';
export { Space } from './space.model';
export { Revision } from './revision.model';
export { ReferenceGraphHelpers } from './referencegraph.model';

// Additional classes from kieta-data-objs integration
export { PipelineDefinition } from './pipeline.model';
export { TableCell } from './tablecell.model';

// Utility functions
export { base64ToImg, imgToBase64, getInImgSpace, getInXmlSpace } from './utils';

// API Client and utilities
export { S2DocAPIClient, createS2DocClient, defaultS2DocClient } from './api-client';
export type { S2DocAPIConfig } from './api-client';
export { useS2Doc } from './composable';
export type { UseS2DocOptions } from './composable';