import { Map } from "../components/map";

import { TextEditor } from "../components/text-editor"

type FeaturePropeties = {
    title: string;
    description: string;
}

export function Editor(root: HTMLElement): void {
    const map = Map();
    root.appendChild(map);

    const textEditor = TextEditor();
    root.appendChild(textEditor);

    map.onSelectionChange = (oldSelection, newSelection) => {
   
        if(oldSelection?.feature) {
            const properties: FeaturePropeties = oldSelection.feature.properties;
            properties.title = textEditor.titleTextContent;
            properties.description = textEditor.bodyTextContent;
        }

        if(newSelection?.feature) {
            const properties: FeaturePropeties = newSelection.feature.properties;
            textEditor.titleTextContent = properties.title || "";
            textEditor.bodyTextContent = properties.description || "";
        }
        else {
            textEditor.titleTextContent = "";
            textEditor.bodyTextContent = "";
        }

    };

}
