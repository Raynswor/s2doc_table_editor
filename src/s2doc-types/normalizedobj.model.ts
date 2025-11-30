// Auto-generated normalized object utility type for s2doc TypeScript integration
// Based on kieta-data-objs normalizedObj.model.ts

import { Element } from "./element.model";
import { Page } from "./page.model";

export interface INormalizedObj<T> {
  byId: Record<string, T>;
  allIds: string[];
}

export class NormalizedObj<T> implements INormalizedObj<T> {
  byId: Record<string, T>;
  allIds: string[];

  constructor(byId?: Record<string, T>) {
    this.byId = byId || {};
    this.allIds = Object.keys(this.byId);
  }

  values(): T[] {
    return Object.values(this.byId);
  }

  items(): Array<[string, T]> {
    return Object.entries(this.byId);
  }

  get(key: string, defaultValue?: T): T | undefined {
    return this.byId[key] ?? defaultValue;
  }

  add(obj: T): void {
    const key = (obj as any).oid;
    if (key) {
      this.byId[key] = obj;
      if (!this.allIds.includes(key)) {
        this.allIds.push(key);
      }
    }
  }

  remove(obj: T | string): void {
    const oid = typeof obj === 'string' ? obj : (obj as any).oid;
    if (oid && oid in this.byId) {
      delete this.byId[oid];
      this.allIds = this.allIds.filter(id => id !== oid);
    }
  }

  static from_dict<T>(dic: Record<string, any>, what: string): NormalizedObj<T> {
    // Map to constructor functions
    const clsMap: Record<string, any> = {
      'elements': Element,
      'pages': Page
    };

    const objCls = clsMap[what];
    
    // Check if it's a trie format (first element doesn't contain oid)
    let flatDic = dic;
    if (Object.keys(dic).length > 0) {
      const firstValue = Object.values(dic)[0] as any;
      if (firstValue && typeof firstValue === 'object' && !('oid' in firstValue)) {
        // TODO: Implement flatten_compressed_trie when needed
        flatDic = dic;
      }
    }

    try {
      const byId: Record<string, T> = {};
      
      if (objCls && objCls.from_dict) {
        // Use the class from_dict method
        for (const [k, v] of Object.entries(flatDic)) {
          byId[k] = objCls.from_dict(v);
        }
      } else {
        // Direct assignment for now
        Object.assign(byId, flatDic);
      }
      
      return new NormalizedObj<T>(byId);
    } catch (error) {
      throw new Error(`NormalizedObj.from_dict: Failed to load ${what}: ${error}`);
    }
  }

  to_obj(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [k, v] of Object.entries(this.byId)) {
      if (v && typeof v === 'object' && 'to_obj' in v) {
        result[k] = (v as any).to_obj();
      } else {
        result[k] = v;
      }
    }
    
    // TODO: Implement build_compressed_trie when needed
    return result;
  }

  findIndex(key: string): number {
    return this.allIds.indexOf(key);
  }

  get length(): number {
    return this.allIds.length;
  }
}
