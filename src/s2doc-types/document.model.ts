// Auto-generated from s2doc Python classes
import { NormalizedObj } from "./normalizedobj.model";
import { Page } from "./page.model";
import { Element } from "./element.model";
import { Revision } from "./revision.model";
import { Font } from "./font.model";
import type { ReferenceGraph } from "./referencegraph.model";
import { ReferenceGraphHelpers } from "./referencegraph.model";
import type {SemanticNetwork} from "./semanticnetwork.model";



/**
 * Validates and converts a dictionary to ReferenceGraph format
 * @param data - The input data to validate
 * @returns ReferenceGraph object if valid
 * @throws Error if data is invalid
 */
function validateReferenceGraph(data: any): ReferenceGraph {
  if (!data || typeof data !== 'object') {
    throw new Error('ReferenceGraph data must be an object');
  }

  // Validate that all values are arrays of strings
  for (const [key, value] of Object.entries(data)) {
    if (!Array.isArray(value)) {
      throw new Error(`ReferenceGraph: value for key "${key}" must be an array`);
    }
    if (!value.every(item => typeof item === 'string')) {
      throw new Error(`ReferenceGraph: all items in array for key "${key}" must be strings`);
    }
  }

  return data as ReferenceGraph;
}

export interface IDocument {
  oid: string;
  pages: NormalizedObj<Page>;
  elements?: NormalizedObj<Element>;
  references?: ReferenceGraph;
  revisions?: Revision[];
  fonts?: Font[];
  semantic_network?: SemanticNetwork;
  semantic_references?: ReferenceGraph;
  metadata?: any;
  raw_data?: any;
}

export class Document implements IDocument {
  constructor(oid: string, pages?: NormalizedObj<Page>, elements?: NormalizedObj<Element>, references?: ReferenceGraph, revisions?: Revision[], fonts?: Font[], semantic_network?: SemanticNetwork, semantic_references?: ReferenceGraph, metadata?: any, raw_data?: any) {
    this.oid = oid;
    this.pages = pages || new NormalizedObj<Page>();
    this.elements = elements;
    this.references = references;
    this.revisions = revisions;
    this.fonts = fonts;
    this.semantic_network = semantic_network;
    this.semantic_references = semantic_references;
    this.metadata = metadata;
    this.raw_data = raw_data;
  }

  oid: string;
  pages: NormalizedObj<Page>;
  elements?: NormalizedObj<Element>;
  references?: ReferenceGraph;
  revisions?: Revision[];
  fonts?: Font[];
  semantic_network?: SemanticNetwork;
  semantic_references?: ReferenceGraph;
  metadata?: any;
  raw_data?: any;

  static from_dict(d: Record<string, any>): Document {
    // Validate required fields
    if (!d || typeof d !== 'object' || !d.oid || !d.pages || !d.elements) {
      throw new Error(`Document.from_dict: Invalid input: missing required fields`);
    }

    try {
      return new Document(
        d.oid,
        NormalizedObj.from_dict<Page>(d.pages, "pages"),
        NormalizedObj.from_dict<Element>(d.elements, "elements"),
        d.references ? validateReferenceGraph(d.references) : undefined,
        d.revisions ? d.revisions.map((rev: any) => Revision.from_dict(rev)) : undefined,
        d.fonts ? d.fonts.map((font: any) => Font.from_dict(font)) : undefined,
        d.semantic_network || undefined,
        d.semantic_references ? validateReferenceGraph(d.semantic_references) : undefined,
        d.metadata || {},
        d.raw_data || undefined
      );
    } catch (error) {
      throw new Error(`Document.from_dict: ${error}`);
    }
  }

  to_obj(): Record<string, any> {
    return {
      oid: this.oid,
      pages: this.pages && typeof this.pages === 'object' && 'to_obj' in this.pages
        ? (this.pages as any).to_obj()
        : this.pages,
      elements: this.elements && typeof this.elements === 'object' && 'to_obj' in this.elements
        ? (this.elements as any).to_obj()
        : this.elements,
      references: this.references && typeof this.references === 'object' && 'to_obj' in this.references
        ? (this.references as any).to_obj()
        : this.references,
      revisions: Array.isArray(this.revisions)
        ? this.revisions.map((rev: any) =>
            rev && typeof rev === 'object' && 'to_obj' in rev ? rev.to_obj() : rev
          )
        : this.revisions,
      fonts: Array.isArray(this.fonts)
        ? this.fonts.map((font: any) =>
            font && typeof font === 'object' && 'to_obj' in font ? font.to_obj() : font
          )
        : this.fonts,
      metadata: this.metadata,
      raw_data: this.raw_data,
      semantic_network: this.semantic_network && typeof this.semantic_network === 'object' && 'to_obj' in this.semantic_network
        ? (this.semantic_network as any).to_obj()
        : this.semantic_network,
      semantic_references: this.semantic_references && typeof this.semantic_references === 'object' && 'to_obj' in this.semantic_references
        ? (this.semantic_references as any).to_obj()
        : this.semantic_references
    };
  }

