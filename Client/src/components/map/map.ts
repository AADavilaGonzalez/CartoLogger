import L, { type LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map.css"

import type { MapMode, ActionMappings, ActionId } from "./mappings";

import { EditPath } from "./edit-path";
import { KeybindsToActionMappings } from "./mappings";

type GeoJSONConvertibleLayer = L.Polygon | L.Polyline | L.Marker;

type CommitMode = "polygon" | "polyline" | "marker";
type Commiter = (ep: EditPath) => GeoJSONConvertibleLayer;
const commiters: Record<CommitMode, Commiter> = {
    polygon   : (ep) => ep.toPolygon(),
    polyline  : (ep) => ep.toPolyline(),
    marker    : (ep) => ep.toMarker(),
};

type Action = (m:HTMLGeoJSONMapElement) => void
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

type SelectionHandler = (
    newSelection: GeoJSONConvertibleLayer | null
) => void;

type SelectionChangeHandler = (
    oldSelection: GeoJSONConvertibleLayer | null,
    newSelection: GeoJSONConvertibleLayer | null,
) => void;

export class HTMLGeoJSONMapElement extends HTMLElement {

    private map: L.Map;
    private features: L.GeoJSON;
    private editPath: EditPath;
    private actionMappings: ActionMappings;

    private _selectedFeature: GeoJSONConvertibleLayer | null;

    public get selectedFeature() { return this._selectedFeature; }
    private set selectedFeature(feature: GeoJSONConvertibleLayer | null) {
        if(this.onSelection) {
            this.onSelection(feature);
        }
        if(this.onSelectionChange && this._selectedFeature !== feature) {
            this.onSelectionChange(this._selectedFeature, feature);
        }
        this._selectedFeature = feature;
    }

    public onSelection?: SelectionHandler;
    public onSelectionChange?: SelectionChangeHandler;

    public mapMode: MapMode;
    public commitMode: CommitMode;

    constructor() {
        super();
        
        this.map = L.map(this).setView([25.725194867753334, -100.31513482332231], 10);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        this.features = L.geoJson().addTo(this.map);
        this.editPath = new EditPath(this.map, {color: "red"});   
        this.actionMappings = KeybindsToActionMappings({});
        this._selectedFeature = null;

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
        const layer = commiter(this.editPath);
        this.features.addData(layer.toGeoJSON());
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
                console.log(this.selectedFeature!.feature);
                if(this.selectedFeature instanceof L.Path) {
                    this.selectedFeature.bringToFront();
                }
                L.DomEvent.stopPropagation(e);
            },
            edit: () => {}
        }[this.mapMode];
        codePath();
    }

    private onMapClick(e: LeafletMouseEvent) {
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

customElements.define("geojson-map", HTMLGeoJSONMapElement);

export function Map(): HTMLGeoJSONMapElement { 
    return new HTMLGeoJSONMapElement();
}
