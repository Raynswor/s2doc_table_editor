// Auto-generated from s2doc Python ReferenceGraph class

/**
 * TypeScript interface for Python ReferenceGraph's serialized format
 * Corresponds to the output of ReferenceGraph.to_obj() method
 */
export interface ReferenceGraph {
  /**
   * Adjacency list representation where each key is a parent node
   * and the value is an array of child node IDs
   */
  [parentId: string]: string[];
}

/**
 * Utility type for working with reference graphs
 */
export interface ReferenceGraphUtils {
  /**
   * Check if a node exists in the reference graph
   */
  contains(graph: ReferenceGraph, nodeId: string): boolean;
  
  /**
   * Get all children of a given parent node
   */
  getChildren(graph: ReferenceGraph, parentId: string): string[];
  
  /**
   * Get all parent nodes that reference a given child
   */
  getParents(graph: ReferenceGraph, childId: string): string[];
  
  /**
   * Get all root nodes (nodes with no parents)
   */
  getRoots(graph: ReferenceGraph): string[];
  
  /**
   * Get all nodes in the graph
   */
  getAllNodes(graph: ReferenceGraph): string[];

  /**
   * Get all descendants of a given node
   */
  getDescendants(graph: ReferenceGraph, nodeId: string): string[];
}

/**
 * Helper functions for working with reference graphs
 */
export const ReferenceGraphHelpers: ReferenceGraphUtils = {
  contains(graph: ReferenceGraph, nodeId: string): boolean {
    // Check if nodeId exists as a key or in any value array
    if (nodeId in graph) return true;
    return Object.values(graph).some(children => children.includes(nodeId));
  },

  getChildren(graph: ReferenceGraph, parentId: string): string[] {
    return graph[parentId] || [];
  },

  getParents(graph: ReferenceGraph, childId: string): string[] {
    return Object.keys(graph).filter(parentId => 
      graph[parentId]?.includes(childId)
    );
  },

  getDescendants(graph: ReferenceGraph, nodeId: string): string[] {
    const descendants: string[] = [];
    const traverse = (currentId: string) => {
      const children = graph[currentId] || [];
      for (const childId of children) {
        descendants.push(childId);
        traverse(childId); // Recursively find descendants
      }
    };
    traverse(nodeId);
    return descendants;
  },

  getRoots(graph: ReferenceGraph): string[] {
    const allChildren = new Set(
      Object.values(graph).flat()
    );
    return Object.keys(graph).filter(nodeId => !allChildren.has(nodeId));
  },

  getAllNodes(graph: ReferenceGraph): string[] {
    const nodes = new Set(Object.keys(graph));
    Object.values(graph).flat().forEach(nodeId => nodes.add(nodeId));
    return Array.from(nodes);
  }
};
