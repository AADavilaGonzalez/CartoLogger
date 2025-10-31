import { state } from "@/state";
import { getMapFeatures } from "@/api";
import { setRoute } from "@/routing"; 
import { GeoJsonMap, TextEditor } from "@/components";

type FeaturePropeties = {
    name: string;
    description: string;
}

export async function Editor(root: HTMLElement) {
   
    const mapId = state.get().mapId;
    if(!mapId) {
        alert("mapId failed to load before accesing editor");
        setRoute("/dashboard");
        return;
    }
    const features = await getMapFeatures(mapId);
    const map = GeoJsonMap(features);
    root.appendChild(map);

    const textEditor = TextEditor();
    root.appendChild(textEditor);

    map.onSelectionChange = (oldSelection, newSelection) => {
   
        if(oldSelection?.feature) {
            const properties: FeaturePropeties = oldSelection.feature.properties;
            properties.name = textEditor.titleTextContent;
            properties.description = textEditor.bodyTextContent;
        }

        if(newSelection?.feature) {
            const properties: FeaturePropeties = newSelection.feature.properties;
            textEditor.titleTextContent = properties.name || "";
            textEditor.bodyTextContent = properties.description || "";
        }
        else {
            textEditor.titleTextContent = "";
            textEditor.bodyTextContent = "";
        }

    };

}