  findPageOfElement(elementId: string): Page | null {
    if (!this.elements || !this.pages || !this.references) return null;

    const element = this.elements.get(elementId);
    if (!element) return null;

    // Find the page that contains this element
    const parentIds = ReferenceGraphHelpers.getParents(this.references, elementId);
    for (const pageId of parentIds) {
      const page = this.pages.get(pageId);
      if (page) {
        return page; // Return the first matching page
      }
    }

    return null; // Element not found on any page
  }





















  /**
   * Get element by ID (client-side only)
   */
  getElementObj(elementId: string): Element | null {
    return this.elements?.get(elementId) || null;
  }

  /**
   * Add element to document (client-side only, no server persistence)
   */
  addElement(
    page: string | Page,
    category: string,
    region: any,
    data?: Record<string, any>,
    confidence?: number,
    referencedBy?: string
  ): string {
    // Generate element ID
    const elementId = `${page instanceof Object ? page.oid : page}-${category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create element
    const element = Element.create(elementId, category, region, data, confidence);

    // Add to elements collection
    if (!this.elements) {
      this.elements = new NormalizedObj<Element>();
    }
    this.elements.add(element);

    // Add to references
    const pageId = page instanceof Object ? page.oid : page;
    if (this.references) {
      if (!this.references[pageId]) {
        this.references[pageId] = [];
      }
      this.references[pageId].push(elementId);

      // Add reference from parent if provided
      if (referencedBy) {
        if (!this.references[referencedBy]) {
          this.references[referencedBy] = [];
        }
        this.references[referencedBy].push(elementId);
      }
    }

    return elementId;
  }

  /**
   * Delete element from document (client-side only)
   */
  deleteElement(elementId: string): void {
    if (!this.elements || !this.references) return;

    // Remove from elements
    if (this.elements.byId?.[elementId]) {
      delete this.elements.byId[elementId];

      if (this.elements.allIds) {
        const index = this.elements.allIds.indexOf(elementId);
        if (index !== -1) {
          this.elements.allIds.splice(index, 1);
        }
      }
    }

    // Remove from all references
    for (const [, childIds] of Object.entries(this.references)) {
      if (Array.isArray(childIds)) {
        const idx = childIds.indexOf(elementId);
        if (idx !== -1) {
          childIds.splice(idx, 1);
        }
      }
    }

    // Also remove references where this element is the parent
    if (this.references[elementId]) {
      delete this.references[elementId];
    }
  }

  /**
   * Get element data value (concatenates content from referenced elements)
   */
  getElementDataValue(elementId: string): string[] {
    const element = this.getElementObj(elementId);
    if (!element) return [];

    // If element has direct content, return it
    if (element.data?.content) {
      return [element.data.content];
    }

    // Otherwise, gather content from referenced children
    const children = this.references?.[elementId] || [];
    const content: string[] = [];

    for (const childId of children) {
      const child = this.getElementObj(childId);
      if (child?.data?.content) {
        content.push(child.data.content);
      }
    }

    return content;
  }

  /**
   * Find page of element, returning as string if requested
   */
  findPageOfElementAsString(elementId: string): string | null {
    const page = this.findPageOfElement(elementId);
    return page?.oid || null;
  }

  /**
   * Add a reference from parent to child
   */
  addReference(parentId: string, childId: string): void {
    if (!this.references) {
      this.references = {};
    }

    if (!this.references[parentId]) {
      this.references[parentId] = [];
    }

    // Defensive: only add reference if the child element exists in elements.byId
    // This prevents orphaned references that point to non-existent elements
    const hasChild = !!(this.elements && (this.elements as any).byId && (this.elements as any).byId[childId]);
    if (!hasChild) {
      // Log with some context to help trace origin of stray references
      // Do not throw here; just skip adding the invalid reference
      // Use console.warn instead of console.error so flows are not interrupted
      try {
        // Attempt to surface a light stack for debugging in development
        const stack = new Error().stack;
        // eslint-disable-next-line no-console
        console.warn(`Document.addReference: child '${childId}' not found in elements.byId; skipping reference from '${parentId}'.`, { parentId, childId, stack });
      } catch (e) {
        // ignore
      }
      return;
    }

    if (!this.references[parentId].includes(childId)) {
      this.references[parentId].push(childId);
    }
  }

  /**
   * Remove a reference from parent to child
   */
  removeReference(parentId: string, childId: string): void {
    if (!this.references || !this.references[parentId]) return;

    const index = this.references[parentId].indexOf(childId);
    if (index !== -1) {
      this.references[parentId].splice(index, 1);
    }
  }

  /**
   * Get children of an element
   */
  getChildren(parentId: string): string[] {
    if (!this.references) return [];
    return ReferenceGraphHelpers.getChildren(this.references, parentId);
  }

  /**
   * Get parents (ancestors) of an element
   */
  getAncestors(childId: string): string[] {
    if (!this.references) return [];
    return ReferenceGraphHelpers.getParents(this.references, childId);
  }
}