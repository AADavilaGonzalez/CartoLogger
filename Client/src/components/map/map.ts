import L, { type LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css"

import "./map.css"

class EditPath {
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

    toPolyLine(): L.Polyline {
        return L.polyline(this.toLatLngArray())
    }

    toPolygon(): L.Polygon {
        return L.polygon(this.toLatLngArray());
    }

}


class HTMLCartoLoggerMapElement extends HTMLElement {

    private map: L.Map;
    private editPath: EditPath;
    private features: L.FeatureGroup;
    private commit: () => void;

    constructor() {
        super();

        this.map = L.map(this).setView([51.505, -0.09], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        this.editPath = new EditPath(this.map, {color: "red"});
        this.features = L.featureGroup().addTo(this.map);
        this.commit = this.commitToPolyline;
        
        this.addEventListener("keydown", (e) => this.keyboardHandler(e));
        this.map.on("click", (e) => this.onClickHandler(e));
    }

    connectedCallback() { this.map.invalidateSize(); }

    private commitToPolyline() {
        this.features.addLayer(this.editPath.toPolyLine());
        this.editPath.clear();
    }
    private commitToPolygon() {
        this.features.addLayer(this.editPath.toPolygon());
        this.editPath.clear();
    }

    private keyboardHandler(e: KeyboardEvent) {
        console.log(e.key)
        switch(e.key) {
            case "Backspace":
                this.editPath.pop();
                break;
            case "Delete":
                this.editPath.clear();
                break;
            case "Enter":
                this.commit();
                break;
            case "l":
                this.commit = this.commitToPolyline;
                break;
            case "p":
                this.commit = this.commitToPolygon; 
                break;
        }
    }

    private onClickHandler(e: LeafletMouseEvent) {
        this.editPath.push(e.latlng);
    }

}

customElements.define("carto-logger-map", HTMLCartoLoggerMapElement);

export function Map(): HTMLCartoLoggerMapElement { 
    return new HTMLCartoLoggerMapElement();
}
