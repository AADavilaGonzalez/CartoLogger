import L from "leaflet";
import "leaflet/dist/leaflet.css";

export class EditPath {
    private map  : L.Map;
    private path : L.CircleMarker[];
    private line : L.Polyline;
    private opts : L.PathOptions;

    constructor(
        map: L.Map,
        opts: L.PathOptions,
    ) {
        this.map  = map;
        this.path = [];
        this.line = L.polyline([], opts).addTo(map);
        this.opts = opts;
    }

    private toLatLngArray(): L.LatLng[] {
        return this.path.map(m => m.getLatLng());
    }

    private updatePathLine() {
        this.line.setLatLngs(this.toLatLngArray());
    }

    get length() {return this.path.length;}

    isEmpty() {return this.path.length === 0;}

    push(point: L.LatLng) {
        this.path.push(
            L.circleMarker(point, Object.assign(this.opts, {radius: 1}))
             .addTo(this.map)
        );
        this.updatePathLine();
    }

    pop() {
        this.path.pop()?.remove();
        this.updatePathLine(); 
    }

    clear() {
        this.path.forEach(m => m.remove());
        this.path = [];
        this.updatePathLine();
    }

    toMarker(): L.Marker {
        return L.marker(this.path[0].getLatLng())
    }

    toPolyline(): L.Polyline {
        return L.polyline(this.toLatLngArray())
    }

    toPolygon(): L.Polygon {
        return L.polygon(this.toLatLngArray());
    }
}
