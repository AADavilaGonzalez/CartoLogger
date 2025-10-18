import L, { type LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

import type { MapMode, ActionMappings, ActionId } from "./mappings";
import "./map.css"

import { EditPath } from "./edit-path";
import { KeybindsToActionMappings } from "./mappings";

type CommitMode = "polygon" | "polyline" | "marker";
type Commiter = (ep: EditPath) => L.Layer;
const commiters: Record<CommitMode, Commiter> = {
    polygon   : (ep) => ep.toPolygon(),
    polyline  : (ep) => ep.toPolyline(),
    marker    : (ep) => ep.toMarker(),
};

type Action = (m:HTMLCartoLoggerMapElement) => void
const keyboardHandlers: Record<ActionId, Action> = {
    deleteFeature       : (m) => m.deleteFeature(),
    commitToMarker      : (m) => { m.commitMode = "marker"; },
    commitToPolyline    : (m) => { m.commitMode = "polyline"; },
    commitToPolygon     : (m) => { m.commitMode = "polygon"; },
    undoPreviousEdit    : (m) => m.undoPreviousEdit(),
    undoAllEdits        : (m) => m.undoAllEdits(),
    commitFeature       : (m) => m.commitFeature(),
    switchToSelectMode  : (m) => { m.mapMode = "select"; },
    switchToEditMode    : (m) => { m.mapMode = "edit"},
}

class HTMLCartoLoggerMapElement extends HTMLElement {

    private map: L.Map;
    private features: L.FeatureGroup;
    private selectedFeature: L.Layer | null;
    private editPath: EditPath;
    private actionMappings: ActionMappings;

    public mapMode: MapMode;
    public commitMode: CommitMode;

    constructor() {
        super();

        this.map = L.map(this).setView([25.725194867753334, -100.31513482332231], 10);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        this.features = L.featureGroup().addTo(this.map);
        this.selectedFeature = null;
        this.editPath = new EditPath(this.map, {color: "red"});   
        this.actionMappings = KeybindsToActionMappings({});

        this.mapMode = "select";
        this.commitMode = "polyline";

        this.addEventListener("keydown", (e) => this.keyboardHandler(e));
        this.map.on("click", (e) => this.onMapClick(e));
        this.features.on("click", (e) => this.onFeatureClick(e))
    }

    connectedCallback() { this.map.invalidateSize(); }

    deleteFeature() {
        if(!this.selectedFeature) { return; }
        this.features.removeLayer(this.selectedFeature);
        this.selectedFeature = null;
    }

    undoPreviousEdit() { this.editPath.pop(); }

    undoAllEdits() { this.editPath.clear(); }

    commitFeature() {
        if(this.editPath.isEmpty()) { return; }
        const commiter = commiters[this.commitMode];
        const feature = commiter(this.editPath);
        this.features.addLayer(feature);
        this.editPath.clear();
    }
    
    private keyboardHandler(e: KeyboardEvent) {
        const actionMapper = this.actionMappings[this.mapMode];
        if(!(e.key in actionMapper)) { return; }
        const actionId = actionMapper[e.key];
        const action = keyboardHandlers[actionId];
        action(this);
    }

    private onFeatureClick(e: LeafletMouseEvent) {
        const codePath = {
            select: () => {
                this.selectedFeature = e.propagatedFrom;
                L.DomEvent.stopPropagation(e);
            },
            edit: () => {}
        }[this.mapMode];
        codePath();
    }

    private onMapClick(e: LeafletMouseEvent) {
        console.log(e.latlng)
        const codePath = {
            select: () => {
                this.selectedFeature = null
            },
            edit: () => {
                this.editPath.push(e.latlng)
            },
        }[this.mapMode];
        codePath();
    }

}

customElements.define("carto-logger-map", HTMLCartoLoggerMapElement);

export function Map(): HTMLCartoLoggerMapElement { 
    return new HTMLCartoLoggerMapElement();
}
