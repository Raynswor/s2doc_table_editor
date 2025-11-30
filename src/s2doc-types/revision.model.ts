// Auto-generated from s2doc Python classes

export interface IRevision {
  timestamp: string;
  objects?: any;
  comment?: string;
  del_objs?: any;
  reference_revoked?: boolean;
}

export class Revision implements IRevision {
  constructor(timestamp: string, objects?: any, comment?: string, del_objs?: any, reference_revoked?: boolean) {
    this.timestamp = timestamp;
    this.objects = objects;
    this.comment = comment;
    this.del_objs = del_objs;
    this.reference_revoked = reference_revoked;
  }

  timestamp: string;
  objects?: any;
  comment?: string;
  del_objs?: any;
  reference_revoked?: boolean;
  
  static from_dict(d: Record<string, any>): Revision {
    try {
      return new Revision(
        d.timestamp,
        d.objects || new Set(),
        d.comment || '',
        d.del_objs || null,
        d.reference_revoked || false
      );
    } catch (error) {
      throw new Error(`Revision.from_dict: Failed to load Revision from dict: ${error}`);
    }
  }

  to_obj(): Record<string, any> {
    const result: Record<string, any> = {
      timestamp: this.timestamp,
      objects: this.objects,
      comment: this.comment,
      reference_revoked: this.reference_revoked
    };
    
    if (this.del_objs) {
      result.del_objs = this.del_objs;
    }
    
    return result;
  }

}