// Auto-generated from s2doc Python classes

import { PageLayout } from "./pagelayout.model";
import { Space } from "./space.model";

export interface IPage {
  oid: string;
  number: number;
  img?: any;
  spaces?: Record<string, Space>;
  layout?: PageLayout;
  metadata?: any;
}

export class Page implements IPage {
  constructor(oid: string, number: number, img?: any, spaces?: Record<string, Space>, layout?: PageLayout, metadata?: any) {
    this.oid = oid;
    this.number = number;
    this.img = img;
    this.spaces = spaces;
    this.layout = layout;
    this.metadata = metadata;
  }

  oid: string;
  number: number;
  img?: any;
  spaces?: Record<string, Space>;
  layout?: PageLayout;
  metadata?: any;
  
  static from_dict(d: Record<string, any>): Page {
    // Handle layout if present
    const layout = (d.layout && d.layout) ? PageLayout.from_dict(d.layout) : undefined;
    
    // Handle different space formats (legacy xml_width/xml_height vs modern spaces)
    let spaces: Record<string, Space> | undefined;
    if (d.xml_width !== undefined) {
      spaces = {
        xml: new Space("xml", [parseFloat(d.xml_width), parseFloat(d.xml_height)], [true, false]),
        img: new Space("img", [parseFloat(d.img_width), parseFloat(d.img_height)], [true, false])
      };
    } else if (d.spaces) {
      spaces = {};
      for (const [k, v] of Object.entries(d.spaces)) {
        spaces[k] = Space.from_dict(v as Record<string, any>);
      }
    }

    try {
      return new Page(
        d.oid,
        d.number,
        d.img,
        spaces,
        layout,
        d.metadata || {}
      );
    } catch (error) {
      throw new Error(`Page.from_dict: Failed to load Page from dict: ${error}`);
    }
  }

  to_obj(): Record<string, any> {
    return {
      oid: this.oid,
      number: this.number,
      img: this.img,
      spaces: this.spaces && typeof this.spaces === 'object' 
        ? Object.fromEntries(
            Object.entries(this.spaces).map(([k, v]) => [
              k, 
              v && typeof v === 'object' && 'to_obj' in v ? (v as any).to_obj() : v
            ])
          )
        : this.spaces,
      layout: this.layout && typeof this.layout === 'object' && 'to_obj' in this.layout 
        ? (this.layout as any).to_obj() 
        : this.layout,
      metadata: this.metadata
    };
  }

}