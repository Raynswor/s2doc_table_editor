
import { SpanRegion } from "./spanregion.model";
import { RectangleRegion } from "./rectangleregion.model";
import { PolygonRegion } from "./polygonregion.model";
import { LineRegion } from "./lineregion.model";
import { PolylineRegion } from "./polylineregion.model";

export interface IRegion {
    space?: string;
}

export class Region implements IRegion {
    space?: string;

    static from_dict(d: any[]): SpanRegion | RectangleRegion | PolygonRegion | LineRegion | PolylineRegion | null {
        if (d === null || d === undefined) {
            console.error("Region.from_dict: Input cannot be null or undefined");
            return null;
        }

        if (!Array.isArray(d) || d.length === 0) {
            console.error("Region.from_dict: Invalid input data");
            return null;
        }
        
        const regionType = d[0];
        const params = d.slice(1);
        
        switch (regionType) {
            case "s":
                return SpanRegion.from_dict(params);
            case "rr":
                return RectangleRegion.from_dict(params);
            case "pr":
                return PolygonRegion.from_dict(params);
            case "lr":
                return LineRegion.from_dict(params);
            case "pl":
                return PolylineRegion.from_dict(params);
            default:
                console.error(`Region.from_dict: Unknown region type '${regionType}'`);
                return null;
        }
    }
}
