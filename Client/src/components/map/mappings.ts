type SelectModeKeybinds = {
    switchToEditMode: string;
    deleteFeature: string;
}
type SelectModeActionId = keyof SelectModeKeybinds;

type EditModeKeybinds = {
    switchToSelectMode: string;
    commitToPolygon: string,
    commitToPolyline: string,
    commitToMarker: string,
    commitFeature: string;
    undoPreviousEdit: string;
    undoAllEdits: string;
}
type EditModeActionId = keyof EditModeKeybinds;

export type ActionId = SelectModeActionId | EditModeActionId;

/*Map modes are declared through this type table*/
type ModeKeybindsTypeTable = {
    select: SelectModeKeybinds;
    edit: EditModeKeybinds;
};
export type MapMode = keyof ModeKeybindsTypeTable;

type MapKeybinds = {
    [K in MapMode]: ModeKeybindsTypeTable[K];
};

export type PartialMapKeybinds = {
    [K in MapMode]?: Partial<ModeKeybindsTypeTable[K]>;
};

export type ActionMappings = {
    [K in MapMode]: Record<string, keyof ModeKeybindsTypeTable[K]>;
}

const defaultMapKeybinds : MapKeybinds = {
    select: {
        switchToEditMode: "e",
        deleteFeature: "Backspace",
    },
    edit: {
        switchToSelectMode: "s",
        commitToPolygon: "p",
        commitToPolyline: "l",
        commitToMarker: "m",
        commitFeature: "Enter",
        undoPreviousEdit: "Backspace",
        undoAllEdits: "Delete",
    },
}


function getReverseMapping<K extends string, V extends string>(
    obj: Record<K,V>): Record<V, K[]> {
    
    const entries = Object.entries(obj) as [K,V][];
    return entries.reduce(
        (acc, [key, value]) => {
            if(acc[value]) {
                acc[value].push(key);
            }
            else {
                acc[value] = [key];
            }
            return acc;
        }, {} as Record<V, K[]>);
}


function removeDuplicates<K extends string,V extends string>(
    obj: Record<K,V[]>): Record<K,V> {
   
    const entries = Object.entries(obj) as [K,V[]][]
    return Object.fromEntries(
        entries.map(([key, arr]) => [key, arr[0]])
    ) as Record<K,V>;
} 


export function KeybindsToActionMappings(keybinds: PartialMapKeybinds): ActionMappings {
    const bindings = structuredClone(defaultMapKeybinds);
    const actionMapping: any = {};

    for (const mode of Object.keys(bindings) as MapMode[]) {
        if(mode in keybinds) {
            Object.assign(bindings[mode], keybinds[mode]);
        }

        const reverseMapping = getReverseMapping(
            bindings[mode] as Record<string, string>
        );

        for (const key of Object.keys(reverseMapping)) {
            const actions = reverseMapping[key];
            if (actions.length > 1) {
                console.warn(`Key ${key} mapped to multiple actions ${actions} in ${mode}`);
            }
        }

        actionMapping[mode] = removeDuplicates(reverseMapping);
    }

    return actionMapping as ActionMappings;
}
